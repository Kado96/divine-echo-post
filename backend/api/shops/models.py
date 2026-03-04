from django.db import models
from django.utils.text import slugify
from api.accounts.models import Account, User


class Shop(models.Model):
    id = models.BigAutoField(primary_key=True)
    owner = models.ForeignKey(Account, blank=True, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    province = models.CharField(max_length=50, null=True ,blank=True)
    commune = models.CharField(max_length=50, null=True ,blank=True)
    quarter = models.CharField(max_length=50, null=True ,blank=True)
    address = models.CharField(max_length=50, null=True ,blank=True)
    is_active = models.BooleanField(default=False)

    longitude = models.CharField(max_length=100, null=True, blank=True)
    latitude = models.CharField(max_length=100, null=True, blank=True)

    created_at = models.DateField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.owner}"

class ControlFrequency(models.Model):
    id = models.BigAutoField(primary_key=True)
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE)
    days = models.PositiveIntegerField(default=0)
    hours = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.days} - {self.hours}"
    
class Category(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=50)
    created_at = models.DateField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.name
    
class SubCategory(models.Model):
    id = models.BigAutoField(primary_key=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    created_at = models.DateField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.category.name}  : {self.name}"

class BasicProduct(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=50)
    sub_category = models.ForeignKey(SubCategory, null=True, blank=True, on_delete=models.CASCADE)
    image = models.FileField(upload_to="images/", null=True, blank=True)
    created_at = models.DateField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.name} "


class Product(models.Model):
    id = models.BigAutoField(primary_key=True)
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE)
    product = models.ForeignKey(BasicProduct, null=True, blank=True, on_delete=models.CASCADE)
    name = models.CharField(max_length=50, null=True, blank=True)
    in_unity = models.CharField(max_length=50, null=True, blank=True)
    out_unity = models.CharField(max_length=50, null=True, blank=True)
    rapport = models.IntegerField(default=1, null=True, blank=True)
    quantity = models.IntegerField(default=0)
    sale_price = models.FloatField(default=0)
    buy_price = models.FloatField(default=0)

    last_control_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.product}"

    class Meta:
        unique_together = "shop","product","sale_price"

class SalePriceHistory(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    old_price = models.FloatField(default=0)
    new_price = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True) 

    def __str__(self) -> str:
        return f"{self.product.shop.name} - {self.old_price} -> {self.new_price}"

class Supply(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=0)
    total_buy_price = models.FloatField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f" Achat du {self.created_at} de {self.product.name} - qt : {self.quantity} "


class Sales(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=0)
    amount =  models.FloatField(default=0.0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f" Vente de {self.product.name} - qt : {self.quantity} montant : {self.amount}"


class History(models.Model):
    id = models.BigAutoField(primary_key=True)
    shop_name = models.CharField(max_length=30)
    shop_owner = models.CharField(max_length=30)
    shop_id = models.IntegerField()

    province = models.CharField(max_length=50, null=True ,blank=True)
    commune = models.CharField(max_length=50, null=True ,blank=True)
    quarter = models.CharField(max_length=50, null=True ,blank=True)
    address = models.CharField(max_length=50, null=True ,blank=True)
    longitude = models.CharField(max_length=30, null=True, blank=True)
    latitude = models.CharField(max_length=30, null=True, blank=True)

    action = models.CharField(max_length=50)
    category = models.CharField(max_length=50, null=True, blank=True)
    sub_category = models.CharField(max_length=50, null=True, blank=True)
    product_name = models.CharField(max_length=50)
    product_id = models.IntegerField()
    quantity = models.IntegerField()

    unity_price = models.IntegerField(null=True)
    total_price = models.IntegerField(null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


# New model for public store administration
class PublicProduct(models.Model):
    """Modèle simplifié pour la gestion de la boutique publique"""
    STATUS_CHOICES = [
        ('available', 'Disponible'),
        ('out_of_stock', 'Rupture de stock'),
        ('discontinued', 'Arrêté'),
    ]
    
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField(blank=True)
    category = models.ForeignKey(Category, null=True, blank=True, on_delete=models.SET_NULL, related_name="public_products")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
