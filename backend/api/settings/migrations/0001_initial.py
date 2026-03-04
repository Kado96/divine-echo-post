# Generated manually
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='SiteSettings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('site_name', models.CharField(default='Shalom Ministry', max_length=200)),
                ('description', models.TextField(blank=True, default='Plateforme de formation chrétienne en ligne')),
                ('logo', models.ImageField(blank=True, help_text="Logo du site", null=True, upload_to='settings/')),
                ('logo_url', models.URLField(blank=True, help_text="OU URL du logo (si pas d'upload)")),
                ('contact_email', models.EmailField(blank=True, default='contact@shalomministry.org', max_length=254)),
                ('contact_phone', models.CharField(blank=True, default='+257 79 000 000', max_length=50)),
                ('contact_address', models.TextField(blank=True, default='Bujumbura, Burundi')),
                ('facebook_url', models.URLField(blank=True)),
                ('youtube_url', models.URLField(blank=True)),
                ('instagram_url', models.URLField(blank=True)),
                ('twitter_url', models.URLField(blank=True)),
                ('whatsapp_url', models.URLField(blank=True)),
                ('hero_title', models.CharField(blank=True, default='Grandissez dans la foi', max_length=200)),
                ('hero_subtitle', models.TextField(blank=True, default='Découvrez nos émissions, enseignements et temps de méditation pour approfondir votre relation avec Dieu.')),
                ('about_content', models.TextField(blank=True, default='Bienvenue sur Shalom Ministry, une plateforme dédiée à la croissance spirituelle.')),
                ('contact_content', models.TextField(blank=True, default='Contactez-nous pour toute question ou demande.')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Paramètres du site',
                'verbose_name_plural': 'Paramètres du site',
                'ordering': ['-updated_at'],
            },
        ),
    ]

