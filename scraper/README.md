# Grant Scrapers

This repository contains scrapers for various grant sources including:

1. Health Canada Grants
2. Kindred Cares Grants
3. Ontario Trillium Foundation (OTF) Grants


## Project Structure

```
scraper/
├── data/                      # All grant data files
│   ├── hc_grant/              # Health Canada grants
│   │   ├── grant.csv
│   │   └── grant.json
│   ├── kc_grant/              # Kindred Cares grants
│   │   ├── grant.csv
│   │   └── grant.json
│   ├── otf_grant/             # Ontario Trillium Foundation grants
│   │   ├── grant.csv
│   │   └── grant.json
│   └── all_grants.json        # Combined grants from all sources
├── scrapers/                  # Scraper implementation files
│   ├── hcscraper.py           # Health Canada scraper
│   ├── kcscraper.py           # Kindred Cares scraper
│   ├── otfscraper.py          # OTF scraper
│   └── utils.py               # Shared utility functions
├── logs/                      # Log files
│   └── scraper_run.log
├── .github/                   # GitHub Actions workflows
│   └── workflows/
│       └── scraper_schedule.yml
├── run_all_scrapers.py        # Main execution script
├── .env.template              # Template for environment variables
└── README.md                  # This file
```

## Setup Instructions

### Local Setup

1. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Configure Supabase:
   - Copy `.env.template` to `.env`
   - Fill in your Supabase URL and API key in the `.env` file

3. Run the unified scraper:
   ```
   python run_all_scrapers.py
   ```

## Database Schema

The scrapers are configured to work with a Supabase database with the following schema:

### Grant Table
- `grant_id` (int4, primary key): Unique identifier for each grant
- `source_id` (varchar): Source-specific ID format (e.g., HC001, KC001, OTF001)
- `crawled_date` (timestamp): Date and time the grant was crawled
- `title` (varchar): Grant title
- `description` (text): Grant description
- `funding_agency` (varchar): Name of the funding agency
- `amount` (numeric): Grant amount, if available
- `deadline` (date): Application deadline
- `eligibility_criteria` (text): Eligibility requirements
- `application_url` (varchar): URL for the grant application
- `last_updated` (timestamp): Date and time the record was last updated
- `is_active` (bool): Whether the grant is currently active
- `assignee` (varchar): Person assigned to the grant, if any

### WebSource Table
- `source_id` (int4, primary key): Unique identifier for each source
- `website_name` (varchar): Name of the source website
- `base_url` (varchar): Base URL for the source
- `crawling_frequency` (int4): How often to crawl the source (in days)
- `last_crawled` (timestamp): Last time the source was crawled
- `is_active` (bool): Whether the source is active


## Grant ID Ranges

To ensure uniqueness across different sources, each scraper uses a specific range of IDs:

- Health Canada Grants: starting from 1
- Kindred Cares Grants: starting from 1001
- OTF Grants: starting from 2001

## Logs

Logs are stored in `logs/scraper_run.log` and include information about the scraping process, including successes and errors.

## Individual Scrapers

You can also run the scrapers individually:

```python
# Health Canada Grants
from scrapers.hcscraper import HealthCanadaGrantScraper
hc_scraper = HealthCanadaGrantScraper()
hc_grants = hc_scraper.run()

# Kindred Cares Grants
from scrapers.kcscraper import KindredGrantScraper
kc_scraper = KindredGrantScraper()
kc_grants = kc_scraper.run()

# OTF Grants
from scrapers.otfscraper import OTFGrantScraper
otf_scraper = OTFGrantScraper()
otf_grants = otf_scraper.run()
``` 