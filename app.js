const SECRET_VAULT_KEY = "aiman2050"; 

// 1. AUDIO ENGINE
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

// 2. SYSTEM LOG ENGINE
function sysLog(message) {
    const logBox = document.getElementById('terminal-log');
    if (logBox) {
        const now = new Date().toLocaleTimeString('en-GB', { hour12: false });
        logBox.innerHTML += `<br>[${now}] ${message}`;
        logBox.scrollTop = logBox.scrollHeight;
    }
}

// 3. SECURE AUTH LOGIC (Milestone 15%)
function handleAuth(event) {
    if (event.key === "Enter") {
        const input = document.getElementById('masterKey').value;
        const statusUI = document.getElementById('security-status-ui');
        const dashStatus = document.getElementById('dash-security-level');

        if (input === SECRET_VAULT_KEY) {
            playBip('success');
            document.getElementById('loginOverlay').style.display = 'none';
            document.getElementById('osContent').style.display = 'block';
            
            // Sync status to ALPHA
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
            document.getElementById('masterKey').value = ""; // Clear input
        }
    }
}

// 4. CLOCK ENGINE
setInterval(() => {
    const clock = document.getElementById('system-clock');
    if (clock) clock.innerText = "TIME: " + new Date().toLocaleTimeString('en-GB', { hour12: false });
}, 1000);

// 5. GHOST STORAGE (SAVE)
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

// 6. GHOST STORAGE (LOAD)
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

// 7. STORAGE ANALYTICS
async function checkStorage() {
    try {
        const root = await navigator.storage.getDirectory();
        let count = 0;
        for await (const entry of root.values()) count++;
        const storageEl = document.getElementById('storage-status');
        if (storageEl) storageEl.innerText = "GHOST_FILES: " + count;
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
    } catch (e) {}
}
setInterval(shadowAutoSave, 30000);

// 9. PROACTIVE RECOVERY
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
    } catch (e) { sysLog("No shadow draft detected."); }
}
