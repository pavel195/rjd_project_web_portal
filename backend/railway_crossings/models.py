from django.db import models
from users.models import User


class RailwayCrossing(models.Model):
    name = models.CharField(
        max_length=200,
        verbose_name='Название переезда'
    )
    latitude = models.FloatField(
        verbose_name='Широта'
    )
    longitude = models.FloatField(
        verbose_name='Долгота'
    )
    description = models.TextField(
        blank=True,
        verbose_name='Описание переезда'
    )
    
    class Meta:
        verbose_name = 'Железнодорожный переезд'
        verbose_name_plural = 'Железнодорожные переезды'
        
    def __str__(self):
        return self.name


class Closure(models.Model):
    DRAFT = 'draft'
    PENDING = 'pending'
    APPROVED = 'approved'
    REJECTED = 'rejected'
    
    STATUS_CHOICES = [
        (DRAFT, 'Черновик'),
        (PENDING, 'На согласовании'),
        (APPROVED, 'Согласовано'),
        (REJECTED, 'Отклонено'),
    ]
    
    railway_crossing = models.ForeignKey(
        RailwayCrossing,
        on_delete=models.CASCADE,
        related_name='closures',
        verbose_name='Железнодорожный переезд'
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='closures',
        verbose_name='Создатель заявки'
    )
    start_date = models.DateTimeField(
        verbose_name='Дата и время начала'
    )
    end_date = models.DateTimeField(
        verbose_name='Дата и время окончания'
    )
    reason = models.TextField(
        verbose_name='Причина закрытия'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=DRAFT,
        verbose_name='Статус заявки'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата создания'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Дата обновления'
    )
    admin_approved = models.BooleanField(
        default=False,
        verbose_name='Согласовано администрацией'
    )
    gibdd_approved = models.BooleanField(
        default=False,
        verbose_name='Согласовано ГИБДД'
    )
    digital_signature = models.TextField(
        blank=True,
        null=True,
        verbose_name='Цифровая подпись'
    )
    signature_date = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name='Дата подписания'
    )
    
    class Meta:
        verbose_name = 'Заявка на закрытие'
        verbose_name_plural = 'Заявки на закрытие'
        ordering = ['-created_at']
        
    def __str__(self):
        return f'{self.railway_crossing} ({self.start_date} - {self.end_date})'


class ClosureDocument(models.Model):
    """Модель для хранения документов, приложенных к заявке на закрытие"""
    closure = models.ForeignKey(
        Closure,
        on_delete=models.CASCADE,
        related_name='documents',
        verbose_name='Заявка на закрытие'
    )
    title = models.CharField(
        max_length=255,
        verbose_name='Название документа'
    )
    file = models.FileField(
        upload_to='closure_documents/%Y/%m/',
        verbose_name='Файл документа'
    )
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='uploaded_documents',
        verbose_name='Загружено пользователем'
    )
    uploaded_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата загрузки'
    )
    document_type = models.CharField(
        max_length=50,
        default='supporting',
        choices=[
            ('road_scheme', 'Схема организации дорожного движения'),
            ('approval', 'Согласование с другими службами'),
            ('contract', 'Договор на выполнение работ'),
            ('supporting', 'Сопроводительный документ'),
            ('other', 'Другое')
        ],
        verbose_name='Тип документа'
    )
    
    class Meta:
        verbose_name = 'Документ заявки'
        verbose_name_plural = 'Документы заявок'
        ordering = ['-uploaded_at']
        
    def __str__(self):
        return f'{self.title} ({self.closure})'


class ClosureComment(models.Model):
    closure = models.ForeignKey(
        Closure,
        on_delete=models.CASCADE,
        related_name='comments',
        verbose_name='Заявка на закрытие'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='comments',
        verbose_name='Пользователь'
    )
    text = models.TextField(
        verbose_name='Комментарий'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата создания'
    )
    
    class Meta:
        verbose_name = 'Комментарий к заявке'
        verbose_name_plural = 'Комментарии к заявкам'
        ordering = ['-created_at']
        
    def __str__(self):
        return f'Комментарий от {self.user} к {self.closure}' 