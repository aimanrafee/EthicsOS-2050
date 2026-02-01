const SECRET_VAULT_KEY = "aiman2050"; 

// 1. PENGESAHAN IDENTITI (AUTH)
function handleAuth(event) {
    if (event.key === "Enter") {
        const input = document.getElementById('masterKey').value;
        if (input === SECRET_VAULT_KEY) {
            document.getElementById('loginOverlay').style.display = 'none';
            document.getElementById('osContent').style.display = 'block';
            checkStorage(); // Semak storan sebaik sahaja masuk
            alert("IDENTITY VERIFIED. Welcome to EthicsOS.");
        } else {
            alert("ACCESS DENIED: Intrusive signature detected.");
            document.getElementById('masterKey').value = "";
        }
    }
}

// 2. SISTEM JAM MASA NYATA (DASHBOARD)
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-GB', { hour12: false });
    const clockElement = document.getElementById('system-clock');
    if (clockElement) {
        clockElement.innerText = "TIME: " + timeString;
    }
}
setInterval(updateClock, 1000);

// 3. PENGURUSAN STORAN GHOST (SAVE)
async function saveToGhost() {
    const content = document.getElementById('mainEditor').value;
    try {
        const encrypted = btoa(content).split('').reverse().join('');
        const root = await navigator.storage.getDirectory();
        const fileHandle = await root.getFileHandle('secure_data.ethx', { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(encrypted);
        await writable.close();
        alert("SUCCESS: Encrypted data manifested in Ghost Storage.");
        checkStorage(); // Kemaskini status selepas simpan
    } catch (err) {
        alert("ERROR: Encryption layer failed.");
    }
}

// 4. PENGURUSAN STORAN GHOST (LOAD)
async function loadFromGhost() {
    try {
        const root = await navigator.storage.getDirectory();
        const fileHandle = await root.getFileHandle('secure_data.ethx');
        const file = await fileHandle.getFile();
        const encrypted = await file.text();
        const decrypted = atob(encrypted.split('').reverse().join(''));
        document.getElementById('mainEditor').value = decrypted;
        alert("SUCCESS: Data decrypted from the void.");
    } catch (err) {
        alert("NOTICE: No data found or decryption failed.");
    }
}

// 5. PEMANTAU STATUS STORAN (DASHBOARD)
async function checkStorage() {
    try {
        const root = await navigator.storage.getDirectory();
        let fileCount = 0;
        for await (const entry of root.values()) {
            fileCount++;
        }
        const storageElement = document.getElementById('storage-status');
        if (storageElement) {
            storageElement.innerText = "GHOST_FILES: " + fileCount;
        }
    } catch (e) {
        console.log("Storage check failed");
    }
}
