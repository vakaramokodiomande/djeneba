@echo off
echo ========================================
echo   DJENEBA - Demarrage du serveur
echo ========================================
echo.

echo [1/3] Arret des processus existants...
taskkill /F /IM node.exe /T 2>nul
timeout /t 2 /nobreak >nul

echo [2/3] Nettoyage du cache...
if exist .next rmdir /s /q .next 2>nul
timeout /t 1 /nobreak >nul

echo [3/3] Demarrage du serveur sur le port 4000...
echo.
echo Le site sera accessible sur: http://localhost:4000
echo Appuyez sur CTRL+C pour arreter le serveur
echo.
npm run dev -- -p 4000
