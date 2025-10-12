from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from faker import Faker
import random
from shops.models import Shop
from accounts.models import Agent

fake = Faker()

# --- State coordinates for approximate bounding boxes ---
STATE_COORDS = {
    "Lagos": (6.400, 6.650, 3.200, 3.550),
    "Abuja": (8.900, 9.200, 7.200, 7.600),
    "Kano": (11.900, 12.100, 8.400, 8.700),
    "Oyo": (7.300, 7.600, 3.800, 4.100),
}

# --- Local Governments (subset, realistic examples) ---
STATE_LGAS = {
    "Lagos": [
        "Ikeja", "Surulere", "Eti-Osa", "Badagry", "Epe",
        "Kosofe", "Alimosho", "Oshodi-Isolo", "Agege", "Amuwo-Odofin"
    ],
    "Abuja": [
        "Abaji", "Bwari", "Gwagwalada", "Kuje", "Kwali", "Municipal Area Council"
    ],
    "Kano": [
        "Dala", "Fagge", "Gwale", "Kumbotso", "Nassarawa",
        "Tarauni", "Tofa", "Kano Municipal"
    ],
    "Oyo": [
        "Ibadan North", "Ibadan South-West", "Ibadan North-East", "Ogbomosho North",
        "Oyo East", "Oyo West", "Saki East", "Saki West", "Atiba", "Afijio"
    ],
}

# --- Random date choices for "created_at" variability ---
DATE_OFFSETS = [timedelta(days=7), timedelta(days=30), timedelta(days=90)]
NOW = timezone.now()

# --- Descriptive examples for shops ---
SHOP_DESCRIPTIONS = [
    "A local provisions shop selling rice, noodles, beverages, and canned goods.",
    "A small neighborhood supermarket offering fresh produce and daily essentials.",
    "A roadside food stand serving hot local dishes and snacks.",
    "A busy restaurant known for jollof rice, soups, and grilled meat.",
    "A mini mart where residents buy cooking ingredients and household supplies.",
    "A popular bakery making fresh bread, pastries, and meat pies every morning.",
    "A bustling market stall selling grains, oil, spices, and vegetables.",
    "A family-run eatery offering breakfast and lunch to workers nearby.",
    "A cozy canteen famous for affordable local meals and soft drinks.",
    "A grocery and food supply store providing both wholesale and retail services.",
    "A corner food mart offering snacks, drinks, and quick meal options.",
    "A local restaurant specializing in traditional Nigerian dishes.",
    "A provision store where customers buy everything from milk to seasoning cubes.",
    "A small supermarket that caters to both walk-in customers and local deliveries.",
    "A breakfast spot serving tea, bread, and akara to early morning commuters.",
]

class Command(BaseCommand):
    help = "Seeds the database with 5 shops per Local Government in each state."

    def handle(self, *args, **options):
        self.stdout.write("🌍 Starting scaled seeding of Shops (by LGA)...")

        agents = list(Agent.objects.all())
        if not agents:
            self.stdout.write(self.style.ERROR("🚨 No Agents found! Please create some agents first."))
            return

        total_created = 0

        self.stdout.write(f"👥 Found {len(agents)} agents.")

        # Loop through each state and its LGAs
        for state, lgas in STATE_LGAS.items():
            lat_min, lat_max, lon_min, lon_max = STATE_COORDS[state]
            self.stdout.write(self.style.MIGRATE_HEADING(f"\n🏙️ Seeding shops for {state}..."))

            for lga in lgas:
                no_of_shops = random.randint(5, 9)
                self.stdout.write(f"  📍 Creating {no_of_shops} shops in {lga}, {state}...")
                for i in range(no_of_shops):  # 5-9 shops per LGA
                    agent = random.choice(agents)
                    name = f"{fake.first_name()} {random.choice([ 'Provisions', 'Supermarket', 'Mini Mart', 'Restaurant', 'Eatery', 'Food Corner', 'Bakery', 'Kitchen', 'Food Hub', 'Canteen', 'Market', 'Food Supply' ])}"                    
                    phone_number = f"+234{random.randint(7010000000, 9099999999)}"
                    address = f"{random.randint(1, 200)} {random.choice(['Market Rd', 'Main St', 'Broadway', 'Kingsway', 'Unity Ave'])}, {lga}, {state}"
                    latitude = round(random.uniform(lat_min, lat_max), 6)
                    longitude = round(random.uniform(lon_min, lon_max), 6)
                    description = random.choice(SHOP_DESCRIPTIONS)
                    created_date = NOW - random.choice(DATE_OFFSETS)

                    try:
                        Shop.objects.create(
                            name=name,
                            phone_number=phone_number,
                            address=address,
                            latitude=latitude,
                            longitude=longitude,
                            state=state,
                            local_government_area=lga,
                            description=description,
                            owner=None,
                            created_by=agent,
                            is_active=random.choice([True, True, True, False]),  # 75% active
                            date_created=created_date,
                        )
                        total_created += 1
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(
                            f"❌ Error creating shop in {lga}, {state}: {e.__class__.__name__} - {e}"
                        ))
                        continue

                self.stdout.write(self.style.SUCCESS(f"✅ Created {no_of_shops} shops in {lga}, {state}"))

        self.stdout.write(self.style.SUCCESS(f"\n🎉 Done! Created {total_created} shops across {len(STATE_LGAS)} states."))
