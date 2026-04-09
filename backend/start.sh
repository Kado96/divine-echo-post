#!/bin/bash
# Script de démarrage pour Render
# Exécute les migrations, collectstatic et crée le superuser avant de démarrer le serveur

set -e

echo "Starting application..."

# CRITIQUE : Sur Render, si "Root Directory" est configuré à "backend",
# le script s'exécute déjà depuis backend/, donc pas besoin de cd
# Si "Root Directory" n'est pas configuré, on doit aller dans backend/
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CURRENT_DIR="$(pwd)"

# Si on est déjà dans backend/ (Root Directory configuré), rester ici
# Sinon, aller dans backend/
if [[ "$CURRENT_DIR" != *"/backend" ]] && [[ "$CURRENT_DIR" != *"/backend/" ]]; then
    if [[ -d "backend" ]]; then
        cd backend || exit 1
    elif [[ -d "$SCRIPT_DIR/backend" ]]; then
        cd "$SCRIPT_DIR/backend" || exit 1
    else
        # Si le script est dans backend/, aller dans ce répertoire
        cd "$SCRIPT_DIR" || exit 1
    fi
fi

# Définir le PYTHONPATH explicitement pour Render
# Sur Render, le chemin est /opt/render/project/src/backend/
export PYTHONPATH="$(pwd):${PYTHONPATH:-}"

echo "Current directory: $(pwd)"
echo "PYTHONPATH: $PYTHONPATH"

# Fonction pour retry avec backoff exponentiel
retry_with_backoff() {
    local max_attempts=5
    local attempt=1
    local delay=2
    
    while [ $attempt -le $max_attempts ]; do
        echo "🔄 Attempt $attempt/$max_attempts..."
        if "$@"; then
            return 0
        fi
        
        if [ $attempt -lt $max_attempts ]; then
            echo "⏳ Waiting ${delay}s before retry..."
            sleep $delay
            delay=$((delay * 2))  # Backoff exponentiel
        fi
        
        attempt=$((attempt + 1))
    done
    
    echo "❌ Failed after $max_attempts attempts"
    return 1
}

# Lancer les migrations avec retry (problèmes de connectivité IPv6 possibles)
echo "🔄 Running migrations (with retry on connection errors)..."
retry_with_backoff python manage.py migrate --noinput || {
    echo "❌ Migration failed after all retries!"
    exit 1
}

# Collecter les fichiers statiques
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput || {
    echo "❌ collectstatic failed!"
    exit 1
}

# Créer le superuser via le script dédié
echo "👤 Creating or updating superuser..."
python create_admin.py || {
    echo "⚠️ Superuser creation script failed"
}

# Démarrer le serveur (gunicorn)
echo "🚀 Starting server..."
echo "Gunicorn command: gunicorn shalomministry.wsgi:application --bind 0.0.0.0:$PORT"
exec gunicorn shalomministry.wsgi:application --bind 0.0.0.0:$PORT
