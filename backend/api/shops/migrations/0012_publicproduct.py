# Generated migration for PublicProduct model

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('shops', '0011_history_latitude_history_longitude'),
    ]

    operations = [
        migrations.CreateModel(
            name='PublicProduct',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=200)),
                ('slug', models.SlugField(blank=True, max_length=220, unique=True)),
                ('description', models.TextField(blank=True)),
                ('price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('quantity', models.IntegerField(default=0)),
                ('status', models.CharField(choices=[('available', 'Disponible'), ('out_of_stock', 'Rupture de stock'), ('discontinued', 'Arrêté')], default='available', max_length=20)),
                ('image', models.ImageField(blank=True, null=True, upload_to='products/')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('category', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='public_products', to='shops.category')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
