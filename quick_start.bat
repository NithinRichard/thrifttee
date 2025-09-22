@echo off
echo ========================================
echo    Thrift T-Shirt Shop Quick Start
echo ========================================
echo.

echo [1/6] Setting up Django backend...
cd thrift-backend

echo Creating virtual environment...
python -m venv venv

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing Python dependencies...
pip install -r requirements.txt

echo Creating Django project structure...
django-admin startproject thrift_shop .

echo Creating Django apps...
python manage.py startapp products apps/products
python manage.py startapp users apps/users
python manage.py startapp orders apps/orders
python manage.py startapp cart apps/cart
python manage.py startapp common apps/common

echo [2/6] Setting up database...
python manage.py makemigrations
python manage.py migrate

echo [3/6] Creating superuser (follow prompts)...
python manage.py createsuperuser

echo [4/6] Setting up React frontend...
cd ..\thrift-frontend

echo Installing Node.js dependencies...
call npm install

echo Installing additional dependencies...
call npm install axios framer-motion react-router-dom react-hook-form @tanstack/react-query

echo Installing Tailwind CSS...
call npm install -D tailwindcss postcss autoprefixer
call npx tailwindcss init -p

echo [5/6] Creating sample data...
cd ..\thrift-backend
python create_sample_data.py

echo [6/6] Setup complete!
echo.
echo ========================================
echo           SETUP COMPLETE!
echo ========================================
echo.
echo To start your development servers:
echo.
echo Backend (Django):
echo   cd thrift-backend
echo   venv\Scripts\activate
echo   python manage.py runserver
echo.
echo Frontend (React):
echo   cd thrift-frontend  
echo   npm start
echo.
echo Then visit:
echo   Frontend: http://localhost:3000
echo   Backend Admin: http://localhost:8000/admin
echo   API: http://localhost:8000/api/v1
echo.
echo Happy coding! 🚀
pause