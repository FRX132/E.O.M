// --- Theme Switcher Logic (4 Themes) ---
const THEMES = [
  { id: 'eom', name: 'Obsidian Gold', opacity: '0.04', color: '#d48f48' },
  { id: 'matrix', name: 'Matrix Green', opacity: '0.12', color: '#00ff66' },
  { id: 'cyber', name: 'Cyber Neon', opacity: '0.08', color: '#06b6d4' },
  { id: 'slate', name: 'Slate Dark', opacity: '0.03', color: '#a855f7' }
];
let themeIndex = 0;
let activeTheme = THEMES[0].id;

function toggleTheme() {
    themeIndex = (themeIndex + 1) % THEMES.length;
    const current = THEMES[themeIndex];
    activeTheme = current.id;

    document.body.className = `theme-${current.id}`;
    const themeName = document.getElementById('theme-name');
    if (themeName) themeName.innerText = current.name;

    const canvasEl = document.getElementById('matrix-canvas');
    if (canvasEl) canvasEl.style.opacity = current.opacity;
}

// --- Simulator Presets ---
function loadSimulatorPreset(preset) {
    document.querySelectorAll('.simulator-preset-btn').forEach(btn => btn.classList.remove('active'));
    const clickedBtn = document.getElementById(`preset-${preset}`);
    if (clickedBtn) clickedBtn.classList.add('active');

    const habitList = document.querySelector('.habit-list-interactive');
    if (!habitList) return;

    if (preset === 'biohacker') {
        currentXP = 28500;
        rank = 'F';
        habitList.innerHTML = `
            <div class="habit-item-interactive" onclick="toggleHabitLive(this, 250)">
                <input type="checkbox"> <span>🧊 3m Cold Shower & Breathwork (+250 XP)</span>
            </div>
            <div class="habit-item-interactive" onclick="toggleHabitLive(this, 350)">
                <input type="checkbox"> <span>🏃‍♂️ 5km Morning Zone 2 Run (+350 XP)</span>
            </div>
            <div class="habit-item-interactive" onclick="toggleHabitLive(this, 200)">
                <input type="checkbox"> <span>🥗 Clean Nutrition & Macro Audit (+200 XP)</span>
            </div>
        `;
    } else if (preset === 'trader') {
        currentXP = 42000;
        rank = 'C';
        habitList.innerHTML = `
            <div class="habit-item-interactive" onclick="toggleHabitLive(this, 300)">
                <input type="checkbox"> <span>📈 Pre-Market Heatmap & Watchlist (+300 XP)</span>
            </div>
            <div class="habit-item-interactive" onclick="toggleHabitLive(this, 400)">
                <input type="checkbox"> <span>🛡️ Strict Risk Management Execution (+400 XP)</span>
            </div>
            <div class="habit-item-interactive" onclick="toggleHabitLive(this, 250)">
                <input type="checkbox"> <span>📝 Trade Journal & Post-Session Review (+250 XP)</span>
            </div>
        `;
    } else if (preset === 'scholar') {
        currentXP = 68000;
        rank = 'B';
        habitList.innerHTML = `
            <div class="habit-item-interactive" onclick="toggleHabitLive(this, 500)">
                <input type="checkbox"> <span>⏱️ 90m Monastic Deep Work Block (+500 XP)</span>
            </div>
            <div class="habit-item-interactive" onclick="toggleHabitLive(this, 300)">
                <input type="checkbox"> <span>📚 Read 25 Pages Primary Literature (+300 XP)</span>
            </div>
            <div class="habit-item-interactive" onclick="toggleHabitLive(this, 200)">
                <input type="checkbox"> <span>🧠 Active Recall & Mind Palace Reps (+200 XP)</span>
            </div>
        `;
    } else {
        currentXP = 7000;
        rank = 'Z';
        habitList.innerHTML = `
            <div class="habit-item-interactive" onclick="toggleHabitLive(this, 150)">
                <input type="checkbox"> <span>🧘 10m Mindful Meditation (+150 XP)</span>
            </div>
            <div class="habit-item-interactive" onclick="toggleHabitLive(this, 200)">
                <input type="checkbox"> <span>📚 Read 10 Pages Non-Fiction (+200 XP)</span>
            </div>
            <div class="habit-item-interactive" onclick="toggleHabitLive(this, 100)">
                <input type="checkbox"> <span>💧 Hydration: 2L Clean Water (+100 XP)</span>
            </div>
        `;
    }

    const xpCurrentEl = document.getElementById('xp-current');
    if (xpCurrentEl) xpCurrentEl.innerText = currentXP.toLocaleString();
    const rankBadgeEl = document.getElementById('rank-badge');
    if (rankBadgeEl) rankBadgeEl.innerText = rank;
    const barEl = document.getElementById('xp-progress-bar');
    if (barEl) barEl.style.width = `${Math.min(100, Math.round((currentXP / maxXp) * 100))}%`;
}

// --- 1. Matrix Digital Rain Canvas Animation ---
const canvas = document.getElementById('matrix-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ⚡🛡️';
    const alphabet = katakana.split('');

    const fontSize = 14;
    let columns = Math.floor(canvas.width / fontSize);

    const rainDrops = [];
    for (let x = 0; x < columns; x++) {
        rainDrops[x] = Math.random() * -50;
    }

    function drawMatrix() {
        ctx.fillStyle = activeTheme === 'matrix' ? 'rgba(7, 9, 14, 0.06)' : 'rgba(9, 9, 12, 0.06)';
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
    setInterval(drawMatrix, 32);
}

// --- 2. Live XP Progression Simulator ---
let currentXP = 7000;
let maxXp = 20000;
let rank = 'Z';

function showXPPopup(amount, event) {
    const floatEl = document.createElement('div');
    floatEl.className = 'xp-float-tag';
    floatEl.innerText = `+${amount} XP`;
    
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    
    if (event && event.clientX && event.clientY) {
        x = event.clientX;
        y = event.clientY;
    }
    
    floatEl.style.left = `${x}px`;
    floatEl.style.top = `${y}px`;
    
    document.body.appendChild(floatEl);
    
    setTimeout(() => {
        floatEl.remove();
    }, 1200);
}

function updateXPDisplay() {
    const percentage = Math.min(100, Math.round((currentXP / maxXp) * 100));
    const fillBar = document.getElementById('xp-fill-bar');
    const percentLabel = document.getElementById('progress-percent');
    const currentLabel = document.getElementById('xp-current');
    const maxLabel = document.getElementById('xp-max');
    const rankTag = document.getElementById('rank-tag');

    if (fillBar) fillBar.style.width = percentage + '%';
    if (percentLabel) percentLabel.innerText = percentage + '%';
    if (currentLabel) currentLabel.innerText = currentXP.toLocaleString();
    if (maxLabel) maxLabel.innerText = maxXp.toLocaleString();

    // Recalculate rank tiers
    if (currentXP >= 300000) { rank = 'S+'; maxXp = 500000; }
    else if (currentXP >= 200000) { rank = 'S'; maxXp = 300000; }
    else if (currentXP >= 150000) { rank = 'A'; maxXp = 200000; }
    else if (currentXP >= 100000) { rank = 'B'; maxXp = 150000; }
    else if (currentXP >= 80000) { rank = 'C'; maxXp = 100000; }
    else if (currentXP >= 60000) { rank = 'F'; maxXp = 80000; }
    else if (currentXP >= 20000) { rank = 'W'; maxXp = 60000; }
    else { rank = 'Z'; maxXp = 20000; }

    if (rankTag) rankTag.innerText = 'RANK ' + rank;
}

function toggleHabitLive(element, xpVal) {
    const checkbox = element.querySelector('input[type="checkbox"]');
    element.classList.toggle('done');
    
    if (element.classList.contains('done')) {
        if (checkbox) checkbox.checked = true;
        currentXP += xpVal;
        showXPPopup(xpVal, window.event);
    } else {
        if (checkbox) checkbox.checked = false;
        currentXP = Math.max(0, currentXP - xpVal);
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
    
    const overviewVal = document.getElementById('overview-balance-val');
    const netWorthVal = document.getElementById('finance-net-worth');
    
    if (overviewVal) overviewVal.innerText = '€' + balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (netWorthVal) netWorthVal.innerText = '€' + balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function deleteLedgerRow(btn) {
    btn.parentElement.remove();
    recalculateFinanceMockup();
}

function addLedgerRow() {
    const ledgerBox = document.getElementById('ledger-box');
    if (!ledgerBox) return;

    const newRow = document.createElement('div');
    newRow.className = 'ledger-row';
    newRow.innerHTML = `
        <input type="text" value="New expense entry" onchange="recalculateFinanceMockup()">
        <div>
            <span class="currency">€</span>
            <input type="number" value="25.00" style="width: 60px; font-weight: bold; color: var(--primary);" onchange="recalculateFinanceMockup()" class="finance-amount">
        </div>
        <select>
            <option>Food & Nutrition</option>
            <option>Hardware</option>
            <option>Cloud Services</option>
        </select>
        <button class="ledger-delete-btn" onclick="deleteLedgerRow(this)" title="Delete Row">×</button>
    `;
    ledgerBox.appendChild(newRow);
    recalculateFinanceMockup();
}

// --- 5. Muscle Selector Interaction ---
function clickMuscle(name) {
    const chestPath = document.getElementById('muscle-chest');
    if (name === 'Chest' && chestPath) {
        chestPath.classList.toggle('active');
    }

    const logBox = document.getElementById('muscle-logs');
    if (logBox) {
        const newLog = document.createElement('div');
        newLog.className = 'muscle-log-item';
        newLog.innerHTML = `
            <span>💪 Drill Logged: ${name} Target Set</span>
            <span style="color: var(--secondary); font-family: var(--font-mono);">3x Sets (+250 XP)</span>
        `;
        logBox.prepend(newLog);
    }

    // Add XP
    currentXP += 250;
    showXPPopup(250, window.event);
    updateXPDisplay();
}

// --- 6. Mock AI Assistant Chat ---
function triggerAIChat() {
    const input = document.getElementById('chat-input');
    if (!input) return;
    const prompt = input.value.trim();
    if (!prompt) return;

    submitAIPrompt(prompt);
    input.value = '';
}

function submitAIPrompt(promptText) {
    switchMockupTab('ai');
    const history = document.getElementById('chat-box-history');
    if (!history) return;

    // Add user bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble chat-bubble-user';
    userBubble.innerText = promptText;
    history.appendChild(userBubble);

    history.scrollTop = history.scrollHeight;

    // Simulate agent response
    setTimeout(() => {
        const lower = promptText.toLowerCase();
        let reply = "I parsed your query, but no exact system intent was recognized. Try asking to 'log workout', 'complete goal', or 'delete expense'.";
        let statusText = "";

        if (lower.includes('briefing') || lower.includes('morgen') || lower.includes('morning')) {
            reply = "☀️ <strong>Executive Morning Briefing:</strong><br>• Focus: Deep Work & High Output<br>• Schedule: 3 Timeblocks active<br>• Habits: 2/5 completed today<br>• Budget: €18.50 spent / €50.00 daily target<br>• World Pulse: Global news feeds in sync.";
            statusText = "AGENT_WORKFLOW: Morning Briefing Synthesized & TTS Readout Ready";
            currentXP += 300;
            showXPPopup(300);
        } else if (lower.includes('recipe') || lower.includes('kochen') || lower.includes('rezept') || lower.includes('cook') || lower.includes('fridge')) {
            reply = "🍳 <strong>Smart Kitchen Agent:</strong><br>Found: Eggs, Avocado, Spinach.<br>Proposed Dish: <em>Avocado Omelette Deluxe</em> (380 kcal, 24g Protein).<br>[MISSING_INGREDIENTS: Sourdough Bread, Olive Oil]";
            statusText = "AGENT_WORKFLOW: Smart Meal Plan Generated";
            currentXP += 200;
            showXPPopup(200);
        } else if (lower.includes('workout') || lower.includes('training') || lower.includes('gym') || lower.includes('chest')) {
            reply = "Physical training intent detected. Registering target workout drills directly to your fitness telemetry.";
            statusText = "LOG_WORKOUT: Chest / Upper Body (45 minutes)";
            clickMuscle('Chest');
        } else if (lower.includes('goal') || lower.includes('ziel') || lower.includes('task') || lower.includes('complete')) {
            reply = "Objective matched and marked complete. Productivity telemetry updated with bonus XP.";
            statusText = "COMPLETE_OBJECTIVE: 'Diversify cash reserves'";

            const goalText = document.getElementById('overview-goal-text');
            if (goalText) {
                goalText.style.textDecoration = 'line-through';
                goalText.style.color = 'var(--text-muted)';
            }
            currentXP += 500;
            showXPPopup(500);
            updateXPDisplay();
        } else if (lower.includes('delete') || lower.includes('remove') || lower.includes('expense') || lower.includes('cloud')) {
            reply = "Expense record identified. Removing cloud vault subscription entry from the active ledger.";
            statusText = "DELETE_ITEM: 'Encrypted Cloud Vault Backup'";

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
            statusCard.innerHTML = `<span>⚡</span> <span>[MCP_ROUTER_DISPATCH: ${statusText}]</span>`;
            aiBubble.appendChild(statusCard);
        }

        history.appendChild(aiBubble);
        history.scrollTop = history.scrollHeight;

        currentXP += 100;
        updateXPDisplay();
    }, 600);
}

// --- 7. Download Modal Controllers ---
function openDownloadModal(platform) {
    const modal = document.getElementById('download-modal');
    const title = document.getElementById('modal-title');
    const content = document.getElementById('modal-body-content');

    if (!modal || !title || !content) return;

    if (platform === 'pwa') {
        title.innerText = 'Launch E.O.M Web / PWA';
        content.innerHTML = `
            <div class="modal-option-box highlight">
                <div class="modal-option-header">
                    <strong style="color: #fff; font-size: 1.05rem;">⚡ Instant Offline Web App</strong>
                    <span class="modal-option-badge">Zero Install</span>
                </div>
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">
                    Runs locally in any modern browser with full offline persistence and zero latency.
                </p>
                <a href="/app" class="modal-download-btn">
                    Launch Web App Instantly ➔
                </a>
            </div>
            <div class="modal-option-box">
                <div class="modal-option-header">
                    <strong style="color: #fff; font-size: 0.95rem;">📲 Install as Standalone App</strong>
                </div>
                <p style="font-size: 0.82rem; color: var(--text-muted);">
                    In Safari (iOS) tap <strong>Share ➔ Add to Home Screen</strong>. In Chrome (Android/Desktop) click <strong>Install App</strong> in the address bar.
                </p>
            </div>
        `;
    } else if (platform === 'ios') {
        title.innerText = 'E.O.M for Apple iOS (iPhone & iPad)';
        content.innerHTML = `
            <!-- Option 1: PWA (Recommended) -->
            <div class="modal-option-box highlight">
                <div class="modal-option-header">
                    <strong style="color: #fff; font-size: 1.05rem;">⚡ Option 1: Add to Home Screen (Recommended)</strong>
                    <span class="modal-option-badge">1-Click Install</span>
                </div>
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5;">
                    On iPhone and iPad, E.O.M installs directly as a standalone offline application without the App Store:
                </p>
                <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; font-size: 0.82rem; color: var(--text-main); margin-bottom: 12px; display: flex; flex-direction: column; gap: 6px;">
                    <div>1. Open the Web App below in <strong>Safari Browser</strong>.</div>
                    <div>2. Tap the <strong>Share icon</strong> (📤 square with upward arrow) at the bottom.</div>
                    <div>3. Scroll down and tap <strong>"Add to Home Screen"</strong>.</div>
                    <div>4. Tap <strong>"Add"</strong> in the top right. Done! 🎉</div>
                </div>
                <a href="/app" class="modal-download-btn">
                    🚀 Launch Web App in Safari ➔
                </a>
            </div>

            <!-- Option 2: Native IPA Bundle -->
            <div class="modal-option-box">
                <div class="modal-option-header">
                    <strong style="color: #fff; font-size: 0.95rem;">📦 Option 2: Sideload IPA Bundle</strong>
                    <span style="font-size: 0.72rem; color: var(--text-muted);">AltStore / Xcode</span>
                </div>
                <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 8px;">
                    Prebuilt <code>.IPA</code> binary for manual sideloading (e.g. via AltStore / TrollStore).
                </p>
                <a href="https://github.com/FRX132/E.O.M/releases/download/v2.0.3/E.O.M.ipa" class="modal-secondary-btn" download>
                    📥 Download E.O.M.ipa (V2.0.3)
                </a>
            </div>
        `;
    } else if (platform === 'android') {
        title.innerText = 'E.O.M for Android';
        content.innerHTML = `
            <!-- Option 1: PWA (Recommended) -->
            <div class="modal-option-box highlight">
                <div class="modal-option-header">
                    <strong style="color: #fff; font-size: 1.05rem;">⚡ Option 1: 1-Click PWA App</strong>
                    <span class="modal-option-badge">Instant</span>
                </div>
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 10px;">
                    Open in Chrome and install directly with full offline and standalone capabilities.
                </p>
                <a href="/app" class="modal-download-btn">
                    Open Web App on Android ➔
                </a>
            </div>

            <!-- Option 2: Direct APK -->
            <div class="modal-option-box">
                <div class="modal-option-header">
                    <strong style="color: #fff; font-size: 0.95rem;">📦 Option 2: Direct APK Installer</strong>
                    <span style="font-size: 0.72rem; color: var(--text-muted);">Sideload APK</span>
                </div>
                <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 8px;">
                    Install the standalone Android application package.
                </p>
                <a href="https://github.com/FRX132/E.O.M/releases/download/v2.0.3/E.O.M.apk" class="modal-secondary-btn" download>
                    📥 Download E.O.M.apk (V2.0.3)
                </a>
            </div>
        `;
    } else if (platform === 'win') {
        title.innerText = 'Download E.O.M for Windows';
        content.innerHTML = `
            <div class="modal-option-box highlight">
                <div class="modal-option-header">
                    <strong style="color: #fff; font-size: 1.05rem;">🪟 Windows Desktop Installer</strong>
                    <span class="modal-option-badge">x64 Installer</span>
                </div>
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">
                    Download the prebuilt native desktop application for <strong>Windows 10 / 11</strong>.
                </p>
                <a href="https://github.com/FRX132/E.O.M/releases/download/v2.0.3/E.O.M-Setup-2.0.3.exe" class="modal-download-btn" download>
                    📥 Download E.O.M Setup 2.0.3.exe
                </a>
            </div>

            <div class="modal-option-box">
                <div class="modal-option-header">
                    <strong style="color: #fff; font-size: 0.95rem;">🌐 Web App / Browser Version</strong>
                </div>
                <a href="/app" class="modal-secondary-btn">
                    Launch in Browser ➔
                </a>
            </div>
        `;
    } else if (platform === 'mac') {
        title.innerText = 'Download E.O.M for macOS';
        content.innerHTML = `
            <div class="modal-option-box highlight">
                <div class="modal-option-header">
                    <strong style="color: #fff; font-size: 1.05rem;">🍏 macOS Disk Image (.dmg)</strong>
                    <span class="modal-option-badge">Universal DMG</span>
                </div>
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">
                    Download the native desktop disk image for <strong>Apple Silicon & Intel Macs</strong>.
                </p>
                <a href="https://github.com/FRX132/E.O.M/releases/download/v2.0.3/E.O.M-2.0.3.dmg" class="modal-download-btn" download>
                    📥 Download E.O.M-2.0.3.dmg
                </a>
            </div>

            <div class="modal-option-box">
                <div class="modal-option-header">
                    <strong style="color: #fff; font-size: 0.95rem;">🌐 Web App / Browser Version</strong>
                </div>
                <a href="/app" class="modal-secondary-btn">
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

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    const modal = document.getElementById('download-modal');
    if (event.target === modal) {
        closeDownloadModal();
    }
});

// OS Auto-Detection for Platform Bar
function detectUserPlatform() {
    const ua = navigator.userAgent || '';
    let plat = 'pwa';
    
    if (/Macintosh|Mac OS X/i.test(ua) && !/iPhone|iPad/i.test(ua)) {
        plat = 'mac';
    } else if (/Windows/i.test(ua)) {
        plat = 'win';
    } else if (/iPhone|iPad|iPod/i.test(ua)) {
        plat = 'ios';
    } else if (/Android/i.test(ua)) {
        plat = 'android';
    }
    
    const targetBtn = document.getElementById(`btn-plat-${plat}`);
    if (targetBtn) {
        targetBtn.classList.add('recommended');
    }
}

// --- 8. Waitlist Form Handler (AJAX & Validation) ---
document.addEventListener('DOMContentLoaded', () => {
    detectUserPlatform();

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
        if (statusDiv) {
            statusDiv.style.display = 'none';
            statusDiv.className = '';
            statusDiv.innerText = '';
        }
        
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
                statusDiv.style.background = 'rgba(255, 82, 82, 0.12)';
                statusDiv.style.border = '1px solid var(--accent)';
                statusDiv.style.color = 'var(--accent)';
                statusDiv.innerText = 'System uplink rejected. Please correct the fields highlighted in red.';
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
                if (statusDiv) {
                    statusDiv.style.display = 'block';
                    statusDiv.style.background = 'rgba(0, 255, 102, 0.12)';
                    statusDiv.style.border = '1px solid var(--primary)';
                    statusDiv.style.color = 'var(--primary)';
                    statusDiv.innerText = '⚡ ' + result.message;
                }
                form.reset();
            } else {
                if (statusDiv) {
                    statusDiv.style.display = 'block';
                    statusDiv.style.background = 'rgba(255, 82, 82, 0.12)';
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
                statusDiv.style.background = 'rgba(255, 82, 82, 0.12)';
                statusDiv.style.border = '1px solid var(--accent)';
                statusDiv.style.color = 'var(--accent)';
                statusDiv.innerText = 'Network connection offline. Secure link could not be completed.';
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
