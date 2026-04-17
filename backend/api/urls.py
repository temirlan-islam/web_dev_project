from django.urls import path
from .views import login_view, logout_view, profile_view, change_password_view, TaskListAPIView, TaskDetailAPIView, CategoryListAPIView

urlpatterns = [
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('profile/', profile_view, name='profile'),
    path('change-password/', change_password_view, name='change-password'),
    path('tasks/', TaskListAPIView.as_view(), name='task-list'),
    path('tasks/<int:pk>/', TaskDetailAPIView.as_view(), name='task-detail'),
    path('categories/', CategoryListAPIView.as_view(), name='category-list'),
]