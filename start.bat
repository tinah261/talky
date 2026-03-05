@echo off
TITLE Lancement de Talky App
echo ==========================================
echo    DEMARRAGE DU PROJET (BACK + FRONT)
echo ==========================================

:: 1. Lancement du Backend (Spring Boot)
echo Démarrage du Backend...
start "BACKEND - Spring Boot" cmd /k "cd backend && mvn spring-boot:run"

:: Petit délai pour laisser le backend respirer avant de lancer le front
timeout /t 5 /nobreak > nul

:: 2. Lancement du Frontend (React)
echo Démarrage du Frontend...
start "FRONTEND - React" cmd /k "cd frontend && npm start"

echo.
echo ==========================================
echo    LES DEUX TERMINAUX SONT OUVERTS
echo ==========================================
pause