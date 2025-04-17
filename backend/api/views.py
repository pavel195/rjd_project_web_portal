from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from railway_crossings.models import RailwayCrossing, Closure, ClosureComment
from users.models import User
from .serializers import (
    RailwayCrossingSerializer,
    ClosureSerializer,
    ClosureCommentSerializer,
    YandexExportSerializer
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
        return Closure.objects.all()
    
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


class YandexMapExportView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        closures = Closure.objects.filter(status=Closure.APPROVED)
        serializer = YandexExportSerializer(closures, many=True)
        return Response(serializer.data) 