from rest_framework import viewsets, permissions, status, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from railway_crossings.models import RailwayCrossing, Closure, ClosureComment, ClosureDocument
from users.models import User
from .serializers import (
    RailwayCrossingSerializer,
    ClosureSerializer,
    ClosureCommentSerializer,
    YandexExportSerializer,
    ActivitySerializer,
    ClosureDocumentSerializer
)
from .permissions import (
    IsRailwayOperator,
    IsAdministration,
    IsTrafficPolice
)


class RailwayCrossingViewSet(viewsets.ModelViewSet):
    queryset = RailwayCrossing.objects.all()
    serializer_class = RailwayCrossingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsRailwayOperator()]
        return super().get_permissions()


class ClosureViewSet(viewsets.ModelViewSet):
    serializer_class = ClosureSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Closure.objects.all()
        
        # Фильтрация по статусу, если указан в параметрах запроса
        status_param = self.request.query_params.get('status', None)
        if status_param:
            queryset = queryset.filter(status=status_param)
            
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    def get_permissions(self):
        if self.action in ['create']:
            return [IsRailwayOperator()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsRailwayOperator()]
        return super().get_permissions()
    
    @action(
        detail=True,
        methods=['post'],
        permission_classes=[IsAdministration]
    )
    def approve_administration(self, request, pk=None):
        closure = self.get_object()
        closure.admin_approved = True
        closure.save()
        return Response({'status': 'Согласовано администрацией'})
    
    @action(
        detail=True,
        methods=['post'],
        permission_classes=[IsTrafficPolice]
    )
    def approve_gibdd(self, request, pk=None):
        closure = self.get_object()
        closure.gibdd_approved = True
        if closure.admin_approved:
            closure.status = Closure.APPROVED
        closure.save()
        return Response({'status': 'Согласовано ГИБДД'})
    
    @action(
        detail=True,
        methods=['post']
    )
    def send_for_approval(self, request, pk=None):
        closure = self.get_object()
        if closure.status == Closure.DRAFT:
            closure.status = Closure.PENDING
            closure.save()
            return Response({'status': 'Отправлено на согласование'})
        return Response(
            {'error': 'Невозможно отправить на согласование'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(
        detail=True,
        methods=['post'],
        permission_classes=[IsAdministration | IsTrafficPolice]
    )
    def reject(self, request, pk=None):
        closure = self.get_object()
        if closure.status == Closure.PENDING:
            closure.status = Closure.REJECTED
            closure.save()
            return Response({'status': 'Заявка отклонена'})
        return Response(
            {'error': 'Невозможно отклонить заявку'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(
        detail=True,
        methods=['post'],
        permission_classes=[IsRailwayOperator]
    )
    def sign_closure(self, request, pk=None):
        closure = self.get_object()
        
        # Проверяем, что заявка в статусе черновика и создана текущим пользователем
        if closure.status != Closure.DRAFT or closure.created_by != request.user:
            return Response(
                {'error': 'Невозможно подписать заявку'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Получаем цифровую подпись из запроса
        digital_signature = request.data.get('digital_signature')
        if not digital_signature:
            return Response(
                {'error': 'Необходимо предоставить цифровую подпись'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Сохраняем подпись и время подписания
        closure.digital_signature = digital_signature
        closure.signature_date = timezone.now()
        closure.save()
        
        return Response({'status': 'Заявка подписана'})


class ClosureCommentViewSet(viewsets.ModelViewSet):
    serializer_class = ClosureCommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        closure_id = self.kwargs.get('closure_id')
        return ClosureComment.objects.filter(closure_id=closure_id)
    
    def perform_create(self, serializer):
        closure_id = self.kwargs.get('closure_id')
        closure = get_object_or_404(Closure, id=closure_id)
        serializer.save(user=self.request.user, closure=closure)


class ClosureDocumentViewSet(viewsets.ModelViewSet):
    serializer_class = ClosureDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]
    
    def get_queryset(self):
        closure_id = self.kwargs.get('closure_id')
        return ClosureDocument.objects.filter(closure_id=closure_id)
    
    def perform_create(self, serializer):
        closure_id = self.kwargs.get('closure_id')
        closure = get_object_or_404(Closure, id=closure_id)
        
        # Проверка, что пользователь имеет право добавлять документы
        # Оператор РЖД может добавлять только для своих заявок в статусе черновика
        if self.request.user.role == User.RAILWAY_OPERATOR:
            if closure.created_by != self.request.user or closure.status != Closure.DRAFT:
                self.permission_denied(
                    self.request, 
                    message="У вас нет прав для добавления документов к этой заявке"
                )
        
        serializer.save(
            uploaded_by=self.request.user,
            closure=closure
        )
    
    def get_permissions(self):
        if self.action in ['destroy']:
            # Удалять документы может только их загрузивший пользователь
            return [permissions.IsAuthenticated()]
        return super().get_permissions()
    
    def perform_destroy(self, instance):
        # Проверяем, что документ удаляет загрузивший его пользователь
        if instance.uploaded_by != self.request.user:
            self.permission_denied(
                self.request, 
                message="У вас нет прав для удаления этого документа"
            )
        instance.delete()


class YandexMapExportView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        closures = Closure.objects.filter(status=Closure.APPROVED)
        serializer = YandexExportSerializer(closures, many=True)
        return Response(serializer.data)


class ActivityView(APIView):
    """Представление для получения последних активностей пользователей"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        # Получаем последние 10 комментариев ко всем заявкам
        comments = ClosureComment.objects.all().select_related('user', 'closure', 'closure__railway_crossing').order_by('-created_at')[:10]
        serializer = ActivitySerializer(comments, many=True)
        return Response(serializer.data) 