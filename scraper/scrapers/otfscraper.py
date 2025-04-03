import requests
from bs4 import BeautifulSoup
import re
import json
from datetime import datetime
import os
import logging
import sys
import time
from scrapers.utils import save_grant_data
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s — %(levelname)s — %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S,%3d'
)
logger = logging.getLogger(__name__)

class OTFGrantScraper:
    def __init__(self):
        self.next_grant_id = 2001  # start at 2001
        self.grants = []
        self.grant_urls = {
            "Seed Grant": "https://otf.ca/our-grants/community-investments-grants/seed-grant",
            "Grow Grant": "https://otf.ca/our-grants/community-investments-grants/grow-grant"
        }
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        }
        
    def fetch_page(self, url):
        # fetch html content with error handling and retries
        max_retries = 3
        for attempt in range(max_retries):
            try:
                logger.info(f"Fetching {url}")
                response = requests.get(url, headers=self.headers, timeout=30)
                response.raise_for_status()
                return response.content
            except requests.exceptions.RequestException as e:
                logger.error(f"Error fetching {url} (attempt {attempt+1}/{max_retries}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(2)  
                else:
                    return None
    
    def extract_description(self, soup, grant_type):
        # extract grant description based on the grant type
        description = ""
        
        # different heading texts based on grant type
        heading_texts = {
            "Seed Grant": "Build capacity and prepare for future programming",
            "Grow Grant": "Scale up a program and service to benefit your community"
        }
        
        # find the heading with the specified text
        heading = soup.find(string=re.compile(re.escape(heading_texts.get(grant_type, "")), re.IGNORECASE))
        
        if heading:
            # try to find the parent element that contains the heading
            parent_elem = None
            for tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
                found = soup.find(tag, string=re.compile(re.escape(heading_texts.get(grant_type, "")), re.IGNORECASE))
                if found:
                    parent_elem = found
                    break
            
            if parent_elem:
                # get the first paragraph after the heading
                next_p = parent_elem.find_next('p')
                if next_p:
                    description = next_p.text.strip()

        if not description:
            # look for paragraphs directly on the page
            paragraphs = soup.find_all('p')
            for p in paragraphs:
                # if the paragraph follows the header section and seems like a description
                if len(p.text.strip()) > 50:  
                    description = p.text.strip()
                    break
        
        return description
    
    def extract_amount(self, soup, grant_type):
        # Extract the minimum amount from Amount Awarded section
        amount = None
        
        # Look for the Amount Awarded section
        amount_section = soup.find(string=re.compile(r'AMOUNT AWARDED', re.IGNORECASE))
        
        if amount_section:
            # Find the parent container
            parent = amount_section
            for _ in range(5):  # Look up a few levels to find the containing element
                if parent.parent:
                    parent = parent.parent
                else:
                    break
            
            # Different minimum amounts based on grant type
            expected_min = "10,000" if grant_type == "Seed Grant" else "50,000"
            logger.info(f"Looking for minimum amount of ${expected_min} for {grant_type}")
            
            # Get the entire text of the section
            section_text = parent.get_text()
            
            # Specific pattern based on grant type
            if grant_type == "Seed Grant":
                min_match = re.search(r'Minimum\s+\$?([\d,]+)', section_text, re.IGNORECASE)
            else:  # Grow Grant
                min_match = re.search(r'Minimum\s+\$?([\d,]+)', section_text, re.IGNORECASE)
            
            if min_match:
                min_amount = min_match.group(1).replace(',', '')
                try:
                    amount = float(min_amount)
                    logger.info(f"Extracted amount: ${amount} for {grant_type}")
                except ValueError:
                    logger.error(f"Failed to convert amount '{min_amount}' to float")
        
        # Fallback to hardcoded values if extraction fails
        if amount is None:
            if grant_type == "Seed Grant":
                amount = 10000.0
                logger.info(f"Using fallback amount for Seed Grant: $10,000")
            else:  # Grow Grant
                amount = 50000.0
                logger.info(f"Using fallback amount for Grow Grant: $50,000")
        
        return amount
    
    def extract_deadline(self, soup):
        # extract the deadline date (month day, year)
        deadline = None
        
        deadline_heading = soup.find(string=re.compile(r'NEXT DEADLINE', re.IGNORECASE))
        
        if deadline_heading:
            parent = None
            for tag in ['h3', 'h4', 'h5', 'h6', 'div', 'span']:
                if deadline_heading.parent.name == tag:
                    parent = deadline_heading.parent
                    break
            
            if parent:
                date_text = None
                for sibling in parent.next_siblings:
                    if sibling.name and sibling.text.strip():
                        date_text = sibling.text.strip()
                        break
                
                if not date_text and parent.parent:
                    for sibling in parent.parent.next_siblings:
                        if sibling.name and sibling.text.strip():
                            date_text = sibling.text.strip()
                            break
                
                if date_text:
                    date_match = re.search(r'([A-Za-z]+ \d{1,2}, \d{4})', date_text)
                    if date_match:
                        date_str = date_match.group(1)
                        try:
                            deadline_date = datetime.strptime(date_str, '%B %d, %Y')
                            deadline = deadline_date.strftime('%Y-%m-%d')
                        except ValueError:
                            try:
                                deadline_date = datetime.strptime(date_str.replace(',', ''), '%B %d %Y')
                                deadline = deadline_date.strftime('%Y-%m-%d')
                            except ValueError:
                                pass
        
        if not deadline:
            text = soup.get_text()
            date_match = re.search(r'([A-Za-z]+ \d{1,2}, \d{4})', text)
            if date_match:
                date_str = date_match.group(1)
                try:
                    deadline_date = datetime.strptime(date_str, '%B %d, %Y')
                    deadline = deadline_date.strftime('%Y-%m-%d')
                except ValueError:
                    pass
        
        return deadline
    
    def extract_eligibility(self, soup):
        # extract eligibility criteria dynamically
        eligibility_text = ""
        
        interested_heading_text = "Interested applicants must:"
        eligibility_text += interested_heading_text + "\n"
        
        key_bullet_points = [
            "deliver programs and services in one of four sectors: sports and recreation, arts and culture, environment, and human and social services.",
            "have a primary purpose, presence, and reputation for delivering community-based programs",
            "demonstrate the financial and organizational capacity to manage OTF funds",
            "demonstrate that it is the appropriate organization or community to carry out the proposed project"
        ]
        
        bullet_items = soup.find_all('li')
        matching_bullets = []
        
        for bullet in bullet_items:
            bullet_text = bullet.text.strip()
            for key_point in key_bullet_points:
                if key_point.lower() in bullet_text.lower():
                    matching_bullets.append(bullet_text)
                    break
        
        # if we couldn't find any matching bullets, use the known values
        if not matching_bullets:
            matching_bullets = [
                "deliver programs and services in one of four sectors: sports and recreation, arts and culture, environment, and human and social services.",
                "have a primary purpose, presence, and reputation for delivering community-based programs and services with direct community benefit in one of OTF's 16 geographic catchment areas in Ontario.",
                "demonstrate the financial and organizational capacity to manage OTF funds, and deliver and complete the proposed project as per OTF's Financial Need and Health of Applicants policy.",
                "demonstrate that it is the appropriate organization or community to carry out the proposed project."
            ]
        
        for bullet in matching_bullets:
            eligibility_text += f"• {bullet}\n"
        
        eligibility_text += "\nApplicants must be one of the following:\n"
        
        org_types = []
        
        expected_types = [
            "Non-profit organizations",
            "Indigenous communities",
            "Municipalities, libraries and local services boards",
            "Collaboratives",
            "Religious entities"
        ]
        
        for heading_type in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'b']:
            headings = soup.find_all(heading_type)
            for heading in headings:
                heading_text = heading.text.strip()
                for expected in expected_types:
                    if expected.lower() in heading_text.lower() and heading_text not in org_types:
                        org_types.append(expected)
                        break
        
        # if we couldn't find the organization types, use our known list
        if not org_types:
            org_types = expected_types
        
        for org_type in org_types:
            eligibility_text += f"• {org_type}\n"
        
        return eligibility_text
    
    def determine_active_status(self, soup):
        # determine if grant is active based on application period
        is_active = False
        
        # look for application period text
        app_period_text = soup.find(string=re.compile(r'grant application period is from', re.IGNORECASE))
        if app_period_text:
            # extract the start date from the application period
            period_text = app_period_text.strip()
            start_date_match = re.search(r'from\s+([A-Za-z]+ \d{1,2}, \d{4})', period_text)
            
            if start_date_match:
                start_date_str = start_date_match.group(1)
                try:
                    start_date = datetime.strptime(start_date_str, '%B %d, %Y')
                    if datetime.now() >= start_date:
                        is_active = True
                except ValueError:
                    pass
        
        # also check if there's text indicating the grant is closed
        closed_indicators = ['deadline has passed', 'closed', 'not accepting applications']
        for indicator in closed_indicators:
            if re.search(indicator, soup.get_text(), re.IGNORECASE):
                is_active = False
                break
        
        return is_active
    
    def parse_grant(self, html_content, grant_type, url):
        # extract all required information from the grant page
        if not html_content:
            logger.error(f"Failed to fetch {grant_type} page")
            return None
        
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # create a unique sequential grant ID
        grant_id = self.next_grant_id
        self.next_grant_id += 1
        
        # Get eligibility text directly from our hardcoded function
        eligibility_criteria = self.extract_eligibility(soup)
        
        # compile the grant data
        grant_data = {
            'grant_id': grant_id,
            'source_id': 3,  # Simple integer 3 for OTF grants
            'crawled_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'title': grant_type,
            'description': self.extract_description(soup, grant_type),
            'funding_agency': 'Ontario Trillium Foundation',
            'amount': self.extract_amount(soup, grant_type),
            'deadline': self.extract_deadline(soup),
            'eligibility_criteria': eligibility_criteria,
            'application_url': url,
            'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'is_active': self.determine_active_status(soup),
            'assignee': ''
        }
        
        logger.info(f"Parsed details for: {grant_type} (ID: {grant_id})")
        return grant_data
    
    def save_data(self, data, grant_type):
        # save the scraped grant data using the utility function
        if not data:
            logger.warning(f"No grant data to save for {grant_type}")
            return
        
        try:
            from scrapers.utils import save_grant_data
            # Use consistent OTF prefix for both Seed and Grow grants
            save_grant_data(data, "OTF_Grant")
            logger.info(f"Successfully saved {grant_type} data")
        except Exception as e:
            logger.error(f"Error saving grant data for {grant_type}: {e}")
    
    def run(self):
        # scrape all grant types
        for grant_type, url in self.grant_urls.items():
            logger.info(f"Processing {grant_type} from {url}")
            html_content = self.fetch_page(url)
            if html_content:
                grant_data = self.parse_grant(html_content, grant_type, url)
                if grant_data:
                    self.grants.append(grant_data)
                    self.save_data(grant_data, grant_type)
            
        logger.info(f"Completed scraping {len(self.grants)} OTF grants")
        return self.grants

def main():
    try:
        logger.info("Starting OTF grant scraper")
        scraper = OTFGrantScraper()
        grants = scraper.run()
        if grants:
            logger.info(f"Successfully completed OTF grant scraping. Found {len(grants)} grants.")
        else:
            logger.error("Failed to scrape any OTF grants")
    except Exception as e:
        logger.error(f"Error in OTF scraper: {e}", exc_info=True)

if __name__ == "__main__":
    main()