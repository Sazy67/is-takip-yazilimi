@echo off
echo ================================================
echo Is Takip Yazilimi Baslatiliyor...
echo ================================================
echo.
echo Frontend build ediliyor...
cd frontend
call npm run build
cd ..
echo.
echo Backend baslatiliyor...
cd backend
python app.py
pause
