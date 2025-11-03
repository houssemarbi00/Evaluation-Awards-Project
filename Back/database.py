# backend/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

DATABASE_URL ="postgresql://postgres:ma9arouna@localhost:5432/postgres"

engine = create_engine(DATABASE_URL, future=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency pour FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
