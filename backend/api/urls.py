from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RailwayCrossingViewSet, 
    ClosureViewSet, 
    ClosureCommentViewSet,
    YandexMapExportView,
    ActivityView,
    ClosureDocumentViewSet
)

router = DefaultRouter()
router.register('crossings', RailwayCrossingViewSet, basename='crossings')
router.register('closures', ClosureViewSet, basename='closures')
router.register(
    r'closures/(?P<closure_id>\d+)/comments',
    ClosureCommentViewSet,
    basename='closure-comments'
)
router.register(
    r'closures/(?P<closure_id>\d+)/documents',
    ClosureDocumentViewSet,
    basename='closure-documents'
)

urlpatterns = [
    path('', include(router.urls)),
    path('export/yandex/', YandexMapExportView.as_view(), name='yandex-export'),
    path('activities/', ActivityView.as_view(), name='activities'),
] 