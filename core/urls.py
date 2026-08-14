from django.urls import path
from core import views

urlpatterns = [
    path('', views.home, name='home'),
    path('about/', views.about, name='about'),
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('profile/', views.profile_view, name='profile'),

    # Donor
    path('donor/', views.donor_dashboard, name='donor_dashboard'),
    path('donor/add/', views.add_donation, name='add_donation'),
    path('donor/respond/<int:req_id>/', views.respond_to_request, name='respond_to_request'),
    path('claim-donation/<int:post_id>/', views.claim_donation, name='claim_donation'),
    path('donor/delete/<int:post_id>/', views.delete_donation, name='delete_donation'),

    # Receiver
    path('receiver/', views.receiver_dashboard, name='receiver_dashboard'),
    path('receiver/request/', views.add_meal_request, name='add_meal_request'),
    path('receiver/confirm/<int:match_id>/', views.confirm_pickup, name='confirm_pickup'),
    path('receiver/delete/<int:req_id>/', views.delete_request, name='delete_request'),

    # Admin
    path('admin-panel/', views.admin_dashboard, name='admin_dashboard'),
    path('admin-panel/match/<int:post_id>/<int:req_id>/', views.manual_match, name='manual_match'),

    # Notifications
    path('notification/read/<int:notif_id>/', views.mark_read, name='mark_read'),
]