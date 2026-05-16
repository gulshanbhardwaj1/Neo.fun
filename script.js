/**
 * NEO.FUN - Main Portal & Live Mini-Games Engine
 */

document.addEventListener("DOMContentLoaded", () => {
    initLoader();
    initParticleGrid();
    initMouseGlow();
    initDynamicTyping();
    initCardTilts();
    initRippleEffects();
    initScrollRevelations();
    simulateLivePlayers();
    initSidebarEngine();
    
    // Game Modules Injection
    initReflexGame(); 
});

function initLoader() {
    const loader = document.getElementById("loader");
    if (!loader) return;
    
    // Fast loading visibility shutdown handler
    window.addEventListener("load", () => {
        setTimeout(() => {
            loader.style.opacity = "0";
            loader.style.visibility = "hidden";
        }, 600);
    });
}

function initSidebarEngine() {
    const toggle = document.getElementById("menu-toggle");
    const close = document.getElementById("close-sidebar");
    const slider = document.getElementById("sidebar-slider");
    const overlay = document.getElementById("sidebar-overlay");

    if(toggle && slider && overlay) {
        toggle.addEventListener("click", () => {
            slider.classList.add("open");
            overlay.classList.add("open");
        });
    }

    const dismissMenu = () => {
        if(slider && overlay) {
            slider.classList.remove("open");
            overlay.classList.remove("open");
        }
    };

    if(close) close.addEventListener("click", dismissMenu);
    if(overlay) overlay.addEventListener("click", dismissMenu);
    
    // Autohide slider drawer on mobile item clicks
    document.querySelectorAll(".sidebar-item").forEach(item => {
        item.addEventListener("click", dismissMenu);
    });
}

function initParticleGrid() {
    const canvas = document.getElementById("bg-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let particles = [];
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.speedY = (Math.random() - 0.5) * 0.4;
            this.color = Math.random() > 0.5 ? "rgba(0, 240, 255, 0.3)" : "rgba(255, 0, 127, 0.2)";
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) { this.reset(); }
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    const particleCount = Math.min(80, Math.floor(window.innerWidth / 15));
    for (let i = 0; i < particleCount; i++) { particles.push(new Particle()); }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animate);
    }
    animate();
}

function initMouseGlow() {
    const glow = document.getElementById("mouse-glow");
    if(!glow) return;
    window.addEventListener("mousemove", (e) => {
        glow.style.left = `${e.clientX}px`;
        glow.style.top = `${e.clientY}px`;
    });
}

function initDynamicTyping() {
    const target = document.querySelector(".dynamic-typing");
    if (!target) return;
    const words = ["MINI LABS", "PHYSICS TOYS", "REFLEX LABS", "SATISFYING UI"];
    let wordIndex = 0, charIndex = 0, isDeleting = false, delay = 150;

    function type() {
        const currentWord = words[wordIndex];
        if (isDeleting) {
            target.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            delay = 60;
        } else {
            target.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            delay = 120;
        }
        if (!isDeleting && charIndex === currentWord.length) {
            isDeleting = true;
            delay = 1800;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            delay = 400;
        }
        setTimeout(type, delay);
    }
    setTimeout(type, 1000);
}

function initCardTilts() {
    if (window.innerWidth <= 768) return; // Disable tilts completely on tablet/mobile trackers
    const cards = document.querySelectorAll("[data-tilt]");
    cards.forEach(card => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((centerY - y) / centerY) * 10; 
            const rotateY = ((x - centerX) / centerX) * 10;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        card.addEventListener("mouseleave", () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
        card.addEventListener("mouseenter", playHoverTone);
    });
}

function initRippleEffects() {
    const buttons = document.querySelectorAll(".btn-play, .btn-primary");
    buttons.forEach(btn => {
        btn.addEventListener("click", function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const ripple = document.createElement("span");
            ripple.classList.add("ripple");
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            this.appendChild(ripple);
            setTimeout(() => { ripple.remove(); }, 600);
        });
    });
}

function initScrollRevelations() {
    const sections = document.querySelectorAll(".feed-section, .game-card");
    const observerOptions = { root: null, threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    sections.forEach(sec => {
        sec.style.opacity = "0";
        sec.style.transform = "translateY(30px)";
        sec.style.transition = "opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1), transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)";
        observer.observe(sec);
    });
}

function simulateLivePlayers() {
    const countElement = document.getElementById("player-count");
    if (!countElement) return;
    setInterval(() => {
        const randomShift = Math.floor(Math.random() * 21) - 10;
        let currentCount = parseInt(countElement.innerText.replace(/[^0-9]/g, ''));
        if(isNaN(currentCount)) currentCount = 42109;
        countElement.innerText = `⚡ ${(currentCount + randomShift).toLocaleString()} ONLINE`;
    }, 4000);
}

function playHoverTone() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, ctx.currentTime); 
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.015, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
}

/* ==========================================================================
   REFLEX TEST REAL GAME LOGIC
   ========================================================================== */
function initReflexGame() {
    const modal = document.createElement("div");
    modal.id = "game-modal";
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(5, 5, 8, 0.95); z-index: 2000;
        display: flex; justify-content: center; align-items: center;
        opacity: 0; visibility: hidden; transition: all 0.4s ease;
    `;
    
    const gameBox = document.createElement("div");
    gameBox.style.cssText = `
        width: 90%; max-width: 600px; height: 400px;
        background: #0f0f1a; border: 2px solid var(--neon-blue);
        border-radius: 16px; display: flex; flex-direction: column;
        justify-content: center; align-items: center; cursor: pointer;
        user-select: none; position: relative; text-align: center; padding: 20px;
    `;
    
    gameBox.innerHTML = `
        <div style="position: absolute; top: 15px; right: 20px; font-size: 24px; color: #fff; cursor: pointer; z-index: 10;" id="close-game">×</div>
        <h2 id="game-status-text" style="font-family: var(--font-display); color: #fff; font-size: 1.8rem; pointer-events: none;">REFLEX TEST</h2>
        <p id="game-sub-text" style="color: var(--text-muted); margin-top: 15px; pointer-events: none;">Click anywhere inside this box to start.</p>
    `;
    
    modal.appendChild(gameBox);
    document.body.appendChild(modal);

    const playButtons = document.querySelectorAll(".btn-play");
    const reflexPlayBtn = playButtons[1]; 

    if(reflexPlayBtn) {
        reflexPlayBtn.addEventListener("click", () => {
            modal.style.opacity = "1";
            modal.style.visibility = "visible";
            resetGame();
        });
    }

    document.getElementById("close-game").addEventListener("click", (e) => {
        e.stopPropagation();
        modal.style.opacity = "0";
        modal.style.visibility = "hidden";
        clearTimeout(gameTimeout);
    });

    let gameState = "IDLE"; 
    let startTime = 0;
    let gameTimeout = null;
    const statusText = document.getElementById("game-status-text");
    const subText = document.getElementById("game-sub-text");

    function resetGame() {
        gameState = "IDLE";
        gameBox.style.background = "#0f0f1a";
        gameBox.style.borderColor = "var(--neon-blue)";
        statusText.innerText = "REFLEX TEST";
        statusText.style.color = "#fff";
        subText.innerText = "Click anywhere inside this box to start.";
        subText.style.color = "var(--text-muted)";
    }

    gameBox.addEventListener("click", () => {
        if (gameState === "IDLE") {
            gameState = "WAITING";
            gameBox.style.background = "#ff3333"; 
            gameBox.style.borderColor = "#ff3333";
            statusText.innerText = "WAIT FOR GREEN...";
            subText.innerText = "Don't click yet!";
            
            const randomDelay = Math.random() * 3000 + 2000;
            gameTimeout = setTimeout(() => {
                gameState = "READY";
                gameBox.style.background = "var(--neon-green)"; 
                gameBox.style.borderColor = "var(--neon-green)";
                statusText.innerText = "CLICK NOW!!!";
                statusText.style.color = "#000";
                subText.style.color = "#000";
                startTime = performance.now();
            }, randomDelay);

        } else if (gameState === "WAITING") {
            clearTimeout(gameTimeout);
            gameState = "IDLE";
            gameBox.style.background = "#0f0f1a";
            gameBox.style.borderColor = "var(--neon-red)";
            statusText.innerText = "TOO EARLY!";
            statusText.style.color = "#fff";
            subText.innerText = "Click to try again.";
            subText.style.color = "var(--text-muted)";

        } else if (gameState === "READY") {
            const endTime = performance.now();
            const reactionTime = Math.round(endTime - startTime);
            gameState = "IDLE";
            gameBox.style.background = "#0f0f1a";
            gameBox.style.borderColor = "var(--neon-cyan)";
            statusText.innerText = `${reactionTime} ms`;
            statusText.style.color = "#fff";
            subText.innerText = reactionTime < 250 ? "⚡ Godlike reflexes!" : "Not bad, click to try again.";
            subText.style.color = "var(--text-muted)";
        }
    });
}
