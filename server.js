const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const readSheet = require('./src/readGoogleSheet');
const { getAllRemainingClasses } = require('./src/calculateRemainingClasses');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

function requireDashboardAuth(req, res, next) {
  if (req.cookies && req.cookies.dashboardAuth === '1') {
    return next();
  }
  return res.redirect('/login');
}

app.get('/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Dashboard Login - TalkTalk</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      <link href="/css/style.css" rel="stylesheet">
    </head>
    <body>
      <div class="login-overlay">
        <form class="login-box" method="POST" action="/login">
          <h2>Dashboard Login</h2>
          <input type="password" name="password" placeholder="Enter Password" required />
          <button type="submit">Login</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

app.post('/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.DASHBOARD_PASSWORD) {
    res.cookie('dashboardAuth', '1', { httpOnly: true });
    return res.redirect('/');
  }
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Dashboard Login - TalkTalk</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      <link href="/css/style.css" rel="stylesheet">
      <style>
        body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .error-message { text-align: center; color: #c81e63; font-size: 1.1rem; margin-top: 48px; }
        a { color: #EB257A; text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="error-message">
        Incorrect password.<br>
        <a href="/login">Try again</a>
      </div>
    </body>
    </html>
  `);
});

const CACHE_DURATION = 15 * 60 * 1000;
let cache = {
    data: null,
    timestamp: null,
    isInitializing: false
};

async function initializeCache() {
    if (cache.isInitializing) {
        return;
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
    
    if (!cache.data || !cache.timestamp || (now - cache.timestamp) > CACHE_DURATION) {
        if (!cache.isInitializing) {
            initializeCache();
        }
        return null;
    }
    
    return cache.data;
}

console.log(process.env.GMAIL_USER)

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/api/cache-status', (req, res) => {
    const now = Date.now();
    const isReady = cache.data && cache.timestamp && (now - cache.timestamp) <= CACHE_DURATION;
    res.json({ ready: isReady });
});

app.get('/refresh', async (req, res) => {
    try {
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

app.get('/', requireDashboardAuth, async (req, res) => {
    try {
        const students = await getCachedData();
        if (!students) {
            return res.render('loading');
        }
        const grouped = new Map();
        for (const student of students) {
            if (!grouped.has(student.groupId)) grouped.set(student.groupId, []);
            grouped.get(student.groupId).push(student);
        }
        const studentGroups = [];
        for (const [groupId, groupMembers] of grouped.entries()) {
            if (groupMembers.every(m => m.isAlone)) {
                console.log(`Group ${groupId} has all alone member, merging into one entry`);
                console.log(`Adding member ${groupMembers.map(m => m.name).join(', ')} (${groupMembers.map(m => m.email).join(', ')})`);
                // single name with multiple emails
                studentGroups.push({
                    name: groupMembers[0].name,
                    emails: groupMembers.map(m => m.email),
                    groupId: groupId,
                    isAlone: groupMembers[0].isAlone,
                    ...groupMembers[0],
                });
            } else {
                // group with multiple members || single name with single email
                console.log(`Group ${groupId} has ${groupMembers.length} members`);
                groupMembers.forEach(member => {
                    console.log(`Adding member! ${member.name} (${member.email})`);
                    studentGroups.push({
                        name: member.name,
                        emails: [member.email],
                        groupId: member.groupId,
                        isAlone: member.isAlone,
                        ...member,
                    });
                });
            }
        }
        res.render('index', { students: studentGroups });
    } catch (error) {
        console.error('Error fetching student data:', error);
        res.status(500).send('Error fetching student data');
    }
});

app.get('/student/:email', requireDashboardAuth, async (req, res) => {
    try {
        const students = await getCachedData();
        if (!students) {
            return res.render('loading');
        }
        const student = students.find(s => s.email === req.params.email);
        if (!student) {
            return res.status(404).send('Student not found');
        }
        const groupMembers = students.filter(s => s.groupId === student.groupId);
        student.emails = groupMembers.map(m => m.email);
        res.render('student-detail', { student });
    } catch (error) {
        console.error('Error fetching student data:', error);
        res.status(500).send('Error fetching student data');
    }
});

initializeCache().catch(error => {
    console.error('Failed to initialize cache on startup:', error);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});