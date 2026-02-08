# Spotify Analytics

**World map working with multi-source API + Vercel deployment ready!**
<img width="1222" height="945" alt="image" src="https://github.com/user-attachments/assets/b9a6ce38-25c3-436f-9344-b9ff927f75c1" />
<img width="1224" height="1090" alt="image" src="https://github.com/user-attachments/assets/29522e77-1348-4ed5-b85a-7a79ef7f5fb0" />
<img width="1246" height="980" alt="image" src="https://github.com/user-attachments/assets/7106b716-4a05-4096-9263-d594c9b80041" />
<img width="1236" height="1181" alt="image" src="https://github.com/user-attachments/assets/7d96b275-8941-47e1-bb75-f9fa224d1d5f" />

## 🚀 Quick Start (5 minutes)

### 1. Get Spotify API Credentials

1. Go to https://developer.spotify.com/dashboard
2. Create a new app
3. Copy your **Client ID** and **Client Secret**

### 2. Install and Run

```bash
# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Edit .env.local and add your credentials
# Run locally
npm run dev
```

Open http://localhost:3000

### 3. Deploy to Vercel

See **DEPLOYMENT_GUIDE.md** for detailed steps.

## 🌍 How the World Map Works

**3-Layer Cascading System:**

1. **Local Database** - 50+ pre-loaded artists (instant)
2. **Wikidata API** - Primary source (FREE, 70-80% success)
3. **MusicBrainz API** - Fallback (FREE, music-focused)

**Result**: 80-90% of artists matched vs 10-20% before!

See **WORLD_MAP_EXPLAINED.md** for technical details.

## 📚 Documentation

- **DEPLOYMENT_GUIDE.md** - Complete Vercel deployment
- **WORLD_MAP_EXPLAINED.md** - Multi-source API details
- **TROUBLESHOOTING.md** - Common issues and solutions
- **FIXES_SUMMARY.md** - Technical changes made

## 🎵 Get Your Spotify Data

1. Go to https://www.spotify.com/account/privacy/
2. Request "Extended streaming history"
3. Wait for email (up to 30 days)
4. Upload JSON files to the app

## 🔑 Environment Variables

```env
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
```

## 🐛 Need Help?

- Map not working? → WORLD_MAP_EXPLAINED.md
- Deployment issues? → DEPLOYMENT_GUIDE.md
- Other problems? → TROUBLESHOOTING.md

---

**Ready to see where your music comes from?** 🎵🌍
