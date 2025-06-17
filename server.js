const express = require('express');
const path = require('path');
const readSheet = require('./src/readGoogleSheet');
const { getAllRemainingClasses } = require('./src/calculateRemainingClasses');

const dotenv = require('dotenv');
dotenv.config();

// Cache implementation
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
let cache = {
    data: null,
    timestamp: null,
    isInitializing: false
};

async function initializeCache() {
    if (cache.isInitializing) {
        return; // Another initialization is in progress
    }

    try {
        cache.isInitializing = true;
        console.log('Initializing cache - fetching fresh data from Google Sheets');
        const students = await readSheet();
        const studentsWithRemaining = await getAllRemainingClasses(students);
        
        cache = {
            data: studentsWithRemaining,
            timestamp: Date.now(),
            isInitializing: false
        };
    } catch (error) {
        console.error('Error initializing cache:', error);
        cache.isInitializing = false;
        throw error;
    }
}

async function getCachedData() {
    const now = Date.now();
    
    // If cache is empty or expired, trigger initialization
    if (!cache.data || !cache.timestamp || (now - cache.timestamp) > CACHE_DURATION) {
        if (!cache.isInitializing) {
            initializeCache();
        }
        return null; // Return null to indicate cache is not ready
    }
    
    return cache.data;
}

console.log(process.env.GMAIL_USER)

const app = express();
const port = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// API endpoint to check cache status
app.get('/api/cache-status', (req, res) => {
    const now = Date.now();
    const isReady = cache.data && cache.timestamp && (now - cache.timestamp) <= CACHE_DURATION;
    res.json({ ready: isReady });
});

// Force refresh route
app.get('/refresh', async (req, res) => {
    try {
        // Force cache reinitialization
        cache = {
            data: null,
            timestamp: null,
            isInitializing: false
        };
        res.redirect('/');
        await initializeCache();
    } catch (error) {
        console.error('Error refreshing cache:', error);
        res.status(500).send('Error refreshing data');
    }
});

// Routes
app.get('/', async (req, res) => {
    try {
        const students = await getCachedData();
        if (!students) {
            // If cache is not ready, show loading page
            return res.render('loading');
        }
        res.render('index', { students });
    } catch (error) {
        console.error('Error fetching student data:', error);
        res.status(500).send('Error fetching student data');
    }
});

app.get('/student/:email', async (req, res) => {
    try {
        const students = await getCachedData();
        if (!students) {
            // If cache is not ready, show loading page
            return res.render('loading');
        }
        const student = students.find(s => s.email === req.params.email);
        
        if (!student) {
            return res.status(404).send('Student not found');
        }
        res.render('student-detail', { student });
    } catch (error) {
        console.error('Error fetching student data:', error);
        res.status(500).send('Error fetching student data');
    }
});

// Initialize cache on server start
initializeCache().catch(error => {
    console.error('Failed to initialize cache on startup:', error);
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
}); 