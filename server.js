const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // Ez kell, hogy a Netlify-ról elérd!
app.use(express.json());

let servers = {};

app.post('/heartbeat', (req, res) => {
    const { token, name, players } = req.body;
    if (!servers[token]) servers[token] = { commands: [] };
    servers[token] = { ...servers[token], name, players, lastSeen: Date.now() };
    
    const cmds = [...servers[token].commands];
    servers[token].commands = [];
    res.json(cmds);
});

app.post('/send', (req, res) => {
    const { token, action, data } = req.body;
    if (servers[token]) {
        servers[token].commands.push({ action, ...data });
        res.json({ success: true });
    } else res.status(404).json({ error: "Szerver offline" });
});

app.get('/list', (req, res) => {
    res.json(Object.keys(servers).map(t => ({ token: t, ...servers[t] })));
});

app.listen(process.env.PORT || 3000);
