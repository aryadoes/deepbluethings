// Aria OS - Premium Operating System
// ====================================

const OS_CODE = 'ARIA2024';
let currentUser = null;
let windowsOpen = [];
let zIndex = 100;
let folderOpen = false;
let currentView = 'apps';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkSavedUser();
    updateTime();
    setInterval(updateTime, 1000);
});

// ====== BOOT & AUTHENTICATION ======
function checkCode() {
    const code = document.getElementById('osCode').value.toUpperCase().trim();
    
    if (code === OS_CODE || code === 'HW12' || code === 'BUBU8102BAUNI9810ECHO') {
        startInstallation();
    } else {
        alert('Invalid code. Try: ARIA2024');
    }
}

function installOS() {
    startInstallation();
}

function startInstallation() {
    document.getElementById('bootScreen').style.display = 'none';
    document.getElementById('installScreen').style.display = 'flex';

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 25;
        if (progress > 100) progress = 100;
        
        document.getElementById('progressFill').style.width = progress + '%';
        document.getElementById('installPercent').textContent = Math.floor(progress) + '%';

        if (progress === 100) {
            clearInterval(interval);
            setTimeout(() => {
                document.getElementById('installScreen').style.display = 'none';
                document.getElementById('setupScreen').style.display = 'flex';
            }, 800);
        }
    }, 120);
}

function completeSetup() {
    const name = document.getElementById('setupName').value.trim();
    const password = document.getElementById('setupPassword').value.trim();

    if (!name || !password) {
        alert('Please fill all fields');
        return;
    }

    currentUser = { name, password };
    localStorage.setItem('ariaUser', JSON.stringify(currentUser));

    document.getElementById('setupScreen').style.display = 'none';
    startMainOS();
}

function checkSavedUser() {
    const savedUser = localStorage.getItem('ariaUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        document.getElementById('bootScreen').style.display = 'none';
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('loginUserName').textContent = currentUser.name;
    }
}

function loginUser() {
    const password = document.getElementById('loginPassword').value;
    
    if (password === currentUser.password) {
        document.getElementById('loginScreen').style.display = 'none';
        startMainOS();
    } else {
        alert('Incorrect password');
        document.getElementById('loginPassword').value = '';
    }
}

function logoutUser() {
    closeAllWindows();
    document.getElementById('mainOS').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('loginPassword').value = '';
}

function uninstallOS() {
    const msg = document.createElement('div');
    msg.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: rgba(15, 20, 25, 0.95); color: #f8f9fa; padding: 40px 60px;
        border-radius: 24px; text-align: center; z-index: 10001;
        border: 1px solid rgba(99, 102, 241, 0.2); backdrop-filter: blur(20px);
    `;
    msg.innerHTML = '<h2 style="margin-bottom: 16px;">Uninstalling OS</h2><p style="color: #a1a5b3;">Please wait...</p>';
    document.body.appendChild(msg);

    setTimeout(() => {
        localStorage.removeItem('ariaUser');
        currentUser = null;
        windowsOpen = [];
        folderOpen = false;
        document.body.removeChild(msg);
        document.getElementById('bootScreen').style.display = 'flex';
        document.getElementById('mainOS').style.display = 'none';
        document.getElementById('errorScreen').style.display = 'none';
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('osCode').value = '';
        closeAllWindows();
    }, 5000);
}

// ====== MAIN OS ======
function startMainOS() {
    document.getElementById('setupScreen').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainOS').style.display = 'flex';
    windowsOpen = [];
    folderOpen = false;

    initializeWorkspace();
    updateDock();
}

function initializeWorkspace() {
    const workspace = document.getElementById('workspace');
    workspace.innerHTML = '';

    const apps = [
        { name: 'Folder', icon: 'fas fa-folder', type: 'folder', color: '#6366f1' },
        { name: 'Calculator', icon: 'fas fa-calculator', type: 'calculator', color: '#6366f1' },
        { name: 'Notes', icon: 'fas fa-sticky-note', type: 'notes', color: '#6366f1' },
        { name: 'Text Editor', icon: 'fas fa-file-alt', type: 'editor', color: '#6366f1' },
        { name: 'Settings', icon: 'fas fa-cog', type: 'settings', color: '#6366f1' },
        { name: 'Terminal', icon: 'fas fa-terminal', type: 'terminal', color: '#6366f1' }
    ];

    apps.forEach(app => {
        const icon = document.createElement('div');
        icon.className = 'app-icon';
        icon.ondblclick = () => openApp(app.type, app.name, app.icon);
        icon.innerHTML = `
            <div class="app-icon-image" style="background: linear-gradient(135deg, ${app.color}, #818cf8);">
                <i class="${app.icon}"></i>
            </div>
            <div class="app-icon-name">${app.name}</div>
        `;
        workspace.appendChild(icon);
    });
}

function switchView(view) {
    currentView = view;
    document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
    event.target.closest('.sidebar-item').classList.add('active');

    const workspace = document.getElementById('workspace');
    workspace.innerHTML = '';

    switch(view) {
        case 'apps':
            initializeWorkspace();
            break;
        case 'files':
            loadFilesView();
            break;
        case 'settings':
            loadSettingsView();
            break;
    }
}

function loadFilesView() {
    const workspace = document.getElementById('workspace');
    workspace.style.gridTemplateColumns = 'repeat(auto-fill, minmax(120px, 1fr))';
    workspace.innerHTML = `
        <div class="folder-item">
            <div class="folder-item-icon">📄</div>
            <div class="folder-item-name">Documents</div>
        </div>
        <div class="folder-item">
            <div class="folder-item-icon">📥</div>
            <div class="folder-item-name">Downloads</div>
        </div>
        <div class="folder-item">
            <div class="folder-item-icon">🖼️</div>
            <div class="folder-item-name">Pictures</div>
        </div>
        <div class="folder-item">
            <div class="folder-item-icon">🎵</div>
            <div class="folder-item-name">Music</div>
        </div>
        <div class="folder-item">
            <div class="folder-item-icon">🎬</div>
            <div class="folder-item-name">Videos</div>
        </div>
        <div class="folder-item">
            <div class="folder-item-icon">🗑️</div>
            <div class="folder-item-name">Trash</div>
        </div>
    `;
}

function loadSettingsView() {
    const workspace = document.getElementById('workspace');
    workspace.style.display = 'flex';
    workspace.style.flexDirection = 'column';
    workspace.style.gridTemplateColumns = 'unset';
    workspace.innerHTML = `
        <div style="margin-bottom: 24px;">
            <h2 style="font-size: 20px; margin-bottom: 16px;">Display Settings</h2>
            <div class="settings-grid">
                <div class="setting-card">
                    <div class="setting-label">
                        <span>Dark Mode</span>
                        <div class="toggle-switch active" onclick="this.classList.toggle('active')"></div>
                    </div>
                </div>
                <div class="setting-card">
                    <div class="setting-label">
                        <span>Animations</span>
                        <div class="toggle-switch active" onclick="this.classList.toggle('active')"></div>
                    </div>
                </div>
            </div>
        </div>

        <div style="margin-bottom: 24px;">
            <h2 style="font-size: 20px; margin-bottom: 16px;">System Settings</h2>
            <div class="settings-grid">
                <div class="setting-card">
                    <div class="setting-label">
                        <span>Sound</span>
                        <div class="toggle-switch active" onclick="this.classList.toggle('active')"></div>
                    </div>
                </div>
                <div class="setting-card">
                    <div class="setting-label">
                        <span>Notifications</span>
                        <div class="toggle-switch active" onclick="this.classList.toggle('active')"></div>
                    </div>
                </div>
            </div>
        </div>

        <div style="margin-bottom: 24px;">
            <h2 style="font-size: 20px; margin-bottom: 16px;">Account</h2>
            <div class="setting-card">
                <div style="font-size: 14px; color: #a1a5b3;">Username</div>
                <div style="font-size: 16px; font-weight: 600; margin-top: 8px;">${currentUser.name}</div>
            </div>
        </div>

        <div>
            <h2 style="font-size: 20px; margin-bottom: 16px;">Advanced</h2>
            <button class="btn-danger" style="padding: 12px 24px; border-radius: 12px; cursor: pointer; font-weight: 600; width: auto;" onclick="uninstallOS()">Uninstall OS</button>
        </div>
    `;
}

function toggleNotifications() {
    alert('No new notifications');
}

// ====== APP MANAGEMENT ======
function openApp(type, name, icon) {
    if (type === 'folder' && folderOpen) {
        alert('Folder is already open');
        return;
    }

    const windowId = 'window-' + Date.now();
    const windowEl = document.createElement('div');
    windowEl.className = 'window';
    windowEl.id = windowId;
    windowEl.style.zIndex = zIndex++;
    windowEl.style.left = (150 + Math.random() * 300) + 'px';
    windowEl.style.top = (100 + Math.random() * 200) + 'px';

    let forceQuitBtn = '';
    if (type === 'folder') {
        forceQuitBtn = `<button class="window-btn" onclick="showForceQuitWarning()" style="color: #ef4444;">⚠️</button>`;
    }

    windowEl.innerHTML = `
        <div class="window-header">
            <div class="window-title">
                <i class="fas fa-${icon.split('-')[1]}"></i>
                <span>${name}</span>
            </div>
            <div class="window-controls">
                <button class="window-btn" onclick="minimizeWindow('${windowId}')">−</button>
                <button class="window-btn" onclick="maximizeWindow('${windowId}')">□</button>
                ${forceQuitBtn}
                <button class="window-btn close" onclick="closeWindow('${windowId}', '${type}')">✕</button>
            </div>
        </div>
        <div class="window-content" id="content-${windowId}"></div>
    `;

    document.body.appendChild(windowEl);
    makeDraggable(windowEl);
    loadAppContent(windowId, type);

    const dockItem = document.createElement('div');
    dockItem.className = 'dock-item active';
    dockItem.innerHTML = `<i class="${icon}"></i>`;
    dockItem.onclick = () => {
        windowEl.style.display = windowEl.style.display === 'none' ? 'flex' : 'none';
    };
    document.getElementById('dock').appendChild(dockItem);

    windowsOpen.push({ id: windowId, type, dockItem, windowEl });
    
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
            loadSettingsWindow(content);
            break;
        case 'terminal':
            loadTerminal(content);
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
            <button class="calc-btn" onclick="window.calcFunc('C')">C</button>
            <button class="calc-btn" onclick="window.calcFunc('/'">÷</button>
            <button class="calc-btn" onclick="window.calcFunc('*')">×</button>
            <button class="calc-btn" onclick="window.calcFunc('-')">−</button>
            <button class="calc-btn" onclick="window.calcFunc('7')">7</button>
            <button class="calc-btn" onclick="window.calcFunc('8')">8</button>
            <button class="calc-btn" onclick="window.calcFunc('9')">9</button>
            <button class="calc-btn" onclick="window.calcFunc('+')">+</button>
            <button class="calc-btn" onclick="window.calcFunc('4')">4</button>
            <button class="calc-btn" onclick="window.calcFunc('5')">5</button>
            <button class="calc-btn" onclick="window.calcFunc('6')">6</button>
            <button class="calc-btn" onclick="window.calcFunc('.')">.</button>
            <button class="calc-btn" onclick="window.calcFunc('1')">1</button>
            <button class="calc-btn" onclick="window.calcFunc('2')">2</button>
            <button class="calc-btn" onclick="window.calcFunc('3')">3</button>
            <button class="calc-btn" onclick="window.calcFunc('0')">0</button>
            <button class="calc-btn" style="grid-column: 3/5; background: rgba(99, 102, 241, 0.3);" onclick="window.calcFunc('=')">=</button>
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
            op = val === '×' ? '*' : val === '÷' ? '/' : val;
            display = '0';
        } else {
            display = display === '0' ? val : display + val;
        }
        disp.textContent = display;
    };
}

function loadNotes(content) {
    let notes = JSON.parse(localStorage.getItem('ariaNotes')) || [];

    function renderNotes() {
        const list = document.getElementById('notesList');
        list.innerHTML = notes.length === 0 ? '<p style="color: #6b7280; text-align: center; padding: 20px;">No notes yet</p>' : 
            notes.map((note, i) => `
                <div style="padding: 12px; background: rgba(99, 102, 241, 0.1); border-radius: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 13px; flex: 1;">${note.substring(0, 50)}...</span>
                    <button style="background: rgba(239, 68, 68, 0.2); border: none; color: #ef4444; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;" onclick="deleteNote(${i})">Delete</button>
                </div>
            `).join('');
    }

    content.innerHTML = `
        <textarea class="input-textarea" id="noteInp" placeholder="Write your note..."></textarea>
        <button class="btn-primary" onclick="saveNote()" style="width: 100%; margin-top: 16px;">Save Note</button>
        <div id="notesList" style="margin-top: 16px; max-height: 200px; overflow-y: auto;"></div>
    `;

    window.saveNote = function() {
        const text = document.getElementById('noteInp').value.trim();
        if (text) {
            notes.push(text);
            localStorage.setItem('ariaNotes', JSON.stringify(notes));
            document.getElementById('noteInp').value = '';
            renderNotes();
        }
    };

    window.deleteNote = function(i) {
        notes.splice(i, 1);
        localStorage.setItem('ariaNotes', JSON.stringify(notes));
        renderNotes();
    };

    renderNotes();
}

function loadFolder(content) {
    content.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 16px;">
            <div class="folder-item">
                <div class="folder-item-icon">📄</div>
                <div class="folder-item-name">Documents</div>
            </div>
            <div class="folder-item">
                <div class="folder-item-icon">📥</div>
                <div class="folder-item-name">Downloads</div>
            </div>
            <div class="folder-item">
                <div class="folder-item-icon">🖼️</div>
                <div class="folder-item-name">Pictures</div>
            </div>
            <div class="folder-item">
                <div class="folder-item-icon">🎵</div>
                <div class="folder-item-name">Music</div>
            </div>
            <div class="folder-item">
                <div class="folder-item-icon">🎬</div>
                <div class="folder-item-name">Videos</div>
            </div>
            <div class="folder-item">
                <div class="folder-item-icon">📦</div>
                <div class="folder-item-name">Applications</div>
            </div>
        </div>
    `;
}

function loadEditor(content) {
    content.innerHTML = `<textarea class="input-textarea" style="min-height: 280px;" placeholder="Start typing..."></textarea>`;
}

function loadSettingsWindow(content) {
    content.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 20px;">
            <div>
                <h3 style="font-size: 14px; color: #818cf8; font-weight: 600; margin-bottom: 12px; text-transform: uppercase;">Display</h3>
                <div class="setting-card">
                    <div class="setting-label">
                        <span>Theme: Dark</span>
                        <div class="toggle-switch active"></div>
                    </div>
                </div>
            </div>
            <div>
                <h3 style="font-size: 14px; color: #818cf8; font-weight: 600; margin-bottom: 12px; text-transform: uppercase;">System</h3>
                <div class="setting-card">
                    <div class="setting-label">
                        <span>Notifications</span>
                        <div class="toggle-switch active"></div>
                    </div>
                </div>
                <div class="setting-card" style="margin-top: 8px;">
                    <div class="setting-label">
                        <span>Sound</span>
                        <div class="toggle-switch active"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function loadTerminal(content) {
    content.innerHTML = `
        <div style="font-family: 'Courier New', monospace; font-size: 13px; color: #818cf8;">
            <div>aria@os ~ $ whoami</div>
            <div style="color: #a1a5b3; margin-top: 4px;">Welcome to Aria OS</div>
            <div style="margin-top: 16px; color: #818cf8;">aria@os ~ $</div>
            <input type="text" style="background: transparent; border: none; color: #f8f9fa; font-family: inherit; margin-left: 4px; outline: none; width: 200px;" placeholder="Type command...">
        </div>
    `;
}

// ====== WINDOW CONTROLS ======
function minimizeWindow(id) {
    document.getElementById(id).style.display = 'none';
}

function maximizeWindow(id) {
    const win = document.getElementById(id);
    if (win.style.width === '100%') {
        win.style.width = '600px';
        win.style.height = '400px';
        win.style.left = '150px';
        win.style.top = '100px';
        win.style.borderRadius = '20px';
    } else {
        win.style.width = '100%';
        win.style.height = 'calc(100% - 64px)';
        win.style.left = '0';
        win.style.top = '64px';
        win.style.borderRadius = '0';
    }
}

function closeWindow(id, type) {
    const windowEl = document.getElementById(id);
    const idx = windowsOpen.findIndex(w => w.id === id);
    
    if (idx > -1) {
        windowsOpen[idx].dockItem.remove();
        windowsOpen.splice(idx, 1);
    }

    if (type === 'folder') {
        folderOpen = false;
    }

    windowEl.remove();
}

function closeAllWindows() {
    document.querySelectorAll('.window').forEach(w => w.remove());
    document.getElementById('dock').innerHTML = '';
    windowsOpen = [];
    folderOpen = false;
}

function showForceQuitWarning() {
    document.getElementById('forceQuitModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('forceQuitModal').style.display = 'none';
}

function confirmForceQuit() {
    document.getElementById('forceQuitModal').style.display = 'none';
    closeAllWindows();
    
    document.getElementById('mainOS').style.display = 'none';
    document.getElementById('errorScreen').style.display = 'flex';
}

function updateDock() {
    // Dock updates handled dynamically
}

// ====== UTILITIES ======
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

function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    // Update time display if needed
}