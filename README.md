# Голос железнодорожных переездов

Система автоматизации процесса согласования и информирования о длительном закрытии железнодорожных переездов.

## Компоненты системы

- **Backend**: Django + Gunicorn
- **Frontend**: React
- **База данных**: PostgreSQL
- **Веб-сервер**: Nginx

## Запуск проекта

```bash
# Клонирование репозитория
git clone <url-репозитория>
cd rjd_project

# Запуск через Docker Compose
docker-compose up -d
```

После запуска приложение будет доступно:
- Основное приложение: http://localhost
- API бэкенда: http://localhost/api
- Админка Django: http://localhost/admin (логин: admin, пароль: admin123)

## Тестовые пользователи

В системе автоматически создаются следующие тестовые пользователи:

| Логин          | Пароль       | Роль                  |
|----------------|--------------|----------------------|
| rzd_operator   | operator123  | Оператор ЖД          |
| admin_region   | admin123     | Администрация региона |
| gibdd_inspector| inspector123 | Представитель ГИБДД   |

## Структура проекта

```
/
├── backend/         # Django приложение
├── frontend/        # React приложение
├── nginx/           # Конфигурация Nginx
└── docker-compose.yml
```

## Роли пользователей

- Оператор ЖД
- Администрация региона
- Представитель ГИБДД 