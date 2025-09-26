from django.contrib import admin
from django.utils.html import format_html
from .models import Brand, Category, TShirt, TShirtReview, ShippingZone, ShippingMethod, ShippingRate

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
        'is_available', 'is_featured', 'has_detailed_condition_info',
        'condition_verified', 'image_preview', 'created_at'
    ]
    list_filter = [
        'brand', 'size', 'condition', 'gender', 'is_available',
        'is_featured', 'condition_verified', 'has_stains', 'has_holes',
        'has_fading', 'has_pilling', 'has_repairs', 'created_at'
    ]
    search_fields = ['title', 'description', 'brand__name', 'color', 'tags', 'condition_notes']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['created_at', 'updated_at', 'image_preview', 'all_images_preview']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'description', 'brand', 'category')
        }),
        ('Physical Attributes', {
            'fields': ('size', 'color', 'material', 'gender')
        }),
        ('Enhanced Condition Reporting', {
            'fields': (
                'condition', 'condition_notes', 'condition_confidence',
                ('has_stains', 'has_holes', 'has_fading', 'has_pilling', 'has_repairs')
            ),
            'classes': ('collapse',)
        }),
        ('Detailed Measurements', {
            'fields': (
                ('pit_to_pit', 'shoulder_to_shoulder'),
                ('front_length', 'back_length', 'sleeve_length'),
                'weight_grams'
            ),
            'classes': ('collapse',)
        }),
        ('Condition Photos', {
            'fields': ('condition_photo_1', 'condition_photo_2', 'condition_photo_3', 'condition_photo_4'),
            'classes': ('collapse',)
        }),
        ('Condition Verification', {
            'fields': ('condition_verified', 'condition_verifier', 'condition_verified_at'),
            'classes': ('collapse',)
        }),
        ('Pricing & Availability', {
            'fields': ('price', 'original_price', 'quantity', 'is_available', 'is_featured')
        }),
        ('Images', {
            'fields': ('primary_image', 'image_2', 'image_3', 'image_4', 'image_preview', 'all_images_preview')
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

    def all_images_preview(self, obj):
        """Show preview of all images including condition photos."""
        images_html = []
        all_imgs = obj.all_images

        for i, img in enumerate(all_imgs[:8]):  # Show first 8 images
            if img:
                try:
                    images_html.append(
                        format_html(
                            '<img src="{}" style="width: 60px; height: 60px; object-fit: cover; margin: 2px;" title="Image {}" />',
                            img.url, i + 1
                        )
                    )
                except:
                    continue

        if images_html:
            return format_html('<div style="display: flex; flex-wrap: wrap;">{}</div>', ''.join(images_html))
        return "No images"
    all_images_preview.short_description = 'All Images Preview'

    def has_detailed_condition_info(self, obj):
        return obj.has_detailed_condition_info
    has_detailed_condition_info.boolean = True
    has_detailed_condition_info.short_description = 'Has Detailed Info'

@admin.register(TShirtReview)
class TShirtReviewAdmin(admin.ModelAdmin):
    list_display = ['tshirt', 'user', 'rating', 'title', 'is_verified_purchase', 'created_at']
    list_filter = ['rating', 'is_verified_purchase', 'created_at']
    search_fields = ['tshirt__title', 'user__username', 'title', 'comment']
    readonly_fields = ['created_at', 'updated_at']


# Shipping Admin Classes

@admin.register(ShippingZone)
class ShippingZoneAdmin(admin.ModelAdmin):
    list_display = ['name', 'base_cost', 'free_shipping_threshold', 'is_active', 'states_list']
    list_filter = ['is_active']
    search_fields = ['name', 'description']
    list_editable = ['base_cost', 'free_shipping_threshold', 'is_active']

    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'is_active')
        }),
        ('Indian Geographic Coverage', {
            'fields': ('states', 'metro_cities'),
            'classes': ('collapse',)
        }),
        ('Pricing', {
            'fields': ('base_cost', 'free_shipping_threshold')
        }),
    )

    def states_list(self, obj):
        if obj.states:
            states = [state.strip() for state in obj.states.split(',')]
            return ', '.join(states[:3]) + ('...' if len(states) > 3 else '')
        return 'All States'
    states_list.short_description = 'States'


@admin.register(ShippingMethod)
class ShippingMethodAdmin(admin.ModelAdmin):
    list_display = ['name', 'estimated_days', 'cost_multiplier', 'max_weight_kg', 'is_active']
    list_filter = ['is_active', 'estimated_days']
    search_fields = ['name', 'description']
    list_editable = ['estimated_days', 'cost_multiplier', 'max_weight_kg', 'is_active']

    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'estimated_days', 'is_active')
        }),
        ('Cost & Limits', {
            'fields': ('cost_multiplier', 'max_weight_kg', 'max_dimensions_sum')
        }),
    )


@admin.register(ShippingRate)
class ShippingRateAdmin(admin.ModelAdmin):
    list_display = ['zone', 'method', 'min_weight_kg', 'max_weight_kg', 'base_cost', 'per_kg_cost', 'insurance_rate', 'is_active']
    list_filter = ['zone', 'method', 'is_active']
    search_fields = ['zone__name', 'method__name']
    list_editable = ['base_cost', 'per_kg_cost', 'insurance_rate', 'is_active']

    fieldsets = (
        ('Rate Definition', {
            'fields': ('zone', 'method', 'is_active')
        }),
        ('Weight Range', {
            'fields': ('min_weight_kg', 'max_weight_kg')
        }),
        ('Cost Calculation', {
            'fields': ('base_cost', 'per_kg_cost', 'insurance_rate')
        }),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('zone', 'method')
