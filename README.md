# Task Manager

Task Manager is a web application for managing tasks and projects.  
Built with Angular + Django REST Framework.

## Members
- Temirlan
- Zangar
- Anel

## Technologies
- **Frontend:** Angular, TypeScript, CSS
- **Backend:** Django, Django REST Framework
- **Auth:** JWT
- **DB:** SQLite

## Features
- Register / Login / Logout
- Create projects
- Add, edit, delete tasks
- Change task status (in progress / done)
- Comments on tasks
- Users see only their own projects and tasks

## How to Run

### Backend
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
