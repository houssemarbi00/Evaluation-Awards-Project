CREATE TABLE users (
id SERIAL PRIMARY KEY, 
nom VARCHAR(200) NOT NULL, 
email VARCHAR(200) UNIQUE NOT NULL, 
mot_de_passe VARCHAR(200) NOT NULL, 
role VARCHAR(200) CHECK (role IN ('admin','jury')) NOT NULL,
date_creation TIMESTAMP DEFAULT NOW()
);

CREATE TABLE candidats (
id SERIAL PRIMARY KEY,
nom VARCHAR(200) NOT NULL,
prenom VARCHAR(200) NOT NULL,
email VARCHAR(200) UNIQUE NOT NULL,
projet TEXT,
entreprise TEXT,
date_creation TIMESTAMP DEFAULT NOW()
);
CREATE TABLE notes (
id SERIAL PRIMARY KEY,

jury_id INT REFERENCES users(id) ON DELETE CASCADE,
candidat_id INT REFERENCES candidats(id) ON DELETE CASCADE,
note NUMERIC(5,2) CHECK (note >= 0 AND note <= 20)
);

CREATE TABLE categories (
id SERIAL PRIMARY KEY,
nom VARCHAR(200) UNIQUE NOT NULL,
description TEXT 
);
CREATE TABLE category_jury (
    jury_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    categorie_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (jury_id, categorie_id)
);
CREATE TABLE candidate_category(
candidat_id INTEGER REFERENCES candidats(id) ON DELETE CASCADE,
categorie_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
PRIMARY KEY (candidat_id,categorie_id)
);
CREATE TABLE criteres(
id SERIAL PRIMARY KEY,
categorie_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
nom VARCHAR(200) NOT NULL,
valeur_max NUMERIC NOT NULL CHECK (valeur_max >= 0),
ordre_affichage INTEGER DEFAULT 0
);
CREATE TABLE criteria_scores(
id SERIAL PRIMARY KEY,
candidat_id INTEGER REFERENCES candidats(id) ON DELETE CASCADE,
jury_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
categorie_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
critere_id INTEGER REFERENCES criteres(id) ON DELETE CASCADE,
note NUMERIC(5,2) CHECK (note >= 0),
commentaire TEXT,
date_creation TIMESTAMP NOT NULL DEFAULT NOW(),
UNIQUE (candidat_id, critere_id, jury_id)
);
CREATE TABLE jury_scores (
id SERIAL PRIMARY KEY,
candidat_id INTEGER REFERENCES candidats(id) ON DELETE CASCADE,
jury_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
categorie_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
note_totale NUMERIC NOT NULL,
date_creation TIMESTAMP DEFAULT NOW(),
UNIQUE (candidat_id, jury_id, categorie_id)
);
CREATE TABLE final_scores(
id SERIAL PRIMARY KEY,
candidat_id INTEGER REFERENCES candidats(id) ON DELETE CASCADE,
categorie_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
note_finale NUMERIC  NOT NULL,
nb_jury INT NOT NULL DEFAULT 0,
updated_at TIMESTAMP DEFAULT NOW(),
UNIQUE (candidat_id, categorie_id)
);

ALTER TABLE criteria_scores
ADD CONSTRAINT unique_score_per_jury_candidate_criterion
UNIQUE (candidat_id, critere_id, jury_id);

CREATE INDEX idx_criteria_scores_candidat_categ ON criteria_scores (candidat_id, categorie_id);
CREATE INDEX idx_criteria_scores_jury ON criteria_scores (jury_id);
CREATE INDEX idx_jury_scores_candidat_categ ON jury_scores (candidat_id, categorie_id);
CREATE INDEX idx_final_scores_categorie ON final_scores (categorie_id);

CREATE OR REPLACE FUNCTION fn_validate_criteria_score() RETURNS TRIGGER AS $$
DECLARE
    v_valeur_max INTEGER;
BEGIN
    -- Récupère valeur_max du critère référencé
    SELECT valeur_max INTO v_valeur_max FROM criteres WHERE id = NEW.critere_id;
    IF v_valeur_max IS NULL THEN
        RAISE EXCEPTION 'Critère % introuvable', NEW.critere_id;
    END IF;

    IF NEW.note > v_valeur_max THEN
        RAISE EXCEPTION 'La note % dépasse la valeur_max % du critère %', NEW.note, v_valeur_max, NEW.critere_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_criteria_score
BEFORE INSERT OR UPDATE ON criteria_scores
FOR EACH ROW EXECUTE PROCEDURE fn_validate_criteria_score();

-- 2) Fonction pour recalculer/mettre à jour jury_scores pour (candidat, jury, categorie)
CREATE OR REPLACE FUNCTION fn_recalc_jury_scores() RETURNS TRIGGER AS $$
DECLARE
    v_candidat INTEGER;
    v_jury INTEGER;
    v_categorie INTEGER;
    v_sum NUMERIC;
    v_count INTEGER;
BEGIN
    -- déterminer la ligne affectée (INSERT/UPDATE -> NEW, DELETE -> OLD)
    IF TG_OP = 'DELETE' THEN
        v_candidat := OLD.candidat_id;
        v_jury := OLD.jury_id;
        v_categorie := OLD.categorie_id;
    ELSE
        v_candidat := NEW.candidat_id;
        v_jury := NEW.jury_id;
        v_categorie := NEW.categorie_id;
    END IF;

    SELECT COALESCE(SUM(note), 0), COUNT(*) INTO v_sum, v_count
    FROM criteria_scores
    WHERE candidat_id = v_candidat AND jury_id = v_jury AND categorie_id = v_categorie;

    IF v_count = 0 THEN
        -- plus de notes de critères pour ce trio -> supprimer la ligne jury_scores si existante
        DELETE FROM jury_scores
        WHERE candidat_id = v_candidat AND jury_id = v_jury AND categorie_id = v_categorie;
    ELSE
        -- insérer ou updater la somme
        INSERT INTO jury_scores (candidat_id, jury_id, categorie_id, note_totale, date_creation)
        VALUES (v_candidat, v_jury, v_categorie, v_sum, now())
        ON CONFLICT (candidat_id, jury_id, categorie_id)
        DO UPDATE SET note_totale = EXCLUDED.note_totale,
                      date_creation = now();
    END IF;

    -- appeler mise à jour de la note finale pour le candidat+catégorie
    PERFORM fn_recalc_final_scores_for(v_candidat, v_categorie);

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_after_criteria_scores_change
AFTER INSERT OR UPDATE OR DELETE ON criteria_scores
FOR EACH ROW EXECUTE PROCEDURE fn_recalc_jury_scores();

-- 3) Fonction pour recalculer final_scores (moyenne des jury_scores) pour un candidat+categorie
CREATE OR REPLACE FUNCTION fn_recalc_final_scores_for(p_candidat INTEGER, p_categorie INTEGER) RETURNS VOID AS $$
DECLARE
    v_avg NUMERIC;
    v_count INTEGER;
BEGIN
    SELECT AVG(note_totale), COUNT(*) INTO v_avg, v_count
    FROM jury_scores
    WHERE candidat_id = p_candidat AND categorie_id = p_categorie;

    IF v_count = 0 THEN
        -- supprimer si aucune note de jury
        DELETE FROM final_scores WHERE candidat_id = p_candidat AND categorie_id = p_categorie;
    ELSE
        INSERT INTO final_scores (candidat_id, categorie_id, note_finale, nb_jury, updated_at)
        VALUES (p_candidat, p_categorie, v_avg, v_count, now())
        ON CONFLICT (candidat_id, categorie_id)
        DO UPDATE SET note_finale = EXCLUDED.note_finale,
                      nb_jury = EXCLUDED.nb_jury,
                      updated_at = now();
    END IF;
END;
$$ LANGUAGE plpgsql;

-- wrapper pour appeler depuis trigger (utile pour PERFORM)
CREATE OR REPLACE FUNCTION fn_recalc_final_scores_for_trigger() RETURNS TRIGGER AS $$
DECLARE
    v_candidat INTEGER;
    v_categorie INTEGER;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_candidat := OLD.candidat_id;
        v_categorie := OLD.categorie_id;
    ELSE
        v_candidat := NEW.candidat_id;
        v_categorie := NEW.categorie_id;
    END IF;

    PERFORM fn_recalc_final_scores_for(v_candidat, v_categorie);

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- On veut recalculer également quand jury_scores est modifiée (sécurité)
CREATE TRIGGER trg_after_jury_scores_change
AFTER INSERT OR UPDATE OR DELETE ON jury_scores
FOR EACH ROW EXECUTE PROCEDURE fn_recalc_final_scores_for_trigger();