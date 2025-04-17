from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RailwayCrossingViewSet, 
    ClosureViewSet, 
    ClosureCommentViewSet,
    YandexMapExportView
)

router = DefaultRouter()
router.register('crossings', RailwayCrossingViewSet, basename='crossings')
router.register('closures', ClosureViewSet, basename='closures')
router.register(
    r'closures/(?P<closure_id>\d+)/comments',
    ClosureCommentViewSet,
    basename='closure-comments'
)

urlpatterns = [
    path('', include(router.urls)),
    path('export/yandex/', YandexMapExportView.as_view(), name='yandex-export'),
] 