# backend/routers/criteres.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import schemas, models
from database import get_db
from routers.auth import login


router = APIRouter(prefix="/criteres", tags=["criteres"])

@router.post("/", response_model=schemas.CritereOut)
def create_critere(payload: schemas.CritereCreate, db: Session = Depends(get_db)):
    # vérifier catégorie existe
    cat = db.query(models.Category).get(payload.categorie_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Catégorie introuvable")
    crit = models.Critere(**payload.dict())
    db.add(crit)
    db.commit()
    db.refresh(crit)
    return crit

@router.get("/by_category/{categorie_id}", response_model=list[schemas.CritereOut])
def crits_by_cat(categorie_id: int, db: Session = Depends(get_db)):
    return db.query(models.Critere).filter(models.Critere.categorie_id == categorie_id).all()


@router.delete("/{critere_id}",status_code=status.HTTP_204_NO_CONTENT)
def delete_critere(critere_id, db: Session = Depends(get_db)):
    critere = db.query(models.Critere).filter(models.Critere.id == critere_id).first()

    if not critere:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidat avec ID {critere_id} introuvable"
        )
    db.delete(critere)
    db.commit()
    return {"message": "Critere supprimé avec succès"}

@router.post("/criteria-score")
def add_score(payload: schemas.CriteriaScoreCreate,
              db: Session = Depends(get_db),
              current_user: models.User = Depends(login)):

    if current_user.role != "jury":
        raise HTTPException(status_code=403, detail="Accès réservé aux jurys")

    if current_user.id != payload.jury_id:
        raise HTTPException(status_code=403, detail="Vous ne pouvez noter qu'en votre nom")

    # Vérif que jury = catégorie
    link = db.query(models.JuryCategory).filter(
        models.JuryCategory.jury_id == current_user.id,
        models.JuryCategory.categorie_id == payload.categorie_id
    ).first()

    if not link:
        raise HTTPException(status_code=403, detail="Vous n'êtes pas autorisé pour cette catégorie")

    # suite logique 👉 insert du score
