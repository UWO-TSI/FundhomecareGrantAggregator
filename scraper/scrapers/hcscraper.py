import requests
from bs4 import BeautifulSoup
import re
from datetime import datetime
import logging
import time
import os
from urllib.parse import urljoin

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class HealthCanadaGrantScraper:
    def __init__(self, base_url=None):
        self.base_url = base_url or "https://www.canada.ca/en/public-health/services/funding-opportunities/grant-contribution-funding-opportunities.html"
        self.session = requests.Session()
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        }
        self.grants = []
        self.next_grant_id = 1  # start at 1 for health canada
    
    def fetch_page(self, url):
        # fetch html content
        max_retries = 3
        for attempt in range(max_retries):
            try:
                logger.info(f"Fetching {url}")
                response = self.session.get(url, headers=self.headers, timeout=30)
                response.raise_for_status()
                return response.text
            except requests.exceptions.RequestException as e:
                logger.error(f"Error fetching {url} (attempt {attempt+1}/{max_retries}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(2)  # Wait before retrying
                else:
                    return None
    
    def parse_funding_opportunities(self):
        # find all open funding opportunities 
        html = self.fetch_page(self.base_url)
        if not html:
            logger.error("Failed to fetch the main funding opportunities page")
            return []
        
        soup = BeautifulSoup(html, 'html.parser')
        opportunities = []
        
        opportunities_table = soup.find('table')
        if not opportunities_table:
            logger.warning("No opportunities table found on the page")
            return []
        
        rows = opportunities_table.find_all('tr')[1:]
        for row in rows:
            cols = row.find_all('td')
            if len(cols) >= 2:
                link = cols[0].find('a')
                if link:
                    title = link.text.strip()
                    url = urljoin(self.base_url, link['href'])
                    status = cols[1].text.strip()
                    
                    # only process opportunities with "open" status
                    if status.lower() == 'open':
                        opportunities.append({
                            'title': title,
                            'url': url,
                            'status': status
                        })
        
        logger.info(f"Found {len(opportunities)} open funding opportunities")
        return opportunities
    
    def extract_date_from_text(self, text):
        # extract deadline date from text with multiple formats support
        if not text:
            return None
        
        submission_match = re.search(r'[Aa]pplications\s+must\s+be\s+submitted\s+by\s+([^\.]+)', text)
        if submission_match:
            date_text = submission_match.group(1).strip()
            return self._parse_date_formats(date_text)
        
        # look for deadline explicitly mentioned
        deadline_match = re.search(r'[Dd]eadline[:\s]+([^\.]+)', text)
        if deadline_match:
            date_text = deadline_match.group(1).strip()
            return self._parse_date_formats(date_text)
            
        return self._parse_date_formats(text)
    
    def _parse_date_formats(self, text):
        # helper method to parse various date formats
        date_match = re.search(r'(\d{4}-\d{2}-\d{2})', text)
        if date_match:
            return date_match.group(1)
        
        month_day_year = re.search(r'(\w+ \d{1,2},? \d{4})', text)
        if month_day_year:
            date_str = month_day_year.group(1).replace(',', '')
            try:
                parsed_date = datetime.strptime(date_str, '%B %d %Y')
                return parsed_date.strftime('%Y-%m-%d')
            except ValueError:
                pass
        
        day_month_year = re.search(r'(\d{1,2} \w+ \d{4})', text)
        if day_month_year:
            date_str = day_month_year.group(1)
            try:
                parsed_date = datetime.strptime(date_str, '%d %B %Y')
                return parsed_date.strftime('%Y-%m-%d')
            except ValueError:
                pass
        
        time_date = re.search(r'(\d{1,2}:\d{2}\s*(?:am|pm|AM|PM))\s+\w+\s+on\s+(\w+ \d{1,2},? \d{4})', text)
        if time_date:
            date_str = time_date.group(2).replace(',', '')
            try:
                parsed_date = datetime.strptime(date_str, '%B %d %Y')
                return parsed_date.strftime('%Y-%m-%d')
            except ValueError:
                pass
                
        return None
    
    def extract_amount_from_text(self, text):
        # extract funding amount from text
        if not text:
            return None
        
        specific_patterns = [
            r'up to \$\s*([\d,]+)',
            r'maximum of \$\s*([\d,]+)',
            r'total of \$\s*([\d,]+)',
            r'awarded \$\s*([\d,]+)'
        ]
        
        for pattern in specific_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                amount_str = match.group(1).replace(',', '')
                return float(amount_str)
        
        amount_match = re.search(r'\$\s*([\d,]+)', text)
        if amount_match:
            amount_str = amount_match.group(1).replace(',', '')
            return float(amount_str)
            
        amount_match = re.search(r'(\d[\d,]*)\s*(dollars|CAD)', text, re.IGNORECASE)
        if amount_match:
            amount_str = amount_match.group(1).replace(',', '')
            return float(amount_str)
            
        return None
    
    def parse_grant_details(self, opportunity):
        # extract detailed information from an individual grant page
        html = self.fetch_page(opportunity['url'])
        if not html:
            logger.error(f"Failed to fetch details for {opportunity['title']}")
            return None
        
        soup = BeautifulSoup(html, 'html.parser')
        
        # create a unique sequential grant id
        grant_id = self.next_grant_id
        self.next_grant_id += 1
        
        # initialize grant data with default values
        grant_data = {
            'grant_id': grant_id,
            'source_id': 1,  # Simple integer 1 for Health Canada
            'crawled_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'title': opportunity['title'],
            'description': '',
            'funding_agency': 'Public Health Agency of Canada',
            'amount': None,
            'deadline': None,
            'eligibility_criteria': '',
            'application_url': opportunity['url'],
            'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'is_active': True,
            'assignee': ''
        }
        
        main_title = soup.find('h1')
        if main_title:
            grant_data['title'] = main_title.text.strip()
        
        # define sections to look for
        sections = {
            'Overview': None,
            'Objectives': None,
            'Funding': None,
            'Duration': None,
            'Applicants': None,
            'How to apply': None
        }
        
        # find all headings and extract their content
        headings = soup.find_all(['h1', 'h2', 'h3', 'h4'])
        for heading in headings:
            section_name = heading.text.strip()
            
            for key in sections.keys():
                if key.lower() in section_name.lower():
                    content = []
                    for sibling in heading.find_next_siblings():
                        if sibling.name in ['h1', 'h2', 'h3', 'h4']:
                            break
                        if sibling.name in ['p', 'li', 'ul', 'ol']:
                            content.append(sibling.text.strip())
                    
                    sections[key] = '\n'.join(content)
        
        # extract description from overview section
        if sections['Overview']:
            grant_data['description'] = sections['Overview']
        else:
            # fallback: try to get description from first paragraph after title
            first_para = soup.find('h1').find_next('p')
            if first_para:
                grant_data['description'] = first_para.text.strip()
        
        if sections['Applicants']:
            grant_data['eligibility_criteria'] = sections['Applicants']
        
        if sections['Funding']:
            amount = self.extract_amount_from_text(sections['Funding'])
            if amount:
                grant_data['amount'] = amount
        
        if sections['How to apply']:
            deadline_date = self.extract_date_from_text(sections['How to apply'])
            if deadline_date:
                grant_data['deadline'] = deadline_date
        
        logger.info(f"Parsed details for: {grant_data['title']} (ID: {grant_id})")
        return grant_data
    
    def scrape_grants(self):
        # main method to scrape all open grant opportunities
        opportunities = self.parse_funding_opportunities()
        
        for i, opportunity in enumerate(opportunities):
            logger.info(f"Processing opportunity {i+1}/{len(opportunities)}: {opportunity['title']}")
            
            # delay
            if i > 0:
                time.sleep(2)
                
            grant_data = self.parse_grant_details(opportunity)
            if grant_data:
                self.grants.append(grant_data)
            else:
                logger.warning(f"Failed to parse grant details for: {opportunity['title']}")
        
        logger.info(f"Completed scraping {len(self.grants)} grants")
        return self.grants
    
    def save_data(self):
        # save the scraped grant data using the utility function
        if not self.grants:
            logger.warning("No grants to save")
            return
        
        try:
            from scrapers.utils import save_grant_data
            for grant in self.grants:
                grant_name = f"HC_{grant['title'].replace(' ', '_')[:50]}"  # Limit filename length
                save_grant_data(grant, grant_name)
            logger.info(f"Successfully saved {len(self.grants)} grants")
        except Exception as e:
            logger.error(f"Error saving grant data: {e}")
    
    def run(self):
        """Main method to run the scraper and return the grants - compatible with run_all_scrapers.py"""
        grants = self.scrape_grants()
        return grants

def main():
    try:
        logger.info("Starting Health Canada grant scraper")
        scraper = HealthCanadaGrantScraper()
        scraper.scrape_grants()
        scraper.save_data()
        logger.info("Health Canada grant scraper completed successfully")
    except Exception as e:
        logger.error(f"An error occurred during scraping: {e}")

if __name__ == "__main__":
    main()