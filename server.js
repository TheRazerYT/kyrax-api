const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Ideiglenes tároló a szervereknek és a parancsaiknak
let servers = {};

// 1. FIVE M SZERVER BEJELENTKEZÉS (Heartbeat)
app.post('/heartbeat', (req, res) => {
    const { token, name, players } = req.body;
    
    // Ha új szerver, létrehozzuk az adatbázisát
    if (!servers[token]) {
        servers[token] = { commands: [] };
    }
    
    // Frissítjük az adatait
    servers[token] = { 
        ...servers[token], 
        name, 
        players, 
        lastSeen: Date.now() 
    };

    // Kivesszük a várakozó parancsokat és elküldjük a FiveM-nek
    const pendingCommands = [...servers[token].commands];
    servers[token].commands = []; 
    
    res.json(pendingCommands);
});

// 2. PARANCS KÜLDÉSE (A vezérlőpultról ide)
app.post('/send', (req, res) => {
    const { token, action, data } = req.body;
    
    if (servers[token]) {
        // Betesszük a parancsot a szerver várólistájára
        servers[token].commands.push({ action, data });
        console.log(`[${token}] Parancs hozzáadva: ${action}`);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "A szerver jelenleg offline." });
    }
});

// 3. SZERVERLISTA LEKÉRDEZÉSE (A HTML panelnek)
app.get('/list', (req, res) => {
    const now = Date.now();
    // Csak azokat küldjük, amik az utolsó 15 másodpercben jeleztek
    const activeServers = Object.keys(servers)
        .filter(t => now - servers[t].lastSeen < 15000)
        .map(t => ({ 
            token: t, 
            name: servers[t].name, 
            players: servers[t].players 
        }));
    
    res.json(activeServers);
});

// Alapértelmezett kezdőoldal
app.get('/', (req, res) => {
    res.send("KYRAX CLOUD API - Status: [ONLINE]");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend fut a ${PORT} porton.`));
