# Development Workflow Documentation

## Overview
This document outlines the development workflow for the Dune Awakening Deep Desert Tracker, which uses a **two-environment approach**: Local Development and Production.

## Environment Architecture

### 🏠 **Local Development Environment**
- **Purpose**: Development, testing, and Discord migration testing
- **Database**: Shared production Supabase database
- **URL**: `http://localhost:5173`
- **Visual Indicator**: Red "🛠️ LOCAL DEV" badge in top-right corner
- **Safety Features**: Database operation warnings and confirmations

### 🚀 **Production Environment**
- **Purpose**: Live application for users
- **Database**: Production Supabase database
- **URL**: `https://your-netlify-site.netlify.app`
- **Deployment**: Automated via Netlify on `main` branch push

## Development Setup

### 1. Discord OAuth Configuration
Configure your Discord application with these redirect URIs:
```
http://localhost:5173/auth/callback     # Local development
https://your-netlify-site.netlify.app/auth/callback  # Production
```

### 2. Supabase Authentication URLs
In Supabase Dashboard > Authentication > URL Configuration:
```
http://localhost:5173/auth/callback     # Local development  
http://localhost:5173/                  # Local base URL
https://your-netlify-site.netlify.app/auth/callback  # Production
```

### 3. Local Environment Variables
Create `.env.local` in project root:
```bash
# Production Supabase credentials (shared database)
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key

# Development environment settings
VITE_ENVIRONMENT=development
VITE_LOCAL_DEV=true
VITE_ENABLE_DEBUG_TOOLS=true

# Discord OAuth
VITE_DISCORD_CLIENT_ID=your_discord_client_id

# Optional: Discord-only migration testing
# VITE_TEST_DISCORD_ONLY=true
```

## Development Commands

### Standard Development
```bash
# Start local development server
npm run dev

# Build for production testing
npm run build

# Preview production build locally
npm run preview
```

### Discord Migration Testing
```bash
# Test Discord-only authentication mode
# Add VITE_TEST_DISCORD_ONLY=true to .env.local, then:
npm run dev
```

## Safety Features

### Visual Indicators
- **Local Development**: Red "🛠️ LOCAL DEV" badge appears in top-right corner
- **Production**: No development indicator visible

### Database Protection
- **Local Development**: Confirmation dialogs for destructive operations (delete, update)
- **Production**: No additional warnings (assumes intended production use)

### Environment Detection
The application automatically detects the environment based on:
- `VITE_ENVIRONMENT` variable
- `window.location.hostname`
- Netlify domain detection

## Workflow Patterns

### 1. Feature Development
```bash
# 1. Start local development
npm run dev

# 2. Develop and test features locally
# - Visual indicator confirms local environment
# - Safety prompts protect production data
# - Debug tools available for troubleshooting

# 3. Test production build locally
npm run build && npm run preview

# 4. Deploy to production
git add .
git commit -m "Feature: description"
git push origin main
# Netlify auto-deploys from main branch
```

### 2. Discord Migration Testing
```bash
# 1. Enable Discord-only mode in .env.local
echo "VITE_TEST_DISCORD_ONLY=true" >> .env.local

# 2. Test Discord-only authentication
npm run dev

# 3. Verify functionality with Discord accounts
# - Test login/logout flow
# - Verify user profile creation
# - Check admin functionality

# 4. When ready for production migration
# Update production environment variables in Netlify
# Deploy to main branch
```

### 3. Database Operations
```bash
# Local development automatically shows warnings for:
# - POI deletions
# - User management operations  
# - Map reset operations
# - Bulk data operations

# Production operations proceed without extra warnings
```

## Environment Configuration

### Netlify Production Settings
```bash
# Environment Variables in Netlify Dashboard:
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_DISCORD_CLIENT_ID=your_discord_client_id

# Optional for Discord migration:
# VITE_TEST_DISCORD_ONLY=true
```

### Authentication Configuration
The application uses `authConfig.ts` to control authentication methods:
- **Current**: Email + Discord OAuth available
- **Migration Mode**: Discord-only when `VITE_TEST_DISCORD_ONLY=true`
- **Environment-Aware**: Different settings for local vs production

## Troubleshooting

### Common Issues

**Discord OAuth Redirect Mismatch**
- Verify redirect URIs in Discord Developer Portal
- Check Supabase authentication URL configuration
- Ensure `.env.local` has correct Discord client ID

**Database Operation Warnings**
- Expected in local development for safety
- Confirms you're working with production database
- Click "OK" to proceed with intended operations

**Environment Detection**
- Local: Shows "🛠️ LOCAL DEV" indicator
- Production: No development indicators
- Check browser console for environment debug info

**Build Issues**
- Run `npm run build` to check for TypeScript errors
- Verify all environment variables are set correctly
- Check browser console for runtime errors

## Best Practices

### 1. Development Safety
- Always verify the environment indicator before performing destructive operations
- Use separate Discord test accounts for development
- Backup important data before major testing sessions

### 2. Code Quality
- Test locally before pushing to production
- Use TypeScript strictly for type safety
- Follow established component patterns

### 3. Deployment Strategy
- Keep `main` branch production-ready
- Use feature branches for experimental work
- Test authentication flows thoroughly before deployment

### 4. Database Management
- Shared database requires careful testing
- Use admin test accounts for development
- Coordinate with team members on destructive operations

## Files and Configuration

### Key Development Files
- `src/lib/developmentUtils.ts` - Development safety and debugging tools
- `src/lib/authConfig.ts` - Environment-aware authentication configuration
- `.env.local` - Local development environment variables (not committed)
- `netlify.toml` - Production deployment configuration

### Environment Variable Reference
| Variable | Local | Production | Purpose |
|----------|-------|------------|---------|
| `VITE_SUPABASE_URL` | ✅ | ✅ | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | ✅ | Supabase anonymous key |
| `VITE_DISCORD_CLIENT_ID` | ✅ | ✅ | Discord OAuth client ID |
| `VITE_ENVIRONMENT` | `development` | - | Environment identifier |
| `VITE_LOCAL_DEV` | `true` | - | Local development flag |
| `VITE_ENABLE_DEBUG_TOOLS` | `true` | - | Debug tools toggle |
| `VITE_TEST_DISCORD_ONLY` | Optional | Optional | Discord-only mode testing |

This workflow provides a simple, safe, and efficient development experience while maintaining production stability. 