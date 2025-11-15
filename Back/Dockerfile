# Étape 1 : utiliser Python
FROM python:3.11-slim

# Définir le dossier de travail
WORKDIR /app

# Copier les fichiers de ton backend
COPY .. /app/Back

# Installer les dépendances système nécessaires à psycopg2
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Installer les dépendances
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Exposer le port
EXPOSE 8000

# Lancer FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
