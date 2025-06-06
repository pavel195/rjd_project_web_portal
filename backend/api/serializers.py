from rest_framework import serializers
from railway_crossings.models import RailwayCrossing, Closure, ClosureComment, ClosureDocument
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


class ClosureDocumentSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ClosureDocument
        fields = ('id', 'title', 'file', 'file_url', 'uploaded_by', 'uploaded_at', 'document_type')
        read_only_fields = ('uploaded_by', 'uploaded_at')
    
    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None


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
    documents = ClosureDocumentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Closure
        fields = (
            'id', 'railway_crossing', 'railway_crossing_detail',
            'created_by', 'start_date', 'end_date', 'reason',
            'status', 'status_display', 'created_at', 'updated_at',
            'admin_approved', 'gibdd_approved', 'comments', 'documents',
            'digital_signature', 'signature_date'
        )
        read_only_fields = (
            'created_by', 'created_at', 'updated_at',
            'admin_approved', 'gibdd_approved', 'status',
            'digital_signature', 'signature_date'
        )


class YandexExportSerializer(serializers.ModelSerializer):
    latitude = serializers.FloatField(source='railway_crossing.latitude')
    longitude = serializers.FloatField(source='railway_crossing.longitude')
    name = serializers.CharField(source='railway_crossing.name')
    
    class Meta:
        model = Closure
        fields = ('id', 'name', 'latitude', 'longitude', 'start_date', 'end_date', 'reason')


class ActivitySerializer(serializers.ModelSerializer):
    """Сериализатор для отображения активностей пользователей"""
    user = UserSerializer(read_only=True)
    closure_id = serializers.IntegerField(source='closure.id')
    closure_name = serializers.CharField(source='closure.railway_crossing.name')
    
    class Meta:
        model = ClosureComment
        fields = ('id', 'user', 'text', 'created_at', 'closure_id', 'closure_name')
        read_only_fields = ('id', 'user', 'text', 'created_at', 'closure_id', 'closure_name') 