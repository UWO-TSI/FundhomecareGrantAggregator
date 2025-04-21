import os
import json
import logging
import sys
from datetime import datetime
import time
from supabase import create_client
from dotenv import load_dotenv

# Import all scrapers
from scrapers.hcscraper import HealthCanadaGrantScraper
from scrapers.kcscraper import KindredGrantScraper
from scrapers.otfscraper import OTFGrantScraper

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s — %(levelname)s — %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(os.path.join("logs", "scraper_run.log"))
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Initialize Supabase client if credentials are available
supabase = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("Supabase client initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing Supabase client: {e}")
else:
    logger.warning("Supabase credentials not found. Will save data locally only.")
    # Debug information
    logger.info(f"SUPABASE_URL available: {SUPABASE_URL is not None}")
    logger.info(f"SUPABASE_KEY available: {SUPABASE_KEY is not None}")

def save_to_supabase(grants):
    """
    Save grants to Supabase database using upsert to avoid duplicates
    """
    if not supabase:
        logger.warning("Supabase client not available. Skipping database upload.")
        return
    
    try:
        # Ensure grants is a list
        if not isinstance(grants, list):
            grants = [grants]
        
        if not grants:
            logger.warning("No grants to save to Supabase")
            return
        
        # Prepare data for upsert
        # This ensures that if a grant with the same ID already exists, it will be updated
        logger.info(f"Upserting {len(grants)} grants to Supabase")
        
        # Convert datetime objects to ISO format for Supabase
        formatted_grants = []
        for grant in grants:
            formatted_grant = grant.copy()
            
            # Format dates for Supabase if needed
            for key in ['crawled_date', 'last_updated']:
                if key in formatted_grant and not isinstance(formatted_grant[key], str):
                    formatted_grant[key] = formatted_grant[key].isoformat() if formatted_grant[key] else None
            
            # Make sure deadline is in proper date format (YYYY-MM-DD)
            if 'deadline' in formatted_grant and formatted_grant['deadline']:
                # If it's already a string in the right format, keep it
                if not isinstance(formatted_grant['deadline'], str):
                    formatted_grant['deadline'] = formatted_grant['deadline'].strftime('%Y-%m-%d')
                elif len(formatted_grant['deadline']) > 10:
                    # Truncate if it has time component
                    formatted_grant['deadline'] = formatted_grant['deadline'][:10]
            
            # Make sure numeric fields are properly typed
            if 'amount' in formatted_grant and formatted_grant['amount'] is not None:
                try:
                    formatted_grant['amount'] = float(formatted_grant['amount'])
                except (ValueError, TypeError):
                    formatted_grant['amount'] = None
            
            # Ensure boolean fields are properly typed
            if 'is_active' in formatted_grant:
                formatted_grant['is_active'] = bool(formatted_grant['is_active'])
                
            formatted_grants.append(formatted_grant)
        
        # Upsert data to Grant table
        # This will insert new records and update existing ones based on the grant_id
        result = supabase.table('Grant').upsert(formatted_grants, on_conflict='grant_id').execute()
        
        logger.info(f"Successfully saved {len(formatted_grants)} grants to Supabase")
        return result
    except Exception as e:
        logger.error(f"Error saving to Supabase: {e}")
        return None

def ensure_directories():
    """
    Create necessary directories for storing grant data and logs
    """
    base_dir = os.path.dirname(os.path.abspath(__file__))
    directories = [
        os.path.join(base_dir, "data", "hc_grant"),
        os.path.join(base_dir, "data", "kc_grant"),
        os.path.join(base_dir, "data", "otf_grant"),
        os.path.join(base_dir, "logs")
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        logger.info(f"Ensured directory exists: {directory}")

def run_all_scrapers():
    """
    Run all scrapers and save results to Supabase and local files
    """
    all_grants = []
    
    # Ensure all directories exist
    ensure_directories()
    
    try:
        # Health Canada Grants
        logger.info("Starting Health Canada Grant scraper")
        hc_scraper = HealthCanadaGrantScraper()
        hc_grants = hc_scraper.run()
        if hc_grants:
            logger.info(f"Found {len(hc_grants)} Health Canada grants")
            all_grants.extend(hc_grants)
        else:
            logger.warning("No Health Canada grants found")
        
        # Allow some time between scrapers to avoid rate limiting
        time.sleep(5)
        
        # Kindred Cares Grants
        logger.info("Starting Kindred Cares Grant scraper")
        kc_scraper = KindredGrantScraper()
        kc_grants = kc_scraper.run()
        if kc_grants:
            logger.info(f"Found {len(kc_grants)} Kindred Cares grants")
            all_grants.extend(kc_grants)
        else:
            logger.warning("No Kindred Cares grants found")
        
        time.sleep(5)
        
        # OTF Grants
        logger.info("Starting OTF Grant scraper")
        otf_scraper = OTFGrantScraper()
        otf_grants = otf_scraper.run()
        if otf_grants:
            logger.info(f"Found {len(otf_grants)} OTF grants")
            all_grants.extend(otf_grants)
        else:
            logger.warning("No OTF grants found")
        
        # Save all grants to Supabase
        if all_grants:
            save_to_supabase(all_grants)
            logger.info(f"Completed scraping with {len(all_grants)} total grants")
            
            # Save combined grants to data directory for reference
            try:
                combined_file = os.path.join("data", "all_grants.json")
                with open(combined_file, 'w', encoding='utf-8') as f:
                    json.dump(all_grants, f, ensure_ascii=False, indent=4)
                logger.info(f"Saved combined grants to {combined_file}")
            except Exception as e:
                logger.error(f"Error saving combined grants file: {e}")
        else:
            logger.warning("No grants found from any source")
    
    except Exception as e:
        logger.error(f"Error running scrapers: {e}", exc_info=True)
    
    return all_grants

if __name__ == "__main__":
    logger.info("Starting grant scraper process")
    grants = run_all_scrapers()
    logger.info("Grant scraper process completed") 