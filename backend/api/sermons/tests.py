from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from .models import SermonCategory, Sermon


class SermonTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.category = SermonCategory.objects.create(
            name="Enseignements",
            slug="enseignements"
        )
        self.sermon = Sermon.objects.create(
            title="Test Sermon",
            slug="test-sermon",
            description="Test description",
            preacher_name="John Doe",
            category=self.category,
            language="fr"
        )

    def test_sermon_list(self):
        response = self.client.get("/api/sermons/")
        self.assertEqual(response.status_code, 200)

    def test_sermon_detail(self):
        response = self.client.get(f"/api/sermons/{self.sermon.slug}/")
        self.assertEqual(response.status_code, 200)
