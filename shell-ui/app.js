const SECRET_VAULT_KEY = "aiman2050"; 

// 1. ENJIN BUNYI SINTETIK
function playBip(type) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square"; 
        osc.frequency.setValueAtTime(type === 'success' ? 880 : 220, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    } catch (e) { console.log("Audio muted"); }
}

// 2. LOG SISTEM
function sysLog(message) {
    const logBox = document.getElementById('terminal-log');
    if (logBox) {
        const now = new Date().toLocaleTimeString('en-GB', { hour12: false });
        logBox.innerHTML += `<br>[${now}] ${message}`;
        logBox.scrollTop = logBox.scrollHeight;
    }
}

// 3. AUTH DENGAN BUNYI
function handleAuth(event) {
    if (event.key === "Enter") {
        const input = document.getElementById('masterKey').value;
        if (input === SECRET_VAULT_KEY) {
            playBip('success'); // AKTIF: Bunyi kejayaan [cite: 2026-01-24]
            document.getElementById('loginOverlay').style.display = 'none';
            document.getElementById('osContent').style.display = 'block';
            checkStorage();
            sysLog("Session started. Identity verified.");
        } else {
            playBip('error'); // AKTIF: Bunyi ralat [cite: 2026-01-24]
            alert("ACCESS DENIED");
            sysLog("Warning: Unauthorized access attempt.");
        }
    }
}

// 4. JAM MASA NYATA
function updateClock() {
    const clockElement = document.getElementById('system-clock');
    if (clockElement) {
        clockElement.innerText = "TIME: " + new Date().toLocaleTimeString('en-GB', { hour12: false });
    }
}
setInterval(updateClock, 1000);

// 5. SAVE DENGAN BUNYI
async function saveToGhost() {
    const content = document.getElementById('mainEditor').value;
    try {
        const encrypted = btoa(content).split('').reverse().join('');
        const root = await navigator.storage.getDirectory();
        const fileHandle = await root.getFileHandle('secure_data.ethx', { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(encrypted);
        await writable.close();
        
        playBip('success'); // AKTIF: Bunyi simpanan berjaya [cite: 2026-01-24]
        sysLog("Manifested data to Ghost Storage.");
        checkStorage();
    } catch (err) {
        playBip('error'); // AKTIF: Bunyi ralat storan [cite: 2026-01-24]
        sysLog("Error: Manifestation failed.");
    }
}

// 6. LOAD DENGAN BUNYI
async function loadFromGhost() {
    try {
        const root = await navigator.storage.getDirectory();
        const fileHandle = await root.getFileHandle('secure_data.ethx');
        const file = await fileHandle.getFile();
        const encrypted = await file.text();
        const decrypted = atob(encrypted.split('').reverse().join(''));
        document.getElementById('mainEditor').value = decrypted;
        
        playBip('success'); // AKTIF: Bunyi muatan berjaya [cite: 2026-01-24]
        sysLog("Decrypted data from the void.");
    } catch (err) {
        playBip('error'); // AKTIF: Bunyi ralat muatan [cite: 2026-01-24]
        sysLog("Notice: Void is empty.");
    }
}

async function checkStorage() {
    try {
        const root = await navigator.storage.getDirectory();
        let fileCount = 0;
        for await (const entry of root.values()) fileCount++;
        document.getElementById('storage-status').innerText = "GHOST_FILES: " + fileCount;
    } catch (e) {}
}
