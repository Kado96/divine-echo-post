# Generated migration file for sermons app

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='SermonCategory',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
                ('slug', models.SlugField(blank=True, max_length=120, unique=True)),
                ('description', models.TextField(blank=True)),
                ('icon', models.CharField(blank=True, max_length=10, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'Sermon categories',
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='Sermon',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=200)),
                ('slug', models.SlugField(blank=True, max_length=220, unique=True)),
                ('description', models.TextField()),
                ('preacher_name', models.CharField(max_length=120)),
                ('language', models.CharField(choices=[('fr', 'Français'), ('rn', 'Kirundi'), ('en', 'English'), ('sw', 'Kiswahili')], default='fr', max_length=2)),
                ('duration_minutes', models.PositiveIntegerField(blank=True, null=True)),
                ('video_url', models.URLField(blank=True, help_text='URL YouTube ou lien direct')),
                ('video_file', models.FileField(blank=True, help_text='Fichier vidéo', null=True, upload_to='sermons/videos/')),
                ('audio_url', models.URLField(blank=True, help_text='URL audio')),
                ('audio_file', models.FileField(blank=True, help_text='Fichier audio MP3', null=True, upload_to='sermons/audio/')),
                ('image', models.ImageField(blank=True, null=True, upload_to='sermons/images/')),
                ('featured', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
                ('sermon_date', models.DateField(auto_now_add=True)),
                ('views_count', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('category', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='sermons', to='sermons.sermoncategory')),
            ],
            options={
                'ordering': ['-sermon_date'],
            },
        ),
    ]
