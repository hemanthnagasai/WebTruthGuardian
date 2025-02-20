Website Scanner
A comprehensive web-based fake website detection system that leverages advanced AI and machine learning techniques to analyze and classify website authenticity in real-time.

Features
Real-time website security analysis
Advanced phishing detection
SSL certificate validation
Security headers analysis
Social sharing capabilities
User authentication
Detailed scan reports


Tech Stack
Frontend: React with Tailwind CSS
Backend: Express/Node.js
Database: PostgreSQL
ORM: Drizzle
Authentication: JWT/Session
API Integrations: VirusTotal, Google Safe Browsing


Prerequisites
Node.js (v18 or higher)
PostgreSQL
API keys for VirusTotal and Google Safe Browsing
Local Development Setup
Clone the repository:

git clone <repository-url>
cd website-scanner
Install dependencies:

npm install
Create a .env file in the root directory:

cp .env.example .env
Update the environment variables with your values.

Set up the database:

# Make sure PostgreSQL is running
npm run db:push
Start the development server:

npm run dev
The application will be available at http://localhost:5000.

API Keys Setup
VirusTotal API
Sign up at VirusTotal
Get your API key from your profile
Add it to your .env file
Google Safe Browsing API
Create a project in Google Cloud Console
Enable the Safe Browsing API
Create credentials and get your API key
Add it to your .env file


Available Scripts
npm run dev - Start development server
npm run build - Build for production
npm run db:push - Push database schema changes
npm run start - Start production server
Architecture
The application follows a modern full-stack architecture:

Frontend and backend are served from the same Express server
Authentication is handled via sessions
Database queries are made using Drizzle ORM
Real-time security analysis using multiple APIs
