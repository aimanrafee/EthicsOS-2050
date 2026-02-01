const SECRET_VAULT_KEY = "aiman2050"; 

// 1. NEURAL MATRIX ENGINE (20% Milestone) [cite: 2026-01-24]
function initMatrix() {
    const canvas = document.getElementById('matrixCanvas');
    const ctx = canvas.getContext('2d');
    if (!canvas) return;

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

// 2. AUDIO ENGINE [cite: 2026-01-24]
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

// 4. VAULT BROWSER LOGIC (25% Milestone) [cite: 2026-01-24]
async function refreshVaultList() {
    const listElement = document.getElementById('vault-list');
    if (!listElement) return;

    try {
        const root = await navigator.storage.getDirectory();
        listElement.innerHTML = ""; 
        
        let hasFiles = false;
        for await (const entry of root.values()) {
            hasFiles = true;
            const fileItem = document.createElement('div');
            fileItem.style.padding = "2px 0";
            fileItem.style.borderBottom = "1px solid #001100";
            fileItem.innerHTML = `<span style="color: #00ff00;">[FILE]</span> ${entry.name} <span style="float: right; color: #004400;">LOCKED</span>`;
            listElement.appendChild(fileItem);
        }

        if (!hasFiles) {
            listElement.innerHTML = "[Vault is currently empty]";
        }
    } catch (err) {
        listElement.innerHTML = "[Error accessing vault]";
    }
}

// 5. SECURE AUTH LOGIC
function handleAuth(event) {
    if (event.key === "Enter") {
        const input = document.getElementById('masterKey').value;
        const statusUI = document.getElementById('security-status-ui');
        const dashStatus = document.getElementById('dash-security-level');

        if (input === SECRET_VAULT_KEY) {
            playBip('success');
            document.getElementById('loginOverlay').style.display = 'none';
            document.getElementById('osContent').style.display = 'block';
            document.getElementById('matrixCanvas').style.opacity = "0.2"; 
            
            if (dashStatus) {
                dashStatus.innerText = "[SECURE_LEVEL: ALPHA]";
                dashStatus.style.color = "#00ff00";
            }
            
            checkStorage();
            loadShadowDraft();
            refreshVaultList();
            resetIdleTimer(); // Mulakan timer sentinel selepas login [cite: 2026-01-24]
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

// 6. CLOCK ENGINE
setInterval(() => {
    const clock = document.getElementById('system-clock');
    if (clock) clock.innerText = "TIME: " + new Date().toLocaleTimeString('en-GB', { hour12: false });
}, 1000);

// 7. GHOST STORAGE (SAVE/LOAD) [cite: 2026-02-02]
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
        refreshVaultList();
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

// 8. STORAGE ANALYTICS
async function checkStorage() {
    try {
        const root = await navigator.storage.getDirectory();
        let count = 0;
        for await (const entry of root.values()) count++;
        const storageEl = document.getElementById('storage-status');
        if (storageEl) storageEl.innerText = "GHOST_FILES: " + count;
    } catch (e) {}
}

// 9. SHADOW AUTO-SAVE [cite: 2026-02-02]
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
        refreshVaultList();
    } catch (e) {}
}
setInterval(shadowAutoSave, 30000);

// 10. PROACTIVE RECOVERY [cite: 2026-02-02]
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

// 11. GHOST ERASER PROTOCOL (30% Milestone) [cite: 2026-01-24]
async function wipeVault() {
    const confirmation = confirm("WARNING: This will PERMANENTLY erase all secure fragments. Proceed?");
    
    if (confirmation) {
        try {
            playBip('error'); 
            setTimeout(() => playBip('error'), 200);
            const root = await navigator.storage.getDirectory();
            for await (const entry of root.values()) {
                await root.removeEntry(entry.name);
                sysLog(`ERASED: ${entry.name}`);
            }
            document.getElementById('mainEditor').value = "";
            checkStorage();
            refreshVaultList();
            sysLog("CRITICAL: Vault has been sanitized. Zero data remains.");
            alert("VAULT SANITIZED");
        } catch (err) {
            sysLog("Error: Sanitization protocol failed.");
        }
    }
}

// 12. BINARY GHOST LOCK (35% Milestone) [cite: 2026-01-24]
let idleTimer;
const LOCK_TIMEOUT = 300000; // 5 minit (300,000 ms) [cite: 2026-01-24]

function resetIdleTimer() {
    clearTimeout(idleTimer);
    if (document.getElementById('osContent').style.display === 'block') {
        idleTimer = setTimeout(initiateGhostLock, LOCK_TIMEOUT);
    }
}

async function initiateGhostLock() {
    sysLog("SENTINEL: Idle state detected. Initiating Binary Ghost Lock...");
    
    // 1. Simpan draf secara automatik sebelum kunci [cite: 2026-02-02]
    await shadowAutoSave();
    
    // 2. Kosongkan editor untuk elakkan pengintipan [cite: 2026-01-24]
    document.getElementById('mainEditor').value = "";
    
    // 3. Kembali ke skrin login
    document.getElementById('osContent').style.display = 'none';
    document.getElementById('loginOverlay').style.display = 'block';
    document.getElementById('matrixCanvas').style.opacity = "1.0"; 
    
    // 4. Reset input kunci
    document.getElementById('masterKey').value = "";
    document.getElementById('security-status-ui').innerText = "[SESSION_LOCKED_BY_SENTINEL]";
    document.getElementById('security-status-ui').style.color = "#ffff00";
    
    playBip('error');
    sysLog("SENTINEL: Session secured. Data moved to shadow storage.");
}

// Pantau aktiviti pengguna untuk reset timer [cite: 2026-01-24]
window.onmousemove = resetIdleTimer;
window.onkeypress = resetIdleTimer;
window.onclick = resetIdleTimer;
