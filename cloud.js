// This runs the workspace view for your brand new Cloud Sync folder
function loadCloudSyncView() {
    const workspace = document.getElementById('workspace');
    workspace.innerHTML = ''; // Clear desktop view
    
    // Build the new folder items dynamically
    workspace.innerHTML = `
        <div class="folder-grid" style="width: 100%; grid-column: 1 / -1; display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 20px;">
            <div class="folder-item" onclick="alert('Secure Backup Storage: Connected')" style="padding: 16px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 14px; display: flex; flex-direction: column; align-items: center; gap: 12px; cursor: pointer; text-align: center;">
                <div class="folder-item-icon" style="color: #38bdf8; font-size: 32px;"><i class="fas fa-hdd"></i></div>
                <div class="folder-item-name" style="font-size: 12px; font-weight: 500;">Secure Backup</div>
            </div>
            <div class="folder-item" onclick="alert('Assets Sync: 0 Pending files')" style="padding: 16px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 14px; display: flex; flex-direction: column; align-items: center; gap: 12px; cursor: pointer; text-align: center;">
                <div class="folder-item-icon" style="color: #fbbf24; font-size: 32px;"><i class="fas fa-images"></i></div>
                <div class="folder-item-name" style="font-size: 12px; font-weight: 500;">Asset Sync</div>
            </div>
            <div class="folder-item" onclick="alert('Live Stream Data Feed Active')" style="padding: 16px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 14px; display: flex; flex-direction: column; align-items: center; gap: 12px; cursor: pointer; text-align: center;">
                <div class="folder-item-icon" style="color: #ef4444; font-size: 32px;"><i class="fas fa-satellite-dish"></i></div>
                <div class="folder-item-name" style="font-size: 12px; font-weight: 500;">Data Feeds</div>
            </div>
        </div>
    `;
}
