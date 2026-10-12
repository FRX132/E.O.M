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

// --- 2. Live Docs Navigation Scrollspy & Search ---
const menuItems = document.querySelectorAll('.docs-menu-item');
const sections = document.querySelectorAll('.docs-section');

// Scrollspy to set active menu item based on viewport scroll
window.addEventListener('scroll', () => {
    let currentSectionId = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.pageYOffset >= sectionTop - 150) {
            currentSectionId = section.getAttribute('id');
        }
    });

    menuItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === '#' + currentSectionId) {
            item.classList.add('active');
        }
    });
});

// Instant docs filtering function
function filterDocs() {
    const query = document.getElementById('docs-search').value.toLowerCase();
    
    sections.forEach(section => {
        const text = section.innerText.toLowerCase();
        const menuLink = document.querySelector(`.docs-menu-item[href="#${section.id}"]`);
        
        if (text.includes(query)) {
            section.style.display = 'block';
            if (menuLink) menuLink.style.display = 'block';
        } else {
            section.style.display = 'none';
            if (menuLink) menuLink.style.display = 'none';
        }
    });
}
