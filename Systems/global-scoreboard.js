// ==========================================================================
// GB PRODUCTION STUDIOS - REAL-TIME CYBER LEADERBOARD (AUTOMATED MULTI-GAME TRACKER)
// ==========================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, limit, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA0iPIwr_8ImMMsNEfS-LRyiDRXBep1BSU",
  authDomain: "neofun-c1400.firebaseapp.com",
  projectId: "neofun-c1400",
  storageBucket: "neofun-c1400.firebasestorage.app",
  messagingSenderId: "426963072723",
  appId: "1:426963072723:web:b089fd57ba0e9fe1008626",
  measurementId: "G-D74TNTW27G"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const scoresRef = collection(db, "cyber_scores");

// 📊 AUTOMATIC REAL-TIME FETCH
function syncLeaderboardData() {
    const q = query(scoresRef, orderBy("score", "desc"), limit(10));
    
    onSnapshot(q, (snapshot) => {
        const leaderboardList = document.getElementById("leaderboard-list");
        if (!leaderboardList) return;
        
        leaderboardList.innerHTML = ""; 
        let rank = 1;
        snapshot.forEach((doc) => {
            const data = doc.data();
            const row = document.createElement("div");
            row.className = `leaderboard-item rank-${rank}`;
            row.innerHTML = `
                <span class="rank-num">#0${rank}</span>
                <span class="player-name">${data.name || "UNKNOWN_NODE"}</span>
                <span class="player-score">${data.score} PTS</span>
            `;
            leaderboardList.appendChild(row);
            rank++;
        });
    });
}

// 🚀 CORE FUNCTION TO SAVE SCORE
window.saveGamerScore = async function(finalScore) {
    const playerName = localStorage.getItem("gb_player_name") || "GUEST_PLAYER";
    const cleanScore = parseInt(finalScore);
    if (!cleanScore || cleanScore <= 0) return;

    try {
        await addDoc(scoresRef, {
            name: playerName,
            score: cleanScore,
            timestamp: new Date()
        });
        console.log("🚀 Score uploaded to Matrix Net:", cleanScore);
    } catch (error) {
        console.error("❌ Matrix Sync Failed:", error);
    }
};

// ==========================================================================
// 🕵️‍♂️ INTERCEPTOR ENGINE: AUTO-TRACK SCORES FROM ALL 10 GAMES
// ==========================================================================
function startAutomaticGameTracking() {
    
    // 1. Intercept standard alerts (Speed Clicker, Cyber Memory Flip etc.)
    const originalAlert = window.alert;
    window.alert = function(message) {
        originalAlert(message); // Pehle normal alert chalne do
        
        if (!message) return;
        
        // Auto-detect Speed Clicker Score
        if (message.includes("Total Registered Clicks:")) {
            const match = message.match(/Total Registered Clicks:\s*(\d+)/);
            if (match) window.saveGamerScore(match[1]);
        }
        // Auto-detect Cyber Memory Flip Score (Formula: 5000 - Moves * 50)
        else if (message.includes("SYSTEM CLEARED!") && message.includes("Moves:")) {
            const match = message.match(/Moves:\s*(\d+)/);
            if (match) {
                const moves = parseInt(match[1]);
                const memoryScore = Math.max(100, 5000 - (moves * 75));
                window.saveGamerScore(memoryScore);
            }
        }
    };

    // 2. Continuous Element Observer for Canvas/Overlay Games
    setInterval(() => {
        // Neon Snake Matrix & Synth Neon Runner tracking via text mutations
        const runnerMsg = document.getElementById('runner-msg');
        if (runnerMsg && runnerMsg.innerText.includes("SYSTEM REBOOT")) {
            const liveScore = localStorage.getItem('synth_runner_highscore');
            if (liveScore) window.saveGamerScore(liveScore);
        }

        // Color Catcher & Bubble Pop detection
        const retryBtn = document.getElementById('catcher-tap-retry');
        if (retryBtn && window.getComputedStyle(retryBtn).display === "block") {
            // Catcher score element text extraction
            const catcherScoreEl = document.getElementById('catcher-score');
            if (catcherScoreEl) {
                const txt = catcherScoreEl.innerText.replace(/\D/g, "");
                if (txt) window.saveGamerScore(txt);
            }
        }

        // Perfect Circle Arena
        const circleModal = document.getElementById('circle-game-modal');
        if (circleModal) {
            const circleInst = document.getElementById('game-instruction');
            if (circleInst && (circleInst.innerText.includes("RETRYING") || circleInst.innerText.includes("PRECISION") || circleInst.innerText.includes("STRUCTURE"))) {
                const circleScore = localStorage.getItem('circle_high_score');
                if (circleScore) window.saveGamerScore(parseFloat(circleScore) * 10); // Scale up to integer points
            }
        }

        // AI Paradox Engine
        const pdEndScore = document.querySelector('.pd-end-score');
        if (pdEndScore) {
            const txt = pdEndScore.innerText.replace(/\D/g, "");
            if (txt) window.saveGamerScore(txt);
        }

        // Reflex Test Game
        const reflexStatus = document.querySelector('#game-modal div[style*="font-size: 48px"]');
        if (reflexStatus && reflexStatus.innerText.includes("ms")) {
            const ms = parseInt(reflexStatus.innerText);
            if (ms > 0) {
                const reflexScore = Math.max(10, 2000 - ms); // Faster reaction = higher score
                window.saveGamerScore(reflexScore);
            }
        }
    }, 1500); // Har 1.5 second me matrix scan karega background me
}

// Inject UI Styles Automatically
function injectLeaderboardStyles() {
    if (document.getElementById("leaderboard-injected-styles")) return;
    const styleTag = document.createElement("style");
    styleTag.id = "leaderboard-injected-styles";
    styleTag.innerHTML = `
        #leaderboard-container { background: #05060a; border: 2px solid #00ffff; border-radius: 12px; padding: 20px; max-width: 400px; margin: 20px auto; box-shadow: 0 0 30px rgba(0, 255, 255, 0.15); font-family: 'Orbitron', sans-serif; }
        .leaderboard-header { color: #ff007f; text-align: center; font-size: 1.5rem; font-weight: 900; letter-spacing: 3px; margin-bottom: 20px; text-shadow: 0 0 10px rgba(255, 0, 127, 0.5); }
        .leaderboard-item { display: flex; justify-content: space-between; align-items: center; background: #0f111a; border: 1px solid rgba(0, 255, 255, 0.1); border-radius: 6px; padding: 10px 15px; margin-bottom: 8px; color: #fff; font-size: 0.9rem; transition: all 0.2s; }
        .leaderboard-item:hover { border-color: #ff007f; background: #141724; transform: scale(1.02); }
        .rank-num { color: #4e4e64; font-weight: bold; width: 40px; }
        .player-name { flex: 1; color: #e6e6e6; text-align: left; }
        .player-score { color: #00ffff; font-weight: bold; text-shadow: 0 0 5px rgba(0, 255, 255, 0.4); }
        .rank-1 { border-color: #ffd700 !important; box-shadow: 0 0 10px rgba(255, 215, 0, 0.2); }
        .rank-1 .rank-num { color: #ffd700; }
        .rank-2 { border-color: #c0c0c0 !important; }
        .rank-2 .rank-num { color: #c0c0c0; }
        .rank-3 { border-color: #cd7f32 !important; }
        .rank-3 .rank-num { color: #cd7f32; }
    `;
    document.head.appendChild(styleTag);
}

document.addEventListener("DOMContentLoaded", () => {
    injectLeaderboardStyles();
    syncLeaderboardData();
    startAutomaticGameTracking(); // 🔥 BACKGROUND SPY SYSTEM ACTIVATE!
});
