# backend/routers/scores.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, models
from ..database import get_db
from sqlalchemy import func
from .. import models, database




router = APIRouter(prefix="/scores", tags=["scores"])

@router.post("/criteria-score")
def add_criteria_score(request: schemas.CriteriaScoreCreate, 
                       db: Session = Depends(get_db)):

    existing_score = db.query(models.CriteriaScore).filter(
        models.CriteriaScore.candidat_id == request.candidat_id,
        models.CriteriaScore.critere_id == request.critere_id,
        models.CriteriaScore.jury_id == request.jury_id
    ).first()

    if existing_score:
        existing_score.note = request.note
        existing_score.commentaire = request.commentaire
        db.commit()
        db.refresh(existing_score)
        return {"message": "Score updated", "score": existing_score}

    new_score = models.CriteriaScore(
        candidat_id=request.candidat_id,
        jury_id=request.jury_id,
        categorie_id=request.categorie_id,
        critere_id=request.critere_id,
        note=request.note,
        commentaire=request.commentaire
    )

    db.add(new_score)
    db.commit()
    db.refresh(new_score)

    return {"message": "Score created", "score": new_score}

# backend/routers/scores.py
@router.get("/jury-scores/{candidat_id}/{categorie_id}")
def get_jury_scores(candidat_id: int, categorie_id: int, db: Session = Depends(get_db)):
    scores = db.query(models.JuryScore).filter(
        models.JuryScore.candidat_id == candidat_id,
        models.JuryScore.categorie_id == categorie_id
    ).all()
    return scores

@router.get("/final_scores/{categorie_id}")
def get_final_scores_by_category(categorie_id: int, db: Session = Depends(get_db)):
    rows = (
        db.query(models.FinalScore, models.Candidat)
        .join(models.Candidat, models.FinalScore.candidat_id == models.Candidat.id)
        .filter(models.FinalScore.categorie_id == categorie_id)
        .all()
    )

    results = []
    for fs, c in rows:
        results.append({
            "candidat_id": fs.candidat_id,
            "nom_candidat": c.nom,
            "prenom_candidat": getattr(c, "prenom", ""),  # au cas où champ manquant
            "email": getattr(c, "email", ""),
            "projet": getattr(c, "projet", None) or getattr(c, "nom_projet", None) or "",
            "note_finale": float(fs.note_finale),
            "nb_jury": fs.nb_jury,
        })

    return results


# @router.get("/by_category/{categorie_id}")
# def get_final_scores_by_category(categorie_id: int, db: Session = Depends(get_db)):
#     rows = (
#         db.query(models.FinalScore, models.Candidat)
#         .join(models.Candidat, models.FinalScore.candidat_id == models.Candidat.id)
#         .filter(models.FinalScore.categorie_id == categorie_id)
#         .all()
#     )

#     results = [
#         {
#             "candidat_id": fs.candidat_id,
#             "nom_candidat": c.nom,
#             "prenom_candidat": c.prenom,
#             "note_finale": float(fs.note_finale),
#             "nb_jury": fs.nb_jury,
#         }
#         for fs, c in rows
#     ]

#     return results