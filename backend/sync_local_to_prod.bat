@echo off
REM Script batch pour synchroniser les donnees local -> production
REM Usage: sync_local_to_prod.bat [--dry-run] [--confirm]

echo [SYNC] Script de synchronisation Local -^> Production
echo ================================================================================

REM Changer vers le répertoire du script
cd /d "%~dp0"

REM Vérifier que l'environnement virtuel existe
set "VENV_PYTHON=venv\Scripts\python.exe"
if not exist "%VENV_PYTHON%" (
    echo [ERREUR] Environnement virtuel non trouve dans .\venv\
    echo [INFO] Creez un environnement virtuel avec: python -m venv venv
    exit /b 1
)

REM Essayer d'activer l'environnement virtuel (optionnel mais utile)
if exist "venv\Scripts\activate.bat" (
    echo [INFO] Activation de l'environnement virtuel...
    call venv\Scripts\activate.bat
    if errorlevel 1 (
        echo [ATTENTION] Activation echouee, utilisation directe de Python
    ) else (
        echo [OK] Environnement virtuel active
    )
) else (
    echo [INFO] Utilisation directe de Python de l'environnement virtuel
)

REM Vérifier que Python fonctionne
"%VENV_PYTHON%" --version >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Impossible d'executer Python depuis l'environnement virtuel
    echo [INFO] Verifiez que l'environnement virtuel est correctement installe
    exit /b 1
)

REM Vérifier que DATABASE_URL est défini
if "%DATABASE_URL%"=="" (
    echo [ATTENTION] DATABASE_URL n'est pas defini
    echo [INFO] Definissez la variable d'environnement DATABASE_URL avec l'URL Supabase
    echo        Exemple: set DATABASE_URL=postgresql://user:pass@host:5432/db
    echo.
    set /p continue="Voulez-vous continuer quand meme? (o/n): "
    if /i not "%continue%"=="o" (
        echo [ANNULATION] Synchronisation annulee
        exit /b 1
    )
)

REM Construire les arguments
set args=
if "%1"=="--dry-run" set args=%args% --dry-run
if "%2"=="--dry-run" set args=%args% --dry-run
if "%1"=="--confirm" set args=%args% --confirm
if "%2"=="--confirm" set args=%args% --confirm

echo.
echo [EXECUTION] Lancement du script de synchronisation...
echo ================================================================================
echo.

REM Exécuter le script Python avec le Python de l'environnement virtuel
"%VENV_PYTHON%" sync_local_to_prod.py %args%

REM Capturer le code de sortie
set exitCode=%ERRORLEVEL%

echo.
echo ================================================================================

if %exitCode%==0 (
    echo [SUCCES] Synchronisation terminee avec succes
) else (
    echo [ERREUR] Synchronisation terminee avec des erreurs (code: %exitCode%)
    echo [INFO] Consultez le fichier sync_log.txt pour plus de details
)

exit /b %exitCode%

