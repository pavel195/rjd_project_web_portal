#!/bin/bash

echo "Waiting for database..."
sleep 5

# Создание директорий для миграций, если их нет
mkdir -p api/migrations
mkdir -p users/migrations
mkdir -p railway_crossings/migrations

# Создаем пустые файлы __init__.py в директориях миграций
touch api/migrations/__init__.py
touch users/migrations/__init__.py
touch railway_crossings/migrations/__init__.py

# Создаем миграции для всех приложений
python manage.py makemigrations users
python manage.py makemigrations railway_crossings
python manage.py makemigrations api
python manage.py makemigrations

# Применяем миграции
python manage.py migrate

# Собираем статические файлы
python manage.py collectstatic --noinput

# Пытаемся создать суперпользователя
python init_setup.py || echo "Error during init_setup.py, continuing anyway..."

# Запуск сервера в режиме разработки (для удобства отладки)
if [ "$DEBUG" = "true" ]; then
    echo "Starting Django in DEBUG mode"
    python manage.py runserver 0.0.0.0:9009
else
    echo "Starting Gunicorn server"
    exec gunicorn app.wsgi:application --bind 0.0.0.0:9009 
fi 