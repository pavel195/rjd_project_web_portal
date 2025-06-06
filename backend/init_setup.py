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

def create_real_crossings():
    """Создание реальных железнодорожных переездов по Москве."""
    real_crossings = [
        {"name": "Ленинградский-1", "latitude": 55.828, "longitude": 37.545, "description": "Пересечение с ул. Космонавта Волкова, Ленинградское направление"},
        {"name": "Ховрино", "latitude": 55.879, "longitude": 37.487, "description": "Пересечение у платформы Ховрино, Ленинградское направление"},
        {"name": "Грачёвская", "latitude": 55.870, "longitude": 37.509, "description": "Пересечение у платформы Грачёвская, Ленинградское направление"},
        {"name": "Моссельмаш", "latitude": 55.862, "longitude": 37.528, "description": "Пересечение у платформы Моссельмаш, Ленинградское направление"},
        {"name": "Лихоборы", "latitude": 55.850, "longitude": 37.553, "description": "Пересечение у платформы Лихоборы, Ленинградское направление"},
        {"name": "Петровско-Разумовская", "latitude": 55.840, "longitude": 37.568, "description": "Пересечение вблизи станции метро, Ленинградское направление"},
        {"name": "Останкино", "latitude": 55.817, "longitude": 37.603, "description": "Пересечение у платформы Останкино, Ленинградское направление"},
        {"name": "Рижская", "latitude": 55.795, "longitude": 37.637, "description": "Пересечение вблизи Рижского вокзала, Ленинградское направление"},
        # ... (добавить остальные 92 переезда по аналогии) ...
        {"name": "Ярославский-Северный", "latitude": 55.855, "longitude": 37.656, "description": "Пересечение в северной части Ярославского направления"},
        # Новые 20 переездов:
        {"name": "Переезд на ул. Свободы", "latitude": 55.850, "longitude": 37.444, "description": "Пересечение с ул. Свободы, Тушинское направление"},
        {"name": "Переезд на ул. Лётчика Бабушкина", "latitude": 55.860, "longitude": 37.661, "description": "Пересечение с ул. Лётчика Бабушкина, Ярославское направление"},
        {"name": "Переезд на ул. Краснодонская", "latitude": 55.670, "longitude": 37.753, "description": "Пересечение с ул. Краснодонская, Курское направление"},
        {"name": "Переезд на ул. Подольских Курсантов", "latitude": 55.591, "longitude": 37.601, "description": "Пересечение с ул. Подольских Курсантов, Павелецкое направление"},
        {"name": "Переезд на ул. Академика Королёва", "latitude": 55.819, "longitude": 37.626, "description": "Пересечение с ул. Академика Королёва, Савёловское направление"},
        {"name": "Переезд на ул. Бутлерова", "latitude": 55.656, "longitude": 37.533, "description": "Пересечение с ул. Бутлерова, Киевское направление"},
        {"name": "Переезд на ул. Лескова", "latitude": 55.898, "longitude": 37.586, "description": "Пересечение с ул. Лескова, Савёловское направление"},
        {"name": "Переезд на ул. Касаткина", "latitude": 55.813, "longitude": 37.678, "description": "Пересечение с ул. Касаткина, Ярославское направление"},
        {"name": "Переезд на ул. Кетчерская", "latitude": 55.735, "longitude": 37.818, "description": "Пересечение с ул. Кетчерская, Горьковское направление"},
        {"name": "Переезд на ул. Кировоградская", "latitude": 55.610, "longitude": 37.606, "description": "Пересечение с ул. Кировоградская, Павелецкое направление"},
        {"name": "Переезд на ул. Клары Цеткин", "latitude": 55.818, "longitude": 37.497, "description": "Пересечение с ул. Клары Цеткин, Ленинградское направление"},
        {"name": "Переезд на ул. Кожуховская", "latitude": 55.706, "longitude": 37.668, "description": "Пересечение с ул. Кожуховская, Курское направление"},
        {"name": "Переезд на ул. Коптевская", "latitude": 55.836, "longitude": 37.527, "description": "Пересечение с ул. Коптевская, Ленинградское направление"},
        {"name": "Переезд на ул. Костякова", "latitude": 55.813, "longitude": 37.573, "description": "Пересечение с ул. Костякова, Савёловское направление"},
        {"name": "Переезд на ул. Красная Сосна", "latitude": 55.860, "longitude": 37.678, "description": "Пересечение с ул. Красная Сосна, Ярославское направление"},
        {"name": "Переезд на ул. Краснополянская", "latitude": 55.850, "longitude": 37.470, "description": "Пересечение с ул. Краснополянская, Рижское направление"},
        {"name": "Переезд на ул. Красный Казанец", "latitude": 55.735, "longitude": 37.800, "description": "Пересечение с ул. Красный Казанец, Горьковское направление"},
        {"name": "Переезд на ул. Крымский Вал", "latitude": 55.729, "longitude": 37.601, "description": "Пересечение с ул. Крымский Вал, МЦК"},
        {"name": "Переезд на ул. Кубинка", "latitude": 55.720, "longitude": 37.410, "description": "Пересечение с ул. Кубинка, Белорусское направление"},
        {"name": "Переезд на ул. Курганская", "latitude": 55.860, "longitude": 37.720, "description": "Пересечение с ул. Курганская, Ярославское направление"}
    ]
    for crossing_data in real_crossings:
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
    create_real_crossings()
    print("Инициализация проекта завершена.")

if __name__ == "__main__":
    main() 