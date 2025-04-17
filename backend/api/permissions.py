from rest_framework import permissions
from users.models import User


class IsRailwayOperator(permissions.BasePermission):
    """
    Разрешение для операторов ЖД
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and
            request.user.role == User.RAILWAY_OPERATOR
        )


class IsAdministration(permissions.BasePermission):
    """
    Разрешение для представителей администрации
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and
            request.user.role == User.ADMINISTRATION
        )


class IsTrafficPolice(permissions.BasePermission):
    """
    Разрешение для представителей ГИБДД
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and
            request.user.role == User.TRAFFIC_POLICE
        ) 