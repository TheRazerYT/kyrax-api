const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors(), express.json());

let servers = {};

// FiveM script hívja ezt
app.post('/heartbeat', (req, res) => {
    const { token, name, ip, players } = req.body;
    if (!servers[token]) servers[token] = { enabled: true }; // Alapból bekapcsolva
    servers[token] = { ...servers[token], name, ip, players, lastSeen: Date.now() };
    res.json({ enabled: servers[token].enabled });
});

// Electron app hívja ezt a kapcsoláshoz
app.post('/toggle', (req, res) => {
    const { token, state } = req.body;
    if (servers[token]) {
        servers[token].enabled = state;
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "Szerver nem található" });
    }
});

app.get('/list', (req, res) => {
    res.json(Object.keys(servers).map(t => ({ token: t, ...servers[t] })));
});

app.listen(3000, () => console.log("C2 API ONLINE: 3000"));
