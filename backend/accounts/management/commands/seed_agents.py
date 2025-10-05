from django.core.management.base import BaseCommand
from faker import Faker
from accounts.models import Agent, AgentProfile
import random

class Command(BaseCommand):
    help = "Seed the database with sample Nigerian Agents and AgentProfiles."

    def handle(self, *args, **kwargs):
        fake = Faker("en_NG")

        # Example Nigerian regions (states/LGAs)
        regions = [
            "Lagos Mainland", "Ikeja", "Lekki", "Yaba", "Surulere", "Ibadan North", 
            "Abeokuta South", "Port Harcourt City", "Enugu East", "Benin City", 
            "Jos North", "Maiduguri Central", "Kano Municipal", "Kaduna North", 
            "Owerri West", "Ilorin East", "Asaba", "Calabar South", "Uyo", "Makurdi"
        ]

        # Nigerian phone number prefixes
        prefixes = ["0803", "0805", "0810", "0813", "0815", "0905", "0701", "0706", "0916"]

        total_agents = 20  # you can increase this
        created = 0

        for _ in range(total_agents):
            first_name = fake.first_name()
            last_name = fake.last_name()
            email = f"{first_name.lower()}.{last_name.lower()}@tajaagents.com"
            phone_number = f"{random.choice(prefixes)}{random.randint(1000000, 9999999)}"
            address = fake.address().replace("\n", ", ")
            region = random.choice(regions)

            if not Agent.objects.filter(email=email).exists():
                # Create the Agent user
                agent = Agent.objects.create_user(
                    email=email,
                    password="password123",
                    first_name=first_name,
                    last_name=last_name,
                    role="agent",
                )

                # Update the profile with realistic info
                profile = agent.agent_profile
                profile.phone_number = phone_number
                profile.address = address
                profile.assigned_region = region
                profile.save()

                created += 1
                self.stdout.write(self.style.SUCCESS(f"✅ Created Agent: {first_name} {last_name} - {region}"))

        self.stdout.write(self.style.SUCCESS(f"\n🎯 Successfully created {created} Nigerian agents!"))
