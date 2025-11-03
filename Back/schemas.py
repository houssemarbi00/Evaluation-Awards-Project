# backend/schemas.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List

# --- Users ---
class UserCreate(BaseModel):
    nom: str
    email: EmailStr
    mot_de_passe: str
    role: str = Field(..., pattern="^(admin|jury)$")

class UserOut(BaseModel):
    id: int
    nom: str
    email: EmailStr
    role: str

    class Config:
        from_attributes  = True

# --- Auth ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None

# --- Candidat ---
class CandidatBase(BaseModel):
    nom: str
    prenom: str
    email: EmailStr
    projet: Optional[str] = None
    entreprise: Optional[str] = None

class CandidatCreate(CandidatBase):
    pass

class CandidatOut(CandidatBase):
    id: int
    date_creation: Optional[str]

    class Config:
        from_attributes  = True

# --- Category ---
class CategoryCreate(BaseModel):
    nom: str
    description: Optional[str] = None

class CategoryOut(CategoryCreate):
    id: int
    class Config:
        from_attributes  = True

# --- Critere ---
class CritereCreate(BaseModel):
    categorie_id: int
    nom: str
    valeur_max: int

class CritereOut(CritereCreate):
    id: int
    class Config:
        from_attributes  = True

# --- Criteria Score (input) ---
class CriteriaScoreCreate(BaseModel):
    candidat_id: int
    jury_id: int
    categorie_id: int
    critere_id: int
    note: float
    commentaire: Optional[str] = None

class CriteriaScoreOut(CriteriaScoreCreate):
    id: int
    date_creation: Optional[str]
    class Config:
        from_attributes  = True

# --- JuryScore & FinalScore ---
class JuryScoreOut(BaseModel):
    id: int
    candidat_id: int
    jury_id: int
    categorie_id: int
    note_totale: float

    class Config:
        from_attributes  = True

class FinalScoreOut(BaseModel):
    id: int
    candidat_id: int
    categorie_id: int
    note_finale: float
    nb_jury: int
    class Config:
        from_attributes  = True
