from django.contrib import admin
from django.utils.html import format_html
from .models import Brand, Category, TShirt, TShirtReview

@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'tshirt_count', 'created_at']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']
    
    def tshirt_count(self, obj):
        return obj.tshirts.count()
    tshirt_count.short_description = 'T-Shirts'

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'tshirt_count', 'created_at']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']
    
    def tshirt_count(self, obj):
        return obj.tshirts.count()
    tshirt_count.short_description = 'T-Shirts'

@admin.register(TShirt)
class TShirtAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'brand', 'size', 'color', 'condition', 'price',
        'is_available', 'is_featured', 'image_preview', 'created_at'
    ]
    list_filter = [
        'brand', 'size', 'condition', 'gender', 'is_available',
        'is_featured', 'created_at'
    ]
    search_fields = ['title', 'description', 'brand__name', 'color', 'tags']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['created_at', 'updated_at', 'image_preview']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'description', 'brand', 'category')
        }),
        ('Physical Attributes', {
            'fields': ('size', 'color', 'material', 'gender')
        }),
        ('Condition & Pricing', {
            'fields': ('condition', 'price', 'original_price', 'quantity')
        }),
        ('Availability', {
            'fields': ('is_available', 'is_featured')
        }),
        ('Images', {
            'fields': ('primary_image', 'image_2', 'image_3', 'image_4', 'image_preview')
        }),
        ('SEO & Marketing', {
            'fields': ('meta_description', 'tags'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def image_preview(self, obj):
        if obj.primary_image:
            return format_html(
                '<img src="{}" style="width: 100px; height: 100px; object-fit: cover;" />',
                obj.primary_image.url
            )
        return "No image"
    image_preview.short_description = 'Preview'

@admin.register(TShirtReview)
class TShirtReviewAdmin(admin.ModelAdmin):
    list_display = ['tshirt', 'user', 'rating', 'title', 'is_verified_purchase', 'created_at']
    list_filter = ['rating', 'is_verified_purchase', 'created_at']
    search_fields = ['tshirt__title', 'user__username', 'title', 'comment']
    readonly_fields = ['created_at', 'updated_at']
