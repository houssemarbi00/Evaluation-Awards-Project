# backend/models.py
from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, ForeignKey, Numeric, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(200), nullable=False)
    email = Column(String(200), unique=True, nullable=False, index=True)
    mot_de_passe = Column(String(200), nullable=False)
    role = Column(String(200), nullable=False)  # 'admin' or 'jury'
    date_creation = Column(TIMESTAMP, server_default=func.now())

class Candidat(Base):
    __tablename__ = "candidats"
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(200), nullable=False)
    prenom = Column(String(200), nullable=False)
    email = Column(String(200), unique=True, nullable=False)
    projet = Column(Text)
    entreprise = Column(Text)
    date_creation = Column(TIMESTAMP, server_default=func.now())

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(200), unique=True, nullable=False)
    description = Column(Text)

class CategoryJury(Base):
    __tablename__ = "category_jury"
    jury_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    categorie_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), primary_key=True)

class CandidateCategory(Base):
    __tablename__ = "candidate_category"
    candidat_id = Column(Integer, ForeignKey("candidats.id", ondelete="CASCADE"), primary_key=True)
    categorie_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), primary_key=True)

class Critere(Base):
    __tablename__ = "criteres"
    id = Column(Integer, primary_key=True, index=True)
    categorie_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False)
    nom = Column(String(200), nullable=False)
    valeur_max = Column(Integer, nullable=False)

class CriteriaScore(Base):
    __tablename__ = "criteria_scores"
    id = Column(Integer, primary_key=True, index=True)
    candidat_id = Column(Integer, ForeignKey("candidats.id", ondelete="CASCADE"), nullable=False)
    jury_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    categorie_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False)
    critere_id = Column(Integer, ForeignKey("criteres.id", ondelete="CASCADE"), nullable=False)
    note = Column(Numeric, nullable=False)
    commentaire = Column(Text)
    date_creation = Column(TIMESTAMP, server_default=func.now())

    __table_args__ = (
        UniqueConstraint('candidat_id', 'jury_id', 'critere_id', name='uq_candidat_jury_critere'),
    )

class JuryScore(Base):
    __tablename__ = "jury_scores"
    id = Column(Integer, primary_key=True, index=True)
    candidat_id = Column(Integer, ForeignKey("candidats.id", ondelete="CASCADE"), nullable=False)
    jury_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    categorie_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False)
    note_totale = Column(Numeric, nullable=False)
    date_creation = Column(TIMESTAMP, server_default=func.now())

    __table_args__ = (
        UniqueConstraint('candidat_id', 'jury_id', 'categorie_id', name='uq_candidat_jury_categorie'),
    )

class FinalScore(Base):
    __tablename__ = "final_scores"
    id = Column(Integer, primary_key=True, index=True)
    candidat_id = Column(Integer, ForeignKey("candidats.id", ondelete="CASCADE"), nullable=False)
    categorie_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False)
    note_finale = Column(Numeric, nullable=False)
    nb_jury = Column(Integer, nullable=False)
    updated_at = Column(TIMESTAMP, server_default=func.now())

    __table_args__ = (
        UniqueConstraint('candidat_id', 'categorie_id', name='uq_candidat_categorie_final'),
    )
