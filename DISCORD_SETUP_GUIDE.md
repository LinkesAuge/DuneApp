# Discord Application Setup Guide

## Step 1: Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Name: "Dune Awakening Deep Desert Tracker"
4. Save the application

## Step 2: Configure OAuth2 Settings

1. Go to "OAuth2" tab in your Discord application
2. Add Redirect URIs:
   - For development: `http://localhost:5173/auth/callback`
   - For production: `https://your-domain.com/auth/callback`
3. Under "OAuth2 URL Generator":
   - **Scopes**: Select `identify` and `email`
   - **Permissions**: None needed (we only need basic profile info)

## Step 3: Get Credentials

1. Go to "OAuth2" > "General"
2. Copy your **Client ID**
3. Copy your **Client Secret** (keep this secure!)

## Step 4: Application Settings

1. Go to "General Information"
2. Add description: "Community tracker for Dune Awakening players to share discoveries and locations"
3. Add icon/logo if desired
4. Set Terms of Service and Privacy Policy URLs (if you have them)

## Environment Variables Needed

Add these to your `.env.local` file:
```env
VITE_DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here
```

## Supabase Configuration

After getting Discord credentials, we'll configure Supabase Auth to use Discord as a provider.

---

**Next Steps**: Once you have the Discord Client ID and Secret, we'll configure Supabase and update the database schema. 