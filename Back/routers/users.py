# backend/routers/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import schemas, models
from Back.utils import security
from ..database import get_db

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/", response_model=schemas.UserOut)
def create_user(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    hashed = security.hash_password(user_in.mot_de_passe)
    user = models.User(nom=user_in.nom, email=user_in.email, mot_de_passe=hashed, role=user_in.role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.get("/", response_model=list[schemas.UserOut])
def list_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()
