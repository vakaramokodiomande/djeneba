# Script de nettoyage et demarrage DJENEBA
Write-Host "========================================" -ForegroundColor Green
Write-Host "  DJENEBA - Nettoyage et demarrage" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 1. Tuer tous les processus Node.js
Write-Host "[1/4] Arret de tous les processus Node.js..." -ForegroundColor Yellow
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "      Processus Node arretes" -ForegroundColor Green

# 2. Liberer les ports
Write-Host "[2/4] Liberation des ports 3000-4000..." -ForegroundColor Yellow
$ports = 3000..4000
foreach ($port in $ports) {
    $connections = netstat -ano | Select-String ":$port " | Select-String "LISTENING"
    if ($connections) {
        $connections | ForEach-Object {
            $pid = $_.ToString().Split()[-1]
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
    }
}
Write-Host "      Ports liberes" -ForegroundColor Green

# 3. Supprimer le dossier .next
Write-Host "[3/4] Suppression du cache .next..." -ForegroundColor Yellow
if (Test-Path ".next") {
    # Forcer la suppression meme si verrouille
    Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1

    # Si ca ne marche pas, utiliser cmd
    if (Test-Path ".next") {
        cmd /c "rd /s /q .next" 2>$null
    }
}
Write-Host "      Cache supprime" -ForegroundColor Green

# 4. Demarrer le serveur
Write-Host "[4/4] Demarrage du serveur..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Le site sera accessible sur:" -ForegroundColor Cyan
Write-Host "  http://localhost:3000" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Appuyez sur CTRL+C pour arreter le serveur" -ForegroundColor Gray
Write-Host ""

# Demarrer
npm run dev
