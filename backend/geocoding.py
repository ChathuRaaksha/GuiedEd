"""
Geocoding service for converting Swedish postcodes to coordinates.
Uses Nominatim (OpenStreetMap) API for postcode lookups.
"""

import logging
import requests
from typing import Dict, List, Tuple, Optional
from time import sleep

logger = logging.getLogger(__name__)

class GeocodingService:
    """Handles geocoding of Swedish postcodes to lat/lng coordinates."""
    
    def __init__(self):
        self.base_url = "https://nominatim.openstreetmap.org/search"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'MentorMatching/1.0 (educational-platform)'
        })
        
        # Cache for postcode lookups to reduce API calls
        self._cache: Dict[str, Optional[Tuple[float, float]]] = {}
    
    def geocode_postcodes(self, postcodes: Dict[str, str]) -> Dict[str, Tuple[float, float]]:
        """
        Geocode multiple postcodes to coordinates.
        
        Args:
            postcodes: Dict mapping person_id -> postcode
            
        Returns:
            Dict mapping person_id -> (lat, lng) for successfully geocoded postcodes
        """
        results = {}
        
        for person_id, postcode in postcodes.items():
            try:
                coords = self._geocode_single_postcode(postcode)
                if coords:
                    results[person_id] = coords
                    logger.info(f"Geocoded {person_id} ({postcode}): {coords}")
                else:
                    logger.warning(f"Failed to geocode {person_id} ({postcode})")
                
                # Be respectful to the API - small delay between requests
                sleep(0.1)
                
            except Exception as e:
                logger.error(f"Error geocoding {person_id} ({postcode}): {e}")
        
        logger.info(f"Successfully geocoded {len(results)} out of {len(postcodes)} postcodes")
        return results
    
    def _geocode_single_postcode(self, postcode: str) -> Optional[Tuple[float, float]]:
        """
        Geocode a single Swedish postcode to coordinates.
        
        Args:
            postcode: 5-digit Swedish postal code
            
        Returns:
            Tuple of (lat, lng) or None if geocoding failed
        """
        # Check cache first
        if postcode in self._cache:
            return self._cache[postcode]
        
        try:
            # Format postcode for Swedish format (XXXXX -> XXX XX)
            formatted_postcode = f"{postcode[:3]} {postcode[3:]}"
            
            params = {
                'q': formatted_postcode,
                'country': 'Sweden',
                'format': 'json',
                'limit': 1,
                'addressdetails': 1
            }
            
            response = self._session.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if data and len(data) > 0:
                result = data[0]
                
                # Verify this is actually in Sweden
                if 'address' in result and result['address'].get('country_code') == 'se':
                    lat = float(result['lat'])
                    lng = float(result['lon'])
                    
                    coords = (lat, lng)
                    self._cache[postcode] = coords
                    return coords
                else:
                    logger.warning(f"Postcode {postcode} not found in Sweden")
            
            # Cache negative results to avoid repeated lookups
            self._cache[postcode] = None
            return None
            
        except requests.exceptions.RequestException as e:
            logger.error(f"HTTP error geocoding {postcode}: {e}")
            return None
        except (ValueError, KeyError) as e:
            logger.error(f"Data parsing error for {postcode}: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error geocoding {postcode}: {e}")
            return None


# Fallback coordinates for major Swedish cities (if geocoding fails)
FALLBACK_COORDINATES = {
    # Stockholm area (postcodes starting with 1)
    '10000': (59.3293, 18.0686),  # Stockholm
    '11000': (59.3293, 18.0686),
    '12000': (59.3293, 18.0686),
    '13000': (59.3293, 18.0686),
    '14000': (59.3293, 18.0686),
    '15000': (59.3293, 18.0686),
    '16000': (59.3293, 18.0686),
    '17000': (59.3293, 18.0686),
    '18000': (59.3293, 18.0686),
    '19000': (59.3293, 18.0686),
    
    # Gothenburg area (postcodes starting with 4)
    '40000': (57.7089, 11.9746),  # Gothenburg
    '41000': (57.7089, 11.9746),
    '42000': (57.7089, 11.9746),
    '43000': (57.7089, 11.9746),
    '44000': (57.7089, 11.9746),
    '45000': (57.7089, 11.9746),
    '46000': (57.7089, 11.9746),
    
    # Malmö area (postcodes starting with 2)
    '20000': (55.6050, 13.0038),  # Malmö
    '21000': (55.6050, 13.0038),
    '22000': (55.6050, 13.0038),
    '23000': (55.6050, 13.0038),
    '24000': (55.6050, 13.0038),
    '25000': (55.6050, 13.0038),
    
    # Uppsala area (postcodes starting with 75)
    '75000': (59.8586, 17.6389),  # Uppsala
    
    # Linköping area (postcodes starting with 58)
    '58000': (58.4108, 15.6214),  # Linköping
    
    # Örebro area (postcodes starting with 70)
    '70000': (59.2741, 15.2066),  # Örebro
}


def get_fallback_coordinates(postcode: str) -> Optional[Tuple[float, float]]:
    """
    Get fallback coordinates for a postcode based on regional patterns.
    
    Args:
        postcode: 5-digit Swedish postal code
        
    Returns:
        Tuple of (lat, lng) or None if no fallback available
    """
    if len(postcode) != 5 or not postcode.isdigit():
        return None
    
    # Try exact match first
    if postcode in FALLBACK_COORDINATES:
        return FALLBACK_COORDINATES[postcode]
    
    # Try regional fallbacks
    prefix = postcode[:2] + '000'
    if prefix in FALLBACK_COORDINATES:
        return FALLBACK_COORDINATES[prefix]
    
    # Try single digit prefix
    prefix = postcode[:1] + '0000'
    if prefix in FALLBACK_COORDINATES:
        return FALLBACK_COORDINATES[prefix]
    
    return None
