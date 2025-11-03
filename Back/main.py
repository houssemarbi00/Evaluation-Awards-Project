# backend/main.py
from fastapi import FastAPI
from .database import engine
from . import models
from .routers import auth, users, candidats, categories, criteres, scores
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="API Evaluation - FastAPI")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Si tu veux créer les tables via SQLAlchemy (optionnel)
# models.Base.metadata.create_all(bind=engine)



app.include_router(auth.router)
app.include_router(users.router)
app.include_router(candidats.router)
app.include_router(categories.router)
app.include_router(criteres.router)
app.include_router(scores.router)
