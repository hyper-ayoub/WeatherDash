from django.db import models
from django.contrib.auth.models import User

# model region
class Region(models.Model):
    nom = models.CharField(max_length=100)
    def __str__(self):
        return  self.nom

# model Ville:
class Ville(models.Model):
    region = models.ForeignKey(Region, on_delete=models.CASCADE)
    nom = models.CharField(max_length=200)
    pays= models.CharField(max_length=200)
    
    def __str__(self):
        return f"{self.nom} , {self.pays}"
