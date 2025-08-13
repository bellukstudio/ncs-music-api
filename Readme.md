# NCS API Server

A Node.js Express server that provides REST API access to the NoCopyrightSounds music library using the `nocopyrightsounds-api` package.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Installation

1. **Create project directory:**
```bash
mkdir ncs-api-server
cd ncs-api-server
```

2. **Initialize and install dependencies:**
```bash
npm init -y
npm install nocopyrightsounds-api express cors
npm install -D nodemon
```

3. **Copy the server.js and package.json files to your project**

4. **Start the server:**
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:3001`

## 📚 API Endpoints

### 🎵 **Get Latest Songs**
```http
GET /api/songs?page=0&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "song-id",
      "name": "Song Title",
      "artist": "Artist Name",
      "genre": "House",
      "mood": "Happy",
      "previewUrl": "https://...",
      "coverUrl": "https://...",
      "download": {
        "regular": "https://...",
        "instrumental": "https://..."
      }
    }
  ],
  "pagination": {
    "page": 0,
    "limit": 20,
    "total": 20
  }
}
```

### 🔍 **Search Songs**
```http
GET /api/search?q=elektronomia&genre=House&mood=Happy&page=0
```

**Parameters:**
- `q` (required): Search query
- `genre` (optional): Genre filter
- `mood` (optional): Mood filter  
- `page` (optional): Page number (default: 0)

### 👤 **Get Artist Info**
```http
GET /api/artist/artist/760/srikar
```

**Note:** The full artist path should be included after `/api/artist/`

### 🎨 **Get Available Genres**
```http
GET /api/genres
```

### 😊 **Get Available Moods**
```http
GET /api/moods
```

### ⬇️ **Get Download Link**
```http
GET /api/download/:songId?type=regular
```

**Parameters:**
- `type`: `regular` or `instrumental`

### ❤️ **Health Check**
```http
GET /health
```

## 🔧 Integration with Laravel React

### In your Laravel routes (web.php or api.php):
```php
// Proxy to Node.js server
Route::get('/ncs-proxy/{path}', function($path) {
    $nodeUrl = 'http://localhost:3001/api/' . $path;
    $queryString = request()->getQueryString();
    if ($queryString) {
        $nodeUrl .= '?' . $queryString;
    }
    
    $response = Http::get($nodeUrl);
    return response()->json($response->json());
})->where('path', '.*');
```

### In your React components:
```javascript
// Fetch songs
const fetchSongs = async (page = 0) => {
    const response = await fetch(`/ncs-proxy/songs?page=${page}`);
    const data = await response.json();
    return data;
};

// Search songs
const searchSongs = async (query, filters = {}) => {
    const params = new URLSearchParams({
        q: query,
        ...filters
    });
    
    const response = await fetch(`/ncs-proxy/search?${params}`);
    const data = await response.json();
    return data;
};
```

## 🧪 Testing with Postman

Import these example requests:

1. **Get Songs:**
   - GET `http://localhost:3001/api/songs`

2. **Search:**
   - GET `http://localhost:3001/api/search?q=elektronomia`

3. **Get Genres:**
   - GET `http://localhost:3001/api/genres`

4. **Health Check:**
   - GET `http://localhost:3001/health`

## 🔒 Production Considerations

1. **Environment Variables:**
```bash
# Create .env file
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-laravel-app.com
```

2. **Update CORS settings:**
```javascript
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:8000'
}));
```

3. **Add rate limiting:**
```bash
npm install express-rate-limit
```

4. **Add request logging:**
```bash
npm install morgan
```

## 🐛 Troubleshooting

### Common Issues:

1. **"Module not found" errors:**
   - Make sure `"type": "module"` is in package.json
   - Use ES6 import/export syntax

2. **CORS errors:**
   - Check CORS configuration
   - Ensure frontend URL is allowed

3. **Port already in use:**
   - Change PORT in .env or kill existing process
   - Use `lsof -ti:3001 | xargs kill -9`

### Debug Mode:
```bash
DEBUG=* npm run dev
```

## 📝 License

MIT License - feel free to use this in your projects!

---

**Happy coding! 🎵✨**