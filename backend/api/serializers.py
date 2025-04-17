from rest_framework import serializers
from railway_crossings.models import RailwayCrossing, Closure, ClosureComment
from users.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role')


class RailwayCrossingSerializer(serializers.ModelSerializer):
    class Meta:
        model = RailwayCrossing
        fields = ('id', 'name', 'latitude', 'longitude', 'description')


class ClosureCommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = ClosureComment
        fields = ('id', 'user', 'text', 'created_at')
        read_only_fields = ('user', 'created_at')


class ClosureSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    railway_crossing_detail = RailwayCrossingSerializer(
        source='railway_crossing',
        read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    comments = ClosureCommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Closure
        fields = (
            'id', 'railway_crossing', 'railway_crossing_detail',
            'created_by', 'start_date', 'end_date', 'reason',
            'status', 'status_display', 'created_at', 'updated_at',
            'admin_approved', 'gibdd_approved', 'comments'
        )
        read_only_fields = (
            'created_by', 'created_at', 'updated_at',
            'admin_approved', 'gibdd_approved', 'status'
        )


class YandexExportSerializer(serializers.ModelSerializer):
    latitude = serializers.FloatField(source='railway_crossing.latitude')
    longitude = serializers.FloatField(source='railway_crossing.longitude')
    name = serializers.CharField(source='railway_crossing.name')
    
    class Meta:
        model = Closure
        fields = ('id', 'name', 'latitude', 'longitude', 'start_date', 'end_date', 'reason') 