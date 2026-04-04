from django.urls import path, re_path
from . import views

urlpatterns = [
    re_path(r'^songs/?$', views.list_songs, name='list_songs'),
    re_path(r'^stream/?$', views.stream_audio, name='stream_audio'),
]
