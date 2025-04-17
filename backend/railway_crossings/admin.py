from django.contrib import admin
from .models import RailwayCrossing, Closure, ClosureComment


class ClosureCommentInline(admin.TabularInline):
    model = ClosureComment
    extra = 0


@admin.register(RailwayCrossing)
class RailwayCrossingAdmin(admin.ModelAdmin):
    list_display = ('name', 'latitude', 'longitude')
    search_fields = ('name',)


@admin.register(Closure)
class ClosureAdmin(admin.ModelAdmin):
    list_display = (
        'railway_crossing', 'start_date', 'end_date',
        'status', 'admin_approved', 'gibdd_approved'
    )
    list_filter = ('status', 'admin_approved', 'gibdd_approved')
    search_fields = ('railway_crossing__name', 'reason')
    date_hierarchy = 'start_date'
    inlines = [ClosureCommentInline]


@admin.register(ClosureComment)
class ClosureCommentAdmin(admin.ModelAdmin):
    list_display = ('closure', 'user', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('text', 'user__username') 