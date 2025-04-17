#!/bin/bash

python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput

# Создание суперпользователя, если он не существует
python init_setup.py

# Запуск сервера
exec gunicorn app.wsgi:application --bind 0.0.0.0:8000 