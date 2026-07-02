// OS Configuration
const OS_CODES = {
    'HW12': 'deepblue',
    'BUBU8102BAUNI9810ECHO': 'fadedecho'
};

let currentOS = '';
let currentUser = null;
let windowsOpen = [];
let zIndex = 100;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateTime();
    setInterval(updateTime, 1000);
});

// Boot Functions
function checkCode() {
    const code = document.getElementById('osCode').value.toUpperCase();
    
    if (OS_CODES[code]) {
        currentOS = OS_CODES[code];
        startInstallation(currentOS);
    } else {
        alert('Invalid code! Use HW12 for Deep Blue OS or BUBU8102BAUNI9810ECHO for FadedEcho OS');
    }
}

function installOS(osType) {
    currentOS = osType;
    startInstallation(osType);
}

function startInstallation(osType) {
    const osName = osType === 'deepblue' ? 'Deep Blue OS' : 'FadedEcho OS';
    document.getElementById('bootScreen').style.display = 'none';
    document.getElementById('installScreen').style.display = 'flex';
    document.getElementById('installTitle').textContent = `Installing ${osName}`;

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 25;
        if (progress > 100) progress = 100;
        
        document.getElementById('progressFill').style.width = progress + '%';
        document.getElementById('installStatus').textContent = Math.floor(progress) + '% Complete';

        if (progress === 100) {
            clearInterval(interval);
            setTimeout(() => {
                document.getElementById('installScreen').style.display = 'none';
                document.getElementById('setupScreen').style.display = 'flex';
            }, 500);
        }
    }, 200);
}

function completeSetup() {
    const name = document.getElementById('setupName').value.trim();
    const password = document.getElementById('setupPassword').value.trim();

    if (!name || !password) {
        alert('Please fill all fields!');
        return;
    }

    currentUser = { name, password };
    localStorage.setItem('osUser', JSON.stringify(currentUser));

    document.getElementById('setupScreen').style.display = 'none';
    startMainOS();
}

// Login Functions
function showLogin() {
    if (currentUser) {
        document.getElementById('mainOS').style.display = 'none';
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('loginUserName').textContent = currentUser.name;
        document.getElementById('loginPassword').value = '';
    }
}

function loginUser() {
    const password = document.getElementById('loginPassword').value;
    
    if (password === currentUser.password) {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainOS').style.display = 'flex';
    } else {
        alert('Incorrect password!');
    }
}

function logoutUser() {
    showLogin();
}

function uninstallOS() {
    document.getElementById('errorScreen').style.display = 'none';
    document.getElementById('mainOS').style.display = 'none';
    
    const uninstallBox = document.createElement('div');
    uninstallBox.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #000; color: #fff; padding: 40px; border-radius: 10px; text-align: center; z-index: 10000;';
    uninstallBox.innerHTML = '<h2>Uninstalling OS</h2><p>Please wait...</p>';
    document.body.appendChild(uninstallBox);

    setTimeout(() => {
        localStorage.removeItem('osUser');
        currentUser = null;
        windowsOpen = [];
        document.body.removeChild(uninstallBox);
        document.getElementById('bootScreen').style.display = 'flex';
        document.getElementById('osCode').value = '';
    }, 5000);
}

// Main OS Functions
function startMainOS() {
    document.getElementById('setupScreen').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainOS').style.display = 'flex';

    initializeDesktop();
}

function initializeDesktop() {
    const desktop = document.getElementById('desktop');
    desktop.innerHTML = '';

    const apps = [
        { name: 'Calculator', icon: 'fas fa-calculator', type: 'calculator' },
        { name: 'Notes', icon: 'fas fa-sticky-note', type: 'notes' },
        { name: 'Folder', icon: 'fas fa-folder', type: 'folder' },
        { name: 'Text Editor', icon: 'fas fa-file-alt', type: 'editor' },
        { name: 'Settings', icon: 'fas fa-cog', type: 'settings' }
    ];

    apps.forEach(app => {
        const icon = document.createElement('div');
        icon.className = 'desktop-icon';
        icon.ondblclick = () => openApp(app.type, app.name, app.icon);
        icon.innerHTML = `
            <div class="desktop-icon-img">
                <i class="${app.icon}"></i>
            </div>
            <div class="desktop-icon-label">${app.name}</div>
        `;
        desktop.appendChild(icon);
    });

    // Auto-open Folder
    setTimeout(() => {
        openApp('folder', 'Folder', 'fas fa-folder');
    }, 500);
}

// Window Management
function openApp(type, name, icon) {
    if (type === 'folder' && windowsOpen.some(w => w.type === 'folder')) {
        document.querySelector(`[data-app-type="folder"]`).style.display = 'flex';
        return;
    }

    const windowId = 'window-' + Date.now();
    const windowEl = document.createElement('div');
    windowEl.className = 'window';
    windowEl.id = windowId;
    windowEl.dataset.appType = type;
    windowEl.style.zIndex = zIndex++;

    windowEl.innerHTML = `
        <div class="window-header">
            <div class="window-title">
                <i class="${icon}"></i>
                <span>${name}</span>
            </div>
            <div class="window-controls">
                <button class="window-btn" onclick="minimizeWindow('${windowId}')">
                    <i class="fas fa-minus"></i>
                </button>
                <button class="window-btn" onclick="maximizeWindow('${windowId}')">
                    <i class="fas fa-square"></i>
                </button>
                <button class="window-btn close" onclick="closeWindow('${windowId}', '${type}')">
                    <i class="fas fa-times"></i>
                </button>
                ${type === 'folder' ? `<button class="window-btn" onclick="forceQuitOS()" style="background: rgba(255, 59, 48, 0.2); color: #ff3b30;">Force Quit</button>` : ''}
            </div>
        </div>
        <div class="window-content" id="content-${windowId}"></div>
    `;

    document.body.appendChild(windowEl);

    // Make window draggable
    makeDraggable(windowEl);

    // Load content
    loadAppContent(windowId, type);

    // Add to taskbar
    const taskbarApps = document.getElementById('taskbarApps');
    const taskbarApp = document.createElement('div');
    taskbarApp.className = 'taskbar-app active';
    taskbarApp.innerHTML = `<i class="${icon}"></i>`;
    taskbarApp.onclick = () => {
        windowEl.style.display = windowEl.style.display === 'none' ? 'flex' : 'none';
    };
    taskbarApps.appendChild(taskbarApp);

    windowsOpen.push({ id: windowId, type, taskbarEl: taskbarApp });
}

function loadAppContent(windowId, type) {
    const content = document.getElementById(`content-${windowId}`);

    switch(type) {
        case 'calculator':
            loadCalculator(content);
            break;
        case 'notes':
            loadNotes(content);
            break;
        case 'folder':
            loadFolder(content);
            break;
        case 'editor':
            loadEditor(content);
            break;
        case 'settings':
            loadSettings(content, windowId);
            break;
    }
}

function loadCalculator(content) {
    let display = '0';
    let prev = null;
    let op = null;

    content.innerHTML = `
        <div class="calc-display" id="calcDisp">0</div>
        <div class="calc-grid">
            <button class="calc-btn" onclick="calcClick(this, 'C')">C</button>
            <button class="calc-btn" onclick="calcClick(this, '/')">/</button>
            <button class="calc-btn" onclick="calcClick(this, '*')">*</button>
            <button class="calc-btn" onclick="calcClick(this, '-')">-</button>
            <button class="calc-btn" onclick="calcClick(this, '7')">7</button>
            <button class="calc-btn" onclick="calcClick(this, '8')">8</button>
            <button class="calc-btn" onclick="calcClick(this, '9')">9</button>
            <button class="calc-btn" onclick="calcClick(this, '+')">+</button>
            <button class="calc-btn" onclick="calcClick(this, '4')">4</button>
            <button class="calc-btn" onclick="calcClick(this, '5')">5</button>
            <button class="calc-btn" onclick="calcClick(this, '6')">6</button>
            <button class="calc-btn" onclick="calcClick(this, '.')">.</button>
            <button class="calc-btn" onclick="calcClick(this, '1')">1</button>
            <button class="calc-btn" onclick="calcClick(this, '2')">2</button>
            <button class="calc-btn" onclick="calcClick(this, '3')">3</button>
            <button class="calc-btn" onclick="calcClick(this, '0')">0</button>
            <button class="calc-btn" style="grid-column: 3/5; background: rgba(6, 182, 212, 0.3);" onclick="calcClick(this, '=')">=</button>
        </div>
    `;

    window.calcClick = function(btn, val) {
        const disp = document.getElementById('calcDisp');
        if (val === 'C') {
            display = '0';
            prev = null;
            op = null;
        } else if (val === '=') {
            if (op && prev !== null) {
                display = eval(prev + op + display).toString();
                prev = null;
                op = null;
            }
        } else if (['+', '-', '*', '/'].includes(val)) {
            prev = display;
            op = val;
            display = '0';
        } else {
            display = display === '0' ? val : display + val;
        }
        disp.textContent = display;
    };
}

function loadNotes(content) {
    let notes = JSON.parse(localStorage.getItem('notes')) || [];

    content.innerHTML = `
        <textarea class="notes-input" id="noteInp" placeholder="Write note..."></textarea>
        <button class="btn-primary" onclick="addNote()">Save Note</button>
        <div style="margin-top: 15px; max-height: 200px; overflow-y: auto;">
            <div id="notesList"></div>
        </div>
    `;

    window.addNote = function() {
        const text = document.getElementById('noteInp').value.trim();
        if (text) {
            notes.push(text);
            localStorage.setItem('notes', JSON.stringify(notes));
            document.getElementById('noteInp').value = '';
            renderNotes();
        }
    };

    function renderNotes() {
        const list = document.getElementById('notesList');
        list.innerHTML = notes.map((note, i) => `
            <div class="folder-item">
                <span style="flex: 1;">${note}</span>
                <button class="btn-danger" style="padding: 5px 10px; margin: 0; font-size: 12px;" onclick="deleteNote(${i})">Delete</button>
            </div>
        `).join('');
    }

    window.deleteNote = function(i) {
        notes.splice(i, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        renderNotes();
    };

    renderNotes();
}

function loadFolder(content) {
    content.innerHTML = `
        <div style="margin-bottom: 15px;">
            <h3 style="color: #06b6d4; margin-bottom: 10px;">📁 Folders</h3>
            <div class="folder-list">
                <div class="folder-item"><i class="fas fa-folder"></i> Documents</div>
                <div class="folder-item"><i class="fas fa-folder"></i> Downloads</div>
                <div class="folder-item"><i class="fas fa-folder"></i> Pictures</div>
            </div>
        </div>
        <div>
            <h3 style="color: #06b6d4; margin-bottom: 10px;">📄 Recent Files</h3>
            <div class="folder-list">
                <div class="folder-item"><i class="fas fa-file-pdf"></i> Resume.pdf</div>
                <div class="folder-item"><i class="fas fa-file-word"></i> Document.docx</div>
                <div class="folder-item"><i class="fas fa-file-image"></i> Photo.jpg</div>
            </div>
        </div>
    `;
}

function loadEditor(content) {
    content.innerHTML = `
        <textarea class="notes-input" style="min-height: 250px;" placeholder="Start typing..."></textarea>
    `;
}

function loadSettings(content, windowId) {
    content.innerHTML = `
        <div class="app-section">
            <h3>System Settings</h3>
            <div class="folder-item" style="cursor: pointer;" onclick="changeBrightness()">
                <i class="fas fa-sun"></i>
                <span>Brightness</span>
            </div>
            <div class="folder-item" style="cursor: pointer;" onclick="toggleSound()">
                <i class="fas fa-volume-up"></i>
                <span>Sound</span>
            </div>
        </div>
        <div class="app-section">
            <h3>Account</h3>
            <div class="folder-item">
                <i class="fas fa-user"></i>
                <span>${currentUser.name}</span>
            </div>
        </div>
        <div class="app-section">
            <h3>Advanced</h3>
            <button class="btn-danger" style="width: 100%;" onclick="uninstallOS()">Uninstall OS</button>
        </div>
    `;

    window.changeBrightness = function() {
        alert('Brightness control - Feature coming soon!');
    };

    window.toggleSound = function() {
        alert('Sound settings - Feature coming soon!');
    };
}

// Window Controls
function minimizeWindow(id) {
    document.getElementById(id).style.display = 'none';
}

function maximizeWindow(id) {
    const win = document.getElementById(id);
    if (win.style.width === '100%') {
        win.style.width = '600px';
        win.style.height = '400px';
        win.style.left = '100px';
        win.style.top = '100px';
    } else {
        win.style.width = '100%';
        win.style.height = 'calc(100vh - 70px)';
        win.style.left = '0';
        win.style.top = '0';
        win.style.borderRadius = '0';
    }
}

function closeWindow(id, type) {
    const win = document.getElementById(id);
    if (type === 'folder') {
        showErrorScreen();
        return;
    }
    win.remove();
    const idx = windowsOpen.findIndex(w => w.id === id);
    if (idx > -1) {
        windowsOpen[idx].taskbarEl.remove();
        windowsOpen.splice(idx, 1);
    }
}

function forceQuitOS() {
    showErrorScreen();
}

function showErrorScreen() {
    document.getElementById('mainOS').style.display = 'none';
    document.getElementById('errorScreen').style.display = 'flex';
}

// Draggable Windows
function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const header = element.querySelector('.window-header');

    header.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// Time Display
function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();

    document.getElementById('currentTime').textContent = `${hours}:${minutes}`;
    document.getElementById('currentDate').textContent = `${day}/${month}/${year}`;
}

// Check if user exists
window.addEventListener('load', () => {
    const savedUser = localStorage.getItem('osUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        document.getElementById('bootScreen').style.display = 'none';
        showLogin();
    }
});