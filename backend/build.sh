#!/bin/bash
# Script de build pour Render
# Ne fait QUE installer les dépendances et vérifier les imports
# Les migrations et collectstatic sont exécutés dans start.sh

set -e

echo "Starting build..."

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
    fi
fi

# Définir le PYTHONPATH explicitement pour Render
export PYTHONPATH="$(pwd):${PYTHONPATH:-}"

echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Vérifier que le code s'importe correctement
echo "🔍 Testing module imports..."
python -c "
import sys
import os
sys.path.insert(0, os.getcwd())
try:
    import api.settings
    print('   ✅ api.settings importable')
except ImportError as e:
    print('   ❌ api.settings NOT importable:', e)
    sys.exit(1)
" || {
    echo "   ❌ CRITICAL: api.settings is NOT importable after pip install"
    exit 1
}

echo "Build finished. Skipping migrations and collectstatic during build."
