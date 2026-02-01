const SECRET_VAULT_KEY = "aiman2050"; 

// 1. NEURAL MATRIX ENGINE (20% Milestone)
function initMatrix() {
    const canvas = document.getElementById('matrixCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    function draw() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#0F0";
        ctx.font = fontSize + "px monospace";

        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
    }
    setInterval(draw, 33);
}
window.onload = initMatrix;

// 2. AUDIO ENGINE
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
    } catch (e) {}
}

// 3. SYSTEM LOG ENGINE
function sysLog(message) {
    const logBox = document.getElementById('terminal-log');
    if (logBox) {
        const now = new Date().toLocaleTimeString('en-GB', { hour12: false });
        logBox.innerHTML += `<br>[${now}] ${message}`;
        logBox.scrollTop = logBox.scrollHeight;
    }
}

// 4. SECURE AUTH LOGIC
function handleAuth(event) {
    if (event.key === "Enter") {
        const input = document.getElementById('masterKey').value;
        const statusUI = document.getElementById('security-status-ui');
        const dashStatus = document.getElementById('dash-security-level');

        if (input === SECRET_VAULT_KEY) {
            playBip('success');
            document.getElementById('loginOverlay').style.display = 'none';
            document.getElementById('osContent').style.display = 'block';
            document.getElementById('matrixCanvas').style.opacity = "0.2"; // Malapkan matrix bila sudah login
            
            if (dashStatus) {
                dashStatus.innerText = "[SECURE_LEVEL: ALPHA]";
                dashStatus.style.color = "#00ff00";
            }
            
            checkStorage();
            loadShadowDraft();
            sysLog("Session started. Identity verified.");
        } else {
            playBip('error');
            if (statusUI) {
                statusUI.innerText = "[SECURE_LEVEL: OMEGA - BREACH DETECTED]";
                statusUI.style.color = "#ff0000";
            }
            sysLog("CRITICAL: Unauthorized access attempt.");
            document.getElementById('masterKey').value = "";
        }
    }
}

// 5. CLOCK ENGINE
setInterval(() => {
    const clock = document.getElementById('system-clock');
    if (clock) clock.innerText = "TIME: " + new Date().toLocaleTimeString('en-GB', { hour12: false });
}, 1000);

// 6. GHOST STORAGE (SAVE/LOAD)
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
        sysLog("Manifested to Ghost Storage.");
        checkStorage();
    } catch (err) { sysLog("Error: Manifestation failed."); }
}

async function loadFromGhost() {
    try {
        const root = await navigator.storage.getDirectory();
        const fileHandle = await root.getFileHandle('secure_data.ethx');
        const file = await fileHandle.getFile();
        const encrypted = await file.text();
        const decrypted = atob(encrypted.split('').reverse().join(''));
        document.getElementById('mainEditor').value = decrypted;
        playBip('success');
        sysLog("Restored from the void.");
    } catch (err) { sysLog("Notice: Void is empty."); }
}

// 7. STORAGE ANALYTICS & AUTO-SAVE
async function checkStorage() {
    try {
        const root = await navigator.storage.getDirectory();
        let count = 0;
        for await (const entry of root.values()) count++;
        const storageEl = document.getElementById('storage-status');
        if (storageEl) storageEl.innerText = "GHOST_FILES: " + count;
    } catch (e) {}
}

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
    } catch (e) {}
}
setInterval(shadowAutoSave, 30000);

async function loadShadowDraft() {
    try {
        const root = await navigator.storage.getDirectory();
        const fileHandle = await root.getFileHandle('shadow_draft.ethx');
        const file = await fileHandle.getFile();
        const encrypted = await file.text();
        const decrypted = atob(encrypted.split('').reverse().join(''));
        if (document.getElementById('mainEditor').value === "") {
            document.getElementById('mainEditor').value = decrypted;
            sysLog("Restored shadow draft.");
        }
    } catch (e) {}
}
