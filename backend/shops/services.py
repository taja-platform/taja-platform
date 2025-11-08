# shops/services.py
import requests
import json
from django.conf import settings
from django.core.cache import cache
from decimal import Decimal

# Redis cache time-to-live (e.g., 30 days)
CACHE_TTL = 60 * 60 * 24 * 30
OPENCAGE_BASE_URL = "https://api.opencagedata.com/geocode/v1/json"

def get_location_details(latitude, longitude):
    """
    Performs reverse geocoding using OpenCage API with Redis caching.
    Returns a dictionary: {'state': '...', 'local_government_area': '...'}
    """
    if not latitude or not longitude:
        return {'state': None, 'local_government_area': None}

    # Format coords to 6 decimal places for consistent cache key
    lat = Decimal(latitude).quantize(Decimal("0.000001"))
    lon = Decimal(longitude).quantize(Decimal("0.000001"))
    
    # 1. Check Redis Cache
    cache_key = f"geocode:{lat}:{lon}"
    cached_data = cache.get(cache_key)
    
    if cached_data:
        print(f"CACHE HIT for {cache_key}")
        # Return the cached data (already a dict)
        return cached_data

    # 2. Cache Miss: Check API Key
    api_key = settings.OPENCAGE_API_KEY
    if not api_key:
        print("ERROR: OPENCAGE_API_KEY is not configured.")
        return {'state': 'API Key Missing', 'local_government_area': 'API Key Missing'}


    # 3. Call OpenCage API
    params = {
        'q': f"{lat},{lon}",
        'key': api_key,
        'limit': 1,
    }
    
    try:
        response = requests.get(OPENCAGE_BASE_URL, params=params, timeout=5)
        response.raise_for_status() # Raises HTTPError for bad responses (4xx or 5xx)
        data = response.json()

        if not data['results']:
            # No result found
            return {'state': None, 'local_government_area': None}

        # Extract structured components
        components = data['results'][0]['components']
        
        # --- Extraction Logic ---
        
        # State/Region (admin_level 4/3)
        state_or_region = (
            components.get('state') or
            components.get('province') or
            components.get('region')
        )
        
        # Local Government Area / County / District (admin_level 6/7)
        lga_or_district = (
            components.get('city_district') or
            components.get('county') or
            components.get('state_district') or
            components.get('local_administrative_area')
        )
        
        result = {
            'state': state_or_region,
            'local_government_area': lga_or_district
        }

        # 4. Cache the result before returning
        cache.set(cache_key, result, timeout=CACHE_TTL)
        print(f"CACHE SET for {cache_key}")
        
        return result

    except requests.exceptions.RequestException as e:
        print(f"OpenCage API Error: {e}")
        # Return Nones on API failure
        return {'state': 'API Error', 'local_government_area': 'API Error'}
