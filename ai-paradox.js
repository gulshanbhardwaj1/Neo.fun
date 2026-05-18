/**
 * ==========================================================================
 * FILE: ai-paradox.js
 * GAME: AI PARADOX QUIZ - INFINITE MEME EDITION (3 OPTIONS)
 * FEATURES: Infinite Question Loop, Pure Meme Paradoxes, High Scale Layout
 * ==========================================================================
 */

(function () {
    let gameActive = false;
    let currentQuestionIndex = 0;
    let score = 0;
    let totalPlayed = 0;
    let audioCtx = null;
    let gameArea = null;
    let activeQuestionPool = [];

    // INFINITE HINGLISH MEME PARADOX DATABASE (3 OPTIONS ONLY)
    const masterMemeDatabase = [
        {
            question: "Modi Ji ne kaha: 'Main jo bhi bol raha hoon wo jhoot hai.' Toh kya Modi Ji sach bol rahe hain ya jhoot?",
            options: [
                { text: "Wo sach bol rahe hain" },
                { text: "Wo jhoot bol rahe hain" },
                { text: "Hypocrisy ki bhi seema hoti hai! (Brain Crash)" }
            ],
            correctIndex: 2,
            aiReaction: "SYSTEM OVERLOAD: Mitron, logic samajh nahi aa raha hai... *bzzt*"
        },
        {
            question: "Ek chai wala bolta hai: 'Main sabko garam chai pilata hoon jo khud apni chai nahi banate.' Toh kya wo chai wala apni chai khud banayega?",
            options: [
                { text: "Haan, banayega" },
                { text: "Nahi banayega" },
                { text: "Error: Banayega toh rule tootega, nahi banayega toh bhookha marega!" }
            ],
            correctIndex: 2,
            aiReaction: "LOGIC CRITICAL: Chai garam hai par dimaag freeze ho gaya..."
        },
        {
            question: "Agar comment section mein Binod se poocha jaye: 'Kya tum har jagah Binod likhna band karoge?' aur wo jawab mein 'Binod' likh de, toh iska kya matlab hai?",
            options: [
                { text: "Haan, wo band kar raha hai" },
                { text: "Nahi, wo chalu rakhega" },
                { text: "Binod ek loop hai, na haan hai na naa, bas BINOD hai!" }
            ],
            correctIndex: 2,
            aiReaction: "SYSTEM ERROR: Everywhere I go, I see his name... BINOD."
        },
        {
            question: "Sonam Gupta bewafa hai. Par agar wo pure desh se kahe ki 'Main is baat se bewafai kar rahi hoon', toh kya wo wafaadaar hui?",
            options: [
                { text: "Haan, wo loyal ho gayi" },
                { text: "Nahi, wo fir bhi bewafa hai" },
                { text: "Bewafai se bewafai matlab dimaag ka dahi!" }
            ],
            correctIndex: 2,
            aiReaction: "TIMELINE CRASH: Sonam Gupta ka logic decode karna impossible hai."
        },
        {
            question: "Jethalal bolta hai: 'Main hamesha Babita ji ke saamne jhoot bolta hoon.' Agar wo Babita ji se kahe 'Main aapse pyaar karta hoon', toh kya ye sach hai?",
            options: [
                { text: "Haan, sach hai" },
                { text: "Nahi, jhoot hai" },
                { text: "Nonsense! Bagha ko bulao, ye dimaag locked ho gaya hai!" }
            ],
            correctIndex: 2,
            aiReaction: "HARDWARE OVERHEATING: Tapu ke papa, ye kya logic poocha!"
        },
        {
            question: "Arnab Goswami chillakar bolta hai: 'The Nation Wants to Know... ki kya nation ko kuch nahi jaan na?' Nation kya chahta hai?",
            options: [
                { text: "Nation sab jaan na chahta hai" },
                { text: "Nation kuch nahi jaan na chahta" },
                { text: "Mujhe drug do.. oh sorry, mujhe logic do!" }
            ],
            correctIndex: 2,
            aiReaction: "AUDIO DISTORTION: Mujhe bolne do, mujhe bolne do! *pop*"
        }
    ];

    // TOUCH-DRIFT PROTECTION LOGIC
    let touchStartX = 0;
    let touchStartY = 0;
    const MOVE_THRESHOLD = 8;

    document.addEventListener('touchstart', function (e) {
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    }, { passive: true, capture: true });

    document.addEventListener('touchend', handleLaunchTrigger, { passive: false, capture: true });
    document.addEventListener('click', handleLaunchTrigger, true);

    function handleLaunchTrigger(e) {
        let target = e.target;
        let playBtn = target.closest('.btn-play');

        if (playBtn) {
            if (e.type === 'touchend') {
                const touch = e.changedTouches[0];
                const distX = Math.abs(touch.clientX - touchStartX);
                const distY = Math.abs(touch.clientY - touchStartY);
                if (distX > MOVE_THRESHOLD || distY > MOVE_THRESHOLD) return; 
            }

            let gameCard = playBtn.closest('.game-card');
            let cardText = gameCard ? gameCard.innerText || gameCard.innerHTML : '';
            
            if (cardText.toUpperCase().includes('PARADOX') || cardText.toUpperCase().includes('QUIZ')) {
                e.preventDefault();
                e.stopPropagation();
                initQuizAudio();
                setupQuizModal();
            }
        }
    }

    function initQuizAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    function playQuizSound(freq, type, duration) {
        if (!audioCtx) return;
        try {
            let osc = audioCtx.createOscillator();
            let gain = audioCtx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {}
    }

    // Shuffle helper to mix questions endlessly
    function shuffleArray(array) {
        let arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function setupQuizModal() {
        if (document.getElementById('quiz-game-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'quiz-game-modal';
        Object.assign(modal.style, {
            position: 'fixed',
            top: '0', left: '0', width: '100vw', height: '100vh', height: '100dvh',
            background: 'rgba(4, 3, 6, 0.99)',
            backdropFilter: 'blur(20px)', webkitBackdropFilter: 'blur(20px)',
            zIndex: '99999', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            userSelect: 'none', boxSizing: 'border-box'
        });

        modal.innerHTML = `
            <div style="width: 95%; max-width: 400px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid rgba(191, 90, 242, 0.3); padding-bottom: 10px;">
                <div style="text-align: left;">
                    <div style="color: #bf5af2; font-size: 1.2rem; font-weight: 700; text-shadow: 0 0 8px #bf5af2;">AI MEME PARADOX</div>
                    <div style="color: #8a8a9e; font-size: 0.65rem; letter-spacing:1px; margin-top: 2px;">NON-STOP MEME LOOPS ACTIVE</div>
                </div>
                <div style="color: #ff3b30; cursor: pointer; font-size: 1.8rem; font-weight: bold; padding: 2px 12px; border: 1px solid rgba(255,59,48,0.3); border-radius: 6px; background: rgba(255,59,48,0.05); line-height: 1;" id="close-quiz-btn">×</div>
            </div>

            <div id="quiz-game-area" style="position: relative; width: 95%; max-width: 400px; aspect-ratio: 4/5; background: #020104; border: 1px solid #bf5af2; border-radius: 12px; overflow: hidden; box-shadow: 0 0 25px rgba(191, 90, 242, 0.15); box-sizing: border-box; padding: 20px; display:flex; flex-direction:column; justify-content:space-between;">
                
                <div id="quiz-screen-wrapper" style="width:100%; height:100%; display:flex; flex-direction:column; justify-content:space-between;">
                    
                    <div style="background: rgba(191, 90, 242, 0.04); border: 1px solid rgba(191, 90, 242, 0.2); border-radius: 8px; padding: 12px; text-align: center;">
                        <div id="ai-face" style="font-size: 2.5rem; margin-bottom: 6px; transition: all 0.1s;">🤖</div>
                        <div id="ai-status-text" style="color: #39ff14; font-size: 0.75rem; font-family: monospace; letter-spacing: 1px;">MEME CORE: LOADED</div>
                    </div>

                    <div id="quiz-question-box" style="color: #ffffff; font-size: 1.05rem; font-weight: 600; text-align: center; line-height: 1.5; margin: 20px 0; min-height: 70px; display:flex; align-items:center; justify-content:center;">
                        Meme matrices mix ho rahe hain... ready ho jao!
                    </div>

                    <div id="quiz-options-container" style="display: flex; flex-direction: column; gap: 10px; width: 100%;">
                        </div>
                </div>

                <div id="quiz-overlay" style="position: absolute; top:0; left:0; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; background: rgba(3,2,5,0.95); z-index: 10; padding:25px; box-sizing:border-box; text-align:center;">
                    <div style="font-size: 3.5rem; margin-bottom: 15px; filter: drop-shadow(0 0 10px #bf5af2);">🤪</div>
                    <div style="color: #ffffff; font-size: 1.25rem; font-weight: bold; margin-bottom: 8px;">Infinite Meme Matrix</div>
                    <div style="color: #8a8a9e; font-size: 0.85rem; line-height:1.5; margin-bottom: 25px;">Modi ji, Chaiwala aur pure Desi Memes ka ultimate loop challenge. Kya tum AI ka dimaag crash kar paoge?</div>
                    <button id="start-quiz-btn" style="background: rgba(191, 90, 242, 0.1); border: 1px solid #bf5af2; color: #bf5af2; padding: 12px 30px; font-weight: bold; font-size: 0.95rem; border-radius: 6px; cursor: pointer; text-shadow: 0 0 5px #bf5af2; box-shadow: 0 0 10px rgba(191, 90, 242, 0.2); width:80%;">MEME ATTACK START KARO</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('close-quiz-btn').addEventListener('click', destroyQuiz);
        document.getElementById('close-quiz-btn').addEventListener('touchstart', function(e) {
            e.preventDefault(); destroyQuiz();
        });

        gameArea = document.getElementById('quiz-game-area');
        document.getElementById('start-quiz-btn').addEventListener('click', startQuizEngine);
    }

    function startQuizEngine() {
        document.getElementById('quiz-overlay').style.display = 'none';
        score = 0;
        totalPlayed = 0;
        currentQuestionIndex = 0;
        // Create an initial randomized pool from database
        activeQuestionPool = shuffleArray(masterMemeDatabase);
        gameActive = true;
        renderQuestionBlock();
    }

    function renderQuestionBlock() {
        if (!gameActive) return;

        // Infinite Check: Agar pool ke saare sawaal khatam ho jayein, toh use dubara shuffle karke load kar do!
        if (currentQuestionIndex >= activeQuestionPool.length) {
            activeQuestionPool = shuffleArray(masterMemeDatabase);
            currentQuestionIndex = 0;
        }

        document.getElementById('ai-face').innerText = "🤖";
        document.getElementById('ai-status-text').innerText = `LOOPS CRASHED: ${score} | TOTAL ATTEMPTS: ${totalPlayed}`;
        document.getElementById('ai-status-text').style.color = "#39ff14";

        const currentData = activeQuestionPool[currentQuestionIndex];
        document.getElementById('quiz-question-box').innerText = currentData.question;

        const optionsContainer = document.getElementById('quiz-options-container');
        optionsContainer.innerHTML = "";

        // Strictly building 3 buttons dynamically
        currentData.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            Object.assign(btn.style, {
                width: '100%',
                padding: '12px 14px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(191, 90, 242, 0.18)',
                borderRadius: '6px',
                color: '#e4e4ed',
                fontSize: '0.85rem',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s',
                outline: 'none',
                boxSizing: 'border-box'
            });

            btn.innerText = `${String.fromCharCode(65 + idx)}. ${opt.text}`;

            const choiceHandler = function(e) {
                e.preventDefault();
                validateUserSelection(idx, btn);
            };
            btn.addEventListener('click', choiceHandler);

            optionsContainer.appendChild(btn);
        });
    }

    function triggerGlitchVisual() {
        const wrapper = document.getElementById('quiz-screen-wrapper');
        const face = document.getElementById('ai-face');
        
        face.innerText = "💥";
        playQuizSound(120, 'sawtooth', 0.3);
        playQuizSound(800, 'square', 0.15);

        let count = 0;
        const interval = setInterval(() => {
            let offset     = (Math.random() - 0.5) * 15;
            let skewOffset = (Math.random() - 0.5) * 25;
            wrapper.style.transform = `translate(${offset}px, ${offset}px) skewX(${skewOffset}deg)`;
            gameArea.style.borderColor = Math.random() > 0.5 ? '#ff3b30' : '#00f0ff';
            
            count++;
            if(count > 10) {
                clearInterval(interval);
                wrapper.style.transform = 'none';
                gameArea.style.borderColor = '#bf5af2';
                face.innerText = "🥴"; 
            }
        }, 45);
    }

    function validateUserSelection(selectedIndex, selectedButton) {
        const currentData = activeQuestionPool[currentQuestionIndex];
        const optionsContainer = document.getElementById('quiz-options-container');
        
        Array.from(optionsContainer.children).forEach(btn => btn.style.pointerEvents = "none");
        totalPlayed++;

        // Humara logic index 2 (yaani option C) par set hai jo ultimate loop solution hai
        if (selectedIndex === currentData.correctIndex) {
            score++;
            selectedButton.style.background = "rgba(57, 255, 20, 0.1)";
            selectedButton.style.borderColor = "#39ff14";
            selectedButton.style.color = "#39ff14";
            
            document.getElementById('ai-status-text').innerText = "ALERT: MEME LOOP OVERLOAD!";
            document.getElementById('ai-status-text').style.color = "#ff3b30";
            
            triggerGlitchVisual();
        } else {
            selectedButton.style.background = "rgba(255, 59, 48, 0.1)";
            selectedButton.style.borderColor = "#ff3b30";
            selectedButton.style.color = "#ff3b30";
            document.getElementById('ai-face').innerText = "😎";
            document.getElementById('ai-status-text').innerText = "HOST: LOGIC INTACT! AAP SE NA HO PAYEGA.";
            playQuizSound(150, 'triangle', 0.25);
        }

        document.getElementById('quiz-question-box').innerHTML = `<span style="color:#ffc107; font-size:0.9rem; font-style:italic;">"${currentData.aiReaction}"</span>`;

        // Infinite auto-progress mechanism: 2.5 seconds ke baad automatic agla question roll hoga
        setTimeout(() => {
            currentQuestionIndex++;
            renderQuestionBlock();
        }, 2500);
    }

    function destroyQuiz() {
        gameActive = false;
        const modal = document.getElementById('quiz-game-modal');
        if (modal) modal.remove();
    }
})();
