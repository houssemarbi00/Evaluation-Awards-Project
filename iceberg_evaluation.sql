CREATE TABLE users (
id SERIAL PRIMARY KEY, 
nom VARCHAR(200) NOT NULL, 
email VARCHAR(200) UNIQUE NOT NULL, 
mot_de_passe VARCHAR(255) NOT NULL, 
role VARCHAR(20) CHECK (role IN ('admin','jury')) NOT NULL,
date_creation TIMESTAMP DEFAULT NOW()
);

CREATE TABLE candidats (
id SERIAL PRIMARY KEY,
nom VARCHAR(200) NOT NULL,
prenom VARCHAR(200) NOT NULL,
email VARCHAR(200) UNIQUE NOT NULL
);
CREATE TABLE notes (
id SERIAL PRIMARY KEY,
jury_id INT REFERENCES users(id) ON DELETE CASCADE,
candidat_id INT REFERENCES candidats(id) ON DELETE CASCADE,
note NUMERIC(5,2) CHECK (note >= 0 AND note <=20),
commentaire TEXT,
date_evaluation TIMESTAMP DEFAULT NOW()
);

SELECT u.id, n.note, c.nom as candidat_nom, u.id as nom_jury, n.commentaire from notes as n
JOIN users as u  ON n.id = u.id
JOIN candidats as c ON n.id = c.id
