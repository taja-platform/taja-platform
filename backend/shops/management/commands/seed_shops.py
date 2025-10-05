from django.core.management.base import BaseCommand
from faker import Faker
import random
from shops.models import Shop

fake = Faker()

# Define realistic bounding boxes (lat_min, lat_max, lon_min, lon_max)
STATE_COORDS = {
    "Lagos": (6.400, 6.650, 3.200, 3.550),
    "Abuja": (8.900, 9.200, 7.200, 7.600),
    "Kano": (11.900, 12.100, 8.400, 8.700),
    "Rivers": (4.700, 5.100, 6.900, 7.300),
    "Oyo": (7.300, 7.600, 3.800, 4.100),
    "Kaduna": (10.400, 10.700, 7.300, 7.600),
    "Enugu": (6.300, 6.600, 7.300, 7.600),
    "Plateau": (9.800, 10.000, 8.800, 9.200),
    "Delta": (5.200, 5.700, 5.600, 6.200),
    "Borno": (11.800, 12.200, 13.000, 13.300),
}


class Command(BaseCommand):
    help = "Seed the database with 200 realistic Nigerian shops."

    def handle(self, *args, **kwargs):
        total_per_state = 20
        total_created = 0

        self.stdout.write(self.style.MIGRATE_HEADING("🌍 Seeding Shops Across 10 Nigerian States..."))

        for state, (lat_min, lat_max, lon_min, lon_max) in STATE_COORDS.items():
            existing_count = Shop.objects.filter(state=state).count()
            to_create = max(0, total_per_state - existing_count)

            for _ in range(to_create):
                name = f"{fake.first_name()} {random.choice(['Stores', 'Enterprises', 'Supermart', 'Boutique', 'Electronics', 'Bakery'])}"
                phone_number = f"+234{random.randint(7010000000, 9099999999)}"
                address = f"{random.randint(1, 200)} {random.choice(['Market Rd', 'Main St', 'Broadway', 'Station Rd', 'Kingsway', 'Unity Ave'])}, {state}"
                latitude = round(random.uniform(lat_min, lat_max), 6)
                longitude = round(random.uniform(lon_min, lon_max), 6)

                try:
                    Shop.objects.create(
                        name=name,
                        phone_number=phone_number,
                        address=address,
                        latitude=latitude,
                        longitude=longitude,
                        state=state,
                        owner=None,        # ✅ must be NoneType
                        created_by=None,   # ✅ must be NoneType
                        is_active=True,
                    )
                except Exception as e:
                    print(f"❌ Error creating shop in {state}: {e.__class__.__name__} - {e}")
                    raise

                total_created += 1

            self.stdout.write(self.style.SUCCESS(f"✅ Created {to_create} new shops in {state}"))

        self.stdout.write(self.style.SUCCESS(f"\n🎉 Done! Seeded or ensured 20 shops per state across 10 states."))
