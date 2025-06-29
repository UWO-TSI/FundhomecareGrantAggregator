## ✨ Key Features

### Automated Data Collection
- **Weekly automated scraping** of grant opportunities from Health Canada, Kindred Foundation, and Ontario Trillium Foundation (among others) [3](#0-2) 
- **Intelligent data persistence** to Supabase database with duplicate prevention [4](#0-3) 

### User Management & Authentication
- **Role-based access control** with admin and user permissions [5](#0-4) 
- **Secure authentication** through Supabase Auth [6](#0-5) 

### Grant Management Interface
- **Advanced filtering and search** capabilities across all grant data [7](#0-6) 
- **Detailed grant information** with notes and categorization [8](#0-7) 
- **Export functionality** supporting PDF and Excel formats with charts [9](#0-8) 

### Administrative Tools
- **Grant CRUD operations** for administrators [10](#0-9) 
- **User role management** interface [11](#0-10) 


## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- Supabase account and project

### Environment Setup
Create a `.env` file in the scraper directory:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

### Installation
```bash
# Install frontend dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt

# Start development server
npm run dev
```

## 🤖 Automated Scraping

The system runs automated scrapers weekly via GitHub Actions: [16](#0-15) 

- **Schedule**: Every Sunday at 12:00 AM UTC
- **Sources**: Health Canada, Kindred Foundation, Ontario Trillium Foundation
- **Output**: JSON/CSV files and direct database updates


## 📈 Export & Reporting

The system generates professional reports with: [21](#0-20) 
- Fund Home Care Canada branding
- Grant status charts
- Comprehensive data tables
- Multiple export formats (PDF/Excel)

## 🔒 Security & Access Control

- **Authentication**: Secure login with Supabase Auth
- **Authorization**: Role-based permissions (admin/user)
- **Data Protection**: Environment variable configuration
- **Session Management**: Persistent login with remember me option [22](#0-21) 

Wiki pages you might want to explore:
- [System Overview (magicbox04/TSITeam6)](/wiki/magicbox04/TSITeam6#1)
Check out the structure of our project if you are new!
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/magicbox04/TSITeam6)
