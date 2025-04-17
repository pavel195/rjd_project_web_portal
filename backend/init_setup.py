#!/usr/bin/env python
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "app.settings")
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from django.core.management import call_command
from railway_crossings.models import RailwayCrossing

User = get_user_model()

def create_superuser():
    """Создание суперпользователя."""
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='admin123',
            first_name='Админ',
            last_name='Системы',
        )
        print("Суперпользователь создан.")
    else:
        print("Суперпользователь уже существует.")

def create_test_users():
    """Создание тестовых пользователей."""
    users = [
        {
            'username': 'rzd_operator',
            'email': 'operator@rzd.ru',
            'password': 'operator123',
            'first_name': 'Иван',
            'last_name': 'Петров',
            'role': User.RAILWAY_OPERATOR
        },
        {
            'username': 'admin_region',
            'email': 'admin@region.ru',
            'password': 'admin123',
            'first_name': 'Сергей',
            'last_name': 'Иванов',
            'role': User.ADMINISTRATION
        },
        {
            'username': 'gibdd_inspector',
            'email': 'inspector@gibdd.ru',
            'password': 'inspector123',
            'first_name': 'Алексей',
            'last_name': 'Смирнов',
            'role': User.TRAFFIC_POLICE
        }
    ]
    
    for user_data in users:
        if not User.objects.filter(username=user_data['username']).exists():
            User.objects.create_user(
                username=user_data['username'],
                email=user_data['email'],
                password=user_data['password'],
                first_name=user_data['first_name'],
                last_name=user_data['last_name'],
                role=user_data['role']
            )
            print(f"Пользователь {user_data['username']} создан.")
        else:
            print(f"Пользователь {user_data['username']} уже существует.")

def create_test_crossings():
    """Создание тестовых переездов."""
    crossings = [
        {
            'name': 'Переезд №1 "Северный"',
            'latitude': 55.755819,
            'longitude': 37.617644,
            'description': 'Железнодорожный переезд на севере города'
        },
        {
            'name': 'Переезд №2 "Южный"',
            'latitude': 55.742933,
            'longitude': 37.615812,
            'description': 'Железнодорожный переезд на юге города'
        },
        {
            'name': 'Переезд №3 "Восточный"',
            'latitude': 55.751426,
            'longitude': 37.643658,
            'description': 'Железнодорожный переезд на востоке города'
        }
    ]
    
    for crossing_data in crossings:
        if not RailwayCrossing.objects.filter(name=crossing_data['name']).exists():
            RailwayCrossing.objects.create(**crossing_data)
            print(f"Переезд {crossing_data['name']} создан.")
        else:
            print(f"Переезд {crossing_data['name']} уже существует.")

def run_migrations():
    """Выполнение миграций."""
    call_command('makemigrations')
    call_command('migrate')
    print("Миграции выполнены.")

def main():
    """Основная функция инициализации."""
    print("Инициализация проекта...")
    run_migrations()
    create_superuser()
    create_test_users()
    create_test_crossings()
    print("Инициализация проекта завершена.")

if __name__ == "__main__":
    main() 