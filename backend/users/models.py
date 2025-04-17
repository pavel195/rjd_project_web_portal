from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    RAILWAY_OPERATOR = 'railway_operator'
    ADMINISTRATION = 'administration'
    TRAFFIC_POLICE = 'traffic_police'

    ROLE_CHOICES = [
        (RAILWAY_OPERATOR, 'Оператор ЖД'),
        (ADMINISTRATION, 'Администрация региона'),
        (TRAFFIC_POLICE, 'Представитель ГИБДД'),
    ]

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default=RAILWAY_OPERATOR,
        verbose_name='Роль пользователя'
    )
    
    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'
        
    def __str__(self):
        return self.username 