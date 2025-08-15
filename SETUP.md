# MenuCraft Supabase Setup Guide

This guide will help you set up MenuCraft with Supabase database integration.

## Prerequisites

- Node.js 18+
- A Supabase account (free tier works)
- Google AI API key (for menu extraction)

## Step 1: Supabase Setup

1. **Create a new Supabase project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization and set project name
   - Set a secure database password
   - Wait for project to be ready (2-3 minutes)

2. **Run the database schema**
   - In your Supabase dashboard, go to SQL Editor
   - Copy and paste the contents of `supabase-schema.sql`
   - Click "Run" to create all tables and sample data

3. **Get your Supabase credentials**
   - Go to Settings → API
   - Copy your Project URL
   - Copy your service_role secret key (not anon key!)

## Step 2: Environment Setup

### Backend Configuration
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
JWT_SECRET=your_random_jwt_secret
PORT=5001
GOOGLE_API_KEY=your_google_api_key
```

### Frontend Applications
```bash
# Admin Dashboard
cd Admin
cp .env.example .env
# Edit Admin/.env with your Google API key

# Customer App
cd ../Customer
cp .env.example .env

# Kitchen Dashboard
cd ../Kitchen
cp .env.example .env
```

## Step 3: Install Dependencies

```bash
# Backend
cd backend
npm install

# Admin Dashboard
cd ../Admin
npm install

# Customer App
cd ../Customer
npm install

# Kitchen Dashboard
cd ../Kitchen
npm install
```

## Step 4: Start the Application

Open 4 terminal windows and run:

```bash
# Terminal 1 - Backend API
cd backend
npm run dev

# Terminal 2 - Admin Dashboard
cd Admin
npm run dev

# Terminal 3 - Customer App
cd Customer
npm run dev

# Terminal 4 - Kitchen Dashboard
cd Kitchen
npm run dev
```

## Step 5: Test the Application

1. **Admin Dashboard**: http://localhost:3000
   - Login with any credentials (demo mode)
   - Upload a menu image
   - Complete restaurant setup

2. **Customer Ordering**: http://localhost:3002/pizza-palace
   - Browse menu and place orders
   - Fill customer form and submit

3. **Kitchen Dashboard**: http://localhost:3003/kitchen/pizza-palace
   - Login: username: `admin`, password: `admin123`
   - See real-time orders
   - Update order status

## Troubleshooting

### Database Issues
- Check your Supabase URL and service key
- Ensure you ran the schema SQL correctly
- Check browser network tab for API errors

### API Connection Issues
- Verify all apps are using port 5001 for API_URL
- Check CORS settings in backend
- Ensure backend is running on port 5001

### Real-time Updates Not Working
- Check Socket.IO connections in browser dev tools
- Ensure no firewall blocking WebSocket connections
- Verify restaurant IDs match between orders and kitchen

### Menu Upload Issues
- Check Google API key configuration
- Verify image formats (PNG, JPG, JPEG)
- Check browser console for Gemini API errors

## Production Deployment

For production deployment:

1. **Deploy Supabase**: Already hosted, just use production URLs
2. **Deploy Backend**: Heroku, Railway, or Vercel
3. **Deploy Frontend**: Vercel, Netlify, or any static host
4. **Update Environment Variables**: Use production API URLs
5. **Configure Domain Routing**: Set up subdomain routing for multi-tenancy

## Support

If you encounter issues:
1. Check the console logs in browser dev tools
2. Check terminal output for backend errors
3. Verify all environment variables are set correctly
4. Test API endpoints directly using Postman or browser