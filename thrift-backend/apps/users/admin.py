from django.contrib import admin

from .models import Wishlist


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ("user", "tshirt", "created_at")
    list_select_related = ("user", "tshirt")
    search_fields = ("user__username", "user__email", "tshirt__title", "tshirt__slug")
    list_filter = ("created_at",)
    ordering = ("-created_at",)
