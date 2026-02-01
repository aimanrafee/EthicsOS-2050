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
    } catch (e) { console.log("Audio suppressed"); }
}

// 2. MENCETAK LOG SISTEM
function sysLog(message) {
    const logBox = document.getElementById('terminal-log');
    if (logBox) {
        const now = new Date().toLocaleTimeString('en-GB', { hour12: false });
        logBox.innerHTML += `<br>[${now}] ${message}`;
        logBox.scrollTop = logBox.scrollHeight;
    }
}

// 3. PENGESAHAN IDENTITI (AUTH)
function handleAuth(event) {
    if (event.key === "Enter") {
        const input = document.getElementById('masterKey').value;
        if (input === SECRET_VAULT_KEY) {
            playBip('success');
            document.getElementById('loginOverlay').style.display = 'none';
            document.getElementById('osContent').style.display = 'block';
            checkStorage();
            loadShadowDraft(); // Milestone 12%: Pulihkan draf rahsia
            sysLog("Session started. Identity verified.");
        } else {
            playBip('error');
            alert("ACCESS DENIED");
            sysLog("Warning: Unauthorized access attempt.");
        }
    }
}

// 4. SISTEM JAM MASA NYATA
function updateClock() {
    const clockElement = document.getElementById('system-clock');
    if (clockElement) {
        clockElement.innerText = "TIME: " + new Date().toLocaleTimeString('en-GB', { hour12: false });
    }
}
setInterval(updateClock, 1000);

// 5. PENGURUSAN STORAN GHOST (SAVE)
async function saveToGhost() {
    const content = document.getElementById('mainEditor').value;
    try {
        const encrypted = btoa(content).split('').reverse().join('');
        const root = await navigator.storage.getDirectory();
        const fileHandle = await root.getFileHandle('secure_data.ethx', { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(encrypted);
        await writable.close();
        playBip('success');
        sysLog("Manifested data to Ghost Storage.");
        checkStorage();
    } catch (err) {
        playBip('error');
        sysLog("Error: Manifestation failed.");
    }
}

// 6. PENGURUSAN STORAN GHOST (LOAD)
async function loadFromGhost() {
    try {
        const root = await navigator.storage.getDirectory();
        const fileHandle = await root.getFileHandle('secure_data.ethx');
        const file = await fileHandle.getFile();
        const encrypted = await file.text();
        const decrypted = atob(encrypted.split('').reverse().join(''));
        document.getElementById('mainEditor').value = decrypted;
        playBip('success');
        sysLog("Decrypted data from the void.");
    } catch (err) {
        playBip('error');
        sysLog("Notice: Void is empty.");
    }
}

// 7. PEMANTAU STATUS STORAN
async function checkStorage() {
    try {
        const root = await navigator.storage.getDirectory();
        let fileCount = 0;
        for await (const entry of root.values()) fileCount++;
        document.getElementById('storage-status').innerText = "GHOST_FILES: " + fileCount;
    } catch (e) {}
}

// 8. SHADOW AUTO-SAVE (12% Milestone)
async function shadowAutoSave() {
    const content = document.getElementById('mainEditor').value;
    if (content.trim() === "") return;

    try {
        const encrypted = btoa(content).split('').reverse().join('');
        const root = await navigator.storage.getDirectory();
        const fileHandle = await root.getFileHandle('shadow_draft.ethx', { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(encrypted);
        await writable.close();
        sysLog("Shadow draft synchronized.");
    } catch (err) {
        console.log("Auto-save latent.");
    }
}
setInterval(shadowAutoSave, 30000); // Kitaran 30 saat [cite: 2026-02-02]

async function loadShadowDraft() {
    try {
        const root = await navigator.storage.getDirectory();
        const fileHandle = await root.getFileHandle('shadow_draft.ethx');
        const file = await fileHandle.getFile();
        const encrypted = await file.text();
        const decrypted = atob(encrypted.split('').reverse().join(''));
        
        if (document.getElementById('mainEditor').value === "") {
            document.getElementById('mainEditor').value = decrypted;
            sysLog("Restored last shadow draft.");
        }
    } catch (e) {
        sysLog("No shadow draft detected.");
    }
}
