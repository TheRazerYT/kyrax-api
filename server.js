const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

let scriptActive = false; // Ez a távoli kapcsoló állapota

// Ezt nézi a FiveM script
app.get('/status', (req, res) => {
    res.json({ active: scriptActive });
});

// Ezt hívja az Electron appod
app.post('/toggle', (req, res) => {
    scriptActive = req.body.state;
    res.json({ success: true, currentState: scriptActive });
});

app.listen(3000, () => console.log("API fut a 3000-es porton"));
