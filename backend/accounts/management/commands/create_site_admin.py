from django.core.management.base import BaseCommand
from accounts.models import Admin

class Command(BaseCommand):
    help = 'Seeds the database with specific Site Admin accounts (Tunde, WB, GB)'

    def handle(self, *args, **kwargs):
        # The specific list of admins
        admins_to_create = [
            "tunde@taja.com",
            "WB@taja.com",
            "GB@taja.com"
        ]

        self.stdout.write("--- Starting Admin Seeding ---")

        for email in admins_to_create:
            # Logic: Password is "123456" + the name part of the email
            # Example: tunde@taja.com -> 123456tunde
            name_part = email.split('@')[0]
            password = f"{name_part}@pass123"

            if Admin.objects.filter(email=email).exists():
                self.stdout.write(self.style.WARNING(f"[SKIP] Admin {email} already exists."))
            else:
                try:
                    # Using Admin proxy model ensures role="admin"
                    Admin.objects.create_user(email=email, password=password)
                    self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Created {email} | Password: {password}"))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"[ERROR] Failed to create {email}: {str(e)}"))