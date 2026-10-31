@echo off
echo ==================================================
echo Gujarat Khedut Sahay Portal - Starting Servers...
echo ==================================================

echo.
echo Starting Backend (Node.js Server)...
start "Khedut Backend (Port 5000)" cmd /k "cd /d C:\Users\BAPS\.gemini\antigravity\scratch\gujarat-khedut-portal\server && npm run dev"

echo.
echo Starting Frontend (React Vite)...
start "Khedut Frontend (Port 5173)" cmd /k "cd /d C:\Users\BAPS\.gemini\antigravity\scratch\gujarat-khedut-portal\client && npm run dev"

echo.
echo Launching Browser...
powershell -nop -c "Start-Sleep -Seconds 4; Start-Process 'http://localhost:5173'"

exit
