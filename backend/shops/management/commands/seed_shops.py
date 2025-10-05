from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from faker import Faker
import random
from shops.models import Shop
# CRITICAL: Import the Agent model from accounts
from accounts.models import Agent 

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
    "Delta": (5.200, 5.700, 5.600, 6.000),
    "Imo": (5.400, 5.600, 6.900, 7.200),
}

# Define date variation options (in days)
DATE_OPTIONS = [
    timedelta(days=90),
    timedelta(days=30),
    timedelta(days=7),
]
NOW = timezone.now()


class Command(BaseCommand):
    help = 'Seeds the database with random Shop data, linked to Agents, with variable dates and status.'

    def handle(self, *args, **options):
        self.stdout.write("🔥 Starting database seeding for Shops...")

        # 1. Fetch Agents
        agents = list(Agent.objects.all())
        if not agents:
            self.stdout.write(self.style.ERROR("🚨 No Agents found! Please run a command to create agents first."))
            return

        # 2. Setup Agent Assignment List and Counters
        MIN_SHOPS_PER_AGENT = 10
        INACTIVE_SHOPS_PER_AGENT = 3
        
        # Ensures every agent is present at least 10 times (to meet the minimum requirement)
        agent_assignment_list = agents * MIN_SHOPS_PER_AGENT 

        # Add extra shops randomly to distribute the remaining shops evenly
        # Target an additional 10 shops per state, which means 10 * 10 = 100 extra shops
        num_extra_shops = len(STATE_COORDS) * 10
        agent_assignment_list.extend(random.choices(agents, k=num_extra_shops))
        
        # Shuffle the list so the shops are assigned randomly to agents
        random.shuffle(agent_assignment_list)
        
        self.stdout.write(f"👥 Found {len(agents)} agents. Creating a total of {len(agent_assignment_list)} shops...")

        total_created = 0
        agent_shop_counts = {agent.id: 0 for agent in agents}
        # Counter to track how many inactive shops have been assigned to each agent
        agents_with_inactive_count = {agent.id: 0 for agent in agents}


        # 3. Iterate through the prepared list of agents
        for agent in agent_assignment_list:
            
            # 4. Determine Shop Location RANDOMLY
            state = random.choice(list(STATE_COORDS.keys()))
            lat_min, lat_max, lon_min, lon_max = STATE_COORDS[state]
            
            # 5. Determine Shop Details
            name = f"{fake.first_name()} {random.choice(['Stores', 'Enterprises', 'Supermart', 'Boutique', 'Electronics', 'Bakery'])}"
            phone_number = f"+234{random.randint(7010000000, 9099999999)}"
            address = f"{random.randint(1, 200)} {random.choice(['Market Rd', 'Main St', 'Broadway'])}, {state}"
            latitude = round(random.uniform(lat_min, lat_max), 6)
            longitude = round(random.uniform(lon_min, lon_max), 6)

            # 6. Set date_created randomly
            time_ago = random.choice(DATE_OPTIONS)
            created_date = NOW - time_ago

            # 7. Set is_active: Mark as inactive if the agent hasn't reached their quota
            is_active = True
            if agents_with_inactive_count[agent.id] < INACTIVE_SHOPS_PER_AGENT:
                 # ⭐ Mark the shop as inactive and increment the agent's inactive count
                 is_active = False
                 agents_with_inactive_count[agent.id] += 1
            
            
            try:
                Shop.objects.create(
                    name=name,
                    phone_number=phone_number,
                    address=address,
                    latitude=latitude,
                    longitude=longitude,
                    state=state,         # Matches your Shop model field
                    owner=None,          # ✅ Requested: Owner remains None
                    created_by=agent,    # ✅ Assigned to the current agent
                    is_active=is_active, # ✅ Set activity status (3 per agent are inactive)
                    date_created=created_date, # ✅ Set varying creation date
                )
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"❌ Error creating shop: {e.__class__.__name__} - {e}"))
                raise

            total_created += 1
            agent_shop_counts[agent.id] += 1
        
        # 8. Final Summary
        self.stdout.write(self.style.SUCCESS(f"\n🎉 Successfully completed seeding. Total shops created: {total_created}"))
        for agent_id, count in agent_shop_counts.items():
            try:
                agent = Agent.objects.get(id=agent_id)
                agent_name = agent.get_full_name() or agent.email
            except Agent.DoesNotExist:
                 agent_name = f"Unknown Agent ({agent_id})"

            self.stdout.write(f"  - {agent_name}: {count} shops (Inactive: {agents_with_inactive_count[agent_id]})")