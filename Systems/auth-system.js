// ==========================================================================
// GB PRODUCTION STUDIOS - DUAL AUTH CORE (EMAIL + GOOGLE LOGIN)
// ==========================================================================

// Firebase CDN Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// REAL FIREBASE CONFIGURATION INTEGRATED
const firebaseConfig = {
  apiKey: "AIzaSyA0iPIwr_8ImMMsNEfS-LRyiDRXBep1BSU",
  authDomain: "neofun-c1400.firebaseapp.com",
  projectId: "neofun-c1400",
  storageBucket: "neofun-c1400.firebasestorage.app",
  messagingSenderId: "426963072723",
  appId: "1:426963072723:web:b089fd57ba0e9fe1008626",
  measurementId: "G-D74TNTW27G"
};

// Initialize Firebase Core & Analytics
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Track Login Status
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Matrix Node Synced:", user.email);
        // Agar Google se login hai toh display name lega, nahi toh email ka prefix
        const gamerTag = user.displayName ? user.displayName.replace(/\s+/g, '_') : user.email.split('@')[0];
        localStorage.setItem("gb_player_name", gamerTag);
        closeAuthPopup(); 
    } else {
        if (!sessionStorage.getItem("auth_popup_bypassed")) {
            showAuthPopup("LOGIN");
        }
    }
});

document.addEventListener("DOMContentLoaded", () => { injectAuthStyles(); });

function injectAuthStyles() {
    if (document.getElementById("auth-injected-styles")) return;
    const styleTag = document.createElement("style");
    styleTag.id = "auth-injected-styles";
    styleTag.innerHTML = `
        .auth-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(3, 4, 8, 0.96); z-index: 99999999; display: flex; justify-content: center; align-items: center; font-family: 'Orbitron', sans-serif; }
        .auth-box { background: #05060a; border: 2px solid #ff007f; border-radius: 12px; width: 90%; max-width: 380px; padding: 35px 25px; text-align: center; box-shadow: 0 0 40px rgba(255, 0, 127, 0.25); position: relative; }
        .auth-close-btn { position: absolute; top: 12px; right: 18px; color: #4e4e64; font-size: 26px; cursor: pointer; font-family: sans-serif; }
        .auth-close-btn:hover { color: #00ffff; }
        .auth-title { color: #00ffff; font-size: 1.4rem; font-weight: 900; margin-bottom: 5px; letter-spacing: 2px; }
        .auth-subtitle { color: #4e4e64; font-size: 0.7rem; margin-bottom: 20px; letter-spacing: 1px; }
        .auth-input { background: #0f111a; border: 1px solid rgba(0, 255, 255, 0.2); border-radius: 6px; color: #fff; padding: 12px; width: 100%; text-align: center; font-family: sans-serif; font-size: 0.9rem; margin-bottom: 15px; outline: none; box-sizing: border-box; }
        .auth-btn { background: linear-gradient(90deg, #ff007f, #00ffff); color: #fff; width: 100%; padding: 12px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; letter-spacing: 1px; margin-top: 5px; }
        
        /* GOOGLE BUTTON STYLE */
        .auth-google-btn { background: #ffffff; color: #000; width: 100%; padding: 11px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 15px; font-family: sans-serif; font-size: 0.9rem; transition: background 0.2s; }
        .auth-google-btn:hover { background: #e6e6e6; }
        
        .auth-divider { color: #4e4e64; font-size: 0.75rem; margin: 15px 0; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .auth-divider::before, .auth-divider::after { content: ""; height: 1px; background: rgba(78, 78, 100, 0.4); flex: 1; }
        .auth-switch-text { color: #8a8a9e; font-size: 0.75rem; margin-top: 20px; cursor: pointer; }
        .auth-switch-text span { color: #00ffff; font-weight: bold; text-decoration: underline; }
        .auth-error { color: #ff3333; font-size: 0.75rem; margin-bottom: 10px; display: none; font-family: sans-serif; }
    `;
    document.head.appendChild(styleTag);
}

function showAuthPopup(mode) {
    if (document.getElementById("auth-matrix-overlay")) document.getElementById("auth-matrix-overlay").remove();

    const overlay = document.createElement("div");
    overlay.id = "auth-matrix-overlay";
    overlay.className = "auth-overlay";

    let boxHTML = `<div class="auth-box"><span class="auth-close-btn" onclick="bypassAuthProtocol()">&times;</span>`;

    boxHTML += `
        <div class="auth-title">${mode === "LOGIN" ? "CORE LOGIN" : "SIGN UP CORE"}</div>
        <div class="auth-subtitle">// Dual Authentication Engine</div>
        <div id="auth-err-msg" class="auth-error"></div>
        
        <button class="auth-google-btn" id="auth-google-action">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" alt="G">

            Continue with Google
        </button>

        <div class="auth-divider">OR</div>

        <input type="email" id="auth-email" class="auth-input" placeholder="ENTER EMAIL ID">
        <input type="password" id="auth-pass" class="auth-input" placeholder="${mode === "LOGIN" ? "ENTER PASSWORD" : "CREATE PASSWORD (Min 6)"}">
        <button class="auth-btn" id="auth-action-btn">${mode === "LOGIN" ? "ACCESS MATRIX" : "REGISTER SECURELY"}</button>
        <div class="auth-switch-text" id="auth-toggle-mode">${mode === "LOGIN" ? "New Operator? <span>Create Account</span>" : "Already Registered? <span>Sign In</span>"}</div>
    `;

    boxHTML += `</div>`;
    overlay.innerHTML = boxHTML;
    document.body.appendChild(overlay);

    // Event Listeners
    document.getElementById("auth-toggle-mode").onclick = () => showAuthPopup(mode === "LOGIN" ? "SIGNUP" : "LOGIN");
    document.getElementById("auth-action-btn").onclick = () => handleAuthAction(mode);
    document.getElementById("auth-google-action").onclick = () => handleGoogleLogin();
}

function handleAuthAction(mode) {
    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-pass").value;
    const errorDiv = document.getElementById("auth-err-msg");

    if (!email || !password) {
        errorDiv.innerText = "❌ Fields cannot be empty!";
        errorDiv.style.display = "block";
        return;
    }

    if (mode === "SIGNUP") {
        createUserWithEmailAndPassword(auth, email, password).catch(err => { errorDiv.innerText = "❌ " + err.message.replace("Firebase:", ""); errorDiv.style.display = "block"; });
    } else {
        signInWithEmailAndPassword(auth, email, password).catch(() => { errorDiv.innerText = "❌ Invalid credentials."; errorDiv.style.display = "block"; });
    }
}

// Google Login Trigger
function handleGoogleLogin() {
    const errorDiv = document.getElementById("auth-err-msg");
    signInWithPopup(auth, googleProvider)
        .catch(err => {
            errorDiv.innerText = "❌ Google Sync Failed: " + err.message;
            errorDiv.style.display = "block";
        });
}

window.bypassAuthProtocol = function() {
    sessionStorage.setItem("auth_popup_bypassed", "true");
    if(!localStorage.getItem("gb_player_name")) localStorage.setItem("gb_player_name", "GUEST_PLAYER");
    closeAuthPopup();
}

function closeAuthPopup() {
    const overlay = document.getElementById("auth-matrix-overlay");
    if (overlay) overlay.remove();
}

window.triggerMatrixLogout = function() {
    signOut(auth).then(() => {
        localStorage.removeItem("gb_player_name");
        sessionStorage.removeItem("auth_popup_bypassed");
        window.location.reload();
    });
}
