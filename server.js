const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let servers = {};

// FiveM szerver bejelentkezése (VPS-ről)
app.post('/heartbeat', (req, res) => {
    const { token, name, players } = req.body;
    if (!servers[token]) servers[token] = { commands: [] };
    
    servers[token] = { 
        ...servers[token], 
        name, 
        players, 
        lastSeen: Date.now() 
    };

    const pending = [...servers[token].commands];
    servers[token].commands = []; // Parancsok elküldve
    res.json(pending);
});

// Parancs küldése (A te gépedről)
app.post('/send', (req, res) => {
    const { token, action, data } = req.body;
    if (servers[token]) {
        servers[token].commands.push({ action, ...data });
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "Szerver offline" });
    }
});

// Szerverlista lekérése (A HTML-nek)
app.get('/list', (req, res) => {
    const now = Date.now();
    const active = Object.keys(servers)
        .filter(t => now - servers[t].lastSeen < 15000)
        .map(t => ({ token: t, ...servers[t] }));
    res.json(active);
});

// Alapértelmezett üzenet, hogy ne csak "Cannot GET" legyen
app.get('/', (req, res) => {
    res.send("KYRAX API ONLINE - Használd a vezérlőpultot!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Kyrax API Online a ${PORT} porton`));
