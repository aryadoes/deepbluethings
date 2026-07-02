// OS Configuration
const OS_CODES = {
    'HW12': 'deepblue',
    'BUBU8102BAUNI9810ECHO': 'fadedecho'
};

let currentOS = '';
let currentUser = null;
let windowsOpen = [];
let zIndex = 100;
let folderOpen = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateTime();
    setInterval(updateTime, 1000);
    checkSavedUser();
});

// Boot Functions
function checkCode() {
    const code = document.getElementById('osCode').value.toUpperCase().trim();
    
    if (OS_CODES[code]) {
        currentOS = OS_CODES[code];
        startInstallation(currentOS);
    } else {
        alert('Invalid code! Try HW12 or BUBU8102BAUNI9810ECHO');
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
        progress += Math.random() * 20;
        if (progress > 100) progress = 100;
        
        document.getElementById('progressFill').style.width = progress + '%';
        document.getElementById('installPercent').textContent = Math.floor(progress) + '%';

        if (progress === 100) {
            clearInterval(interval);
            setTimeout(() => {
                document.getElementById('installScreen').style.display = 'none';
                document.getElementById('setupScreen').style.display = 'flex';
            }, 1000);
        }
    }, 150);
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

function checkSavedUser() {
    const savedUser = localStorage.getItem('osUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        document.getElementById('bootScreen').style.display = 'none';
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('loginUserDisplay').textContent = `👤 ${currentUser.name}`;
    }
}

function loginUser() {
    const password = document.getElementById('loginPass').value;
    
    if (password === currentUser.password) {
        document.getElementById('loginScreen').style.display = 'none';
        startMainOS();
    } else {
        alert('Incorrect password!');
        document.getElementById('loginPass').value = '';
    }
}

function logoutUser() {
    // Close all windows
    document.querySelectorAll('.window').forEach(w => w.remove());
    windowsOpen = [];
    
    document.getElementById('mainOS').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('loginPass').value = '';
    document.getElementById('taskbarApps').innerHTML = '';
}

function uninstallOS() {
    const uninstallMsg = document.createElement('div');
    uninstallMsg.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #000;
        color: #fff;
        padding: 40px;
        border-radius: 15px;
        text-align: center;
        z-index: 10001;
        border: 2px solid #00d9ff;
    `;
    uninstallMsg.innerHTML = '<h2>Uninstalling OS</h2><p>Please wait...</p>';
    document.body.appendChild(uninstallMsg);

    setTimeout(() => {
        localStorage.removeItem('osUser');
        currentUser = null;
        windowsOpen = [];
        folderOpen = false;
        document.body.removeChild(uninstallMsg);
        document.getElementById('bootScreen').style.display = 'flex';
        document.getElementById('mainOS').style.display = 'none';
        document.getElementById('errorScreen').style.display = 'none';
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('osCode').value = '';
        document.querySelectorAll('.window').forEach(w => w.remove());
        document.getElementById('taskbarApps').innerHTML = '';
    }, 5000);
}

// Main OS
function startMainOS() {
    document.getElementById('setupScreen').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainOS').style.display = 'flex';
    document.getElementById('taskbarApps').innerHTML = '';
    windowsOpen = [];
    folderOpen = false;

    initializeDesktop();
}

function initializeDesktop() {
    const desktop = document.getElementById('desktop');
    desktop.innerHTML = '';

    const apps = [
        { name: 'Folder', icon: 'fas fa-folder-open', type: 'folder' },
        { name: 'Calculator', icon: 'fas fa-calculator', type: 'calculator' },
        { name: 'Notes', icon: 'fas fa-sticky-note', type: 'notes' },
        { name: 'Text Editor', icon: 'fas fa-file-alt', type: 'editor' },
        { name: 'Settings', icon: 'fas fa-cog', type: 'settings' }
    ];

    apps.forEach(app => {
        const icon = document.createElement('div');
        icon.className = 'icon';
        icon.ondblclick = () => {
            if (app.type === 'folder' && folderOpen) {
                alert('Folder is already open!');
                return;
            }
            openApp(app.type, app.name, app.icon);
        };
        icon.innerHTML = `
            <div class="icon-img"><i class="${app.icon}"></i></div>
            <div class="icon-label">${app.name}</div>
        `;
        desktop.appendChild(icon);
    });
}

// Window Management
function openApp(type, name, icon) {
    const windowId = 'window-' + Date.now();
    const windowEl = document.createElement('div');
    windowEl.className = 'window';
    windowEl.id = windowId;
    windowEl.style.zIndex = zIndex++;
    windowEl.style.left = (100 + Math.random() * 200) + 'px';
    windowEl.style.top = (100 + Math.random() * 200) + 'px';

    let forceQuitBtn = '';
    if (type === 'folder') {
        forceQuitBtn = `<button class="window-btn" onclick="showForceQuitWarning()" style="background: rgba(255, 107, 107, 0.3); color: #ff6b6b;">⚠️</button>`;
    }

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
                ${forceQuitBtn}
                <button class="window-btn close" onclick="closeWindow('${windowId}', '${type}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
        <div class="window-content" id="content-${windowId}"></div>
    `;

    document.body.appendChild(windowEl);
    makeDraggable(windowEl);
    loadAppContent(windowId, type);

    const taskbarApp = document.createElement('div');
    taskbarApp.className = 'taskbar-app active';
    taskbarApp.innerHTML = `<i class="${icon}"></i>`;
    taskbarApp.onclick = () => {
        windowEl.style.display = windowEl.style.display === 'none' ? 'flex' : 'none';
    };
    document.getElementById('taskbarApps').appendChild(taskbarApp);

    windowsOpen.push({ id: windowId, type, taskbarEl: taskbarApp, windowEl });
    
    if (type === 'folder') {
        folderOpen = true;
    }
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
            loadSettings(content);
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
            <button class="calc-btn" onclick="window.calcFunc('C', this)">C</button>
            <button class="calc-btn" onclick="window.calcFunc('/', this)">/</button>
            <button class="calc-btn" onclick="window.calcFunc('*', this)">×</button>
            <button class="calc-btn" onclick="window.calcFunc('-', this)">-</button>
            <button class="calc-btn" onclick="window.calcFunc('7', this)">7</button>
            <button class="calc-btn" onclick="window.calcFunc('8', this)">8</button>
            <button class="calc-btn" onclick="window.calcFunc('9', this)">9</button>
            <button class="calc-btn" onclick="window.calcFunc('+', this)">+</button>
            <button class="calc-btn" onclick="window.calcFunc('4', this)">4</button>
            <button class="calc-btn" onclick="window.calcFunc('5', this)">5</button>
            <button class="calc-btn" onclick="window.calcFunc('6', this)">6</button>
            <button class="calc-btn" onclick="window.calcFunc('.', this)">.</button>
            <button class="calc-btn" onclick="window.calcFunc('1', this)">1</button>
            <button class="calc-btn" onclick="window.calcFunc('2', this)">2</button>
            <button class="calc-btn" onclick="window.calcFunc('3', this)">3</button>
            <button class="calc-btn" onclick="window.calcFunc('0', this)">0</button>
            <button class="calc-btn" style="grid-column: 3/5; background: rgba(0, 217, 255, 0.35);" onclick="window.calcFunc('=', this)">=</button>
        </div>
    `;

    window.calcFunc = function(val) {
        const disp = document.getElementById('calcDisp');
        if (val === 'C') {
            display = '0';
            prev = null;
            op = null;
        } else if (val === '=') {
            if (op && prev !== null) {
                try {
                    display = eval(prev + op + display).toString();
                } catch (e) {
                    display = 'Error';
                }
                prev = null;
                op = null;
            }
        } else if (['+', '-', '*', '/'].includes(val)) {
            prev = display;
            op = val === '×' ? '*' : val;
            display = '0';
        } else {
            display = display === '0' ? val : display + val;
        }
        disp.textContent = display;
    };
}

function loadNotes(content) {
    let notes = JSON.parse(localStorage.getItem('osNotes')) || [];

    function renderNotes() {
        const list = document.getElementById('notesList');
        list.innerHTML = notes.length === 0 ? '<p style="color: #666; text-align: center;">No notes yet</p>' : notes.map((note, i) => `
            <div class="folder-item">
                <span style="flex: 1; font-size: 13px;">${note}</span>
                <button style="padding: 5px 10px; background: rgba(255, 107, 107, 0.2); border: 1px solid rgba(255, 107, 107, 0.3); border-radius: 4px; color: #ff6b6b; cursor: pointer; font-size: 11px;" onclick="deleteNote(${i})">Delete</button>
            </div>
        `).join('');
    }

    content.innerHTML = `
        <textarea class="notes-input" id="noteInp" placeholder="Write your note..."></textarea>
        <button class="btn" onclick="saveNote()" style="width: 100%; margin-top: 10px;">Save Note</button>
        <div id="notesList" style="margin-top: 15px; max-height: 200px; overflow-y: auto;"></div>
    `;

    window.saveNote = function() {
        const text = document.getElementById('noteInp').value.trim();
        if (text) {
            notes.push(text);
            localStorage.setItem('osNotes', JSON.stringify(notes));
            document.getElementById('noteInp').value = '';
            renderNotes();
        }
    };

    window.deleteNote = function(i) {
        notes.splice(i, 1);
        localStorage.setItem('osNotes', JSON.stringify(notes));
        renderNotes();
    };

    renderNotes();
}

function loadFolder(content) {
    content.innerHTML = `
        <div style="margin-bottom: 20px;">
            <h3 style="color: #00d9ff; margin-bottom: 12px; font-size: 13px; text-transform: uppercase;">📁 Folders</h3>
            <div class="folder-list">
                <div class="folder-item"><i class="fas fa-folder"></i> Documents</div>
                <div class="folder-item"><i class="fas fa-folder"></i> Downloads</div>
                <div class="folder-item"><i class="fas fa-folder"></i> Pictures</div>
                <div class="folder-item"><i class="fas fa-folder"></i> Videos</div>
                <div class="folder-item"><i class="fas fa-folder"></i> Music</div>
            </div>
        </div>
        <div>
            <h3 style="color: #00d9ff; margin-bottom: 12px; font-size: 13px; text-transform: uppercase;">📄 Recent Files</h3>
            <div class="folder-list">
                <div class="folder-item"><i class="fas fa-file-pdf"></i> Resume.pdf</div>
                <div class="folder-item"><i class="fas fa-file-word"></i> Report.docx</div>
                <div class="folder-item"><i class="fas fa-file-image"></i> Photo.jpg</div>
                <div class="folder-item"><i class="fas fa-file-video"></i> Video.mp4</div>
                <div class="folder-item"><i class="fas fa-file-audio"></i> Song.mp3</div>
            </div>
        </div>
    `;
}

function loadEditor(content) {
    content.innerHTML = `
        <textarea class="notes-input" style="min-height: 250px; resize: vertical;" placeholder="Start typing..."></textarea>
    `;
}

function loadSettings(content) {
    content.innerHTML = `
        <div class="settings-section">
            <h3>Display</h3>
            <div class="setting-item">
                <span>Dark Mode</span>
                <div class="toggle active" onclick="this.classList.toggle('active')"></div>
            </div>
            <div class="setting-item">
                <span>Animations</span>
                <div class="toggle active" onclick="this.classList.toggle('active')"></div>
            </div>
            <div class="setting-item">
                <span>Notifications</span>
                <div class="toggle active" onclick="this.classList.toggle('active')"></div>
            </div>
        </div>

        <div class="settings-section">
            <h3>System</h3>
            <div class="setting-item">
                <span>Sound</span>
                <div class="toggle active" onclick="this.classList.toggle('active')"></div>
            </div>
            <div class="setting-item">
                <span>Auto-lock</span>
                <div class="toggle" onclick="this.classList.toggle('active')"></div>
            </div>
        </div>

        <div class="settings-section">
            <h3>Account</h3>
            <div class="folder-item" style="cursor: default;">
                <i class="fas fa-user"></i>
                <span>${currentUser.name}</span>
            </div>
        </div>

        <div class="settings-section">
            <h3>Advanced</h3>
            <button style="width: 100%; padding: 12px; background: rgba(255, 107, 107, 0.2); border: 1px solid rgba(255, 107, 107, 0.3); color: #ff6b6b; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.3s;" 
                    onmouseover="this.style.background='rgba(255, 107, 107, 0.35)'" 
                    onmouseout="this.style.background='rgba(255, 107, 107, 0.2)'"
                    onclick="uninstallOS()">Uninstall OS</button>
        </div>
    `;
}

// Window Controls
function minimizeWindow(id) {
    document.getElementById(id).style.display = 'none';
}

function maximizeWindow(id) {
    const win = document.getElementById(id);
    if (win.style.width === '100%') {
        win.style.width = '500px';
        win.style.height = '350px';
        win.style.left = '100px';
        win.style.top = '100px';
        win.style.borderRadius = '12px';
    } else {
        win.style.width = '100%';
        win.style.height = 'calc(100% - 60px)';
        win.style.left = '0';
        win.style.top = '0';
        win.style.borderRadius = '0';
    }
}

function closeWindow(id, type) {
    const windowEl = document.getElementById(id);
    const idx = windowsOpen.findIndex(w => w.id === id);
    
    if (idx > -1) {
        windowsOpen[idx].taskbarEl.remove();
        windowsOpen.splice(idx, 1);
    }

    if (type === 'folder') {
        folderOpen = false;
    }

    windowEl.remove();
}

function showForceQuitWarning() {
    document.getElementById('forceQuitModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('forceQuitModal').style.display = 'none';
}

function confirmForceQuit() {
    document.getElementById('forceQuitModal').style.display = 'none';
    
    // Close all windows
    document.querySelectorAll('.window').forEach(w => w.remove());
    document.getElementById('taskbarApps').innerHTML = '';
    windowsOpen = [];
    folderOpen = false;
    
    // Show error screen
    document.getElementById('mainOS').style.display = 'none';
    document.getElementById('errorScreen').style.display = 'flex';
}

// Draggable
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

// Time Update
function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();

    document.getElementById('osTime').textContent = `${hours}:${minutes}`;
    document.getElementById('osDate').textContent = `${day}/${month}/${year}`;
}