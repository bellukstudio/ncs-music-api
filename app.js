// server.js - Enhanced NCS API Server
import express from "express";
import cors from "cors";
import ncs from "nocopyrightsounds-api";

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "NCS API Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Get songs
app.get("/api/songs", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const songs = await ncs.getSongs(page);

    res.json({
      success: true,
      data: songs,
      count: songs.length,
      page: page,
    });
  } catch (error) {
    console.error("Error fetching songs:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Enhanced search with genre and mood filters
app.get("/api/search", async (req, res) => {
  try {
    const { q: query, genre, mood, page = 0 } = req.query;

    // Build search filter object
    const searchFilter = {};

    // Add query if provided
    if (query) {
      searchFilter.query = query;
    }

    // Add genre filter if provided and valid
    if (genre && ncs.Genre && ncs.Genre[genre]) {
      searchFilter.genre = ncs.Genre[genre];
    }

    // Add mood filter if provided and valid
    if (mood && ncs.Mood && ncs.Mood[mood]) {
      searchFilter.mood = ncs.Mood[mood];
    }

    // If no filters provided, require at least a query
    if (!query && !genre && !mood) {
      return res.status(400).json({
        success: false,
        error: "At least one filter is required: query (q), genre, or mood",
        availableGenres: ncs.Genre ? Object.keys(ncs.Genre) : [],
        availableMoods: ncs.Mood ? Object.keys(ncs.Mood) : [],
      });
    }

    // Perform search using exact NCS library syntax
    const results = await ncs.search(
      searchFilter,
      parseInt(page) // page here
    );

    res.json({
      success: true,
      data: results,
      count: results.length,
      filters: {
        query: query || null,
        genre: genre || null,
        mood: mood || null,
      },
      page: parseInt(page),
    });
  } catch (error) {
    console.error("Error searching:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      filters: {
        query: req.query.q || null,
        genre: req.query.genre || null,
        mood: req.query.mood || null,
      },
    });
  }
});

// Get songs by genre only (using exact NCS syntax)
app.get("/api/genre/:genreName", async (req, res) => {
  try {
    const { genreName } = req.params;
    const page = parseInt(req.query.page) || 0;

    // Check if genre exists
    if (!ncs.Genre || !ncs.Genre[genreName]) {
      return res.status(400).json({
        success: false,
        error: `Genre "${genreName}" not found`,
        availableGenres: ncs.Genre ? Object.keys(ncs.Genre) : [],
      });
    }

    // Search using exact documentation syntax
    const results = await ncs.search(
      {
        // filter
        genre: ncs.Genre[genreName],
      },
      page // page here
    );

    res.json({
      success: true,
      data: results,
      count: results.length,
      genre: genreName,
      page: page,
    });
  } catch (error) {
    console.error(`Error fetching ${req.params.genreName} songs:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
      genre: req.params.genreName,
    });
  }
});

// Get songs by mood only
app.get("/api/mood/:moodName", async (req, res) => {
  try {
    const { moodName } = req.params;
    const page = parseInt(req.query.page) || 0;

    // Check if mood exists
    if (!ncs.Mood || !ncs.Mood[moodName]) {
      return res.status(400).json({
        success: false,
        error: `Mood "${moodName}" not found`,
        availableMoods: ncs.Mood ? Object.keys(ncs.Mood) : [],
      });
    }

    const results = await ncs.search(
      {
        mood: ncs.Mood[moodName],
      },
      page
    );

    res.json({
      success: true,
      data: results,
      count: results.length,
      mood: moodName,
      page: page,
    });
  } catch (error) {
    console.error(`Error fetching ${req.params.moodName} songs:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
      mood: req.params.moodName,
    });
  }
});

// Get available genres
app.get("/api/genres", (req, res) => {
  try {
    if (!ncs.Genre) {
      return res.json({
        success: true,
        data: [],
        message: "Genres not available in this NCS library version",
      });
    }

    const genres = Object.keys(ncs.Genre)
      .filter((key) => isNaN(Number(key)))
      .map((key) => ({
        name: key,
        value: ncs.Genre[key],
      }));

    res.json({
      success: true,
      data: genres,
      count: genres.length,
    });
  } catch (error) {
    console.error("Error fetching genres:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get available moods
app.get("/api/moods", (req, res) => {
  try {
    if (!ncs.Mood) {
      return res.json({
        success: true,
        data: [],
        message: "Moods not available in this NCS library version",
      });
    }

    const moods = Object.keys(ncs.Mood)
      .filter((key) => isNaN(Number(key)))
      .map((key) => ({
        name: key,
        value: ncs.Mood[key],
      }));

    res.json({
      success: true,
      data: moods,
      count: moods.length,
    });
  } catch (error) {
    console.error("Error fetching moods:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Advanced search with multiple filters
app.get("/api/advanced-search", async (req, res) => {
  try {
    const { q: query, genre, mood, page = 0 } = req.query;

    // Build comprehensive filter
    const searchFilter = {};

    if (query) searchFilter.query = query;
    if (genre && ncs.Genre && ncs.Genre[genre]) {
      searchFilter.genre = ncs.Genre[genre];
    }
    if (mood && ncs.Mood && ncs.Mood[mood]) {
      searchFilter.mood = ncs.Mood[mood];
    }

    if (Object.keys(searchFilter).length === 0) {
      return res.status(400).json({
        success: false,
        error: "At least one search parameter is required",
        example: "/api/advanced-search?q=beat&genre=House&mood=Happy",
      });
    }

    const results = await ncs.search(searchFilter, parseInt(page));

    res.json({
      success: true,
      data: results,
      count: results.length,
      searchFilter: searchFilter,
      page: parseInt(page),
    });
  } catch (error) {
    console.error("Error in advanced search:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get random songs by shuffling latest songs
app.get("/api/random", async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 10;
    const songs = await ncs.getSongs(0);

    // Simple shuffle
    const shuffled = songs.sort(() => 0.5 - Math.random());
    const randomSongs = shuffled.slice(0, count);

    res.json({
      success: true,
      data: randomSongs,
      count: randomSongs.length,
      requested: count,
    });
  } catch (error) {
    console.error("Error fetching random songs:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// API documentation endpoint
app.get("/api/docs", (req, res) => {
  res.json({
    success: true,
    message: "NCS API Documentation",
    endpoints: {
      "GET /health": "Health check",
      "GET /api/songs?page=0": "Get latest songs with pagination",
      "GET /api/search?q=query&genre=House&mood=Happy&page=0":
        "Search with filters",
      "GET /api/genre/House?page=0": "Get songs by specific genre",
      "GET /api/mood/Happy?page=0": "Get songs by specific mood",
      "GET /api/genres": "Get all available genres",
      "GET /api/moods": "Get all available moods",
      "GET /api/advanced-search?q=beat&genre=House":
        "Advanced search with multiple filters",
      "GET /api/random?count=5": "Get random songs",
      "GET /api/docs": "This documentation",
    },
    examples: {
      "House music only": "/api/genre/House",
      "Search for 'beat' in House genre": "/api/search?q=beat&genre=House",
      "Happy mood songs": "/api/mood/Happy",
      "Complex search":
        "/api/advanced-search?q=music&genre=Electronic&mood=Energetic",
    },
    availableGenres: ncs.Genre ? Object.keys(ncs.Genre) : [],
    availableMoods: ncs.Mood ? Object.keys(ncs.Mood) : [],
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 NCS API Server running on http://localhost:${PORT}`);
  console.log(`📋 Enhanced endpoints:`);
  console.log(`   GET /health`);
  console.log(`   GET /api/songs?page=0`);
  console.log(`   GET /api/search?q=elektronomia&genre=House&page=0`);
  console.log(`   GET /api/genre/House?page=0`);
  console.log(`   GET /api/mood/Happy?page=0`);
  console.log(`   GET /api/genres`);
  console.log(`   GET /api/moods`);
  console.log(`   GET /api/advanced-search?q=beat&genre=House`);
  console.log(`   GET /api/random?count=5`);
  console.log(`   GET /api/docs`);
  console.log(`\n🧪 Test: curl http://localhost:${PORT}/api/docs`);
});

// Handle server errors
app.use((error, req, res, next) => {
  console.error("Server error:", error);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});
