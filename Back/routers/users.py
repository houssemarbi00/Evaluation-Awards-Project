# Back/routers/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import schemas, models
from utils import security
from database import get_db
# from ..routers.auth import get_current_user

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

# @router.get("/me", response_model=schemas.UserOut)
# def get_me(current_user: schemas.UserOut = Depends(get_current_user), db: Session = Depends(get_db)):
#     user = db.query(models.User).filter(models.User.id == current_user.id).first()
#     return user

# --- Suppression d'un user ---
@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_candidat(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User avec ID {user_id} introuvable"
        )

    db.delete(user)
    db.commit()
    return {"message": "User supprimé avec succès"}