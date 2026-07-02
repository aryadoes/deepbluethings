// Window Management
class WindowManager {
    constructor() {
        this.windows = [];
        this.zIndex = 100;
        this.taskbarApps = document.getElementById('taskbarApps');
        this.windowsContainer = document.getElementById('windowsContainer');
    }

    createWindow(title, icon, type, name = '') {
        const windowId = `window-${Date.now()}`;
        const windowElement = document.createElement('div');
        windowElement.className = 'window active';
        windowElement.id = windowId;
        windowElement.style.zIndex = this.zIndex++;
        
        // Random position
        const randomX = Math.random() * (window.innerWidth - 600);
        const randomY = Math.random() * (window.innerHeight - 400);
        windowElement.style.left = randomX + 'px';
        windowElement.style.top = randomY + 'px';

        windowElement.innerHTML = `
            <div class="window-header">
                <div class="window-title">
                    <i class="${icon}"></i>
                    <span>${title}</span>
                </div>
                <div class="window-controls">
                    <button class="window-btn minimize">
                        <i class="fas fa-minus"></i>
                    </button>
                    <button class="window-btn maximize">
                        <i class="fas fa-square"></i>
                    </button>
                    <button class="window-btn close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="window-content" id="content-${windowId}"></div>
        `;

        this.windowsContainer.appendChild(windowElement);

        // Add to taskbar
        this.addToTaskbar(windowId, title, icon);

        // Event listeners
        this.setupWindowEvents(windowElement, windowId);

        // Load content based on type
        this.loadWindowContent(windowId, type, name);

        // Store window
        this.windows.push({
            id: windowId,
            element: windowElement,
            title: title,
            type: type
        });

        return windowElement;
    }

    setupWindowEvents(windowElement, windowId) {
        const header = windowElement.querySelector('.window-header');
        const closeBtn = windowElement.querySelector('.window-btn.close');
        const minimizeBtn = windowElement.querySelector('.window-btn.minimize');
        const maximizeBtn = windowElement.querySelector('.window-btn.maximize');

        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;

        // Drag
        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - windowElement.offsetLeft;
            offsetY = e.clientY - windowElement.offsetTop;
            windowElement.style.zIndex = this.zIndex++;
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                windowElement.style.left = (e.clientX - offsetX) + 'px';
                windowElement.style.top = (e.clientY - offsetY) + 'px';
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Close
        closeBtn.addEventListener('click', () => {
            this.closeWindow(windowId);
        });

        // Minimize
        minimizeBtn.addEventListener('click', () => {
            windowElement.style.display = 'none';
        });

        // Maximize
        maximizeBtn.addEventListener('click', () => {
            if (windowElement.style.width === '100%') {
                windowElement.style.width = '600px';
                windowElement.style.height = '400px';
                windowElement.style.left = '50%';
                windowElement.style.top = '50%';
                windowElement.style.transform = 'translate(-50%, -50%)';
            } else {
                windowElement.style.width = '100%';
                windowElement.style.height = 'calc(100vh - 70px)';
                windowElement.style.left = '0';
                windowElement.style.top = '0';
                windowElement.style.transform = 'none';
            }
        });

        // Focus on click
        windowElement.addEventListener('mousedown', () => {
            windowElement.classList.add('active');
            windowElement.style.zIndex = this.zIndex++;
        });
    }

    addToTaskbar(windowId, title, icon) {
        const taskbarApp = document.createElement('div');
        taskbarApp.className = 'taskbar-app active';
        taskbarApp.innerHTML = `<i class="${icon}"></i>`;
        taskbarApp.addEventListener('click', () => {
            const window = document.getElementById(windowId);
            if (window.style.display === 'none') {
                window.style.display = 'flex';
            } else {
                window.style.display = 'none';
            }
        });
        this.taskbarApps.appendChild(taskbarApp);
    }

    closeWindow(windowId) {
        const window = document.getElementById(windowId);
        if (window) {
            window.remove();
            const taskbarApp = this.taskbarApps.querySelector(`.taskbar-app[data-window-id="${windowId}"]`);
            if (taskbarApp) taskbarApp.remove();
            this.windows = this.windows.filter(w => w.id !== windowId);
        }
    }

    loadWindowContent(windowId, type, name) {
        const content = document.getElementById(`content-${windowId}`);

        switch(type) {
            case 'Calculator':
                this.loadCalculator(content);
                break;
            case 'Notes':
                this.loadNotes(content);
                break;
            case 'Browser':
                this.loadBrowser(content);
                break;
            case 'Text Editor':
                this.loadTextEditor(content);
                break;
            case 'Settings':
                this.loadSettings(content);
                break;
            case 'folder':
                this.loadFolder(content, name);
                break;
        }
    }

    loadCalculator(content) {
        let display = '0';
        let currentValue = '0';
        let operator = null;
        let previousValue = null;

        content.innerHTML = `
            <div class="calc-display" id="calcDisplay">0</div>
            <div class="calculator-grid">
                <button class="calc-button">C</button>
                <button class="calc-button operator">/</button>
                <button class="calc-button operator">*</button>
                <button class="calc-button operator">-</button>
                <button class="calc-button">7</button>
                <button class="calc-button">8</button>
                <button class="calc-button">9</button>
                <button class="calc-button operator">+</button>
                <button class="calc-button">4</button>
                <button class="calc-button">5</button>
                <button class="calc-button">6</button>
                <button class="calc-button operator">.</button>
                <button class="calc-button">1</button>
                <button class="calc-button">2</button>
                <button class="calc-button">3</button>
                <button class="calc-button">0</button>
                <button class="calc-button equals">=</button>
            </div>
        `;

        const buttons = content.querySelectorAll('.calc-button');
        const display_el = content.querySelector('#calcDisplay');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const value = btn.textContent;

                if (value === 'C') {
                    currentValue = '0';
                    operator = null;
                    previousValue = null;
                } else if (value === '=') {
                    if (operator && previousValue !== null) {
                        const prev = parseFloat(previousValue);
                        const current = parseFloat(currentValue);
                        const result = this.calculate(prev, current, operator);
                        currentValue = result.toString();
                        operator = null;
                        previousValue = null;
                    }
                } else if (['+', '-', '*', '/', '.'].includes(value)) {
                    if (operator !== null) {
                        const prev = parseFloat(previousValue);
                        const current = parseFloat(currentValue);
                        const result = this.calculate(prev, current, operator);
                        currentValue = result.toString();
                    }
                    previousValue = currentValue;
                    operator = value;
                    currentValue = '0';
                } else {
                    currentValue = currentValue === '0' ? value : currentValue + value;
                }

                display_el.textContent = currentValue;
            });
        });
    }

    calculate(a, b, op) {
        switch(op) {
            case '+': return a + b;
            case '-': return a - b;
            case '*': return a * b;
            case '/': return a / b;
            default: return b;
        }
    }

    loadNotes(content) {
        let notes = JSON.parse(localStorage.getItem('notes')) || [];

        content.innerHTML = `
            <div class="notes-container">
                <textarea class="note-input" id="noteInput" placeholder="Write your note here..."></textarea>
                <button class="note-btn" id="noteAddBtn">Add Note</button>
                <div class="notes-list" id="notesList"></div>
            </div>
        `;

        const noteInput = content.querySelector('#noteInput');
        const addBtn = content.querySelector('#noteAddBtn');
        const notesList = content.querySelector('#notesList');

        const renderNotes = () => {
            notesList.innerHTML = '';
            notes.forEach((note, index) => {
                const noteItem = document.createElement('div');
                noteItem.className = 'note-item';
                noteItem.innerHTML = `
                    <div>${note}</div>
                    <button class="note-delete" data-index="${index}">Delete</button>
                `;
                notesList.appendChild(noteItem);

                noteItem.querySelector('.note-delete').addEventListener('click', () => {
                    notes.splice(index, 1);
                    localStorage.setItem('notes', JSON.stringify(notes));
                    renderNotes();
                });
            });
        };

        addBtn.addEventListener('click', () => {
            if (noteInput.value.trim()) {
                notes.push(noteInput.value);
                localStorage.setItem('notes', JSON.stringify(notes));
                noteInput.value = '';
                renderNotes();
            }
        });

        renderNotes();
    }

    loadBrowser(content) {
        content.innerHTML = `
            <input type="text" class="browser-urlbar" placeholder="Enter URL..." value="https://www.example.com">
            <div class="browser-content">
                <h2>Welcome to DeepBlue Browser</h2>
                <p>This is a demo browser. Enter a URL to navigate (for demo purposes only).</p>
            </div>
        `;
    }

    loadTextEditor(content) {
        content.innerHTML = `
            <textarea class="editor-textarea" placeholder="Start typing..."></textarea>
        `;
    }

    loadSettings(content) {
        content.innerHTML = `
            <div class="settings-section">
                <h3>Display</h3>
                <div class="setting-item">
                    <span>Dark Mode</span>
                    <div class="toggle active"></div>
                </div>
                <div class="setting-item">
                    <span>Animations</span>
                    <div class="toggle active"></div>
                </div>
            </div>
            <div class="settings-section">
                <h3>System</h3>
                <div class="setting-item">
                    <span>Sound</span>
                    <div class="toggle active"></div>
                </div>
                <div class="setting-item">
                    <span>Notifications</span>
                    <div class="toggle active"></div>
                </div>
            </div>
        `;

        const toggles = content.querySelectorAll('.toggle');
        toggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                toggle.classList.toggle('active');
            });
        });
    }

    loadFolder(content, folderName) {
        const files = {
            Documents: ['Resume.pdf', 'Cover Letter.docx', 'Project Proposal.docx'],
            Downloads: ['image.jpg', 'video.mp4', 'archive.zip'],
            Pictures: ['Photo1.jpg', 'Photo2.png', 'Screenshot.jpg']
        };

        const fileList = files[folderName] || [];

        content.innerHTML = `
            <div class="folder-view">
                <div style="margin-bottom: 15px; color: var(--text-secondary); font-size: 12px;">
                    ${fileList.length} items in ${folderName}
                </div>
                ${fileList.map(file => `
                    <div class="folder-item">
                        <i class="fas ${file.endsWith('.pdf') ? 'fa-file-pdf' : file.endsWith('.docx') ? 'fa-file-word' : file.endsWith(('.jpg', '.png')) ? 'fa-file-image' : 'fa-file'}"></i>
                        <span class="folder-item-name">${file}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

// Initialize
const windowManager = new WindowManager();

// Desktop Items Click
document.querySelectorAll('.desktop-item').forEach(item => {
    item.addEventListener('dblclick', () => {
        const type = item.dataset.type;
        const name = item.dataset.name;
        const icon = item.querySelector('i').className;

        if (type === 'app') {
            windowManager.createWindow(name, icon, name);
        } else if (type === 'folder') {
            windowManager.createWindow(name, icon, 'folder', name);
        }
    });
});

// Start Menu
const startButton = document.getElementById('startButton');
const startMenu = document.getElementById('startMenu');
const closeMenu = document.getElementById('closeMenu');

startButton.addEventListener('click', () => {
    startMenu.classList.toggle('active');
});

closeMenu.addEventListener('click', () => {
    startMenu.classList.remove('active');
});

document.addEventListener('click', (e) => {
    if (!startButton.contains(e.target) && !startMenu.contains(e.target)) {
        startMenu.classList.remove('active');
    }
});

// Menu Items
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
        const appName = item.dataset.app;
        const icon = item.querySelector('i').className;
        windowManager.createWindow(appName, icon, appName);
        startMenu.classList.remove('active');
    });
});

// Clock
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('time').textContent = `${hours}:${minutes}`;
}

updateClock();
setInterval(updateClock, 60000);

// Right-click Context Menu
const contextMenu = document.getElementById('contextMenu');
const desktop = document.getElementById('desktop');

desktop.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    contextMenu.style.left = e.pageX + 'px';
    contextMenu.style.top = e.pageY + 'px';
    contextMenu.classList.add('active');
});

document.addEventListener('click', () => {
    contextMenu.classList.remove('active');
});

// Drag and Drop
document.querySelectorAll('.desktop-item').forEach(item => {
    item.addEventListener('dragstart', (e) => {
        e.dataTransfer.effectAllowed = 'move';
        item.style.opacity = '0.5';
    });

    item.addEventListener('dragend', (e) => {
        item.style.opacity = '1';
    });
});

desktop.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
});

desktop.addEventListener('drop', (e) => {
    e.preventDefault();
    const draggingItem = document.querySelector('.desktop-item[style*="opacity"]');
    if (draggingItem) {
        draggingItem.style.position = 'absolute';
        draggingItem.style.left = e.pageX + 'px';
        draggingItem.style.top = e.pageY + 'px';
    }
});

console.log('🚀 DeepBlue OS Loaded Successfully!');