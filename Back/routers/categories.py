# backend/routers/categories.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, models
from ..database import get_db

router = APIRouter(prefix="/categories", tags=["categories"])

@router.post("/", response_model=schemas.CategoryOut)
def create_category(payload: schemas.CategoryCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Category).filter(models.Category.nom == payload.nom).first()
    if existing:
        raise HTTPException(status_code=400, detail="Catégorie existante")
    c = models.Category(**payload.dict())
    db.add(c)
    db.commit()
    db.refresh(c)
    return c

@router.get("/", response_model=list[schemas.CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).all()

@router.post("/{categorie_id}/add_candidat/{candidat_id}")
def add_candidat_to_categorie(
    categorie_id: int,
    candidat_id: int,
    db: Session = Depends(get_db)
):
    # Vérifier si la catégorie existe
    categorie = db.query(models.Category).filter(models.Category.id == categorie_id).first()
    if not categorie:
        raise HTTPException(status_code=404, detail="Catégorie introuvable")

    # Vérifier si le candidat existe
    candidat = db.query(models.Candidat).filter(models.Candidat.id == candidat_id).first()
    if not candidat:
        raise HTTPException(status_code=404, detail="Candidat introuvable")

    # Vérifier si déjà inscrit
    check = db.query(models.CandidateCategory).filter_by(
        candidat_id=candidat_id,
        categorie_id=categorie_id
    ).first()

    if check:
        raise HTTPException(status_code=409, detail="Déjà inscrit dans cette catégorie")

    # Ajouter dans la relation many-to-many
    link = models.CandidateCategory(
        candidat_id=candidat_id,
        categorie_id=categorie_id
    )
    db.add(link)
    db.commit()

    return {"message": "Candidat ajouté à la catégorie avec succès!"}

@router.post("/{categorie_id}/add_jury/{jury_id}")
def add_jury_to_categorie(
    categorie_id: int,
    jury_id: int,
    db: Session = Depends(get_db)
):
    # Vérifier que l'utilisateur existe et est jury
    jury = db.query(models.User).filter(models.User.id == jury_id).first()
    if not jury:
        raise HTTPException(status_code=404, detail="Jury introuvable")
    if jury.role != "jury":
        raise HTTPException(status_code=400, detail="Cet utilisateur n'est pas un jury")

    # Vérifier que la catégorie existe
    categorie = db.query(models.Category).filter(models.Category.id == categorie_id).first()
    if not categorie:
        raise HTTPException(status_code=404, detail="Catégorie introuvable")

    # Vérifier si déjà assigné
    check = db.query(models.CategoryJury).filter_by(
        jury_id=jury_id,
        categorie_id=categorie_id
    ).first()
    if check:
        raise HTTPException(status_code=409, detail="Jury déjà assigné à cette catégorie")

    # Ajout
    link = models.CategoryJury(
        jury_id=jury_id,
        categorie_id=categorie_id
    )
    db.add(link)
    db.commit()

    return {"message": "Jury ajouté à la catégorie avec succès ✅"}

@router.get("/{categorie_id}/candidats")
def get_candidats_in_categorie(categorie_id: int, db: Session = Depends(get_db)):
    """Retourne la liste des candidats assignés à une catégorie"""
    liens = db.query(models.CandidateCategory).filter(
        models.CandidateCategory.categorie_id == categorie_id
    ).all()

    candidats = []
    for l in liens:
        c = db.query(models.Candidat).filter(models.Candidat.id == l.candidat_id).first()
        if c:
            candidats.append({
                "id": c.id,
                "nom": c.nom,
                "prenom": c.prenom,
                "email": c.email
            })
    return candidats


@router.get("/{categorie_id}/jurys")
def get_jurys_in_categorie(categorie_id: int, db: Session = Depends(get_db)):
    """Retourne la liste des jurys assignés à une catégorie"""
    liens = db.query(models.CategoryJury).filter(
        models.CategoryJury.categorie_id == categorie_id
    ).all()

    jurys = []
    for l in liens:
        j = db.query(models.User).filter(models.User.id == l.jury_id).first()
        if j:
            jurys.append({
                "id": j.id,
                "nom": j.nom,
                "email": j.email,
                "role": j.role
            })
    return jurys
from fastapi import status

@router.delete("/{categorie_id}/remove_candidat/{candidat_id}", status_code=status.HTTP_200_OK)
def remove_candidat_from_categorie(
    categorie_id: int,
    candidat_id: int,
    db: Session = Depends(get_db)
):
    link = db.query(models.CandidateCategory).filter_by(
        categorie_id=categorie_id, candidat_id=candidat_id
    ).first()
    if not link:
        raise HTTPException(status_code=404, detail="Candidat non trouvé dans cette catégorie")

    db.delete(link)
    db.commit()
    return {"message": "Candidat retiré avec succès ✅"}


@router.delete("/{categorie_id}/remove_jury/{jury_id}", status_code=status.HTTP_200_OK)
def remove_jury_from_categorie(
    categorie_id: int,
    jury_id: int,
    db: Session = Depends(get_db)
):
    link = db.query(models.CategoryJury).filter_by(
        categorie_id=categorie_id, jury_id=jury_id
    ).first()
    if not link:
        raise HTTPException(status_code=404, detail="Jury non trouvé dans cette catégorie")

    db.delete(link)
    db.commit()
    return {"message": "Jury retiré avec succès ✅"}
