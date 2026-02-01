const SECRET_VAULT_KEY = "aiman2050"; 
let idleTimer;

// 1. NEURAL MATRIX ENGINE (20% Milestone)
function initMatrix() {
    const canvas = document.getElementById('matrixCanvas');
    const ctx = canvas.getContext('2d');
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = "01010101ETHICOSSOVEREIGN2050";
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
        osc.type = type === 'success' ? 'sine' : 'square'; 
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
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.frequency.value = 150;
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.connect(g); g.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.04);
    } catch (e) {}
}

// 3. SYSTEM LOG ENGINE
function sysLog(message) {
    const logBox = document.getElementById('terminal-log');
    if (logBox) {
        const now = new Date().toLocaleTimeString('en-GB', { hour12: false });
        logBox.innerHTML += `<br>[${now}] > ${message}`;
        logBox.scrollTop = logBox.scrollHeight;
    }
}

// 4. WINDOW MANAGEMENT & DRAGGABLE SYSTEM
function openWin(id) {
    const win = document.getElementById(id);
    if (win) {
        win.style.display = 'block';
        win.style.zIndex = 100;
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

// Logik "Drag" Tetingkap Ubuntu-Style
document.querySelectorAll('.win-header').forEach(header => {
    header.onmousedown = function(e) {
        let win = header.parentElement;
        let shiftX = e.clientX - win.getBoundingClientRect().left;
        let shiftY = e.clientY - win.getBoundingClientRect().top;

        function moveAt(pageX, pageY) {
            win.style.left = pageX - shiftX + 'px';
            win.style.top = pageY - shiftY + 'px';
        }

        function onMouseMove(e) { moveAt(e.pageX, e.pageY); }
        document.addEventListener('mousemove', onMouseMove);
        
        header.onmouseup = function() {
            document.removeEventListener('mousemove', onMouseMove);
            header.onmouseup = null;
        };
    };
    header.ondragstart = function() { return false; };
});

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
        display.value = "ERR";
        playBip('error');
    }
}

// 6. GHOST STORAGE & ENCRYPTION
const encrypt = (t) => btoa(t).split('').reverse().join('');
const decrypt = (t) => atob(t.split('').reverse().join(''));

async function saveToGhost() {
    const content = encrypt(document.getElementById('mainEditor').value);
    try {
        const root = await navigator.storage.getDirectory();
        const handle = await root.getFileHandle('vault.ethx', {create:true});
        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();
        sysLog("Manual Save: Manifested to Ghost.");
        playBip('success');
        refreshVaultList();
    } catch (err) { sysLog("Error: Save failed."); }
}

async function loadFromGhost() {
    try {
        const root = await navigator.storage.getDirectory();
        const handle = await root.getFileHandle('vault.ethx');
        const file = await handle.getFile();
        document.getElementById('mainEditor').value = decrypt(await file.text());
        sysLog("Data restored from the void.");
        playBip('success');
    } catch (e) { sysLog("Notice: Void is empty."); }
}

async function refreshVaultList() {
    const list = document.getElementById('vault-list');
    if (!list) return;
    try {
        const root = await navigator.storage.getDirectory();
        list.innerHTML = "";
        let count = 0;
        for await (const entry of root.values()) {
            count++;
            list.innerHTML += `<div style="margin-bottom:5px; border-bottom:1px solid #001100;">[SECURE] ${entry.name}</div>`;
        }
        const bar = document.getElementById('storage-bar');
        if (bar) bar.style.width = Math.min((count / 10) * 100, 100) + "%";
    } catch (e) {}
}

// 7. STEGANOGRAPHY (LSB ENGINE)
async function injectGhostMessage() {
    const imgInput = document.getElementById('imageInput');
    const content = document.getElementById('mainEditor').value;
    if (!imgInput.files[0] || !content) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.getElementById('steganoCanvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width; canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const binaryMsg = btoa(content).split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join('') + '00000000';
            for (let i = 0; i < binaryMsg.length; i++) {
                data[i * 4] = (data[i * 4] & 0xFE) | parseInt(binaryMsg[i]);
            }
            ctx.putImageData(imageData, 0, 0);
            const link = document.createElement('a');
            link.download = "ghost_manifest.png";
            link.href = canvas.toDataURL();
            link.click();
            sysLog("Stegano: Injection Successful.");
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
            const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            let binary = "";
            for (let i = 0; i < data.length; i += 4) binary += (data[i] & 1).toString();
            const bytes = binary.match(/.{8}/g);
            let chars = "";
            for (let b of bytes) {
                if (b === "00000000") break;
                chars += String.fromCharCode(parseInt(b, 2));
            }
            document.getElementById('mainEditor').value = atob(chars);
            sysLog("Stegano: Extraction successful.");
            playBip('success');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(imgInput.files[0]);
}

// 8. SOVEREIGN MEDIA ENGINE
document.getElementById('mediaInput')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const videoPlayer = document.getElementById('videoPlayer');
    const audioPlayer = document.getElementById('audioPlayer');
    const placeholder = document.getElementById('mediaPlaceholder');
    const fileNameDisplay = document.getElementById('mediaFileName');
    
    const mediaURL = URL.createObjectURL(file);
    fileNameDisplay.innerText = file.name.toUpperCase();
    if (placeholder) placeholder.style.display = 'none';

    if (file.type.startsWith('video/')) {
        audioPlayer.style.display = 'none';
        videoPlayer.style.display = 'block';
        videoPlayer.src = mediaURL;
        videoPlayer.play();
    } else if (file.type.startsWith('audio/')) {
        videoPlayer.style.display = 'none';
        audioPlayer.style.display = 'block';
        audioPlayer.src = mediaURL;
        audioPlayer.play();
    }
    
    sysLog(`Media Manifested: ${file.name}`);
    playBip('success');
});

// 9. AUTH & SECURITY
function handleAuth(e) {
    if(e.key === "Enter") {
        if(document.getElementById('masterKey').value === SECRET_VAULT_KEY) {
            document.getElementById('loginOverlay').style.display = 'none';
            document.getElementById('osContent').style.display = 'block';
            document.getElementById('matrixCanvas').style.opacity = "0.2";
            refreshVaultList();
            sysLog("Access Granted. Milestone 2050 Active.");
            resetIdleTimer();
        } else {
            playBip('error');
            sysLog("Unauthorized access attempt.");
        }
    }
}

function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => location.reload(), 300000); 
}
window.onmousemove = resetIdleTimer;
window.onkeypress = resetIdleTimer;

// 10. CLOCK & PWA
setInterval(() => {
    const clock = document.getElementById('system-clock');
    if (clock) clock.innerText = new Date().toLocaleTimeString('en-GB');
    const p = document.getElementById('pulse');
    if(p) p.style.opacity = p.style.opacity === "0" ? "1" : "0";
}, 1000);
