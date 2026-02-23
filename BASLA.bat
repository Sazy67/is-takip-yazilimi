@echo off
echo Backend baslat iliyor...
start cmd /k "cd backend && python app.py"

timeout /t 3

echo Frontend baslatiliyor...
start cmd /k "cd frontend && npm run dev"

echo.
echo Uygulamalar baslatildi!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause
