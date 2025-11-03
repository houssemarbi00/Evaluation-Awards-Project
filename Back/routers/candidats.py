# backend/routers/candidats.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, models
from ..database import get_db

router = APIRouter(prefix="/candidats", tags=["candidats"])

@router.post("/", response_model=schemas.CandidatOut)
def create_candidat(payload: schemas.CandidatCreate, db: Session = Depends(get_db)):
    exists = db.query(models.Candidat).filter(models.Candidat.email == payload.email).first()
    if exists:
        raise HTTPException(status_code=400, detail="Email candidat déjà existant")
    c = models.Candidat(**payload.dict())
    db.add(c)
    db.commit()
    db.refresh(c)
    # 🩵 Conversion manuelle avant le retour
    c.date_creation = c.date_creation.isoformat()
    return c

@router.get("/", response_model=list[schemas.CandidatOut])
def list_candidats(db: Session = Depends(get_db)):
    candidat= db.query(models.Candidat).all()
    for c in candidat:
        c.date_creation = c.date_creation.isoformat()
    return candidat
    

@router.get("/{candidat_id}", response_model=schemas.CandidatOut)
def get_candidat(candidat_id: int, db: Session = Depends(get_db)):
    candidat= db.query(models.Candidat).get(candidat_id)
     
    
    if not candidat:
        raise HTTPException(status_code=404, detail="Candidat introuvable")
    # ✅ convertir date_creation en string ISO (si besoin)
    if hasattr(candidat, "date_creation") and isinstance(candidat.date_creation, (str, bytes)) is False:
        candidat.date_creation = candidat.date_creation.isoformat()
    return candidat