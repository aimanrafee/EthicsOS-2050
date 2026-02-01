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

function playTypeSound() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.frequency.value = 150;
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.04);
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

// 4. WINDOW MANAGEMENT SYSTEM
function openWin(id) {
    const win = document.getElementById(id);
    if (win) {
        win.style.display = 'block';
        win.style.zIndex = 100; // Bawa ke hadapan
        document.getElementById('active-app').innerText = id.replace('win-', '').toUpperCase();
        playBip('success');
        sysLog(`App launched: ${id}`);
    }
}

function closeWin(id) {
    const win = document.getElementById(id);
    if (win) {
        win.style.display = 'none';
        document.getElementById('active-app').innerText = "DESKTOP";
    }
}

// 5. SOVEREIGN CALCULATOR LOGIC
function calcInput(val) {
    const display = document.getElementById('calc-display');
    if (display) {
        display.value += val;
        playTypeSound();
    }
}

function calcResult() {
    const display = document.getElementById('calc-display');
    try {
        const res = eval(display.value);
        display.value = res;
        playBip('success');
    } catch(e) {
        display.value = "ERROR";
        playBip('error');
    }
}

// 6. VAULT BROWSER LOGIC (25% Milestone) [cite: 2026-01-24]
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
        if (!hasFiles) listElement.innerHTML = "[Vault is currently empty]";
        updateStorageVisuals();
    } catch (err) {
        listElement.innerHTML = "[Error accessing vault]";
    }
}

// 7. SECURE AUTH LOGIC
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
            resetIdleTimer();
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

// 8. CLOCK ENGINE
setInterval(() => {
    const clock = document.getElementById('system-clock');
    if (clock) clock.innerText = "TIME: " + new Date().toLocaleTimeString('en-GB', { hour12: false });
}, 1000);

// 9. GHOST STORAGE (SAVE/LOAD) [cite: 2026-02-02]
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

// 10. STORAGE ANALYTICS & SHADOW AUTO-SAVE [cite: 2026-02-02]
async function checkStorage() {
    try {
        const root = await navigator.storage.getDirectory();
        let count = 0;
        for await (const entry of root.values()) count++;
        updateStorageVisuals();
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
        refreshVaultList();
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
            refreshVaultList();
            sysLog("CRITICAL: Vault has been sanitized.");
            alert("VAULT SANITIZED");
        } catch (err) { sysLog("Error: Sanitization protocol failed."); }
    }
}

// 12. BINARY GHOST LOCK (35% Milestone) [cite: 2026-01-24]
let idleTimer;
const LOCK_TIMEOUT = 300000; 
function resetIdleTimer() {
    clearTimeout(idleTimer);
    if (document.getElementById('osContent').style.display === 'block') {
        idleTimer = setTimeout(initiateGhostLock, LOCK_TIMEOUT);
    }
}
async function initiateGhostLock() {
    sysLog("SENTINEL: Idle state detected. Initiating Binary Ghost Lock...");
    await shadowAutoSave();
    document.getElementById('mainEditor').value = "";
    document.getElementById('osContent').style.display = 'none';
    document.getElementById('loginOverlay').style.display = 'block';
    document.getElementById('matrixCanvas').style.opacity = "1.0"; 
    document.getElementById('masterKey').value = "";
    document.getElementById('security-status-ui').innerText = "[SESSION_LOCKED_BY_SENTINEL]";
    document.getElementById('security-status-ui').style.color = "#ffff00";
    playBip('error');
}
window.onmousemove = resetIdleTimer;
window.onkeypress = resetIdleTimer;
window.onclick = resetIdleTimer;

// 13. NEURAL DASHBOARD ENGINE (40% Milestone) [cite: 2026-01-24]
setInterval(() => {
    const pulse = document.getElementById('pulse');
    if (pulse) pulse.style.opacity = pulse.style.opacity === "0" ? "1" : "0";
}, 1000);

async function updateStorageVisuals() {
    try {
        const root = await navigator.storage.getDirectory();
        let count = 0;
        for await (const entry of root.values()) count++;
        const bar = document.getElementById('storage-bar');
        if (bar) bar.style.width = Math.min((count / 10) * 100, 100) + "%";
    } catch (e) {}
}

// 14. STEGANOGRAPHY ENGINES
async function injectGhostMessage() {
    const imgInput = document.getElementById('imageInput');
    const content = document.getElementById('mainEditor').value;
    if (!imgInput.files[0] || !content) {
        sysLog("ERROR: Image and message required.");
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.getElementById('steganoCanvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width; canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;
            const secretData = btoa(content) + "##END##";
            let binarySecret = "";
            for (let i = 0; i < secretData.length; i++) {
                binarySecret += secretData[i].charCodeAt(0).toString(2).padStart(8, '0');
            }
            for (let i = 0; i < binarySecret.length; i++) {
                pixels[i * 4] = (pixels[i * 4] & 0xFE) | parseInt(binarySecret[i]);
            }
            ctx.putImageData(imageData, 0, 0);
            const link = document.createElement('a');
            link.download = "ghost_manifestation.png";
            link.href = canvas.toDataURL("image/png");
            link.click();
            sysLog("SUCCESS: Ghost Message manifested.");
            playBip('success');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(imgInput.files[0]);
}

async function extractGhostMessage() {
    const imgInput = document.getElementById('imageInput');
    if (!imgInput.files[0]) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width; canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;
            let binarySecret = "";
            for (let i = 0; i < pixels.length / 4; i++) {
                binarySecret += (pixels[i * 4] & 1).toString();
            }
            let secretData = "";
            for (let i = 0; i < binarySecret.length; i += 8) {
                const charCode = parseInt(binarySecret.substr(i, 8), 2);
                if (charCode === 0) break;
                secretData += String.fromCharCode(charCode);
                if (secretData.endsWith("##END##")) break;
            }
            if (secretData.includes("##END##")) {
                const finalMessage = atob(secretData.replace("##END##", ""));
                document.getElementById('mainEditor').value = finalMessage;
                sysLog("SUCCESS: Extraction complete.");
                playBip('success');
            } else {
                sysLog("NOTICE: No ghost fragments found.");
            }
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(imgInput.files[0]);
}
