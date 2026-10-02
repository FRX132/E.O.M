// --- Theme Switcher Logic ---
let activeTheme = 'eom';
function toggleTheme() {
    const canvasEl = document.getElementById('matrix-canvas');
    const themeName = document.getElementById('theme-name');
    if (activeTheme === 'eom') {
        document.body.classList.remove('theme-eom');
        activeTheme = 'matrix';
        themeName.innerText = 'Matrix Green';
        if (canvasEl) canvasEl.style.opacity = '0.15';
    } else {
        document.body.classList.add('theme-eom');
        activeTheme = 'eom';
        themeName.innerText = 'E.O.M Obsidian Gold';
        if (canvasEl) canvasEl.style.opacity = '0.04';
    }
}

// --- 1. Matrix Digital Rain Animation ---
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const alphabet = katakana.split('');

const fontSize = 14;
let columns = canvas.width / fontSize;

const rainDrops = [];
for (let x = 0; x < columns; x++) {
    rainDrops[x] = 1;
}

function drawMatrix() {
    ctx.fillStyle = activeTheme === 'matrix' ? 'rgba(10, 10, 15, 0.05)' : 'rgba(17, 17, 17, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = activeTheme === 'matrix' ? '#00ff66' : '#d48f48';
    ctx.font = fontSize + 'px Share Tech Mono';

    for (let i = 0; i < rainDrops.length; i++) {
        const text = alphabet[Math.floor(Math.random() * alphabet.length)];
        ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

        if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            rainDrops[i] = 0;
        }
        rainDrops[i]++;
    }
}
setInterval(drawMatrix, 30);

// --- 2. Live XP Progression Simulator ---
let currentXP = 7000;
let maxXp = 20000;
let rank = 'Z';

function updateXPDisplay() {
    const percentage = Math.min(100, Math.round((currentXP / maxXp) * 100));
    document.getElementById('xp-fill-bar').style.width = percentage + '%';
    document.getElementById('progress-percent').innerText = percentage + '%';
    document.getElementById('xp-current').innerText = currentXP.toLocaleString();
    document.getElementById('xp-max').innerText = maxXp.toLocaleString();
    document.getElementById('rank-tag').innerText = rank;

    // Recalculate rank tiers
    if (currentXP >= 300000) { rank = 'S+'; maxXp = 500000; }
    else if (currentXP >= 200000) { rank = 'S'; maxXp = 300000; }
    else if (currentXP >= 150000) { rank = 'A'; maxXp = 200000; }
    else if (currentXP >= 100000) { rank = 'B'; maxXp = 150000; }
    else if (currentXP >= 80000) { rank = 'C'; maxXp = 100000; }
    else if (currentXP >= 60000) { rank = 'F'; maxXp = 80000; }
    else if (currentXP >= 20000) { rank = 'W'; maxXp = 60000; }
    else { rank = 'Z'; maxXp = 20000; }
}

function toggleHabitLive(element, xpVal) {
    element.classList.toggle('done');
    const checkbox = element.querySelector('input[type="checkbox"]');
    if (element.classList.contains('done')) {
        checkbox.checked = true;
        currentXP += xpVal;
    } else {
        checkbox.checked = false;
        currentXP -= xpVal;
    }
    updateXPDisplay();
}

// --- 3. Mockup Tab Switcher ---
function switchMockupTab(tabId) {
    document.querySelectorAll('.mockup-nav-item').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.mockup-view').forEach(view => {
        view.classList.remove('active');
    });

    // Find clicked button
    const navBtn = Array.from(document.querySelectorAll('.mockup-nav-item')).find(btn => btn.innerText.toLowerCase().includes(tabId));
    if (navBtn) navBtn.classList.add('active');

    const view = document.getElementById('view-' + tabId);
    if (view) view.classList.add('active');
}

// --- 4. Finance Ledger Interactive Mockup ---
let balance = 14250.00;

function recalculateFinanceMockup() {
    let totalExpenses = 0;
    document.querySelectorAll('.finance-amount').forEach(input => {
        totalExpenses += parseFloat(input.value) || 0;
    });

    const newBalance = 15000.00 - totalExpenses;
    balance = newBalance;
    document.getElementById('overview-balance-val').innerText = '€' + balance.toFixed(2);
    document.getElementById('finance-net-worth').innerText = '€' + balance.toFixed(2);
}

function deleteLedgerRow(btn) {
    btn.parentElement.remove();
    recalculateFinanceMockup();
}

function addLedgerRow() {
    const ledgerBox = document.getElementById('ledger-box');
    const newRow = document.createElement('div');
    newRow.className = 'ledger-row';
    newRow.innerHTML = `
        <input type="text" value="New expense item" onchange="recalculateFinanceMockup()">
        <div>
            <span class="currency">€</span>
            <input type="number" value="15.00" style="width: 60px; font-weight: bold; color: var(--accent);" onchange="recalculateFinanceMockup()" class="finance-amount">
        </div>
        <select>
            <option>Utilities</option>
            <option>Food</option>
            <option>Entertainment</option>
        </select>
        <button class="ledger-delete-btn" onclick="deleteLedgerRow(this)">×</button>
    `;
    ledgerBox.appendChild(newRow);
    recalculateFinanceMockup();
}

// --- 5. Muscle Selector Interaction ---
function clickMuscle(name) {
    const chestPath = document.getElementById('muscle-chest');
    if (name === 'Chest') {
        chestPath.classList.toggle('active');
    }

    const logBox = document.getElementById('muscle-logs');
    const newLog = document.createElement('div');
    newLog.className = 'muscle-log-item';
    newLog.innerHTML = `
        <span>💪 Selected target zone: ${name}</span>
        <span style="color: var(--secondary);">Unlocked Sport Hub drills</span>
    `;
    logBox.prepend(newLog);

    // Add XP
    currentXP += 250;
    updateXPDisplay();
}

// --- 6. Mock AI Assistant Chat ---
function triggerAIChat() {
    const input = document.getElementById('chat-input');
    const prompt = input.value.trim();
    if (!prompt) return;

    submitAIPrompt(prompt);
    input.value = '';
}

function submitAIPrompt(promptText) {
    switchMockupTab('ai');
    const history = document.getElementById('chat-box-history');

    // Add user bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble chat-bubble-user';
    userBubble.innerText = promptText;
    history.appendChild(userBubble);

    history.scrollTop = history.scrollHeight;

    // Simple mock response based on keywords
    setTimeout(() => {
        const lower = promptText.toLowerCase();
        let reply = "I parsed your input, but no matching system router was matched. Try asking to 'log workout' or 'complete goal'.";
        let statusText = "";

        if (lower.includes('workout') || lower.includes('training') || lower.includes('gym')) {
            reply = "I identified a physical workout intent. Logging your activity to the fitness records.";
            statusText = "LOG_WORKOUT: Chest (45 minutes)";

            // Trigger workout log
            clickMuscle('Chest');
        } else if (lower.includes('goal') || lower.includes('ziel') || lower.includes('task')) {
            reply = "Goal found and checked off. Congratulations on your productivity milestone!";
            statusText = "COMPLETE_GOAL: 'Diversify cash assets'";

            // Update goal text
            document.getElementById('overview-goal-text').style.textDecoration = 'line-through';
            document.getElementById('overview-goal-text').style.color = 'var(--text-muted)';
            currentXP += 500;
            updateXPDisplay();
        } else if (lower.includes('delete') || lower.includes('remove') || lower.includes('expense')) {
            reply = "Expense identified. Removing the subscription entry from your Ledger.";
            statusText = "DELETE_ITEM: 'Subscription Cloud Storage'";

            // Remove second row
            const rows = document.querySelectorAll('.ledger-row');
            if (rows.length > 1) {
                rows[1].remove();
                recalculateFinanceMockup();
            }
        }

        const aiBubble = document.createElement('div');
        aiBubble.className = 'chat-bubble chat-bubble-ai';
        aiBubble.innerHTML = reply;

        if (statusText) {
            const statusCard = document.createElement('div');
            statusCard.className = 'chat-mcp-status';
            statusCard.innerText = `[SYSTEM ACTION COMPLETED: ${statusText}]`;
            aiBubble.appendChild(statusCard);
        }

        history.appendChild(aiBubble);
        history.scrollTop = history.scrollHeight;

        currentXP += 100;
        updateXPDisplay();
    }, 1000);
}

// --- 7. Download Modal Controllers ---
function openDownloadModal(platform) {
    const modal = document.getElementById('download-modal');
    const title = document.getElementById('modal-title');
    const content = document.getElementById('modal-body-content');
    
    if (!modal || !title || !content) return;
    
    if (platform === 'pwa') {
        title.innerText = 'Launch & Install E.O.M (PWA)';
        content.innerHTML = `
            <div class="modal-option-box highlight">
                <div class="modal-option-header">
                    <strong style="color: #fff; font-size: 1.05rem;">🚀 Instant Web App</strong>
                    <span class="modal-option-badge">Recommended</span>
                </div>
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">
                    Runs directly in your browser with offline support, local IndexedDB persistence, and zero setup required.
                </p>
                <a href="https://frx132.github.io/E.O.M/" target="_blank" class="modal-download-btn" style="margin-top: 5px;">
                    Launch E.O.M Web App ➔
                </a>
            </div>

            <div class="modal-option-box">
                <strong style="color: #fff; display: block; margin-bottom: 8px;">📲 How to install as an App:</strong>
                <div style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.5;">
                    • <strong>iPhone / iPad (Safari):</strong> Open link, tap Share <span style="font-size: 1rem;">📤</span>, select <strong>„Add to Home Screen“</strong> (➕).<br>
                    • <strong>Android (Chrome):</strong> Open link, tap Menu (⋮), select <strong>„Install App“</strong>.<br>
                    • <strong>Desktop (Chrome / Edge):</strong> Click the <strong>Install icon (⊕)</strong> in your browser address bar.
                </div>
            </div>
        `;
    } else if (platform === 'ios') {
        title.innerText = 'E.O.M for iOS (iPhone & iPad)';
        content.innerHTML = `
            <!-- Option 1: PWA (Recommended) -->
            <div class="modal-option-box highlight">
                <div class="modal-option-header">
                    <strong style="color: #fff; font-size: 1rem;">⚡ Option 1: Instant PWA Install</strong>
                    <span class="modal-option-badge">No Xcode Needed</span>
                </div>
                <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 10px;">
                    Install directly to your iPhone Home Screen without developer accounts or sideloading tools.
                </p>
                <div style="font-size: 0.8rem; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px; margin-bottom: 12px; line-height: 1.5;">
                    1. Open in <strong>Safari</strong>: <a href="https://frx132.github.io/E.O.M/" target="_blank" style="color: var(--primary);">frx132.github.io/E.O.M</a><br>
                    2. Tap the <strong>Share button</strong> (📤) at the bottom.<br>
                    3. Tap <strong>„Add to Home Screen“</strong> (➕) and confirm.
                </div>
                <a href="https://frx132.github.io/E.O.M/" target="_blank" class="modal-download-btn" style="padding: 10px; font-size: 0.9rem;">
                    Open Web App on iPhone ➔
                </a>
            </div>

            <!-- Option 2: Native IPA Bundle -->
            <div class="modal-option-box">
                <div class="modal-option-header">
                    <strong style="color: #fff; font-size: 0.95rem;">📦 Option 2: Sideload IPA Bundle</strong>
                    <span style="font-size: 0.72rem; color: var(--text-muted);">For AltStore / Xcode</span>
                </div>
                <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px;">
                    Download the prebuilt <code>.IPA</code> binary for manual sideloading.
                </p>
                <a href="https://github.com/FRX132/E.O.M/releases/download/v2.0.0/E.O.M.ipa" class="modal-secondary-btn" download>
                    📥 Download E.O.M.ipa (V2.0.0)
                </a>
            </div>
        `;
    } else if (platform === 'android') {
        title.innerText = 'E.O.M for Android';
        content.innerHTML = `
            <!-- Option 1: PWA (Recommended) -->
            <div class="modal-option-box highlight">
                <div class="modal-option-header">
                    <strong style="color: #fff; font-size: 1rem;">⚡ Option 1: 1-Click PWA App</strong>
                    <span class="modal-option-badge">Instant</span>
                </div>
                <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 10px;">
                    Open in Chrome and install directly with full offline and standalone capabilities.
                </p>
                <a href="https://frx132.github.io/E.O.M/" target="_blank" class="modal-download-btn" style="padding: 10px; font-size: 0.9rem;">
                    Open Web App on Android ➔
                </a>
            </div>

            <!-- Option 2: Direct APK -->
            <div class="modal-option-box">
                <div class="modal-option-header">
                    <strong style="color: #fff; font-size: 0.95rem;">📦 Option 2: Direct APK Installer</strong>
                    <span style="font-size: 0.72rem; color: var(--text-muted);">Sideload APK</span>
                </div>
                <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px;">
                    Install the standalone Android application package.
                </p>
                <a href="https://github.com/FRX132/E.O.M/releases/download/v2.0.0/E.O.M.apk" class="modal-secondary-btn" download>
                    📥 Download E.O.M.apk (V2.0.0)
                </a>
            </div>
        `;
    } else if (platform === 'win') {
        title.innerText = 'Download E.O.M for Windows';
        content.innerHTML = `
            <div class="modal-option-box highlight">
                <div class="modal-option-header">
                    <strong style="color: #fff; font-size: 1rem;">🪟 Windows Desktop Installer</strong>
                    <span class="modal-option-badge">x64 Installer</span>
                </div>
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">
                    Download the prebuilt native desktop application for <strong>Windows 10 / 11</strong>.
                </p>
                <a href="https://github.com/FRX132/E.O.M/releases/download/v2.0.0/E.O.M-Setup-2.0.0.exe" class="modal-download-btn" download>
                    📥 Download E.O.M Setup 2.0.0.exe
                </a>
            </div>

            <div class="modal-option-box">
                <div class="modal-option-header">
                    <strong style="color: #fff; font-size: 0.95rem;">🌐 Web App / Browser Version</strong>
                </div>
                <a href="https://frx132.github.io/E.O.M/" target="_blank" class="modal-secondary-btn">
                    Launch in Browser ➔
                </a>
            </div>
        `;
    } else if (platform === 'mac') {
        title.innerText = 'Download E.O.M for macOS';
        content.innerHTML = `
            <div class="modal-option-box highlight">
                <div class="modal-option-header">
                    <strong style="color: #fff; font-size: 1rem;">🍏 macOS Disk Image (.dmg)</strong>
                    <span class="modal-option-badge">Universal DMG</span>
                </div>
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">
                    Download the native desktop disk image for <strong>Apple Silicon & Intel Macs</strong>.
                </p>
                <a href="https://github.com/FRX132/E.O.M/releases/download/v2.0.0/E.O.M-2.0.0.dmg" class="modal-download-btn" download>
                    📥 Download E.O.M-2.0.0.dmg
                </a>
            </div>

            <div class="modal-option-box">
                <div class="modal-option-header">
                    <strong style="color: #fff; font-size: 0.95rem;">🌐 Web App / Browser Version</strong>
                </div>
                <a href="https://frx132.github.io/E.O.M/" target="_blank" class="modal-secondary-btn">
                    Launch in Browser ➔
                </a>
            </div>
        `;
    }
    
    modal.style.display = 'flex';
}

function closeDownloadModal() {
    const modal = document.getElementById('download-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Close modal when clicking outside the modal-card
window.addEventListener('click', (event) => {
    const modal = document.getElementById('download-modal');
    if (event.target === modal) {
        closeDownloadModal();
    }
});

// --- 8. Waitlist Form Handler (AJAX & Validation) ---
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('waitlist-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Elements
        const statusDiv = document.getElementById('form-status');
        const nameInput = document.getElementById('agent-name');
        const emailInput = document.getElementById('agent-email');
        const reasonInput = document.getElementById('agent-reason');

        const errName = document.getElementById('error-name');
        const errEmail = document.getElementById('error-email');
        const errReason = document.getElementById('error-reason');

        // Reset display
        statusDiv.style.display = 'none';
        statusDiv.className = '';
        statusDiv.innerText = '';
        
        [errName, errEmail, errReason].forEach(el => {
            if (el) {
                el.style.display = 'none';
                el.innerText = '';
            }
        });
        [nameInput, emailInput, reasonInput].forEach(el => {
            if (el) {
                el.style.borderColor = 'var(--border-color)';
            }
        });

        // Client-side validation
        let clientErrors = false;

        const nameVal = nameInput ? nameInput.value.trim() : '';
        if (nameVal === '') {
            if (errName) {
                errName.innerText = 'Agent codename is required.';
                errName.style.display = 'block';
            }
            if (nameInput) nameInput.style.borderColor = 'var(--accent)';
            clientErrors = true;
        } else if (nameVal.length < 2) {
            if (errName) {
                errName.innerText = 'Agent codename must be at least 2 characters.';
                errName.style.display = 'block';
            }
            if (nameInput) nameInput.style.borderColor = 'var(--accent)';
            clientErrors = true;
        }

        const emailVal = emailInput ? emailInput.value.trim() : '';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailVal === '') {
            if (errEmail) {
                errEmail.innerText = 'Email address is required.';
                errEmail.style.display = 'block';
            }
            if (emailInput) emailInput.style.borderColor = 'var(--accent)';
            clientErrors = true;
        } else if (!emailRegex.test(emailVal)) {
            if (errEmail) {
                errEmail.innerText = 'Please enter a valid secure email address.';
                errEmail.style.display = 'block';
            }
            if (emailInput) emailInput.style.borderColor = 'var(--accent)';
            clientErrors = true;
        }

        const reasonVal = reasonInput ? reasonInput.value.trim() : '';
        if (reasonVal.length > 1000) {
            if (errReason) {
                errReason.innerText = 'Motivation message must not exceed 1000 characters.';
                errReason.style.display = 'block';
            }
            if (reasonInput) reasonInput.style.borderColor = 'var(--accent)';
            clientErrors = true;
        }

        if (clientErrors) {
            if (statusDiv) {
                statusDiv.style.display = 'block';
                statusDiv.style.background = 'rgba(255, 107, 107, 0.1)';
                statusDiv.style.border = '1px solid var(--accent)';
                statusDiv.style.color = 'var(--accent)';
                statusDiv.innerText = 'System override rejected. Please fix errors below.';
            }
            return;
        }

        // AJAX submit
        try {
            const formData = new FormData(form);
            const response = await fetch('validate.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                // Success
                if (statusDiv) {
                    statusDiv.style.display = 'block';
                    statusDiv.style.background = 'rgba(0, 255, 102, 0.1)';
                    statusDiv.style.border = '1px solid var(--primary)';
                    statusDiv.style.color = 'var(--primary)';
                    statusDiv.innerText = result.message;
                }
                form.reset();
            } else {
                // Server-side validation errors
                if (statusDiv) {
                    statusDiv.style.display = 'block';
                    statusDiv.style.background = 'rgba(255, 107, 107, 0.1)';
                    statusDiv.style.border = '1px solid var(--accent)';
                    statusDiv.style.color = 'var(--accent)';
                    statusDiv.innerText = result.message || 'System override rejected. Please fix errors below.';
                }

                if (result.errors) {
                    if (result.errors.name && errName) {
                        errName.innerText = result.errors.name;
                        errName.style.display = 'block';
                        if (nameInput) nameInput.style.borderColor = 'var(--accent)';
                    }
                    if (result.errors.email && errEmail) {
                        errEmail.innerText = result.errors.email;
                        errEmail.style.display = 'block';
                        if (emailInput) emailInput.style.borderColor = 'var(--accent)';
                    }
                    if (result.errors.reason && errReason) {
                        errReason.innerText = result.errors.reason;
                        errReason.style.display = 'block';
                        if (reasonInput) reasonInput.style.borderColor = 'var(--accent)';
                    }
                }
            }
        } catch (error) {
            console.error('Submission error:', error);
            if (statusDiv) {
                statusDiv.style.display = 'block';
                statusDiv.style.background = 'rgba(255, 107, 107, 0.1)';
                statusDiv.style.border = '1px solid var(--accent)';
                statusDiv.style.color = 'var(--accent)';
                statusDiv.innerText = 'Network connection failed. Secure link could not be established.';
            }
        }
    });
});

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registered successfully.', reg))
            .catch(err => console.error('Service Worker registration failed:', err));
    });
}


