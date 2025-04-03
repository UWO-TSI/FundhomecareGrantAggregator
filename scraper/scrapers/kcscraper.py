import requests
from bs4 import BeautifulSoup
import re
from datetime import datetime
import logging
import os
import time
from urllib.parse import urljoin
import json

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class KindredGrantScraper:
    def __init__(self, url=None):
        self.url = url or "https://www.kindredfoundation.ca/community-support/kindred-cares-grant"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        }
        self.grant_data = None
        self.next_grant_id = 1001  # Start at 1001 to avoid overlap with other scrapers
    
    def fetch_page(self):
        # fetch html content with error handling and retries
        max_retries = 3
        for attempt in range(max_retries):
            try:
                logger.info(f"Fetching {self.url}")
                response = requests.get(self.url, headers=self.headers, timeout=30)
                response.raise_for_status()
                return response.text
            except requests.exceptions.RequestException as e:
                logger.error(f"Error fetching {self.url} (attempt {attempt+1}/{max_retries}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(2)
                else:
                    return None
    
    def extract_description(self, soup):
        # extract description 
        description = ""
        
        intro_text = soup.find(string=re.compile(r'In 2021, Kindred Foundation established the Kindred Cares Grant to:'))
        if intro_text:
            # find the parent element containing the intro text
            parent = None
            for p in soup.find_all('p'):
                if intro_text in p.text:
                    parent = p.parent
                    break
            
            if parent:
                # find bullet points (list items) in the section
                bullet_points = []
                for ul in parent.find_all('ul'):
                    for li in ul.find_all('li'):
                        bullet_points.append(li.text.strip())
                
                if bullet_points:
                    description = "In 2021, Kindred Foundation established the Kindred Cares Grant to:\n"
                    for point in bullet_points:
                        description += f"• {point}\n"
        
        if not description:
            content = soup.get_text()
            intro_match = re.search(r'In 2021, Kindred Foundation established the Kindred Cares Grant to:', content)
            if intro_match:
                # try to extract the bullet points after this text
                section_after = content[intro_match.end():]
                bullet_points = re.findall(r'[•■▪◦]\s+(.*?)(?=\n[•■▪◦]|\n\s*\n|$)', section_after)
                if bullet_points:
                    description = "In 2021, Kindred Foundation established the Kindred Cares Grant to:\n"
                    for point in bullet_points[:2]:  
                        description += f"• {point}\n"
        
        return description.strip()
    
    def extract_dates(self, soup):
        # extract application dates from the important dates section
        dates = {}
        current_year = datetime.now().year
        
        important_dates = soup.find(string=re.compile(r'Important Dates'))
        if important_dates:
            section = None
            for elem in soup.find_all(['h1', 'h2', 'h3', 'h4']):
                if 'Important Dates' in elem.text:
                    section = elem
                    break
            
            if section:
                date_text = ""
                for sibling in section.find_next_siblings():
                    if sibling.name in ['h1', 'h2', 'h3', 'h4']:
                        break
                    date_text += sibling.text + "\n"
                
                open_match = re.search(r'([A-Za-z]+ \d{1,2}, \d{4}):\s*Application window opens', date_text)
                if open_match:
                    try:
                        open_date = datetime.strptime(open_match.group(1), '%B %d, %Y')
                        dates['application_open'] = open_date.strftime('%Y-%m-%d')
                    except ValueError:
                        pass
                
                close_match = re.search(r'([A-Za-z]+ \d{1,2}, \d{4})(?:.*?):\s*Application window closes', date_text)
                if close_match:
                    try:
                        close_date = datetime.strptime(close_match.group(1), '%B %d, %Y')
                        dates['application_close'] = close_date.strftime('%Y-%m-%d')
                    except ValueError:
                        pass
                
                if not dates:
                    # try pattern without year
                    open_match = re.search(r'([A-Za-z]+ \d{1,2})(?:\s+at\s+.*?)?:\s*Application window opens', date_text)
                    close_match = re.search(r'([A-Za-z]+ \d{1,2})(?:\s+at\s+.*?)?:\s*Application window closes', date_text)
                    
                    if open_match:
                        try:
                            open_date_str = f"{open_match.group(1)}, {current_year}"
                            open_date = datetime.strptime(open_date_str, '%B %d, %Y')
                            if open_date < datetime.now():
                                open_date = datetime.strptime(f"{open_match.group(1)}, {current_year+1}", '%B %d, %Y')
                            dates['application_open'] = open_date.strftime('%Y-%m-%d')
                        except ValueError:
                            pass
                    
                    if close_match:
                        try:
                            close_date_str = f"{close_match.group(1)}, {current_year}"
                            close_date = datetime.strptime(close_date_str, '%B %d, %Y')
                            if close_date < datetime.now():
                                close_date = datetime.strptime(f"{close_match.group(1)}, {current_year+1}", '%B %d, %Y')
                            dates['application_close'] = close_date.strftime('%Y-%m-%d')
                        except ValueError:
                            pass
                
                if not dates.get('application_close'):
                    alt_close = re.search(r'([A-Za-z]+ \d{1,2}, \d{4})\s*at\s*\d+(?:am|pm|AM|PM)\s*[A-Z]+\s*:\s*Application window closes', date_text)
                    if alt_close:
                        try:
                            close_date = datetime.strptime(alt_close.group(1), '%B %d, %Y')
                            dates['application_close'] = close_date.strftime('%Y-%m-%d')
                        except ValueError:
                            pass
        
        if not dates:
            full_text = soup.get_text()
            
            application_open = re.search(r'[Aa]pplication\s+window\s+opens[:\s]*([A-Za-z]+ \d{1,2},? \d{4})', full_text)
            if application_open:
                try:
                    date_str = application_open.group(1).replace(',', '')
                    open_date = datetime.strptime(date_str, '%B %d %Y')
                    dates['application_open'] = open_date.strftime('%Y-%m-%d')
                except ValueError:
                    pass
            
            application_close = re.search(r'[Aa]pplication\s+window\s+closes[:\s]*([A-Za-z]+ \d{1,2},? \d{4})', full_text)
            if application_close:
                try:
                    date_str = application_close.group(1).replace(',', '')
                    close_date = datetime.strptime(date_str, '%B %d %Y')
                    dates['application_close'] = close_date.strftime('%Y-%m-%d')
                except ValueError:
                    pass
        
        return dates
    
    def extract_amount(self, soup):
        # extract the per-grant amount ($10,000) 
        amounts = {}
        
        overall_info = soup.find(string=re.compile(r'Overall Information'))
        if overall_info:
            section = None
            for elem in soup.find_all(['h1', 'h2', 'h3', 'h4']):
                if 'Overall Information' in elem.text:
                    section = elem
                    break
            
            if section:
                info_text = ""
                for sibling in section.find_next_siblings():
                    if sibling.name in ['h1', 'h2', 'h3', 'h4']:
                        break
                    info_text += sibling.text + "\n"
                
                # look for the pattern that mentions per grant amount
                per_grant_match = re.search(r'maximum of \$(\d{1,3}(?:,\d{3})*) per grant', info_text)
                if per_grant_match:
                    try:
                        amount_str = per_grant_match.group(1).replace(',', '')
                        amounts['per_grant'] = float(amount_str)
                    except ValueError:
                        pass
                
                # look for total funding amount
                total_match = re.search(r'\$(\d{1,3}(?:,\d{3})*) in total funding', info_text)
                if total_match:
                    try:
                        amount_str = total_match.group(1).replace(',', '')
                        amounts['total_funding'] = float(amount_str)
                    except ValueError:
                        pass
        
        if 'per_grant' not in amounts:
            full_text = soup.get_text()
            
            per_grant_patterns = [
                r'maximum of \$(\d{1,3}(?:,\d{3})*) per grant',
                r'up to \$(\d{1,3}(?:,\d{3})*) per grant',
                r'grant of \$(\d{1,3}(?:,\d{3})*)',
                r'grants of \$(\d{1,3}(?:,\d{3})*)'
            ]
            
            for pattern in per_grant_patterns:
                match = re.search(pattern, full_text, re.IGNORECASE)
                if match:
                    try:
                        amount_str = match.group(1).replace(',', '')
                        amounts['per_grant'] = float(amount_str)
                        break
                    except ValueError:
                        pass
        
        return amounts
    
    def extract_eligibility(self, soup):
        # extract eligibility criteria from the Eligibility section
        eligibility_text = ""
        
        eligibility_heading = soup.find(string=re.compile(r'Eligibility'))
        if eligibility_heading:
            section = None
            for elem in soup.find_all(['h1', 'h2', 'h3', 'h4']):
                if 'Eligibility' in elem.text:
                    section = elem
                    break
            
            if section:
                for sibling in section.find_next_siblings():
                    if sibling.name in ['h1', 'h2', 'h3', 'h4']:
                        break
                    if sibling.name in ['p', 'ul', 'ol', 'li']:
                        eligibility_text += sibling.get_text() + "\n"
        
        if not eligibility_text:
            full_text = soup.get_text()
            match = re.search(r'(?:Eligibility|Who can apply)([\s\S]+?)(?=\n\s*\n\s*\w+:|$)', full_text)
            if match:
                eligibility_text = match.group(1).strip()
        
        return eligibility_text
    
    def determine_status(self, soup):
        # determine if the grant is active based on multiple indicators
        title_text = ""
        title_elem = soup.find('h1')
        if title_elem:
            title_text = title_elem.text.strip()
            if re.search(r'closed', title_text, re.IGNORECASE):
                logger.info("Grant marked as inactive: 'CLOSED' found in title")
                return False
        
        # check for year in title - if it's past year, likely closed
        year_match = re.search(r'\b(20\d{2})\b', title_text)
        if year_match:
            year = int(year_match.group(1))
            current_year = datetime.now().year
            if year < current_year:
                logger.info(f"Grant marked as inactive: title references past year {year}")
                return False
        
        banner_closed = soup.find(string=re.compile(r'\bCLOSED\b'))
        if banner_closed:
            logger.info("Grant marked as inactive: 'CLOSED' found on page")
            return False
        
        dates = self.extract_dates(soup)
        now = datetime.now()
        
        if 'application_open' in dates and 'application_close' in dates:
            open_date = datetime.strptime(dates['application_open'], '%Y-%m-%d')
            close_date = datetime.strptime(dates['application_close'], '%Y-%m-%d')
            
            if now < open_date:
                logger.info(f"Grant marked as inactive: current date {now.date()} is before application open date {open_date.date()}")
                return False
            elif now > close_date:
                logger.info(f"Grant marked as inactive: current date {now.date()} is after application close date {close_date.date()}")
                return False
            else:
                logger.info(f"Grant marked as active: current date {now.date()} is within application window")
                return True
        elif 'application_close' in dates:
            close_date = datetime.strptime(dates['application_close'], '%Y-%m-%d')
            if now > close_date:
                logger.info(f"Grant marked as inactive: current date {now.date()} is after application close date {close_date.date()}")
                return False
        
        # default behavior - if we can't determine status reliably, assume inactive
        logger.info("Grant status undetermined, marking as inactive by default")
        return False
    
    def scrape_grant(self):
        # main method to scrape the Kindred Cares Grant information
        html = self.fetch_page()
        if not html:
            logger.error("Failed to fetch page")
            return None
        
        soup = BeautifulSoup(html, 'html.parser')
        
        # create a unique sequential grant ID
        grant_id = self.next_grant_id
        self.next_grant_id += 1
        
        title_elem = soup.find('h1')
        title = title_elem.text.strip() if title_elem else "Kindred Cares Grant"
        
        description = self.extract_description(soup)
        if not description:
            description = "The Kindred Cares Grant provides funding for programs, projects, operations and research in the area of hospice, palliative, and end-of-life care for children and adults with life-limiting conditions and their families."
        
        dates = self.extract_dates(soup)
        deadline = dates.get('application_close', None)
        
        # extract funding amounts - we want the per_grant amount, not total_funding
        amounts = self.extract_amount(soup)
        amount = amounts.get('per_grant', None)
        
        # extract eligibility criteria
        eligibility = self.extract_eligibility(soup)
        
        # determine if the grant is currently active
        is_active = self.determine_status(soup)
        
        # compile the grant data
        self.grant_data = {
            'grant_id': grant_id,
            'source_id': 2,  # Simple integer 2 for Kindred Cares
            'crawled_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'title': title,
            'description': description,
            'funding_agency': 'Kindred Foundation',
            'amount': amount,
            'deadline': deadline,
            'eligibility_criteria': eligibility,
            'application_url': self.url,
            'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'is_active': is_active,
            'assignee': ''
        }
        
        logger.info(f"Scraped grant: {title} (ID: {grant_id}) - Status: {'Active' if is_active else 'Inactive'}")
        return self.grant_data
    
    def save_data(self):
        # save the scraped grant data using the utility function
        if not self.grant_data:
            logger.warning("No grant data to save")
            return
        
        try:
            from scrapers.utils import save_grant_data
            save_grant_data(self.grant_data, "Kindred_Cares_Grant")
            logger.info(f"Successfully saved Kindred Cares Grant data")
        except Exception as e:
            logger.error(f"Error saving grant data: {e}")

    def run(self):
        """Main method to run the scraper and return the grants"""
        self.scrape_grant()
        if self.grant_data:
            return [self.grant_data]
        return []

def main():
    try:
        logger.info("Starting Kindred Cares Grant scraper")
        scraper = KindredGrantScraper()
        scraper.scrape_grant()
        scraper.save_data()
        logger.info("Kindred Cares Grant scraper completed successfully")
    except Exception as e:
        logger.error(f"An error occurred during scraping: {e}")

if __name__ == "__main__":
    main()