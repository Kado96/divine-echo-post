"""
⚠️ IMPORTANT : Admin Django réservé à la gestion système uniquement

Pour toutes les opérations normales (CRUD), utilisez l'API REST :
- Frontend : /api/shops/shops/, /api/shops/products/ (lecture)
- Administration : /api/admin/shops/shops/, /api/admin/shops/products/ (CRUD complet)

L'admin Django (/admin/) est uniquement pour :
- Gestion système avancée
- Débogage
- Super-admin uniquement

Toutes les opérations utilisateur doivent passer par l'API.
"""
from django.contrib import admin
from .models import *

admin.site.register(Shop)
admin.site.register(BasicProduct)
admin.site.register(Product)
admin.site.register(Sales)
admin.site.register(Supply)
admin.site.register(Category)
admin.site.register(SubCategory)
admin.site.register(SalePriceHistory)