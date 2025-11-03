# backend/routers/criteres.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, models
from ..database import get_db

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
