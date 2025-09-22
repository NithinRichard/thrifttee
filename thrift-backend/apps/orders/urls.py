from django.urls import path
from . import views

app_name = 'orders'

urlpatterns = [
    # Order endpoints
    path('', views.OrderListView.as_view(), name='order-list'),
    path('create/', views.CreateOrderView.as_view(), name='create-order'),
    path('<str:order_number>/', views.OrderDetailView.as_view(), name='order-detail'),
    
    # Payment endpoints
    path('payment/create-intent/', views.CreatePaymentIntentView.as_view(), name='create-payment-intent'),
    path('payment/confirm/', views.ConfirmPaymentView.as_view(), name='confirm-payment'),
]