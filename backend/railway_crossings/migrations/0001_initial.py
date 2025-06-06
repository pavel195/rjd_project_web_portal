# Generated by Django 4.2.7 on 2025-04-18 18:51

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Closure',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start_date', models.DateTimeField(verbose_name='Дата и время начала')),
                ('end_date', models.DateTimeField(verbose_name='Дата и время окончания')),
                ('reason', models.TextField(verbose_name='Причина закрытия')),
                ('status', models.CharField(choices=[('draft', 'Черновик'), ('pending', 'На согласовании'), ('approved', 'Согласовано'), ('rejected', 'Отклонено')], default='draft', max_length=20, verbose_name='Статус заявки')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Дата обновления')),
                ('admin_approved', models.BooleanField(default=False, verbose_name='Согласовано администрацией')),
                ('gibdd_approved', models.BooleanField(default=False, verbose_name='Согласовано ГИБДД')),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='closures', to=settings.AUTH_USER_MODEL, verbose_name='Создатель заявки')),
            ],
            options={
                'verbose_name': 'Заявка на закрытие',
                'verbose_name_plural': 'Заявки на закрытие',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='RailwayCrossing',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200, verbose_name='Название переезда')),
                ('latitude', models.FloatField(verbose_name='Широта')),
                ('longitude', models.FloatField(verbose_name='Долгота')),
                ('description', models.TextField(blank=True, verbose_name='Описание переезда')),
            ],
            options={
                'verbose_name': 'Железнодорожный переезд',
                'verbose_name_plural': 'Железнодорожные переезды',
            },
        ),
        migrations.CreateModel(
            name='ClosureComment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.TextField(verbose_name='Комментарий')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')),
                ('closure', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comments', to='railway_crossings.closure', verbose_name='Заявка на закрытие')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comments', to=settings.AUTH_USER_MODEL, verbose_name='Пользователь')),
            ],
            options={
                'verbose_name': 'Комментарий к заявке',
                'verbose_name_plural': 'Комментарии к заявкам',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddField(
            model_name='closure',
            name='railway_crossing',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='closures', to='railway_crossings.railwaycrossing', verbose_name='Железнодорожный переезд'),
        ),
    ]
