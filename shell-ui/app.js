async function saveToGhost() {
    const content = document.getElementById('mainEditor').value;
    try {
        const root = await navigator.storage.getDirectory();
        const fileHandle = await root.getFileHandle('secure_data.ethx', { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
        alert("SUCCESS: Data manifested in Ghost Storage.");
    } catch (err) {
        console.error(err);
        alert("ERROR: Ghost Storage failed to initialize.");
    }
}

async function loadFromGhost() {
    try {
        const root = await navigator.storage.getDirectory();
        const fileHandle = await root.getFileHandle('secure_data.ethx');
        const file = await fileHandle.getFile();
        const content = await file.text();
        document.getElementById('mainEditor').value = content;
        alert("SUCCESS: Data retrieved from the void.");
    } catch (err) {
        alert("NOTICE: No data found in Ghost Storage.");
    }
}
