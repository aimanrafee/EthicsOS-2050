const SECRET_VAULT_KEY = "aiman2050"; 

function sysLog(message) {
    const logBox = document.getElementById('terminal-log');
    if (logBox) {
        const now = new Date().toLocaleTimeString('en-GB', { hour12: false });
        logBox.innerHTML += `<br>[${now}] ${message}`;
        logBox.scrollTop = logBox.scrollHeight;
    }
}

function handleAuth(event) {
    if (event.key === "Enter") {
        const input = document.getElementById('masterKey').value;
        if (input === SECRET_VAULT_KEY) {
            document.getElementById('loginOverlay').style.display = 'none';
            document.getElementById('osContent').style.display = 'block';
            checkStorage();
            sysLog("Session started. Identity verified.");
        } else {
            alert("ACCESS DENIED");
            sysLog("Warning: Unauthorized access attempt.");
        }
    }
}

function updateClock() {
    const clockElement = document.getElementById('system-clock');
    if (clockElement) {
        clockElement.innerText = "TIME: " + new Date().toLocaleTimeString('en-GB', { hour12: false });
    }
}
setInterval(updateClock, 1000);

async function saveToGhost() {
    const content = document.getElementById('mainEditor').value;
    try {
        const encrypted = btoa(content).split('').reverse().join('');
        const root = await navigator.storage.getDirectory();
        const fileHandle = await root.getFileHandle('secure_data.ethx', { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(encrypted);
        await writable.close();
        sysLog("Manifested data to Ghost Storage.");
        checkStorage();
    } catch (err) {
        sysLog("Error: Manifestation failed.");
    }
}

async function loadFromGhost() {
    try {
        const root = await navigator.storage.getDirectory();
        const fileHandle = await root.getFileHandle('secure_data.ethx');
        const file = await fileHandle.getFile();
        const encrypted = await file.text();
        const decrypted = atob(encrypted.split('').reverse().join(''));
        document.getElementById('mainEditor').value = decrypted;
        sysLog("Decrypted data from the void.");
    } catch (err) {
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
