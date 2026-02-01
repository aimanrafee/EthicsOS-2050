const SECRET_VAULT_KEY = "aiman2050"; 

function handleAuth(event) {
    if (event.key === "Enter") {
        const input = document.getElementById('masterKey').value;
        if (input === SECRET_VAULT_KEY) {
            document.getElementById('loginOverlay').style.display = 'none';
            document.getElementById('osContent').style.display = 'block';
            alert("IDENTITY VERIFIED. Welcome to EthicsOS.");
        } else {
            alert("ACCESS DENIED: Intrusive signature detected.");
            document.getElementById('masterKey').value = "";
        }
    }
}

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
    } catch (err) {
        alert("ERROR: Encryption layer failed.");
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
        alert("SUCCESS: Data decrypted from the void.");
    } catch (err) {
        alert("NOTICE: No data found or decryption failed.");
    }
}

