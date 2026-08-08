// OutAtlas Side Panel — extracted from index.html (Phase 1.5)
import '@fontsource/outfit';
import './styles/sidepanel-responsive.css';
import { auth, db } from './firebase.js';
import { store, initStorage } from './storage.js';


/* Font Awesome 6.4.0 — local webfonts */
const _faStyle = document.createElement('style');
_faStyle.textContent = `
@font-face {
  font-family: "Font Awesome 6 Brands";
  font-style: normal;
  font-weight: 400;
  src: url("../assets/fonts/fa-brands-400.woff2") format("woff2");
}
@font-face {
  font-family: "Font Awesome 6 Free";
  font-style: normal;
  font-weight: 400;
  src: url("../assets/fonts/fa-regular-400.woff2") format("woff2");
}
@font-face {
  font-family: "Font Awesome 6 Free";
  font-style: normal;
  font-weight: 900;
  src: url("../assets/fonts/fa-solid-900.woff2") format("woff2");
}
@font-face {
  font-family: "Font Awesome 6 Free";
  font-style: normal;
  font-weight: 400;
  font-variant: normal;
  src: url("../assets/fonts/fa-v4compatibility.woff2") format("woff2");
}
`;
document.head.appendChild(_faStyle);

// ── extracted script block ──────────────────────────────────────────────
// On page load or when changing themes, best to add inline in `head` to avoid FOUC
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }

// ── extracted script block ──────────────────────────────────────────────
/* ============================================================================
           OUTATLAS THEME MANAGER
           Manages three-theme system with localStorage persistence and system preference detection
           ============================================================================ */

        // Theme configuration constants
        const THEME_CONFIG = {
            CLEAR: 'clear-mode',
            LIGHT: 'light-mode',
            DARK: 'dark-mode',
            STORAGE_KEY: 'outatlas-theme',
            REDUCE_MOTION_KEY: 'reduce-motion',
            HIGH_CONTRAST_KEY: 'high-contrast'
        };

        /* ============================================================================
           getSavedTheme()

           Retrieves the user's theme preference in this order:
           1. localStorage.getItem('outatlas-theme') - User's manual selection
           2. System preference via window.matchMedia('(prefers-color-scheme: dark)')
           3. 'clear' as absolute default (WCAG AAA accessible default)

           Returns: 'clear', 'light', or 'dark'
           ============================================================================ */
        function getSavedTheme() {
            // Check if user has manually saved a theme preference
            const saved = store.getSync(THEME_CONFIG.STORAGE_KEY);
            if (saved) {
                return saved;
            }

            // Check system preference for dark mode
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                return 'dark';
            }

            // Check system preference for light mode
            const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
            if (prefersLight) {
                return 'light';
            }

            // Absolute default: Clear View (WCAG AAA accessible)
            return 'clear';
        }

        /* ============================================================================
           setTheme(theme)

           Applies the specified theme to the document and saves preference.

           Process:
           1. Remove all theme classes from document.body
           2. Add the appropriate class based on theme parameter
           3. For dark mode: set document.documentElement.style.colorScheme = 'dark'
           4. Save preference to localStorage
           5. Log the change to console
           6. Trigger CSS variable updates (immediate theme switch)

           Parameters: theme - 'clear', 'light', or 'dark'
           ============================================================================ */
        function setTheme(theme) {
            // Validate theme parameter
            if (!['clear', 'light', 'dark'].includes(theme)) {
                console.warn(`Invalid theme: ${theme}. Using 'clear' instead.`);
                theme = 'clear';
            }

            // Map theme names to CSS class names
            const themeClass = {
                'clear': THEME_CONFIG.CLEAR,
                'light': THEME_CONFIG.LIGHT,
                'dark': THEME_CONFIG.DARK
            }[theme];

            // Remove all existing theme classes from document.body
            document.body.classList.remove(
                THEME_CONFIG.CLEAR,
                THEME_CONFIG.LIGHT,
                THEME_CONFIG.DARK
            );

            // Add the new theme class to document.body
            document.body.classList.add(themeClass);

            // Manage Tailwind's 'dark' class separately (Tailwind looks for 'dark', not 'dark-mode')
            if (theme === 'dark') {
                document.documentElement.classList.add('dark');
                document.documentElement.style.colorScheme = 'dark';
            } else {
                document.documentElement.classList.remove('dark');
                document.documentElement.style.colorScheme = 'light';
            }

            // Save theme preference to chrome.storage.local for persistence across sessions
            store.set(THEME_CONFIG.STORAGE_KEY, theme);

            // Log the theme change to console for debugging
            console.log(`Theme changed to: ${theme} (${themeClass})`);

            // Dispatch custom event for other components to listen to
            window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
        }

        /* ============================================================================
           Cycle Theme - Toggle between Clear View, Light, and Dark modes
           ============================================================================ */
        function cycleTheme() {
            const currentTheme = store.getSync(THEME_CONFIG.STORAGE_KEY) || 'clear';
            const themes = ['clear', 'light', 'dark'];
            const currentIndex = themes.indexOf(currentTheme);
            const nextTheme = themes[(currentIndex + 1) % themes.length];
            setTheme(nextTheme);
            updateThemeSelection();
        }

        /* ============================================================================
           Initialize Theme on Page Load

           Runs when DOM is ready to:
           1. Get the appropriate theme (saved, system preference, or default)
           2. Apply the theme to the document
           3. Set up system preference monitoring
           ============================================================================ */
        function initializeThemeSystem() {
            // Get the theme to use
            const initialTheme = getSavedTheme();

            // Apply the theme
            setTheme(initialTheme);

            // Apply accessibility settings (reduce motion, high contrast)
            applyAccessibilitySettings();

            // Set up system preference change listeners
            setupSystemPreferenceListeners();
        }

        /* ============================================================================
           Apply Accessibility Settings

           Respects user's system accessibility preferences:
           - Reduce motion: disables animations
           - High contrast: increases visual contrast
           ============================================================================ */
        function applyAccessibilitySettings() {
            // Check for reduced motion preference
            const reduceMotion = store.getSync(THEME_CONFIG.REDUCE_MOTION_KEY) === 'true' ||
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            if (reduceMotion) {
                document.documentElement.style.setProperty('--transition-base', 'none');
                document.body.classList.add('reduce-motion');
            }

            // Check for high contrast preference
            const highContrast = store.getSync(THEME_CONFIG.HIGH_CONTRAST_KEY) === 'true' ||
                window.matchMedia('(prefers-contrast: more)').matches;

            if (highContrast) {
                document.body.classList.add('high-contrast');
            }
        }

        /* ============================================================================
           System Preference Change Listeners

           Monitors OS-level theme changes and respects user's manual selections:
           - Only auto-switches if user hasn't manually chosen a theme
           - Allows users to override system preferences via localStorage
           ============================================================================ */
        function setupSystemPreferenceListeners() {
            // Listen for dark mode preference changes
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                // Only auto-switch if user hasn't manually set a theme
                const hasUserPreference = store.getSync(THEME_CONFIG.STORAGE_KEY);
                if (!hasUserPreference) {
                    const newTheme = e.matches ? 'dark' : 'light';
                    setTheme(newTheme);
                    console.log(`System preference changed to: ${newTheme}`);
                }
            });

            // Listen for reduced motion preference changes
            window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
                if (e.matches) {
                    document.documentElement.style.setProperty('--transition-base', 'none');
                    document.body.classList.add('reduce-motion');
                } else {
                    document.documentElement.style.removeProperty('--transition-base');
                    document.body.classList.remove('reduce-motion');
                }
            });

            // Listen for high contrast preference changes
            window.matchMedia('(prefers-contrast: more)').addEventListener('change', (e) => {
                if (e.matches) {
                    document.body.classList.add('high-contrast');
                } else {
                    document.body.classList.remove('high-contrast');
                }
            });
        }

        /* ============================================================================
           Global Exports

           These functions are exposed globally for use in settings modals and buttons:
           - window.getSavedTheme() - Get current theme preference
           - window.setTheme(theme) - Change theme (can be called from buttons)

           Example usage in HTML:
           <button onclick="setTheme('clear')">Clear View</button>
           <button onclick="setTheme('light')">Light Mode</button>
           <button onclick="setTheme('dark')">Dark Mode</button>
           ============================================================================ */
        window.getSavedTheme = getSavedTheme;
        window.setTheme = setTheme;
        window.cycleTheme = cycleTheme;
        window.updateThemeSelection = updateThemeSelection;

        // Populate chrome.storage.local cache then initialize theme
        initStorage().then(() => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initializeThemeSystem);
            } else {
                initializeThemeSystem();
            }
        });

// ── extracted script block ──────────────────────────────────────────────
(function () {
            const FB_CFG = {
                apiKey: "AIzaSyBr8E41ny_oPeQ5pjrpwuRS-Ub1pZNUhUc",
                authDomain: "pride-scout-26f4e.firebaseapp.com",
                projectId: "pride-scout-26f4e",
                storageBucket: "pride-scout-26f4e.firebasestorage.app",
                messagingSenderId: "402384469695",
                appId: "1:402384469695:web:13fa09d6c9c287d8c3100a",
                measurementId: "G-7SHNRD677F"
            };
            firebase.initializeApp(FB_CFG);
            const auth = firebase.auth();
            const db = firebase.firestore();
            let currentUser = null;
            let savedTripIds = new Set();
            let savedTripDocIds = new Map();

            // Auth state
            auth.onAuthStateChanged(async (user) => {
                currentUser = user;
                renderUserBtn(user);
                if (user) {
                    await refreshSavedIds();

                    const params = new URLSearchParams(window.location.search);
                    const shareId = params.get('shareId');
                    if (shareId) {
                        try {
                            const sharedSnap = await db.collection('shared_trips').doc(shareId).get();
                            if (sharedSnap.exists) {
                                const st = sharedSnap.data();
                                const tripsSnap = await db.collection('users').doc(user.uid).collection('trips').where('shareId', '==', shareId).get();
                                if (tripsSnap.empty) {
                                    await db.collection('users').doc(user.uid).collection('trips').add({
                                        destination: st.destination,
                                        departure: st.departure,
                                        dateStart: st.dateStart,
                                        dateEnd: st.dateEnd,
                                        tripKey: st.tripKey,
                                        createdAt: Date.now(),
                                        savedAt: firebase.firestore.FieldValue.serverTimestamp(),
                                        shareId: shareId
                                    });
                                    alert("You have joined the collaborative trip to " + st.destination + "!");
                                    await refreshSavedIds();
                                }
                                window.history.replaceState({}, document.title, window.location.pathname);
                            } else {
                                alert("This shared trip no longer exists.");
                                window.history.replaceState({}, document.title, window.location.pathname);
                            }
                        } catch (e) { console.error("Error joining shared trip", e); }
                    }

                    refreshSaveButtons();
                }
                else { savedTripIds.clear(); refreshSaveButtons(); }
            });

            async function refreshSavedIds() {
                if (!currentUser) return;
                const snap = await db.collection('users').doc(currentUser.uid).collection('trips').get();
                savedTripIds.clear();
                savedTripDocIds.clear();
                snap.docs.forEach(d => {
                    savedTripIds.add(d.data().tripKey);
                    savedTripDocIds.set(d.data().tripKey, d.id);
                });
            }

            function getUserInitials(user) {
                if (!user) return '?';
                let initials = '?';
                if (user.displayName) {
                    const parts = user.displayName.trim().split(/[\s.]+/);
                    if (parts.length >= 2) {
                        initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                    } else if (parts[0].length >= 2) {
                        initials = parts[0].slice(0, 2).toUpperCase();
                    } else if (parts[0].length === 1) {
                        initials = parts[0].toUpperCase();
                    }
                } else if (user.email) {
                    initials = user.email.slice(0, 2).toUpperCase();
                }
                return initials;
            }

            // Countdown calculation functions
            function calculateDaysUntilDeparture(dateStartStr) {
                const now = new Date();
                const departDate = new Date(dateStartStr);
                const diffMs = departDate - now;
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const isExpired = diffMs < 0;
                const isDeparting = diffDays === 0 && diffHours > 0;
                return { days: Math.max(0, diffDays), hours: Math.max(0, diffHours), isExpired, isDeparting };
            }

            function formatCountdown(dateStartStr) {
                const { days, hours, isExpired } = calculateDaysUntilDeparture(dateStartStr);
                if (isExpired) return 'Departed';
                if (days === 0 && hours === 0) return 'Departing today!';
                if (days === 0) return `Departing in ${hours} hour${hours !== 1 ? 's' : ''}`;
                return `Departing in ${days} day${days !== 1 ? 's' : ''}${hours > 0 ? `, ${hours} hour${hours !== 1 ? 's' : ''}` : ''}`;
            }

            function getCountdownColor(dateStartStr) {
                const { days, isExpired } = calculateDaysUntilDeparture(dateStartStr);
                if (isExpired) return 'color:#999;';
                if (days < 7) return 'color:#dc2626;';
                if (days < 14) return 'color:#eab308;';
                return 'color:#22c55e;';
            }

            function isUpcomingTrip(dateStartStr) {
                const { days, isExpired } = calculateDaysUntilDeparture(dateStartStr);
                return !isExpired && days <= 90;
            }

            function isPastTrip(dateStartStr) {
                const { isExpired } = calculateDaysUntilDeparture(dateStartStr);
                return isExpired;
            }

            // Header user button
            function renderUserBtn(user) {
                const wrap = document.getElementById('ps-user-menu-wrap');
                if (!wrap) return;
                if (user) {
                    let initials = getUserInitials(user);

                    wrap.innerHTML = `
            <button id="ps-user-btn" onclick="psToggleDropdown()">
              <span style="width:1.4rem;height:1.4rem;border-radius:50%;background:rgba(255,255,255,.3);
                display:inline-flex;align-items:center;justify-content:center;font-size:.68rem;font-weight:900;">
                ${initials}
              </span>
            </button>
            <div id="ps-user-dropdown">
              <div class="ps-dd-item" onclick="psTripPanel(true)">&#128278; My Saved Trips</div>
              <div class="ps-dd-item" onclick="psOpenUpcomingTripsPanel()">🚀 Confirmed Trips</div>
              <div class="ps-dd-item" onclick="psSignOut()" style="color:#e11d48;">&#128075; Sign Out</div>
            </div>`;
                } else {
                    wrap.innerHTML = `<button id="ps-user-btn" onclick="psOpenModal()">&#127987;&#65039;&#8205;&#127752; Sign In</button>`;
                }
            }

            window.psToggleDropdown = function () {
                document.getElementById('ps-user-dropdown')?.classList.toggle('open');
            };
            document.addEventListener('click', e => {
                if (!e.target.closest('#ps-user-menu-wrap'))
                    document.getElementById('ps-user-dropdown')?.classList.remove('open');
            });

            // Modal helpers
            window.psOpenModal = function (msg) {
                document.getElementById('ps-auth-modal-backdrop').classList.add('open');
                if (msg) document.getElementById('ps-modal-msg').textContent = msg;
                setTimeout(() => document.getElementById('ps-auth-email')?.focus(), 50);
            };
            window.psCloseModal = function () {
                document.getElementById('ps-auth-modal-backdrop').classList.remove('open');
                document.getElementById('ps-auth-error').textContent = '';
                document.getElementById('ps-modal-msg').textContent = '';
            };
            window.psSwitchTab = function (tab) {
                const isUp = tab === 'up';
                document.getElementById('ps-tab-in').className = 'ps-tab' + (isUp ? '' : ' active');
                document.getElementById('ps-tab-up').className = 'ps-tab' + (isUp ? ' active' : '');
                document.getElementById('ps-auth-name').style.display = isUp ? 'block' : 'none';
                document.getElementById('ps-auth-submit').textContent = isUp ? 'Create Account' : 'Sign In';
                document.getElementById('ps-auth-pass').autocomplete = isUp ? 'new-password' : 'current-password';
                const forgotEl = document.getElementById('ps-auth-forgot');
                if (forgotEl) forgotEl.style.display = isUp ? 'none' : 'block';
                document.getElementById('ps-auth-error').textContent = '';
            };
            window.psForgotPassword = async function (e) {
                e.preventDefault();
                const email = document.getElementById('ps-auth-email').value.trim();
                const errEl = document.getElementById('ps-auth-error');
                if (!email) {
                    errEl.style.color = '#e11d48';
                    errEl.textContent = 'Please enter your email address first.';
                    return;
                }
                errEl.textContent = '';
                try {
                    await auth.sendPasswordResetEmail(email);
                    errEl.style.color = '#15803d'; // Green for success
                    errEl.textContent = 'Password reset email sent. Check your inbox.';
                    setTimeout(() => errEl.style.color = '#e11d48', 5000); // Reset color
                } catch (err) {
                    errEl.style.color = '#e11d48';
                    errEl.textContent = (err.message || '').replace('Firebase: ', '').replace(/ \(auth\/[^)]+\)/, '');
                }
            };

            window.psSubmitAuth = async function () {
                const email = document.getElementById('ps-auth-email').value.trim();
                const pass = document.getElementById('ps-auth-pass').value;
                const name = document.getElementById('ps-auth-name').value.trim();
                const isUp = document.getElementById('ps-tab-up').classList.contains('active');
                const errEl = document.getElementById('ps-auth-error');
                errEl.textContent = '';
                try {
                    if (isUp) {
                        const cred = await auth.createUserWithEmailAndPassword(email, pass);
                        if (name) await cred.user.updateProfile({ displayName: name });
                        await db.collection('users').doc(cred.user.uid).set({
                            email, displayName: name || '', createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        }, { merge: true });
                    } else {
                        await auth.signInWithEmailAndPassword(email, pass);
                    }
                    psCloseModal();
                } catch (e) {
                    errEl.textContent = (e.message || '').replace('Firebase: ', '').replace(/ \(auth\/[^)]+\)/, '');
                }
            };
            // NOTE: signInWithPopup is blocked in MV3 Side Panels.
            // Phase 2.4: replaced with chrome.identity + Cloud Function bridge.
            // The Cloud Function (chromeAuthToken) verifies the Google token and
            // returns a Firebase custom token. See checklist task 3.4 for setup.
            window.psGoogleSignIn = async function () {
                const errEl = document.getElementById('ps-auth-error');
                try {
                    const googleToken = await new Promise((resolve, reject) => {
                        chrome.identity.getAuthToken({ interactive: true }, token => {
                            if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
                            else resolve(token);
                        });
                    });
                    // Exchange Google OAuth token for Firebase custom token via Cloud Function
                    const fnRes = await fetch(
                        'https://us-central1-pride-scout-26f4e.cloudfunctions.net/chromeAuthToken',
                        { method: 'POST', headers: { Authorization: `Bearer ${googleToken}` } }
                    );
                    if (!fnRes.ok) throw new Error('Auth bridge error: ' + fnRes.status);
                    const { customToken } = await fnRes.json();
                    const { signInWithCustomToken } = await import('firebase/auth');
                    const cred = await signInWithCustomToken(auth, customToken);
                    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
                    await setDoc(doc(db, 'users', cred.user.uid), {
                        email: cred.user.email, displayName: cred.user.displayName || '',
                        createdAt: serverTimestamp()
                    }, { merge: true });
                    psCloseModal();
                } catch (e) {
                    if (errEl) errEl.textContent = e.message || 'Sign-in failed';
                }
            };
            window.psSignOut = async function () {
                await auth.signOut();
                document.getElementById('ps-user-dropdown')?.classList.remove('open');
            };

            // Save Trip
            window.psSaveTrip = async function (dest, dep, ds, de, btnEl) {
                if (!currentUser) { psOpenModal('Sign in to save trips!'); return; }
                const key = [dest, dep, ds, de].join('|');
                if (savedTripIds.has(key)) return;
                const docRef = await db.collection('users').doc(currentUser.uid).collection('trips').add({
                    destination: dest, departure: dep, dateStart: ds, dateEnd: de,
                    tripKey: key, savedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    confirmed: false, bookmarks: []
                });
                savedTripIds.add(key);
                savedTripDocIds.set(key, docRef.id);
                if (btnEl) { btnEl.classList.add('saved'); btnEl.innerHTML = '&#10003; Saved!'; }
            };

            // Confirm Trip
            window.psConfirmTrip = async function (docId, tripKey, btnEl) {
                if (!currentUser) { psOpenModal('Sign in to confirm trips!'); return; }
                try {
                    await db.collection('users').doc(currentUser.uid).collection('trips').doc(docId).update({
                        confirmed: true,
                        confirmedAt: firebase.firestore.FieldValue.serverTimestamp(),
                        confirmedByUser: currentUser.uid
                    });
                    if (btnEl) {
                        btnEl.classList.add('confirmed');
                        btnEl.innerHTML = '✓ Confirmed';
                        btnEl.disabled = true;
                    }
                    psLoadTrips();
                } catch (err) {
                    console.error('Error confirming trip:', err);
                    psOpenModal('Error confirming trip. Please try again.');
                }
            };

            // Unconfirm Trip
            window.psUnconfirmTrip = async function (docId, tripKey, btnEl) {
                if (!currentUser) { psOpenModal('Sign in to unconfirm trips!'); return; }
                try {
                    await db.collection('users').doc(currentUser.uid).collection('trips').doc(docId).update({
                        confirmed: false,
                        confirmedAt: firebase.firestore.FieldValue.delete(),
                        confirmedByUser: firebase.firestore.FieldValue.delete()
                    });
                    if (btnEl) {
                        btnEl.classList.remove('confirmed');
                        btnEl.innerHTML = 'Confirm Trip';
                        btnEl.disabled = false;
                    }
                    psLoadTrips();
                } catch (err) {
                    console.error('Error unconfirming trip:', err);
                    psOpenModal('Error unconfirming trip. Please try again.');
                }
            };

            window.psBookmarkPlace = async function (placeName, placeType, dest, dep, ds, de, btnEl) {
                if (!currentUser) { psOpenModal('Sign in to save bookmarks!'); return; }
                const key = [dest, dep, ds, de].join('|');

                let docId = savedTripDocIds.get(key);
                if (!docId) {
                    const docRef = await db.collection('users').doc(currentUser.uid).collection('trips').add({
                        destination: dest, departure: dep, dateStart: ds, dateEnd: de,
                        tripKey: key, savedAt: firebase.firestore.FieldValue.serverTimestamp(),
                        bookmarks: []
                    });
                    savedTripIds.add(key);
                    savedTripDocIds.set(key, docRef.id);
                    docId = docRef.id;
                    refreshSaveButtons();
                }

                const initials = getUserInitials(currentUser);
                const updateObj = { bookmarks: firebase.firestore.FieldValue.arrayUnion({ name: placeName, type: placeType, addedBy: initials }) };

                const tSnap = await db.collection('users').doc(currentUser.uid).collection('trips').doc(docId).get();
                if (tSnap.exists && tSnap.data().shareId) {
                    try { await db.collection('shared_trips').doc(tSnap.data().shareId).set(updateObj, { merge: true }); }
                    catch (e) { console.error(e); }
                }

                await db.collection('users').doc(currentUser.uid).collection('trips').doc(docId).set(updateObj, { merge: true });

                if (btnEl) {
                    btnEl.innerHTML = '<span class="material-symbols-outlined text-[14px]">bookmark_added</span>';
                    btnEl.classList.add('text-pride-green');
                    btnEl.classList.remove('text-slate-400');
                    btnEl.classList.remove('hover:bg-slate-200');
                    btnEl.disabled = true;
                    if (btnEl.title) btnEl.title = 'Saved to trip';
                }
            };

            window.psAddNote = async function (docId, inputId) {
                if (!currentUser) return;
                const inputEl = document.getElementById(inputId);
                if (!inputEl) return;
                const noteText = inputEl.value.trim();
                if (!noteText) return;

                const initials = getUserInitials(currentUser);
                const newNote = {
                    text: noteText,
                    addedAt: Date.now(),
                    addedBy: initials
                };

                const updateObj = { notes: firebase.firestore.FieldValue.arrayUnion(newNote) };

                const tSnap = await db.collection('users').doc(currentUser.uid).collection('trips').doc(docId).get();
                if (tSnap.exists && tSnap.data().shareId) {
                    try { await db.collection('shared_trips').doc(tSnap.data().shareId).set(updateObj, { merge: true }); }
                    catch (e) { console.error(e); }
                }

                await db.collection('users').doc(currentUser.uid).collection('trips').doc(docId).set(updateObj, { merge: true });

                inputEl.value = '';
                psLoadTrips();
            };

            window.psSaveBookingInfo = async function (docId, type, inputId) {
                if (!currentUser) return;
                const inputEl = document.getElementById(inputId);
                if (!inputEl) return;
                const val = inputEl.value.trim();
                if (!val) return;

                const initials = getUserInitials(currentUser);
                const userDisplayName = currentUser.displayName || currentUser.email || 'User';
                const newBookingEntry = { user: userDisplayName, initials: initials, info: val, addedAt: Date.now() };

                const fieldName = `bookingInfo_${type}`;

                // First, remove any existing entry from this user
                const tSnap = await db.collection('users').doc(currentUser.uid).collection('trips').doc(docId).get();
                const tripData = tSnap.data() || {};
                let bookingArray = tripData[fieldName] || [];

                // If it's a string (old format), convert to array
                if (typeof bookingArray === 'string') {
                    bookingArray = [{ user: 'Unknown', initials: '?', info: bookingArray, addedAt: Date.now() }];
                }

                // Remove old entry from current user if exists
                bookingArray = bookingArray.filter(b => b.initials !== initials);

                // Add new entry
                bookingArray.push(newBookingEntry);

                const updateObj = {};
                updateObj[fieldName] = bookingArray;

                const sharedTSnap = await db.collection('users').doc(currentUser.uid).collection('trips').doc(docId).get();
                if (sharedTSnap.exists && sharedTSnap.data().shareId) {
                    try { await db.collection('shared_trips').doc(sharedTSnap.data().shareId).set(updateObj, { merge: true }); }
                    catch (e) { console.error(e); }
                }

                await db.collection('users').doc(currentUser.uid).collection('trips').doc(docId).set(updateObj, { merge: true });

                inputEl.value = '';
                const oldBtnHTML = inputEl.nextElementSibling.innerHTML;
                inputEl.nextElementSibling.innerHTML = '&#10003;';
                inputEl.nextElementSibling.style.background = '#10b981';
                inputEl.nextElementSibling.style.color = '#fff';
                setTimeout(() => {
                    inputEl.nextElementSibling.innerHTML = oldBtnHTML;
                    inputEl.nextElementSibling.style.background = '#eee';
                    inputEl.nextElementSibling.style.color = '#333';
                    psLoadTrips();
                }, 1000);
            };

            window.psDeleteBookingInfo = async function (docId, type, bookingObjStr) {
                if (!currentUser) return;
                try {
                    const bookingObj = JSON.parse(decodeURIComponent(bookingObjStr));
                    const fieldName = `bookingInfo_${type}`;
                    const updateObj = {};
                    updateObj[fieldName] = firebase.firestore.FieldValue.arrayRemove(bookingObj);

                    const tSnap = await db.collection('users').doc(currentUser.uid).collection('trips').doc(docId).get();
                    if (tSnap.exists && tSnap.data().shareId) {
                        try { await db.collection('shared_trips').doc(tSnap.data().shareId).update(updateObj); }
                        catch (e) { console.error(e); }
                    }

                    await db.collection('users').doc(currentUser.uid).collection('trips').doc(docId).update(updateObj);
                    psLoadTrips();
                } catch (e) {
                    console.error("Error deleting booking info", e);
                }
            };

            window.psDeleteNote = async function (docId, noteObjStr) {
                if (!currentUser) return;
                try {
                    const noteObj = JSON.parse(decodeURIComponent(noteObjStr));
                    const updateObj = { notes: firebase.firestore.FieldValue.arrayRemove(noteObj) };

                    const tSnap = await db.collection('users').doc(currentUser.uid).collection('trips').doc(docId).get();
                    if (tSnap.exists && tSnap.data().shareId) {
                        try { await db.collection('shared_trips').doc(tSnap.data().shareId).update(updateObj); }
                        catch (e) { console.error(e); }
                    }

                    await db.collection('users').doc(currentUser.uid).collection('trips').doc(docId).update(updateObj);
                    psLoadTrips();
                } catch (e) {
                    console.error("Error deleting note", e);
                }
            };

            window.psDeleteBookmark = async function (docId, bookmarkObjStr) {
                if (!currentUser) return;
                try {
                    const bookmarkObj = JSON.parse(decodeURIComponent(bookmarkObjStr));
                    const updateObj = { bookmarks: firebase.firestore.FieldValue.arrayRemove(bookmarkObj) };

                    const tSnap = await db.collection('users').doc(currentUser.uid).collection('trips').doc(docId).get();
                    if (tSnap.exists && tSnap.data().shareId) {
                        try { await db.collection('shared_trips').doc(tSnap.data().shareId).update(updateObj); }
                        catch (e) { console.error(e); }
                    }

                    await db.collection('users').doc(currentUser.uid).collection('trips').doc(docId).update(updateObj);
                    psLoadTrips();
                } catch (e) {
                    console.error("Error deleting bookmark", e);
                }
            };

            window.psEmailTrip = async function (e, origin, dest, start, end, weather, lgbtqSafety) {
                e.preventDefault();
                const subject = `Trip Idea: ${dest} for Pride Travel`;
                const gFlights = `https://www.google.com/travel/flights?q=${encodeURIComponent(origin + ' to ' + dest + ' ' + start)}`;
                let body = `Hey,\n\nI found a great trip idea using OutAtlas!\n\nDestination: ${dest}\nDates: ${start} to ${end}\nFrom: ${origin}\n\nWeather: ${weather}\nLGBTQ Safety: ${lgbtqSafety}\n\nCheck out flights:\nGoogle Flights: ${gFlights}\n\n`;

                const key = [dest, origin, start, end].join('|');
                let bookmarksText = '';
                let notesText = '';

                if (currentUser && savedTripDocIds && savedTripDocIds.has(key)) {
                    const docId = savedTripDocIds.get(key);
                    try {
                        const doc = await db.collection('users').doc(currentUser.uid).collection('trips').doc(docId).get();
                        if (doc.exists) {
                            const t = doc.data();
                            let confirmationText = '';
                            if (t.confirmed) {
                                confirmationText = "Trip Status: ✓ Confirmed\n";
                                if (t.confirmedAt) {
                                    const confirmedDate = t.confirmedAt.toDate().toLocaleDateString();
                                    confirmationText += `Confirmed on: ${confirmedDate}\n`;
                                }
                                if (t.dateStart) {
                                    const countdown = calculateDaysUntilDeparture(t.dateStart);
                                    if (!countdown.isExpired) {
                                        confirmationText += `Departing in: ${countdown.days} days, ${countdown.hours} hours\n`;
                                    } else {
                                        confirmationText += `Trip has departed\n`;
                                    }
                                }
                                confirmationText += "\n";
                            } else {
                                confirmationText = "Trip Status: Not yet confirmed\n\n";
                            }
                            let bookingText = '';
                            if (t.bookingInfo_flight || t.bookingInfo_hotel || t.bookingInfo_tour) {
                                bookingText = "Booking Details:\n";
                                ['flight', 'hotel', 'tour'].forEach(type => {
                                    const fieldName = `bookingInfo_${type}`;
                                    let bookings = t[fieldName] || [];
                                    if (typeof bookings === 'string') {
                                        bookings = [{ user: 'User', initials: '?', info: bookings }];
                                    }
                                    if (bookings.length > 0) {
                                        bookingText += type.charAt(0).toUpperCase() + type.slice(1) + ": ";
                                        bookingText += bookings.map(b => `[${b.initials}] ${b.user}: ${b.info}`).join(", ") + "\n";
                                    }
                                });
                                bookingText += "\n";
                            }
                            if (t.bookmarks && t.bookmarks.length > 0) {
                                bookmarksText = "Bookmarked Places:\n" + t.bookmarks.map(b => `- ${b.name} (${b.type})`).join('\n') + "\n\n";
                            }
                            if (t.notes && t.notes.length > 0) {
                                notesText = "Notes:\n" + t.notes.map(n => `- ${n.text}`).join('\n') + "\n\n";
                            }
                            if (t.note) {
                                notesText += "Notes:\n" + t.note + "\n\n";
                            }
                        }
                        body += confirmationText + bookingText;
                    } catch (err) { console.error("Error fetching trip for email", err); }
                }

                body += bookmarksText + notesText + `Sent from OutAtlas`;
                window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            };

            window.psDownloadTrip = async function (origin, dest, start, end) {
                const key = [dest, origin, start, end].join('|');
                let lines = [];
                lines.push('OutAtlas - Trip Details');
                lines.push('==================================');
                lines.push('');
                lines.push('Destination: ' + dest);
                lines.push('Departure From: ' + origin);
                lines.push('Dates: ' + start + ' to ' + end);
                lines.push('');

                if (currentUser && savedTripDocIds && savedTripDocIds.has(key)) {
                    const docId = savedTripDocIds.get(key);
                    try {
                        const doc = await db.collection('users').doc(currentUser.uid).collection('trips').doc(docId).get();
                        if (doc.exists) {
                            const t = doc.data();
                            if (t.confirmed) {
                                lines.push('Trip Status: ✓ Confirmed');
                                if (t.confirmedAt) {
                                    const confirmedDate = t.confirmedAt.toDate().toLocaleDateString();
                                    lines.push('Confirmed on: ' + confirmedDate);
                                }
                                if (t.dateStart) {
                                    const countdown = calculateDaysUntilDeparture(t.dateStart);
                                    if (!countdown.isExpired) {
                                        lines.push('Departing in: ' + countdown.days + ' days, ' + countdown.hours + ' hours');
                                    } else {
                                        lines.push('Trip has departed');
                                    }
                                }
                            } else {
                                lines.push('Trip Status: Not yet confirmed');
                            }
                            lines.push('');
                            if (t.bookingInfo_flight || t.bookingInfo_hotel || t.bookingInfo_tour) {
                                lines.push('Booking Details:');
                                ['flight', 'hotel', 'tour'].forEach(type => {
                                    const fieldName = `bookingInfo_${type}`;
                                    let bookings = t[fieldName] || [];
                                    // Handle backward compatibility - convert string to array
                                    if (typeof bookings === 'string') {
                                        bookings = [{ user: 'User', initials: '?', info: bookings }];
                                    }
                                    if (bookings.length > 0) {
                                        lines.push('  ' + type.charAt(0).toUpperCase() + type.slice(1) + ':');
                                        bookings.forEach(b => {
                                            lines.push('    - [' + (b.initials || '?') + '] ' + (b.user || 'User') + ': ' + (b.info || ''));
                                        });
                                    }
                                });
                                lines.push('');
                            }
                            if (t.bookmarks && t.bookmarks.length > 0) {
                                lines.push('Bookmarked Places:');
                                t.bookmarks.forEach(b => lines.push('  - ' + b.name + ' (' + b.type + ')'));
                                lines.push('');
                            }
                            if (t.notes && t.notes.length > 0) {
                                lines.push('Notes:');
                                t.notes.forEach(n => lines.push('  - ' + n.text));
                                lines.push('');
                            }
                        }
                    } catch (err) { console.error('Error fetching trip for download', err); }
                }

                lines.push('Generated by OutAtlas - TravelinPride.com');

                const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
                const blobUrl = URL.createObjectURL(blob);
                const filename = 'outatlas-trip-' + dest.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.txt';
                // Use chrome.downloads API (required in MV3 Side Panel — <a download> is blocked)
                chrome.downloads.download({ url: blobUrl, filename }, () => {
                    URL.revokeObjectURL(blobUrl);
                });
            };

            window.psTripMap = async function(docId) {
                if (!currentUser) { psOpenModal('Sign in to use Trip Map!'); return; }
                try {
                    const snap = await db.collection('users').doc(currentUser.uid).collection('trips').doc(docId).get();
                    if (!snap.exists) { alert('Trip not found.'); return; }
                    const t = snap.data();
                    const destination = t.destination || '';
                    if (!t.bookmarks || t.bookmarks.length === 0) {
                        window.open('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(destination), '_blank');
                        return;
                    }
                    // Up to 3 hotels always included first
                    const hotels = t.bookmarks.filter(b => (b.type || '') === 'Hotel').slice(0, 3);
                    // Guarantee one representative from each category when over 10 bookmarks
                    const guaranteedTypes = ['Shopping', 'Dining', 'Nightlife', 'Beach', 'Community'];
                    const usedNames = new Set(hotels.map(b => b.name));
                    const guaranteed = [];
                    guaranteedTypes.forEach(cat => {
                        const match = t.bookmarks.find(b => b.type === cat && !usedNames.has(b.name));
                        if (match) { guaranteed.push(match); usedNames.add(match.name); }
                    });
                    // Fill any remaining slots (cap total at 10) with leftover bookmarks
                    const remainingSlots = Math.max(0, 10 - hotels.length - guaranteed.length);
                    const overflow = t.bookmarks.filter(b => !usedNames.has(b.name) && (b.type || '') !== 'Publication');
                    const stops = [...hotels, ...guaranteed, ...overflow.slice(0, remainingSlots)];
                    if (stops.length === 1) {
                        window.open('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(stops[0].name + ', ' + destination), '_blank');
                        return;
                    }
                    if (hotels.length > 0) {
                        // First hotel is the explicit origin; remaining stops are waypoints + destination
                        const enc = s => encodeURIComponent(s.name + ', ' + destination);
                        const origin = enc(stops[0]);
                        const dest   = enc(stops[stops.length - 1]);
                        const middle = stops.slice(1, -1);
                        let url = 'https://www.google.com/maps/dir/?api=1&origin=' + origin + '&destination=' + dest;
                        if (middle.length > 0) url += '&waypoints=' + middle.map(enc).join('|');
                        window.open(url, '_blank');
                    } else {
                        const parts = stops.map(s => encodeURIComponent(s.name + ', ' + destination));
                        window.open('https://www.google.com/maps/dir/' + parts.join('/') + '/', '_blank');
                    }
                } catch (err) {
                    console.error('psTripMap error', err);
                    alert('Could not open Trip Map. Please try again.');
                }
            };

            window.psSmsTrip = async function (e, origin, dest, start, end, weather, lgbtqSafety) {
                e.preventDefault();
                const gFlights = `https://www.google.com/travel/flights?q=${encodeURIComponent(origin + ' to ' + dest + ' ' + start)}`;
                let body = `Trip Idea from OutAtlas!\n\nDestination: ${dest}\nDates: ${start} to ${end}\nFrom: ${origin}\n\nWeather: ${weather}\nLGBTQ Safety: ${lgbtqSafety}\n\nGoogle Flights: ${gFlights}\n\n`;

                const key = [dest, origin, start, end].join('|');
                let bookingText = '';
                let bookmarksText = '';
                let notesText = '';

                if (currentUser && savedTripDocIds && savedTripDocIds.has(key)) {
                    const docId = savedTripDocIds.get(key);
                    try {
                        const doc = await db.collection('users').doc(currentUser.uid).collection('trips').doc(docId).get();
                        if (doc.exists) {
                            const t = doc.data();
                            if (t.bookingInfo_flight || t.bookingInfo_hotel || t.bookingInfo_tour) {
                                bookingText = "Bookings: ";
                                ['flight', 'hotel', 'tour'].forEach(type => {
                                    const fieldName = `bookingInfo_${type}`;
                                    let bookings = t[fieldName] || [];
                                    if (typeof bookings === 'string') {
                                        bookings = [{ info: bookings }];
                                    }
                                    if (bookings.length > 0) {
                                        bookingText += type + ": " + bookings.map(b => b.info).join(", ") + " | ";
                                    }
                                });
                                bookingText += "\n\n";
                            }
                            if (t.bookmarks && t.bookmarks.length > 0) {
                                bookmarksText = "Bookmarks:\n" + t.bookmarks.map(b => `- ${b.name}`).join('\n') + "\n\n";
                            }
                            if (t.notes && t.notes.length > 0) {
                                notesText = "Notes:\n" + t.notes.map(n => `- ${n.text}`).join('\n') + "\n\n";
                            }
                            if (t.note) {
                                notesText += "Notes:\n" + t.note + "\n\n";
                            }
                        }
                    } catch (err) { console.error("Error fetching trip for SMS", err); }
                }

                body += bookingText + bookmarksText + notesText;

                // Detect iOS vs Android/Others for SMS link format
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
                const separator = isIOS ? '&' : '?';
                window.location.href = `sms:${separator}body=${encodeURIComponent(body)}`;
            };

            window.psShareTrip = async function (docId, tripKey) {
                if (!currentUser) return;
                try {
                    const docRef = db.collection('users').doc(currentUser.uid).collection('trips').doc(docId);
                    const docSnap = await docRef.get();
                    if (!docSnap.exists) return;
                    let t = docSnap.data();

                    let shareId = t.shareId;
                    if (!shareId) {
                        const sharedRef = await db.collection('shared_trips').add({
                            ...t,
                            sharedBy: currentUser.uid,
                            sharedAt: Date.now()
                        });
                        shareId = sharedRef.id;
                        await docRef.update({ shareId: shareId });
                    }

                    const shareUrl = window.location.href.split('?')[0] + '?shareId=' + shareId;
                    navigator.clipboard.writeText(shareUrl).then(() => {
                        alert("Trip is now Collaborative!\n\nCopied to clipboard!\nShare this link with friends so they can add notes and bookmarks:\n\n" + shareUrl);
                    }).catch(err => {
                        console.error('Failed to copy', err);
                        alert("Trip is now Collaborative!\nShare this link with friends so they can add notes and bookmarks:\n\n" + shareUrl);
                    });
                    psLoadTrips();
                } catch (e) {
                    console.error("Error sharing trip", e);
                    if (e.code === 'permission-denied') {
                        alert("Permission Denied: You need to update your Firebase Security Rules in the Firebase Console to allow access to the 'shared_trips' collection.");
                    } else {
                        alert("Error creating shared trip. Check console.");
                    }
                }
            };

            function refreshSaveButtons() {
                document.querySelectorAll('.ps-save-btn[data-trip-key]').forEach(btn => {
                    if (savedTripIds.has(btn.dataset.tripKey)) {
                        btn.classList.add('saved'); btn.innerHTML = '&#10003; Saved!';
                    } else {
                        btn.classList.remove('saved'); btn.innerHTML = '&#128278; Save Trip';
                    }
                });
            }

            // Trips panel
            window.psTripPanel = function (open) {
                document.getElementById('ps-trips-panel').classList[open ? 'add' : 'remove']('open');
                document.getElementById('ps-user-dropdown')?.classList.remove('open');
                if (open) psLoadTrips();
            };
            window.psCloseTripPanel = function (e) {
                if (e.target === document.getElementById('ps-trips-panel')) psTripPanel(false);
            };

            window.psOpenUpcomingTripsPanel = function () {
                document.getElementById('ps-upcoming-trips-panel').classList.add('open');
                document.getElementById('ps-user-dropdown')?.classList.remove('open');
                psLoadUpcomingTrips();
            };

            window.psCloseUpcomingTripsPanel = function (e) {
                const panel = document.getElementById('ps-upcoming-trips-panel');
                if (e && e.target === panel) {
                    panel.classList.remove('open', 'fullscreen');
                } else if (!e) {
                    panel.classList.remove('open', 'fullscreen');
                }
            };

            // Setup panel backdrop close on touch devices
            document.getElementById('ps-upcoming-trips-panel')?.addEventListener('click', function(e) {
                if (e.target === this) {
                    psCloseUpcomingTripsPanel();
                }
            });

            window.psToggleTripPanelFullscreen = function () {
                document.getElementById('ps-trips-panel').classList.toggle('fullscreen');
            };

            window.psToggleUpcomingTripsFullscreen = function () {
                document.getElementById('ps-upcoming-trips-panel').classList.toggle('fullscreen');
            };

            async function psLoadUpcomingTrips() {
                if (!currentUser) return;
                try {
                    const snap = await db.collection('users').doc(currentUser.uid)
                        .collection('trips').where('confirmed', '==', true).orderBy('dateStart', 'asc').get();

                    const leavingSoonContainer = document.getElementById('ps-leaving-soon-container');
                    const futureTripsContainer = document.getElementById('ps-future-trips-container');
                    const pastTripsContainer = document.getElementById('ps-past-trips-container');
                    const noTripsMsg = document.getElementById('ps-no-confirmed-trips');

                    leavingSoonContainer.innerHTML = '';
                    futureTripsContainer.innerHTML = '';
                    pastTripsContainer.innerHTML = '';

                    if (snap.empty) {
                        noTripsMsg.style.display = 'block';
                        document.getElementById('ps-leaving-soon-section').style.display = 'none';
                        document.getElementById('ps-future-trips-section').style.display = 'none';
                        document.getElementById('ps-past-trips-section').style.display = 'none';
                        return;
                    }

                    noTripsMsg.style.display = 'none';
                    let hasLeavingSoon = false, hasFutureTrips = false, hasPastTrips = false;

                    snap.docs.forEach(doc => {
                        const t = doc.data();
                        const { days, isExpired } = calculateDaysUntilDeparture(t.dateStart);
                        const countdownText = formatCountdown(t.dateStart);
                        const countdownColor = getCountdownColor(t.dateStart);

                        const tripCardHtml = `
                            <div style="background:white;border-radius:8px;padding:1rem;box-shadow:0 1px 3px rgba(0,0,0,0.1);border-left:4px solid #f20d8f;">
                                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.5rem;">
                                    <div style="font-weight:bold;font-size:.95rem;">${t.departure || '?'} → ${t.destination}</div>
                                    <button onclick="psDeleteTrip('${doc.id}','${t.tripKey}')" title="Remove" style="background:none;border:none;cursor:pointer;color:#e11d48;font-size:.9rem;">✕</button>
                                </div>
                                <div style="font-size:.8rem;color:#666;margin-bottom:.5rem;">📅 ${t.dateStart} to ${t.dateEnd}</div>
                                <div style="font-weight:bold;font-size:.9rem;${countdownColor};margin-bottom:.5rem;">${countdownText}</div>
                                <div style="display:flex;gap:.5rem;flex-wrap:wrap;">
                                    <button onclick="psReSearch('${t.destination}','${t.departure || ''}','${t.dateStart}','${t.dateEnd}')" style="font-size:.7rem;background:#f20d8f;color:#fff;border:none;border-radius:999px;padding:.25rem .5rem;cursor:pointer;">Search</button>
                                    <button onclick="psEmailTrip(event,'${t.departure || ''}','${t.destination}','${t.dateStart}','${t.dateEnd}','Varies','Varies')" style="font-size:.7rem;background:#e5e7eb;color:#374151;border:none;border-radius:999px;padding:.25rem .5rem;cursor:pointer;">Email</button>
                                </div>
                            </div>
                        `;

                        if (isExpired) {
                            hasPastTrips = true;
                            pastTripsContainer.innerHTML += tripCardHtml;
                        } else if (days <= 30) {
                            hasLeavingSoon = true;
                            leavingSoonContainer.innerHTML += tripCardHtml;
                        } else {
                            hasFutureTrips = true;
                            futureTripsContainer.innerHTML += tripCardHtml;
                        }
                    });

                    document.getElementById('ps-leaving-soon-section').style.display = hasLeavingSoon ? 'block' : 'none';
                    document.getElementById('ps-future-trips-section').style.display = hasFutureTrips ? 'block' : 'none';
                    document.getElementById('ps-past-trips-section').style.display = hasPastTrips ? 'block' : 'none';
                } catch (err) {
                    console.error('Error loading upcoming trips:', err);
                }
            }

            // Countdown auto-refresh timer
            let countdownRefreshInterval = null;
            function psStartCountdownRefresh() {
                if (countdownRefreshInterval) clearInterval(countdownRefreshInterval);
                countdownRefreshInterval = setInterval(() => {
                    psRefreshAllCountdowns();
                }, 60000); // Refresh every 60 seconds
            }

            function psStopCountdownRefresh() {
                if (countdownRefreshInterval) {
                    clearInterval(countdownRefreshInterval);
                    countdownRefreshInterval = null;
                }
            }

            function psRefreshAllCountdowns() {
                // Refresh countdowns in trip panel
                if (document.getElementById('ps-trips-panel').classList.contains('open')) {
                    psLoadTrips();
                }
                // Refresh countdowns in upcoming trips panel
                if (document.getElementById('ps-upcoming-trips-panel').classList.contains('open')) {
                    psLoadUpcomingTrips();
                }
            }

            async function psLoadTrips() {
                if (!currentUser) return;
                const list = document.getElementById('ps-trips-list');
                list.innerHTML = '<p style="color:#aaa;text-align:center;padding:1rem;">Loading...</p>';
                try {
                    const snap = await db.collection('users').doc(currentUser.uid)
                        .collection('trips').orderBy('savedAt', 'desc').get();
                    if (snap.empty) {
                        list.innerHTML = '<p style="color:#aaa;font-size:.9rem;text-align:center;padding:2rem 0;">No saved trips yet.</p>';
                        return;
                    }
                    const HTMLs = await Promise.all(snap.docs.map(async doc => {
                        const t = doc.data();

                        if (t.shareId) {
                            try {
                                const sharedSnap = await db.collection('shared_trips').doc(t.shareId).get();
                                if (sharedSnap.exists) {
                                    const st = sharedSnap.data();
                                    t.notes = st.notes || t.notes || [];
                                    t.bookmarks = st.bookmarks || t.bookmarks || [];
                                    // For booking info, merge arrays from shared and personal trips
                                    ['flight', 'hotel', 'tour'].forEach(type => {
                                        const fieldName = `bookingInfo_${type}`;
                                        let sharedBookings = st[fieldName] || [];
                                        let personalBookings = t[fieldName] || [];

                                        // Handle backward compatibility - convert strings to arrays
                                        if (typeof sharedBookings === 'string') {
                                            sharedBookings = [{ user: 'User', initials: '?', info: sharedBookings }];
                                        }
                                        if (typeof personalBookings === 'string') {
                                            personalBookings = [{ user: 'User', initials: '?', info: personalBookings }];
                                        }

                                        // Merge arrays - shared data takes precedence
                                        if (Array.isArray(sharedBookings) && sharedBookings.length > 0) {
                                            t[fieldName] = sharedBookings;
                                        } else if (Array.isArray(personalBookings) && personalBookings.length > 0) {
                                            t[fieldName] = personalBookings;
                                        }
                                    });
                                }
                            } catch (e) { console.error("Could not fetch shared contents", e); }
                        }

                        const dateStr = (t.dateStart && t.dateEnd) ? t.dateStart + ' to ' + t.dateEnd : '';
                        let bookmarksHtml = '';
                        if (t.bookmarks && t.bookmarks.length > 0) {
                            bookmarksHtml = '<div class="ps-trip-section" style="margin-top:.5rem; font-size:.9rem; background:rgba(0,0,0,0.02); padding:.6rem; border-radius:6px;">' +
                                '<div style="font-weight:bold; margin-bottom:.4rem; color:#f20d8f; display:flex; align-items:center; gap:4px; font-size:.95rem;">' +
                                '<span class="material-symbols-outlined" style="font-size:18px;">bookmarks</span> Bookmarked Places</div>' +
                                '<ul class="ps-trip-item-text" style="list-style:none; padding:0; margin:0; color:#444; display:flex; flex-direction:column; gap:.5rem;">' +
                                t.bookmarks.map(b => {
                                    const bookmarkObjStr = encodeURIComponent(JSON.stringify(b));
                                    return '<li class="ps-trip-item" style="display:flex; justify-content:space-between; align-items:center; gap:.5rem; background:#fff; padding:.5rem .6rem; border-radius:6px; border:1px solid #ddd; min-height:2.5rem;">' +
                                        '<div style="flex:1; word-break:break-word;">' +
                                        '<div style="display:flex; align-items:center; gap:.5rem; flex-wrap:wrap; margin-bottom:.3rem;"><strong style="font-size:.95rem;">' + b.name + '</strong>' + (b.addedBy ? '<span style="font-size:.75rem; color:#fff; background:linear-gradient(90deg,#f20d8f,#86007D); padding:3px 7px; border-radius:99px; font-weight:bold; white-space:nowrap;">' + b.addedBy + '</span>' : '') + '</div>' +
                                        '<div style="display:flex; align-items:center; gap:.4rem; font-weight:600; font-size:.85rem;"><span style="color:#f20d8f; background:#f20d8f20; padding:4px 8px; border-radius:4px; white-space:nowrap;">' + b.type + '</span></div>' +
                                        '</div>' +
                                        '<a href="https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(b.name + ', ' + (t.destination || '')) + '" target="_blank" rel="noopener" title="View on Google Maps" style="color:#1a73e8; display:flex; align-items:center; text-decoration:none; margin-left:.3rem; opacity:0.65; transition:opacity 0.2s; flex-shrink:0;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.65">' +
                                        '<span class="material-symbols-outlined" style="font-size:18px;">location_on</span></a>' +
                                        '<button onclick="psDeleteBookmark(\'' + doc.id + '\', \'' + bookmarkObjStr + '\')" title="Delete Bookmark" style="background:none; border:none; color:#e11d48; cursor:pointer; padding:0; margin-left:.3rem; opacity:0.6; transition:opacity 0.2s; flex-shrink:0;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.6">' +
                                        '<span class="material-symbols-outlined" style="font-size:20px;">delete</span></button>' +
                                        '</li>';
                                }).join('') +
                                '</ul></div>';
                        }
                        let notesHtml = '';
                        if (t.notes && t.notes.length > 0) {
                            notesHtml = '<div class="ps-trip-section" style="margin-top:.5rem; font-size:.8rem; background:rgba(0,0,0,0.02); padding:.5rem; border-radius:6px;">' +
                                '<div style="font-weight:bold; margin-bottom:.4rem; color:#f20d8f; display:flex; align-items:center; gap:4px;">' +
                                '<span class="material-symbols-outlined" style="font-size:14px;">notes</span> Saved Notes</div>' +
                                '<ul class="ps-trip-item-text" style="list-style:none; padding:0; margin:0; color:#444;">' +
                                t.notes.map(n => {
                                    const dateStr = new Date(n.addedAt).toLocaleDateString();
                                    const noteObjStr = encodeURIComponent(JSON.stringify(n));
                                    const addedByHtml = n.addedBy ? '<span style="font-size:.6rem; color:#fff; background:linear-gradient(90deg,#f20d8f,#86007D); padding:2px 5px; border-radius:99px; font-weight:bold;">' + n.addedBy + '</span>' : '';
                                    return '<li class="ps-trip-item" style="margin-bottom:.3rem; display:flex; justify-content:space-between; align-items:flex-start; gap:4px; background:#fff; padding:6px; border-radius:4px; border:1px solid #eee;">' +
                                        '<div style="flex:1; word-break:break-word;">' +
                                        '<div style="display:flex; align-items:center; gap:6px; margin-bottom:2px;"><span style="font-size:9px; font-weight:bold; text-transform:uppercase; color:#888;">' + dateStr + '</span>' + addedByHtml + '</div>' +
                                        '<span>' + n.text + '</span>' +
                                        '</div>' +
                                        '<button onclick="psDeleteNote(\'' + doc.id + '\', \'' + noteObjStr + '\')" title="Delete Note" style="background:none; border:none; color:#e11d48; cursor:pointer; padding:0; margin-left:4px; opacity:0.6; transition:opacity 0.2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.6">' +
                                        '<span class="material-symbols-outlined" style="font-size:16px;">delete</span></button>' +
                                        '</li>';
                                }).join('') +
                                '</ul></div>';
                        }

                        const confirmBtnClass = t.confirmed ? 'confirmed' : '';
                        const confirmBtnText = t.confirmed ? '✓ Confirmed' : 'Confirm Trip';
                        const confirmBtnDisabled = t.confirmed ? 'disabled' : '';
                        const countdownHtml = t.dateStart ? (
                            '<div style="margin-bottom:.4rem; padding:.4rem; background:linear-gradient(135deg, #f20d8f15, #86007d15); border-radius:6px; border-left:3px solid #f20d8f;">' +
                            '<div style="font-weight:bold; font-size:.85rem; ' + getCountdownColor(t.dateStart) + ';">' + formatCountdown(t.dateStart) + '</div>' +
                            (t.confirmed && t.confirmedAt ? '<div style="font-size:.75rem; color:#666; margin-top:.2rem;">Confirmed</div>' : '') +
                            '</div>'
                        ) : '';

                        return '<div class="ps-trip-card" style="flex-direction:column; align-items:stretch; gap:.5rem;">'
                            + '<div style="display:flex; justify-content:space-between; align-items:flex-start;">'
                            + '<div style="flex:1;">'
                            + '<div class="ps-trip-title" style="font-weight:800;font-size:.95rem;margin-bottom:.2rem;color:#000;">' + (t.shareId ? '<span class="material-symbols-outlined" style="font-size:1rem;color:#f20d8f;margin-right:4px;">group</span>' : '&#9992;&#65039; ')
                            + (t.departure || '?') + ' &#8594; ' + t.destination + '</div>'
                            + (dateStr ? '<div class="ps-trip-date" style="font-size:.8rem;color:#333;margin-bottom:.4rem;">&#128197; ' + dateStr + '</div>' : '')
                            + countdownHtml
                            + '<button class="ps-confirm-btn ' + confirmBtnClass + '" onclick="psConfirmTrip(\'' + doc.id + '\',\'' + t.tripKey + '\',this)" ' + confirmBtnDisabled + ' style="font-size:.75rem;font-weight:700;background:linear-gradient(90deg,#f20d8f,#86007D);color:#fff;border:none;border-radius:999px;padding:.3rem .75rem;cursor:pointer;font-family:inherit;margin-right:.5rem;' + (t.confirmed ? 'opacity:0.7;' : '') + '">'
                            + confirmBtnText + '</button>'
                            + '<button onclick="psReSearch(\'' + t.destination + '\',\'' + (t.departure || '') + '\',\'' + (t.dateStart || '') + '\',\'' + (t.dateEnd || '') + '\')"'
                            + ' style="font-size:.75rem;font-weight:700;background:linear-gradient(90deg,#f20d8f,#86007D);color:#fff;border:none;border-radius:999px;padding:.3rem .75rem;cursor:pointer;font-family:inherit;margin-right:.5rem;">'
                            + '&#128269; Search Again</button>'
                            + '<button onclick="psEmailTrip(event, \'' + (t.departure || '') + '\', \'' + t.destination + '\', \'' + (t.dateStart || '') + '\', \'' + (t.dateEnd || '') + '\', \'Varies\', \'Varies\')"'
                            + ' class="ps-trip-btn-secondary" style="font-size:.75rem;font-weight:700;background:#e5e7eb;color:#374151;border:none;border-radius:999px;padding:.3rem .75rem;cursor:pointer;font-family:inherit;margin-right:.5rem;">'
                            + '&#x1F4E7; Email</button>'
                            + '<button onclick="psSmsTrip(event, \'' + (t.departure || '') + '\', \'' + t.destination + '\', \'' + (t.dateStart || '') + '\', \'' + (t.dateEnd || '') + '\', \'Varies\', \'Varies\')"'
                            + ' class="ps-trip-btn-secondary" style="font-size:.75rem;font-weight:700;background:#e5e7eb;color:#374151;border:none;border-radius:999px;padding:.3rem .75rem;cursor:pointer;font-family:inherit;margin-right:.5rem;">'
                            + '&#128241; Text</button>'
                            + '<button onclick="psShareTrip(\'' + doc.id + '\', \'' + t.tripKey + '\')"'
                            + ' class="ps-trip-btn-secondary" style="font-size:.75rem;font-weight:700;background:#e5e7eb;color:#374151;border:none;border-radius:999px;padding:.3rem .75rem;cursor:pointer;font-family:inherit;margin-right:.5rem;">'
                            + '&#128101; Collaborate</button>'
                            + '<button onclick="psDownloadTrip(\'' + (t.departure || '') + '\', \'' + t.destination + '\', \'' + (t.dateStart || '') + '\', \'' + (t.dateEnd || '') + '\')"'
                            + ' class="ps-trip-btn-secondary" style="font-size:.75rem;font-weight:700;background:#e5e7eb;color:#374151;border:none;border-radius:999px;padding:.3rem .75rem;cursor:pointer;font-family:inherit;margin-right:.5rem;">'
                            + '&#11015;&#65039; Download</button>'
                            + '<button onclick="psTripMap(\'' + doc.id + '\')"'
                            + ' class="ps-trip-btn-secondary" style="font-size:.75rem;font-weight:700;background:#1a73e8;color:#fff;border:none;border-radius:999px;padding:.3rem .75rem;cursor:pointer;font-family:inherit;">'
                            + '&#x1F5FA;&#xFE0F; Trip Map</button>'
                            + '</div>'
                            + '<button onclick="psDeleteTrip(\'' + doc.id + '\',\'' + t.tripKey + '\')" title="Remove" style="background:none;border:none;cursor:pointer;color:#e11d48;font-size:1.1rem;">&#128465;&#65039;</button>'
                            + '</div>'
                            + bookmarksHtml
                            + notesHtml
                            + (() => {
                                const bookingTypes = ['flight', 'hotel', 'tour'];
                                const bookingIcons = { flight: 'flight_takeoff', hotel: 'hotel', tour: 'explore' };
                                let bookingHtml = '<div class="ps-trip-section" style="margin-top:.5rem; font-size:.8rem; background:rgba(0,0,0,0.02); padding:.5rem; border-radius:6px;">' +
                                    '<div style="font-weight:bold; margin-bottom:.4rem; color:#f20d8f; display:flex; align-items:center; gap:4px;">' +
                                    '<span class="material-symbols-outlined" style="font-size:14px;">airplane_ticket</span> Booking Details</div>';

                                bookingTypes.forEach(type => {
                                    const fieldName = `bookingInfo_${type}`;
                                    let bookings = t[fieldName] || [];

                                    // Handle backward compatibility - convert string to array
                                    if (typeof bookings === 'string') {
                                        bookings = [{ user: 'Unknown', initials: '?', info: bookings, addedAt: Date.now() }];
                                    }

                                    const currentUserInitials = currentUser ? getUserInitials(currentUser) : '';
                                    const userHasBooking = bookings.some(b => b.initials === currentUserInitials);

                                    bookingHtml += '<div style="margin-bottom:.8rem;">' +
                                        '<div style="display:flex; align-items:center; gap:6px; margin-bottom:.3rem;">' +
                                        '<span class="material-symbols-outlined" style="font-size:16px; color:#555;">' + bookingIcons[type] + '</span>' +
                                        '<span style="font-weight:bold; text-transform:capitalize;">' + type + '</span>' +
                                        '</div>';

                                    // Show existing bookings from all users
                                    if (bookings.length > 0) {
                                        bookingHtml += '<ul class="ps-trip-item-text" style="list-style:none; padding:0; margin:0 0 .4rem 0; color:#444;">';
                                        bookings.forEach(b => {
                                            const bookingObjStr = encodeURIComponent(JSON.stringify(b));
                                            const dateStr = b.addedAt ? new Date(b.addedAt).toLocaleDateString() : '';
                                            const canDelete = currentUser && b.initials === currentUserInitials;
                                            bookingHtml += '<li class="ps-trip-item" style="margin-bottom:.2rem; display:flex; justify-content:space-between; align-items:flex-start; gap:4px; background:#fff; padding:6px; border-radius:4px; border:1px solid #eee;">' +
                                                '<div style="flex:1; word-break:break-word;">' +
                                                '<div style="display:flex; align-items:center; gap:6px; margin-bottom:2px;"><span style="font-size:.6rem; color:#fff; background:linear-gradient(90deg,#f20d8f,#86007D); padding:2px 5px; border-radius:99px; font-weight:bold;">' + b.initials + '</span><span style="font-size:.7rem; color:#888;">' + b.user + '</span>' + (dateStr ? '<span style="font-size:.65rem; color:#999;">' + dateStr + '</span>' : '') + '</div>' +
                                                '<span>' + b.info + '</span>' +
                                                '</div>' +
                                                (canDelete ? '<button onclick="psDeleteBookingInfo(\'' + doc.id + '\', \'' + type + '\', \'' + bookingObjStr + '\')" title="Delete Booking" style="background:none; border:none; color:#e11d48; cursor:pointer; padding:0; margin-left:4px; opacity:0.6; transition:opacity 0.2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.6;"><span class="material-symbols-outlined" style="font-size:16px;">delete</span></button>' : '') +
                                                '</li>';
                                        });
                                        bookingHtml += '</ul>';
                                    }

                                    // Show input for current user if they haven't added their booking yet
                                    if (currentUser && !userHasBooking) {
                                        bookingHtml += '<div style="display:flex; align-items:center; gap:6px;">' +
                                            '<input type="text" id="booking-' + type + '-' + doc.id + '" placeholder="Add your ' + type + ' details..." class="ps-trip-input" style="flex:1; border:1px solid #ccc; border-radius:4px; padding:.3rem .5rem; font-size:.75rem; font-family:inherit; outline:none; color:#333;">' +
                                            '<button onclick="psSaveBookingInfo(\'' + doc.id + '\', \'' + type + '\', \'booking-' + type + '-' + doc.id + '\')" class="ps-trip-btn-secondary" style="background:#eee;color:#333;border:none;border-radius:4px;padding:.3rem .5rem;font-size:.7rem;font-weight:bold;cursor:pointer;">Save</button>' +
                                            '</div>';
                                    }

                                    bookingHtml += '</div>';
                                });

                                bookingHtml += '</div>';
                                return bookingHtml;
                            })()
                            + '<div style="margin-top:.5rem; display:flex; gap:6px;">'
                            + '<input type="text" id="note-input-' + doc.id + '" placeholder="e.g. Meet friends at 8PM" '
                            + 'class="ps-trip-input" style="flex:1; border:1px solid #ccc; border-radius:6px; padding:.4rem .6rem; font-size:.8rem; font-family:inherit; outline:none; color:#333; box-sizing:border-box;">'
                            + '<button onclick="psAddNote(\'' + doc.id + '\', \'note-input-' + doc.id + '\')" '
                            + 'style="background:linear-gradient(90deg,#f20d8f,#86007D);color:#fff;border:none;border-radius:6px;padding:.4rem .75rem;font-size:.8rem;font-weight:bold;cursor:pointer;font-family:inherit;">Save Note</button>'
                            + '</div>'
                            + '</div>';
                    }));
                    list.innerHTML = HTMLs.join('');
                } catch (e) { list.innerHTML = '<p style="color:#e11d48;font-size:.85rem;text-align:center;">Error loading trips.</p>'; }
            }
            window.psDeleteTrip = async function (docId, key) {
                await db.collection('users').doc(currentUser.uid).collection('trips').doc(docId).delete();
                savedTripIds.delete(key); refreshSaveButtons(); psLoadTrips();
            };
            window.psReSearch = function (dest, dep, ds, de) {
                psTripPanel(false);
                const get = id => document.getElementById(id);
                let searchDest = dest ? dest.split(',')[0].trim() : '';

                if (dest && typeof window.DATABASE !== 'undefined') {
                    const normalized = searchDest.toLowerCase();
                    if (window.DATABASE.mappings && window.DATABASE.mappings.cities && window.DATABASE.mappings.cities[normalized]) {
                        const codes = window.DATABASE.mappings.cities[normalized];
                        if (codes && codes.length > 0) {
                            searchDest = codes[0].toUpperCase();
                        }
                    } else if (window.DATABASE.details) {
                        const match = Object.values(window.DATABASE.details).find(d => d.name && (d.name === dest || d.name.toLowerCase().startsWith(normalized)));
                        if (match && match.iata) {
                            searchDest = match.iata;
                        }
                    }
                }

                if (get('destination')) get('destination').value = searchDest;
                if (get('departure') && dep) get('departure').value = dep;
                if (get('dateStart') && ds) get('dateStart').value = ds;
                if (get('dateEnd') && de) get('dateEnd').value = de;
                const form = get('searchForm');
                if (form) form.dispatchEvent(new Event('submit'));
            };

            // Called by result card rendering
            window.psMakeSaveBtn = function (dest, dep, ds, de) {
                const key = [dest, dep, ds, de].join('|');
                const saved = savedTripIds.has(key);
                return '<button class="ps-save-btn' + (saved ? ' saved' : '') + '" data-trip-key="' + key + '"'
                    + ' onclick="psSaveTrip(\'' + dest + '\',\'' + dep + '\',\'' + ds + '\',\'' + de + '\',this)">'
                    + (saved ? '&#10003; Saved!' : '&#128278; Save Trip') + '</button>';
            };

            renderUserBtn(null); // show Sign In immediately
        })();

// ── extracted script block ──────────────────────────────────────────────
// Data is now loaded via fetch in the loadDestinationsData function
        // (Call moved to end of main script block for correct initialization)

// ── extracted script block ──────────────────────────────────────────────
(function () {
            // Standalone mode IDs matching HTML
            const CONTAINER_ID = '';

            // --- DATE VALIDATION UTILITIES ---
            window.isPastDate = function (dateString) {
                if (!dateString) return false;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const checkDate = new Date(dateString + 'T00:00:00');
                return checkDate < today;
            };

            window.isPastEvent = function (event) {
                if (!event.end) return false;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const eventEnd = new Date(event.end + 'T00:00:00');
                return eventEnd < today;
            };

            // --- VIEW MANAGEMENT ---
            window.toggleView = function (viewId, navEl = null) {
                const views = document.querySelectorAll('.view-section');
                views.forEach(v => v.classList.remove('active'));
                const target = document.getElementById(viewId);
                if (target) {
                    target.classList.add('active');
                    window.scrollTo(0, 0);
                }

                // Update Bottom Nav state
                if (navEl) {
                    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('text-primary', 'active-nav'));
                    document.querySelectorAll('.nav-item').forEach(n => n.classList.add('text-slate-400 dark:text-slate-300'));
                    navEl.classList.remove('text-slate-400 dark:text-slate-300');
                    navEl.classList.add('text-primary', 'active-nav');
                }
            };

            window.showView = function (viewId) {
                toggleView(viewId);
            };

            window.quickSearch = function (cityName, start, end) {
                const destInput = document.getElementById('destination');
                const dateStartInput = document.getElementById('dateStart');
                const dateEndInput = document.getElementById('dateEnd');
                const departureInput = document.getElementById('departure');

                if (destInput) destInput.value = cityName;

                if (start && dateStartInput && dateEndInput) {
                    // Event logic: pre-fill suggested departure (event start - 1) and return (event end + 1)
                    // These are one-time defaults — changing departure afterward does NOT recalculate return
                    try {
                        const parts = start.split('-');
                        const sDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));

                        const endParts = (end || start).split('-');
                        const eDate = new Date(parseInt(endParts[0], 10), parseInt(endParts[1], 10) - 1, parseInt(endParts[2], 10));

                        // Suggest: 1 day before event start
                        sDate.setDate(sDate.getDate() - 1);
                        // Suggest: 1 day after event end
                        eDate.setDate(eDate.getDate() + 1);

                        const formatDate = (d) => {
                            const yyyy = d.getFullYear();
                            const mm = String(d.getMonth() + 1).padStart(2, '0');
                            const dd = String(d.getDate()).padStart(2, '0');
                            return `${yyyy}-${mm}-${dd}`;
                        };

                        dateStartInput.value = formatDate(sDate);
                        dateEndInput.value = formatDate(eDate);
                    } catch (e) {
                        console.error("QuickSearch date error", e);
                    }
                }

                // Always check if form is complete before searching
                const isComplete = departureInput?.value && dateStartInput?.value && dateEndInput?.value;
                if (isComplete) {
                    const searchForm = document.getElementById('searchForm');
                    if (searchForm) searchForm.dispatchEvent(new Event('submit'));
                } else {
                    // Not complete: go home so user can fill in missing fields
                    toggleView('homeView');
                    window.scrollTo(0, 0);
                    if (!departureInput?.value && departureInput) {
                        departureInput.focus();
                    } else if (destInput) {
                        destInput.focus();
                    }
                }
            };
            let DESTINATION_LINKS = {}; // Loaded from destinations.json
            window.DATABASE = { mappings: { regions: {}, countries: {}, cities: {} }, details: {} };
            let SPECIAL_EVENTS_DATA = [];
            let SAFE_HOTSPOTS_DATA = [];
            let _evtByType = {}; // keyed by type, populated in populateAllHotspots

            // === DESTINATIONS DATA LOADER ===
            // Load all destination data from destinations.json
            let _destinationsLoaded = false;

            async function loadDestinationsData() {
                if (_destinationsLoaded) return Promise.resolve();

                let data;
                if (window._DESTINATIONS_DATA) {
                    console.log('[OutAtlas] Using pre-loaded _DESTINATIONS_DATA');
                    data = window._DESTINATIONS_DATA;
                } else {
                    try {
                        console.log('[OutAtlas] Fetching destinations.json...');
                        const CDN_URL = 'https://out-atlas-extension.vercel.app/destinations.json';
                        let response;
                        try {
                            response = await fetch(CDN_URL, { signal: AbortSignal.timeout(5000) });
                        } catch (_) {
                            response = null;
                        }
                        if (!response || !response.ok) {
                            console.log('[OutAtlas] CDN unavailable, using bundled file');
                            response = await fetch(chrome.runtime.getURL('destinations.json'));
                        }
                        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                        data = await response.json();
                    } catch (error) {
                        console.error('[OutAtlas] Error loading data:', error);
                        // Show error UI if both fail
                        const hotspotsSection = document.getElementById('hotspots-section');
                        if (hotspotsSection) {
                            hotspotsSection.innerHTML = `
                                <div class="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border-2 border-red-200 dark:border-red-800 text-center">
                                    <span class="material-symbols-outlined text-red-500 text-4xl mb-2">error</span>
                                    <p class="text-red-800 dark:text-red-200 font-bold">Data failed to load.</p>
                                    <p class="text-red-600 dark:text-red-300 text-sm">Failed to fetch destinations.json and no local backup found.</p>
                                </div>`;
                        }
                        return Promise.reject(error);
                    }
                }

                if (!data) return Promise.reject('No data');

                console.log('[OutAtlas] Processing destinations data...');
                const { destinationLinks, mappings, specialEvents, eventHotels, safeHotspots, default: _default, ...details } = data;

                if (destinationLinks) Object.assign(DESTINATION_LINKS, destinationLinks);
                if (mappings) window.DATABASE.mappings = mappings;
                if (specialEvents) {
                    SPECIAL_EVENTS_DATA.length = 0;
                    SPECIAL_EVENTS_DATA.push(...specialEvents);
                }
                if (eventHotels) window._EVENT_HOTELS = eventHotels;
                if (safeHotspots) {
                    SAFE_HOTSPOTS_DATA.length = 0;
                    SAFE_HOTSPOTS_DATA.push(...safeHotspots);
                }

                window.DATABASE.details = details;

                // Build mappings from destination data if not provided
                if (!window.DATABASE.mappings || Object.keys(window.DATABASE.mappings.regions || {}).length === 0) {
                    console.log('[OutAtlas] Building mappings from destination data...');
                    const mappingsToUse = window.DATABASE.mappings || { regions: {}, countries: {}, cities: {} };

                    Object.entries(details).forEach(([key, data]) => {
                        if (!data || !data.name) return;

                        // Extract country from destination key (e.g., "amsterdam_netherlands" → "netherlands")
                        const parts = key.split('_');
                        if (parts.length >= 2) {
                            const country = parts[parts.length - 1];
                            const countryNorm = country.toLowerCase();

                            if (!mappingsToUse.countries[countryNorm]) {
                                mappingsToUse.countries[countryNorm] = [];
                            }
                            if (!mappingsToUse.countries[countryNorm].includes(key)) {
                                mappingsToUse.countries[countryNorm].push(key);
                            }
                        }

                        // Map city name (first part of "Full City, Country")
                        const cityName = data.name.split(',')[0].toLowerCase().trim();
                        if (cityName && !mappingsToUse.cities[cityName]) {
                            mappingsToUse.cities[cityName] = [key];
                        }
                    });

                    window.DATABASE.mappings = mappingsToUse;
                }

                // Collect all events from destinations if not provided
                if (!SPECIAL_EVENTS_DATA.length) {
                    console.log('[OutAtlas] Building events from destinations...');
                    Object.entries(details).forEach(([key, data]) => {
                        if (data && data.events && Array.isArray(data.events)) {
                            data.events.forEach(event => {
                                SPECIAL_EVENTS_DATA.push({ ...event, city: data.name.split(',')[0] });
                            });
                        }
                    });
                }

                // Build safe hotspots from destinations if not provided
                if (!SAFE_HOTSPOTS_DATA.length) {
                    console.log('[OutAtlas] Building safe hotspots from destinations...');
                    Object.entries(details).forEach(([key, data]) => {
                        if (data && data.name && data.safetyScore !== undefined) {
                            const nameParts = data.name.split(',');
                            const city = nameParts[0].trim();
                            const country = nameParts.length > 1 ? nameParts[1].trim() : '';
                            SAFE_HOTSPOTS_DATA.push({
                                city: city,
                                country: country,
                                safetyScore: data.safetyScore,
                                image: data.image || '🌍'
                            });
                        }
                    });
                }

                _destinationsLoaded = true;

                if (typeof populateTrendingEvents === 'function') { try { populateTrendingEvents(); } catch(e) { console.error('populateTrendingEvents error:', e); } }
                if (typeof populateSafeHotspots === 'function') { try { populateSafeHotspots(); } catch(e) { console.error('populateSafeHotspots error:', e); } }

                return Promise.resolve();
            }

            // === END DESTINATIONS DATA LOADER ===

            // Trigger initial load
            loadDestinationsData().catch(err => {
                console.error("Initial data load failed:", err);
            });

            const form = document.querySelector('#searchForm');
            const container = document.querySelector('#resultsContainer');

            if (form) {
                // Auto-suggest return date only when it hasn't been set yet
                const dateStartInput = document.querySelector('#dateStart');
                const dateEndInput = document.querySelector('#dateEnd');

                if (dateStartInput && dateEndInput) {
                    function autoSetReturnDate() {
                        const val = dateStartInput.value;
                        if (!val) return;
                        try {
                            const parts = val.split('-');
                            if (parts.length !== 3) return;
                            const year = parseInt(parts[0], 10);
                            const month = parseInt(parts[1], 10) - 1;
                            const day = parseInt(parts[2], 10);
                            // Wait for a fully typed modern year before auto-filling
                            if (isNaN(year) || year < 2000) return;
                            const startDate = new Date(year, month, day);
                            startDate.setFullYear(year);
                            // Auto-fill when return is empty or would be on/before departure
                            const returnAlreadyAfter = dateEndInput.value && dateEndInput.value > val;
                            if (returnAlreadyAfter) return;
                            const nextDay = new Date(startDate);
                            nextDay.setDate(startDate.getDate() + 1);
                            const yyyy = String(nextDay.getFullYear()).padStart(4, '0');
                            const mm = String(nextDay.getMonth() + 1).padStart(2, '0');
                            const dd = String(nextDay.getDate()).padStart(2, '0');
                            dateEndInput.value = `${yyyy}-${mm}-${dd}`;
                        } catch (e) {
                            console.error("Date auto-update error", e);
                        }
                    }
                    dateStartInput.addEventListener('change', autoSetReturnDate);
                    dateStartInput.addEventListener('input', autoSetReturnDate);
                }
                form.addEventListener('submit', async function (e) {
                    e.preventDefault();

                    // Ensure destination data is loaded before searching
                    await loadDestinationsData();

                    const origin = document.querySelector('#departure').value.trim();
                    const destinationInput = document.querySelector('#destination').value.trim().toLowerCase();
                    const dateStart = document.querySelector('#dateStart').value;
                    const dateEnd = document.querySelector('#dateEnd').value;

                    if (!origin || !destinationInput) {
                        alert("Please enter a departure city and destination.");
                        return;
                    }

                    // Check if either date is in the past
                    if ((dateStart && window.isPastDate(dateStart)) || (dateEnd && window.isPastDate(dateEnd))) {
                        showSearchWarningModal();
                        return;
                    }

                    let targets = [];

                    if (DATABASE.mappings.regions[destinationInput]) {
                        targets = DATABASE.mappings.regions[destinationInput];
                    } else if (DATABASE.mappings.countries[destinationInput]) {
                        targets = DATABASE.mappings.countries[destinationInput];
                    } else if (DATABASE.mappings.cities && DATABASE.mappings.cities[destinationInput]) {
                        targets = DATABASE.mappings.cities[destinationInput];
                    } else {
                        // Check if direct key exists or IATA match
                        const iataMatch = Object.keys(DATABASE.details).find(key => {
                            if (!DATABASE.details[key].iata) return false;
                            const iataString = String(DATABASE.details[key].iata).toLowerCase();
                            return iataString.split(',').map(i => i.trim()).includes(destinationInput);
                        });

                        if (DATABASE.details[destinationInput]) {
                            targets = [destinationInput];
                        } else if (iataMatch) {
                            targets = [iataMatch];
                        } else {
                            alert("this destination has not been added to our database yet");
                            return;
                        }
                    }

                    // Deduplicate targets to prevent duplicate weather summaries
                    targets = [...new Set(targets)];

                    // Dateless search → show events-only listing page
                    if (!dateStart || !dateEnd) {
                        showEventsOnlyView(targets);
                        return;
                    }

                    container.innerHTML = '';
                    if (typeof showView === 'function') showView('resultsView');

                    targets.forEach((targetKey, index) => {
                        let data = DATABASE.details[targetKey];

                        // Safety check if mapping exists but details missing (shouldn't happen with correct data)
                        if (!data) {
                            // Only alert if this is the only target, otherwise just skip this one
                            if (targets.length === 1) {
                                alert("Destination details currently unavailable.");
                            }
                            return;
                        }

                        // Specific Hotels for Events
                        const EVENT_HOTELS = window._EVENT_HOTELS || {}; // Loaded from destinations.json

                        // --- EVENT DETECTION LOGIC ---
                        let eventContent = '';
                        const searchStart = new Date(dateStart);
                        const searchEnd = new Date(dateEnd);
                        const bufferTime = 14 * 24 * 60 * 60 * 1000; // 14 Days Buffer

                        // 1. Search in SPECIAL_EVENTS_DATA (Primary Source)
                        let matchingEvents = SPECIAL_EVENTS_DATA.filter(e => {
                            // Check city match - match events for THIS specific city (targetKey) OR the city name in details
                            const normalize = s => s ? s.toLowerCase().trim() : '';
                            const targetCityName = normalize(data.name.split(',')[0]);
                            const eventCity = normalize(e.city);

                            const cityMatch = eventCity === normalize(targetKey) || eventCity === targetCityName;

                            if (!cityMatch) return false;

                            // Check Date Overlap with Buffer
                            const eStart = new Date(e.start);
                            const eEnd = new Date(e.end);
                            const startBuffer = new Date(eStart.getTime() - bufferTime);
                            const endBuffer = new Date(eEnd.getTime() + bufferTime);

                            return (searchStart <= endBuffer && searchEnd >= startBuffer);
                        });

                        // 2. Fallback to internal DATABASE.details events
                        if (matchingEvents.length === 0 && data.events) {
                            const internalMatches = data.events.filter(e => {
                                const eStart = new Date(e.start);
                                const eEnd = new Date(e.end);
                                const startBuffer = new Date(eStart.getTime() - bufferTime);
                                const endBuffer = new Date(eEnd.getTime() + bufferTime);
                                return (searchStart <= endBuffer && searchEnd >= startBuffer);
                            });
                            matchingEvents.push(...internalMatches);
                        }

                        // Fisher-Yates shuffle — returns a new shuffled array
                        const shuffle = arr => {
                            const a = [...arr];
                            for (let i = a.length - 1; i > 0; i--) {
                                const j = Math.floor(Math.random() * (i + 1));
                                [a[i], a[j]] = [a[j], a[i]];
                            }
                            return a;
                        };

                        // Hotel selection: Always include 1 World Rainbow Member & 1 IGLTA Accredited (if available)
                        const rainbowHotels = shuffle((data.hotels || []).filter(h => h.tags && h.tags.some(t => t.includes('World Rainbow'))));
                        const iglataHotels = shuffle((data.hotels || []).filter(h => h.tags && h.tags.some(t => t.includes('IGLTA'))));
                        const otherHotels = shuffle((data.hotels || []).filter(h =>
                          (!h.tags || (!h.tags.some(t => t.includes('World Rainbow')) && !h.tags.some(t => t.includes('IGLTA'))))
                        ));

                        let randomHotels = [];

                        // Add all World Rainbow Hotels
                        if (rainbowHotels.length > 0) {
                          randomHotels.push(...rainbowHotels);
                        }

                        // Add all IGLTA Hotels
                        if (iglataHotels.length > 0) {
                          randomHotels.push(...iglataHotels);
                        }

                        // Add remaining hotels up to limit of 6
                        if (otherHotels.length > 0) {
                          randomHotels.push(...otherHotels);
                        }
                        const allHotelsPool = [...randomHotels];
                        randomHotels = randomHotels.slice(0, 6);

                        // Inject Featured Event Hotel (prepend if exists)
                        let firstMatchingEvent = matchingEvents.length > 0 ? matchingEvents[0] : null;

                        if (firstMatchingEvent && firstMatchingEvent.hotels && firstMatchingEvent.hotels.length > 0) {
                            const randomEventHotelName = firstMatchingEvent.hotels[Math.floor(Math.random() * firstMatchingEvent.hotels.length)];

                            const specialHotel = {
                                name: randomEventHotelName,
                                type: 'Event Special',
                                tags: ['Featured', 'Pride Partner']
                            };

                            // Prepend to top of list
                            randomHotels.unshift(specialHotel);
                        } else if (firstMatchingEvent && EVENT_HOTELS[firstMatchingEvent.name]) {
                            // Legacy fallback if map matches old hardcoded name
                            const eventHotelNames = EVENT_HOTELS[firstMatchingEvent.name];
                            const randomEventHotelName = eventHotelNames[Math.floor(Math.random() * eventHotelNames.length)];
                            const specialHotel = { name: randomEventHotelName, type: 'Event Special', tags: ['Featured'] };
                            randomHotels.unshift(specialHotel);
                        }

                        const eventHotels = randomHotels.filter(h => h.type === 'Event Special');
                        const allHotelsDisplay = [...eventHotels, ...allHotelsPool];

                        // Split nightlife into distinct categories (merge dedicated saunas/stores arrays)
                        const availableNightlife = shuffle([
                            ...(Array.isArray(data.nightlife) ? data.nightlife : []),
                            ...(Array.isArray(data.saunas) ? data.saunas : []),
                            ...(Array.isArray(data.stores) ? data.stores : [])
                        ]);
                        const availableRestaurants = data.restaurants ? shuffle([...data.restaurants]) : [];

                        const isStore = n => { const t = (n.type || '').toLowerCase(); const tags = (n.tags || []).map(g => g.toLowerCase()); return t.includes('store') || t.includes('shop') || tags.some(g => g.includes('store') || g.includes('shop')); };
                        const isSauna = n => { const t = (n.type || '').toLowerCase(); const tags = (n.tags || []).map(g => g.toLowerCase()); return t.includes('sauna') || t.includes('bath') || tags.some(g => g.includes('sauna') || g.includes('bathhouse')); };
                        const isRestaurant = n => { const t = (n.type || '').toLowerCase(); return t.includes('restaurant') || t.includes('diner') || t.includes('cafe') || t.includes('bakery') || t.includes('bistro'); };

                        const allStores       = availableNightlife.filter(n => isStore(n));
                        const randomStores    = allStores.slice(0, 2);
                        const allSaunas       = availableNightlife.filter(n => !isStore(n) && isSauna(n));
                        const randomSaunas    = allSaunas.slice(0, 2);
                        const nightlifeRestaurants = availableNightlife.filter(n => !isStore(n) && !isSauna(n) && isRestaurant(n));
                        const allNightlife    = availableNightlife.filter(n => !isStore(n) && !isSauna(n) && !isRestaurant(n));
                        const randomNightlife = allNightlife.slice(0, 4);

                        // Restaurants: dedicated array + any restaurant-type items found in nightlife array
                        const allRestaurants    = [...availableRestaurants, ...nightlifeRestaurants];
                        const randomRestaurants = allRestaurants.slice(0, 2);

                        // LGBTQ Publications — prioritise entries with a URL, randomly show up to 2
                        const allNewspapers = (() => { const a = data.newspapers || []; const withUrl = a.filter(p => p.url); const withoutUrl = a.filter(p => !p.url); return withUrl.length >= 2 ? withUrl : [...withUrl, ...withoutUrl]; })();
                        const randomNewspapers = allNewspapers.length <= 2 ? allNewspapers : [...allNewspapers].sort(() => Math.random() - 0.5).slice(0, 2);

                        // LGBTQ Beaches — randomly show up to 2
                        const randomBeaches = (() => { const a = data.beaches || []; return a.length <= 2 ? a : [...a].sort(() => Math.random() - 0.5).slice(0, 2); })();

                        // LGBTQ Community Engagement — randomly show up to 2
                        const allCommunity    = [...(data.community || [])].sort(() => Math.random() - 0.5);
                        const randomCommunity = allCommunity.slice(0, 2);

                        // Tours: Always show 1 LGBTQ tour (if available) + up to 4 others
                        // LGBTQ detection: explicit tag OR name contains LGBTQ/gay/queer/pride
                        const isLgbtqTour = t => {
                            const name = (t.name || '').toLowerCase();
                            const tags = Array.isArray(t.tags) ? t.tags.map(x => x.toLowerCase()) : [];
                            return tags.some(tag => tag.includes('lgbtq') || tag.includes('gay') || tag.includes('queer') || tag.includes('pride'))
                                || name.includes('lgbtq') || name.includes('gay') || name.includes('queer') || name.includes('pride tour') || name.includes('pride walk');
                        };
                        const allTours = data.tours || [];
                        const lgbtqTours = allTours.filter(isLgbtqTour);
                        const otherTours = allTours.filter(t => !isLgbtqTour(t));
                        const shuffledLgbtqTours = shuffle(lgbtqTours);
                        const shuffledOtherTours = shuffle(otherTours);
                        const randomTours = [
                          ...shuffledLgbtqTours.slice(0, 2),
                          ...shuffledOtherTours.slice(0, 3)
                        ];
                        const allToursDisplay = [...shuffledLgbtqTours, ...shuffledOtherTours];

                        const randomParks = shuffle(data.amusementParks || []).slice(0, 2);
                        const fareEstimate = calculateFareEstimate(data.baseFare);
                        const delay = index * 200;


                        if (matchingEvents.length > 0) {
                            const carouselItems = matchingEvents.map(event => {
                                const hasTravelInPrideLink = event.link && event.link.includes('travelinpride.com');
                                const isCruise = event.type === 'Cruise';
                                const showOfficialBtn = hasTravelInPrideLink || isCruise || (event.link && !event.link.includes('google.com/search'));
                                const officialLink = event.link || getEventsLink(data.name, dateStart);
                                const link1 = officialLink;
                                const link2 = `https://www.google.com/search?q=${encodeURIComponent(event.name + " 2026")}`;

                                const s = getEventTypeStyle(event.type);
                                const bannerTitle = isCruise ? "Cruise Alert" : "Event Detected";

                                return `
                                <div class="snap-center shrink-0 w-[85%] sm:w-80 bg-gradient-to-r ${s.gradient} rounded-xl shadow-lg p-5 relative overflow-hidden group flex flex-col">
                                    <div class="absolute top-0 right-0 p-4 opacity-40 text-7xl leading-none select-none">${s.emoji}</div>
                                    <!-- Line 1: Icon -->
                                    <div class="text-2xl leading-none flex-shrink-0 mb-2">${s.emoji}</div>
                                    <!-- Line 2: Event Detected / Cruise Alert -->
                                    <h4 class="font-bold text-lg leading-snug break-words ${s.bannerTextColor || 'text-white'} mb-2">${bannerTitle}${matchingEvents.length > 1 ? ' <span class="text-[10px] font-black uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded text-slate-900 backdrop-blur-sm shadow-sm ring-1 ring-white/40">MULTIPLE</span>' : ''}</h4>
                                    <!-- Line 3: Bookmark -->
                                    <button onclick="window.psBookmarkPlace('${event.name.replace(/'/g, "\\'")}', '${isCruise ? 'Cruise' : 'Event'}', '${data.name.replace(/'/g, "\\'")}', '${origin.replace(/'/g, "\\'")}', '${dateStart}', '${dateEnd}', this)" title="Bookmark this event" class="w-11 h-11 flex items-center justify-center rounded-full bg-white/50 hover:bg-white/70 transition-colors text-slate-900 z-10 cursor-pointer flex-shrink-0 mb-2 self-start">
                                        <span class="material-symbols-outlined text-[20px] pointer-events-none fill-1">bookmark</span>
                                    </button>
                                    <!-- Line 4: Event Name (WORD WRAP REQUIRED) -->
                                    <a href="${link1}" target="_blank" class="font-bold ${s.eventNameColor || 'text-white'} text-xl hover:text-white hover:underline cursor-pointer break-words transition-colors mb-2">
                                        ${event.name}
                                    </a>
                                    <!-- Line 5: Dates -->
                                    <p class="text-xs text-yellow-100 mb-4 flex items-center gap-1 font-medium">
                                        <span class="material-symbols-outlined text-sm">calendar_today</span>
                                        ${event.start} &ndash; ${event.end}
                                    </p>
                                    <div class="flex gap-2">
                                        ${showOfficialBtn ? `
                                        <a href="${link1}" target="_blank" class="flex-1 py-2 bg-white text-slate-900 hover:bg-white/90 rounded-lg text-center text-xs font-bold transition-colors flex items-center justify-center gap-1 px-1">
                                            <span class="material-symbols-outlined text-sm">language</span>
                                            Official
                                        </a>` : ''}
                                        <a href="${link2}" target="_blank" class="flex-1 py-2 bg-white/20 text-slate-900 font-bold border border-white/40 hover:bg-white/30 rounded-lg text-center text-xs transition-colors flex items-center justify-center gap-1 px-1">
                                            <span class="material-symbols-outlined text-sm">search</span>
                                            Google
                                        </a>
                                    </div>
                                </div>`;
                            }).join('');

                            eventContent = `
                            <div class="mt-4 -mx-6 px-6">
                                <div class="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 hide-scrollbar" style="scroll-padding-left: 1.5rem;">
                                    ${carouselItems}
                                </div>
                            </div>
                        `;
                        }

                        // Calculate safety score properties
                        const safetyScore = data.safetyScore || 85;
                        let safetyColor = 'text-pride-green';
                        let safetyLabel = 'Excellent Inclusivity';
                        if (safetyScore < 50) {
                            safetyColor = 'text-pride-red';
                            safetyLabel = 'Caution Advised';
                        } else if (safetyScore < 65) {
                            safetyColor = 'text-pride-yellow';
                            safetyLabel = 'Moderate Inclusivity';
                        } else {
                            safetyColor = 'text-pride-green';
                            safetyLabel = 'Excellent Inclusivity';
                        }
                        const safetyOffset = 251.2 * (1 - safetyScore / 100);

                        // Randomly pick 2 neighborhoods to display
                        const allDistricts = Array.isArray(data.lgbtqDistrict) ? data.lgbtqDistrict : (data.lgbtqDistrict ? [data.lgbtqDistrict] : []);
                        const displayDistricts = allDistricts.length <= 2 ? allDistricts : [...allDistricts].sort(() => Math.random() - 0.5).slice(0, 2);

                        const card = document.createElement('div');
                        card.className = "bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-primary/10 overflow-hidden fade-in-up";
                        card.style.animationDelay = `${delay}ms`;
                        card.innerHTML = `
                         <!-- Result Header -->
                        <div class="pride-gradient-bg p-6 flex justify-between items-center"
                             >
                            <div class="flex items-center gap-4">
                                <div class="text-4xl select-none filter drop-shadow-md">${data.image}</div>
                                <div>
                                    <h2 class="text-sm font-black italic text-white">${formatDisplayName(data)}</h2>
                                    <span class="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-1">
                                        <span class="material-symbols-outlined text-[12px] text-primary">verified</span> Travel Scout Report
                                    </span>
                                </div>
                            </div>
                            <a href="#" onclick="window.psEmailTrip(event, '${origin.replace(/'/g, "\\'")}', '${data.name.replace(/'/g, "\\'")}', '${dateStart}', '${dateEnd}', '${data.weather}', '${data.lgbtqSafety}')"
                               class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary transition-all active:scale-95 hover:bg-primary hover:text-white shadow-lg shadow-primary/10"
                               title="Email Result">
                                <span class="material-symbols-outlined text-xl">mail</span>
                            </a>
                        </div>
                        <!-- Save Button Row -->
                        <div class="pride-gradient-bg px-6 pb-4 flex justify-center">
                            ${psMakeSaveBtn(data.name, origin, dateStart, dateEnd)}
                        </div>

                        <div class="p-4 space-y-6 bg-slate-50 dark:bg-gray-800">
                            <!-- 3 & 4. Flight & Hotel Hub -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <!-- Flight Card -->
                                <div class="bg-white dark:bg-slate-800 p-5 rounded-xl border-l-4 border-pride-blue shadow-md">
                                    <div class="flex justify-between items-start mb-4">
                                        <div class="px-3 py-1 bg-pride-blue/10 rounded-lg">
                                            <span class="font-extrabold text-lg dark-pill">Flights</span>
                                        </div>
                                        <div class="text-right">
                                            <span class="text-[10px] font-black text-slate-400 dark:text-slate-300 uppercase tracking-widest block">Booking Dates</span>
                                            <span class="text-[11px] font-bold text-pride-blue">${formatDateShort(dateStart)} &ndash; ${formatDateShort(dateEnd)}</span>
                                        </div>
                                    </div>
                                    <p class="text-2xl font-bold mb-1 text-slate-900 dark:text-white">${fareEstimate} <span class="text-xs font-normal text-slate-700 dark:text-slate-300 dark:text-slate-300">/ round-trip</span></p>
                                    <p class="text-xs text-slate-700 dark:text-slate-300 dark:text-slate-300 mb-4">Cheapest options via regional budget carriers</p>
                                    <div class="flex gap-2">
                                        <a href="${getGoogleFlightsLink(origin, data.name, dateStart, dateEnd, data)}" target="_blank"
                                           class="flex-1 py-2 bg-pride-blue text-white rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90">
                                            Google
                                        </a>
                                    </div>
                                </div>
                                <!-- Hotels Section -->
                                <section>
                                    <h3 class="text-xl font-bold mb-4 inline-block" style="background-color: #dc2626; color: white; padding: 0.25rem 1rem; border-radius: 9999px;">
                                        Hotels
                                    </h3>
                                    <div class="space-y-3 mb-3">
                                        ${allHotelsDisplay.map((h, hotelIdx) => {
                            const tagInfo = getHotelTagsInfo(h);
                            const primaryBadge = tagInfo.specialty || (tagInfo.certifications.length > 0 ? tagInfo.certifications[0] : null);
                            const badgeColor = !primaryBadge ? '' : primaryBadge === 'Luxury' ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300' : primaryBadge === 'LGBTQ Friendly' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' : primaryBadge === 'Event Hotel' ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300' : 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-black dark:text-white dark:from-pink-600 dark:via-purple-600 dark:to-blue-600';
                            const isHidden = hotelIdx >= randomHotels.length;
                            return `
                                            <div class="${isHidden ? 'view-more-item hidden' : ''} bg-white dark:bg-slate-800 p-5 rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-md">
                                                <div class="flex items-start gap-3 mb-3">
                                                    <button onclick="window.psBookmarkPlace('${h.name.replace(/'/g, "\\'")}', 'Hotel', '${data.name.replace(/'/g, "\\'")}', '${origin.replace(/'/g, "\\'")}', '${dateStart}', '${dateEnd}', this)" title="Bookmark this hotel" class="w-11 h-11 flex items-center justify-center rounded bg-slate-700 dark:bg-slate-600 hover:bg-slate-800 dark:hover:bg-slate-500 transition-colors text-white flex-shrink-0">
                                                        <span class="material-symbols-outlined text-[20px]">hotel</span>
                                                    </button>
                                                    <div class="flex-1 min-w-0">
                                                        <span class="font-black text-slate-800 dark:text-slate-100 leading-tight text-lg block break-words">${h.name}</span>
                                                        <div class="flex flex-wrap gap-2 mt-2">
                                                            ${primaryBadge ? `<span class="text-[10px] font-bold px-3 py-1 rounded-full break-words ${badgeColor}">${primaryBadge}</span>` : ''}
                                                            ${tagInfo.priceTag ? `<span class="text-[10px] font-bold px-3 py-1 rounded-lg break-words text-black dark:text-white" style="background-color: #0d7d63;">${tagInfo.priceTag}</span>` : ''}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="text-right text-xs">
                                                    <span class="font-black text-slate-400 dark:text-slate-300 uppercase tracking-widest block">Stay: ${formatDateShort(dateStart)} – ${formatDateShort(dateEnd)}</span>
                                                </div>
                                            </div>
                                        `}).join('')}
                                    </div>
                                    ${allHotelsDisplay.length > randomHotels.length ? `
                                    <button onclick="var items=this.closest('section').querySelectorAll('.view-more-item');var showing=items[0]&&!items[0].classList.contains('hidden');items.forEach(function(el){el.classList.toggle('hidden')});this.innerHTML=showing?'<span class=\\'material-symbols-outlined text-[16px]\\'>expand_more</span> View More (${allHotelsDisplay.length - randomHotels.length} more)':'<span class=\\'material-symbols-outlined text-[16px]\\'>expand_less</span> View Less';" class="mb-3 w-full py-2 text-sm font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center gap-1">
                                        <span class="material-symbols-outlined text-[16px]">expand_more</span> View More (${allHotelsDisplay.length - randomHotels.length} more)
                                    </button>
                                    ` : ''}
                                    <div class="space-y-3">
                                        <a href="${getExpediaLink(data.name, dateStart, dateEnd)}" target="_blank"
                                           class="w-full py-3 bg-pride-purple text-white rounded-full font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-pride-purple/20 active:scale-95 transition-all">
                                            <span class="material-symbols-outlined text-sm">open_in_new</span> Book All on Expedia
                                        </a>
                                        <a href="${getBookingComLink(data.name, dateStart, dateEnd)}" target="_blank"
                                           class="w-full py-3 bg-blue-600 text-white rounded-full font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
                                            <span class="material-symbols-outlined text-sm">open_in_new</span> Book on Booking.com
                                        </a>
                                    </div>
                                </section>
                            </div>
                            <!-- Misterbnb Card -->
                            <div class="bg-white dark:bg-slate-800 p-5 rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-md mb-4">
                                <div class="flex justify-between items-start mb-4">
                                    <div class="px-3 py-1 bg-pride-red/10 rounded-lg">
                                        <span class="font-extrabold text-lg dark-pill">LGBTQ Rentals</span>
                                    </div>
                                    <div class="text-right">
                                        <span class="text-[10px] font-black text-slate-400 dark:text-slate-300 uppercase tracking-widest block">Stay Period</span>
                                        <span class="text-[11px] font-bold text-pride-red">${formatDateShort(dateStart)} &ndash; ${formatDateShort(dateEnd)}</span>
                                    </div>
                                </div>
                                <p class="text-sm font-bold text-slate-900 dark:text-white mb-2">Apartments, Condos, Villas and Homes</p>
                                <a href="https://www.misterbandb.com" target="_blank"
                                   class="w-full py-3 bg-pride-red rounded-full font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-pride-red/20 active:scale-95 transition-all mb-4"
                                   style="color: black !important;">
                                    <span class="material-symbols-outlined text-sm" style="color: black !important;">search</span> Search on Misterb&b
                                </a>
                                <div class="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
                                    <p class="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                                        <strong class="text-pride-red">Reminder:</strong> Before you book, double-check the listing details! Ensure you've selected "Entire Place" if you want total privacy. If you’re okay with a "Shared Room" or "Private Room in a Home," make sure the host’s house rules align with your comfort and safety.
                                    </p>
                                </div>
                            </div>

                             <!-- 5. Safety & Neighborhoods -->
                            <section class="bg-white dark:bg-slate-800 p-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-md relative overflow-hidden">
                                <div class="absolute -right-6 -top-6 w-24 h-24 bg-pride-green/5 rounded-full"></div>
                                <h3 class="text-xl font-bold mb-4 inline-block" style="background-color: #16a34a; color: white; padding: 0.25rem 1rem; border-radius: 9999px;">
                                    Destination Information
                                </h3>

                                <div class="flex flex-col items-center gap-6 my-6">
                                    <a href="https://www.equaldex.com/equality-index" target="_blank" class="flex flex-col items-center hover:scale-105 transition-transform flex-shrink-0">
                                        <span class="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 underline tracking-wider uppercase">Equaldex</span>
                                        <div class="relative w-32 h-32 flex items-center justify-center">
                                            <svg viewBox="0 0 96 96" class="w-full h-full transform -rotate-90">
                                                <circle class="text-slate-100 dark:text-slate-700" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" stroke-width="8"></circle>
                                                <circle class="${safetyColor}" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" stroke-dasharray="251.2" stroke-dashoffset="${safetyOffset}" stroke-width="10" stroke-linecap="round"></circle>
                                            </svg>
                                            <div class="absolute inset-0 flex flex-col items-center justify-center px-4">
                                                <span class="text-4xl font-black ${safetyColor} leading-none mb-1">${safetyScore}</span>
                                                <span class="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-300 leading-tight text-center">Equality Index<br>Score</span>
                                            </div>
                                        </div>
                                    </a>
                                    <div class="w-full text-center">
                                        <p class="font-black text-slate-800 dark:text-slate-100">${safetyLabel}</p>
                                        <p class="text-sm text-slate-700 dark:text-slate-300 dark:text-slate-300 leading-relaxed flex-wrap">${data.lgbtqSafety}</p>
                                    </div>
                                </div>
                                <p class="text-sm text-slate-700 dark:text-slate-300 mb-6 -mt-2 font-medium">
                                    The Equality Index measures the current status of LGBT rights, laws, and freedoms as well as public attitudes towards LGBT people.
                                </p>

                                ${eventContent}

                                <div class="space-y-3">
                                    <div class="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <div class="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400 shadow-inner flex-shrink-0">
                                            <span class="material-symbols-outlined font-black">hub</span>
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <p class="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1">LGBTQ+ Neighborhood${displayDistricts.length !== 1 ? 's' : ''}</p>
                                            <div class="flex flex-wrap gap-1">
                                                ${displayDistricts.map(d => `<span class="text-xs font-bold px-2 py-0.5 bg-green-500/10 text-green-700 dark:text-green-400 rounded-full border border-green-500/30">${d}</span>`).join('')}
                                                ${allDistricts.length > 2 ? `<span class="text-xs text-slate-400 dark:text-slate-500 self-center pl-1">+${allDistricts.length - 2} more</span>` : ''}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                ${DESTINATION_LINKS[targetKey] ? `
                                <div class="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                                    <h4 class="text-sm font-bold text-slate-900 dark:text-white mb-3">LGBTQ+ Guides & Resources</h4>
                                    <div class="flex flex-wrap gap-2">
                                        ${DESTINATION_LINKS[targetKey].gaycities ? `<a href="${DESTINATION_LINKS[targetKey].gaycities}" target="_blank" class="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-bold hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">public</span> GayCities</a>` : ''}
                                        ${DESTINATION_LINKS[targetKey].youtube ? `<a href="${DESTINATION_LINKS[targetKey].youtube}" target="_blank" class="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-xs font-bold hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">play_circle</span> YouTube Guide</a>` : ''}
                                    </div>
                                </div>
                                ` : ''}
                            </section>

                            <!-- LGBTQ Community Resources Header -->
                            <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border-l-4 border-pride-purple shadow-md">
                                <div class="flex items-center justify-between">
                                    <div class="px-3 py-1 bg-pride-purple/10 rounded-lg">
                                        <span class="font-extrabold text-lg dark-pill"><span class="pride-gradient-text">LGBTQ Community Resources</span></span>
                                    </div>
                                    <p class="text-xs text-slate-700 dark:text-slate-300 hidden sm:block">Shops &bull; Bars &bull; Dining &bull; Publications &amp; More</p>
                                </div>
                            </div>

                            <!-- 6. Shops & Stores -->
                            ${allStores.length > 0 ? `
                            <section>
                                <h3 class="text-xl font-bold mb-4 inline-flex items-center gap-2 dark-pill">
                                    <span class="material-symbols-outlined">shopping_bag</span>
                                    Shops & Stores
                                </h3>
                                <div class="grid grid-cols-2 gap-3">
                                    ${allStores.map((n, i) => {
                                const icon = getNightlifeIcon(n.type);
                                const firstTag = n.tags && n.tags.length > 0 ? n.tags[0] : '';
                                return `
                                        <div class="${i >= 2 ? 'view-more-item hidden' : ''} bg-white p-4 rounded-xl border-2 border-pride-green/20 group hover:bg-pride-green transition-colors duration-300 cursor-default flex flex-col">
                                            <!-- Line 1: Icon -->
                                            <div class="w-10 h-10 bg-pride-green rounded-full flex items-center justify-center text-white mb-3 group-hover:bg-white dark:bg-white dark:text-pride-green group-hover:text-pride-green flex-shrink-0">
                                                ${icon}
                                            </div>
                                            <!-- Line 2: Name -->
                                            <p class="font-bold group-hover:text-white text-black break-words mb-1" style="color: black !important;">${n.name}</p>
                                            <!-- Line 3: Tag -->
                                            <p class="text-xs text-slate-700 dark:text-slate-300 dark:text-slate-300 group-hover:text-white break-words mb-3">${n.type}${firstTag ? ' &bull; ' + firstTag : ''}</p>
                                            <!-- Line 4: Actions -->
                                            <div class="flex items-center gap-2">
                                                <button onclick="window.psBookmarkPlace('${n.name.replace(/'/g, "\\'")}', 'Shopping', '${data.name.replace(/'/g, "\\'")}', '${origin.replace(/'/g, "\\'")}', '${dateStart}', '${dateEnd}', this)" title="Bookmark this place" class="w-11 h-11 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-400 flex-shrink-0">
                                                    <span class="material-symbols-outlined text-[16px]">bookmark</span>
                                                </button>
                                                <a href="https://www.google.com/search?q=${encodeURIComponent(n.name + ' ' + data.name.split(',')[0].trim())}" target="_blank" rel="noopener noreferrer" title="Search on Google" class="w-11 h-11 flex items-center justify-center rounded-full bg-slate-100 hover:bg-blue-100 transition-colors text-slate-400 hover:text-blue-600 flex-shrink-0">
                                                    <span class="material-symbols-outlined text-[16px]">search</span>
                                                </a>
                                            </div>
                                        </div>
                                        `;
                            }).join('')}
                                </div>
                                ${allStores.length > 2 ? `
                                <button onclick="var items=this.closest('section').querySelectorAll('.view-more-item');var showing=items[0]&&!items[0].classList.contains('hidden');items.forEach(function(el){el.classList.toggle('hidden')});this.innerHTML=showing?'<span class=\\'material-symbols-outlined text-[16px]\\'>expand_more</span> View More (${allStores.length - 2} more)':'<span class=\\'material-symbols-outlined text-[16px]\\'>expand_less</span> View Less';" class="mt-3 w-full py-2 text-sm font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center gap-1">
                                    <span class="material-symbols-outlined text-[16px]">expand_more</span> View More (${allStores.length - 2} more)
                                </button>
                                ` : ''}
                            </section>
                            ` : ''}

                            <!-- Saunas & Bathhouses -->
                            ${allSaunas.length > 0 ? `
                            <section>
                                <h3 class="text-xl font-bold mb-4 inline-flex items-center gap-2 dark-pill">
                                    <span class="material-symbols-outlined">hot_tub</span>
                                    Saunas & Bathhouses
                                </h3>
                                <div class="grid grid-cols-2 gap-3">
                                    ${allSaunas.map((n, i) => {
                                const icon = getNightlifeIcon(n.type);
                                const firstTag = n.tags && n.tags.length > 0 ? n.tags[0] : '';
                                return `
                                        <div class="${i >= 2 ? 'view-more-item hidden' : ''} bg-white p-4 rounded-xl border-2 border-pride-red/20 group hover:bg-pride-red transition-colors duration-300 cursor-default flex flex-col">
                                            <!-- Line 1: Icon -->
                                            <div class="w-10 h-10 bg-pride-red rounded-full flex items-center justify-center text-white mb-3 group-hover:bg-white dark:bg-white dark:text-pride-red group-hover:text-pride-red flex-shrink-0">
                                                ${icon}
                                            </div>
                                            <!-- Line 2: Name -->
                                            <p class="font-bold group-hover:text-white text-black break-words mb-1" style="color: black !important;">${n.name}</p>
                                            <!-- Line 3: Tag -->
                                            <p class="text-xs text-slate-700 dark:text-slate-300 dark:text-slate-300 group-hover:text-white break-words mb-3">${n.type}${firstTag ? ' &bull; ' + firstTag : ''}</p>
                                            <!-- Line 4: Bookmark -->
                                            <button onclick="window.psBookmarkPlace('${n.name.replace(/'/g, "\\'")}', 'Nightlife', '${data.name.replace(/'/g, "\\'")}', '${origin.replace(/'/g, "\\'")}', '${dateStart}', '${dateEnd}', this)" title="Bookmark this place" class="w-11 h-11 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-400 flex-shrink-0 self-start">
                                                <span class="material-symbols-outlined text-[16px]">bookmark</span>
                                            </button>
                                        </div>
                                        `;
                            }).join('')}
                                </div>
                                ${allSaunas.length > 2 ? `
                                <button onclick="var items=this.closest('section').querySelectorAll('.view-more-item');var showing=items[0]&&!items[0].classList.contains('hidden');items.forEach(function(el){el.classList.toggle('hidden')});this.innerHTML=showing?'<span class=\\'material-symbols-outlined text-[16px]\\'>expand_more</span> View More (${allSaunas.length - 2} more)':'<span class=\\'material-symbols-outlined text-[16px]\\'>expand_less</span> View Less';" class="mt-3 w-full py-2 text-sm font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center gap-1">
                                    <span class="material-symbols-outlined text-[16px]">expand_more</span> View More (${allSaunas.length - 2} more)
                                </button>
                                ` : ''}
                            </section>
                            ` : ''}

                            <!-- Bars & Nightlife -->
                            ${allNightlife.length > 0 ? `
                            <section>
                                <h3 class="text-xl font-bold mb-4 inline-flex items-center gap-2 dark-pill">
                                    <span class="material-symbols-outlined">nightlife</span>
                                    Bars & Nightlife
                                </h3>
                                <div class="grid grid-cols-2 gap-3">
                                    ${allNightlife.map((n, i) => {
                                let color = 'pride-purple';
                                const t = (n.type || '').toLowerCase();
                                if (t.includes('club') || t.includes('disco')) color = 'pride-blue';
                                else if (t.includes('bar')) color = 'pride-purple';
                                else color = 'pride-orange';
                                const icon = getNightlifeIcon(n.type);
                                const firstTag = n.tags && n.tags.length > 0 ? n.tags[0] : '';
                                return `
                                        <div class="${i >= 4 ? 'view-more-item hidden' : ''} bg-white p-4 rounded-xl border-2 border-${color}/20 group hover:bg-${color} transition-colors duration-300 cursor-default flex flex-col">
                                            <!-- Line 1: Icon -->
                                            <div class="w-10 h-10 bg-${color} rounded-full flex items-center justify-center text-white mb-3 group-hover:bg-white dark:bg-white dark:text-${color} group-hover:text-${color} flex-shrink-0">
                                                ${icon}
                                            </div>
                                            <!-- Line 2: Name -->
                                            <p class="font-bold group-hover:text-white text-black break-words mb-1" style="color: black !important;">${n.name}</p>
                                            <!-- Line 3: Tag -->
                                            <p class="text-xs text-slate-700 dark:text-slate-300 dark:text-slate-300 group-hover:text-white break-words mb-3">${n.type}${firstTag ? ' &bull; ' + firstTag : ''}</p>
                                            <!-- Line 4: Actions -->
                                            <div class="flex items-center gap-2">
                                                <button onclick="window.psBookmarkPlace('${n.name.replace(/'/g, "\\'")}', 'Nightlife', '${data.name.replace(/'/g, "\\'")}', '${origin.replace(/'/g, "\\'")}', '${dateStart}', '${dateEnd}', this)" title="Bookmark this place" class="w-11 h-11 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-400 flex-shrink-0">
                                                    <span class="material-symbols-outlined text-[16px]">bookmark</span>
                                                </button>
                                                <a href="https://www.google.com/search?q=${encodeURIComponent(n.name + ' ' + data.name.split(',')[0].trim())}" target="_blank" rel="noopener noreferrer" title="Search on Google" class="w-11 h-11 flex items-center justify-center rounded-full bg-slate-100 hover:bg-blue-100 transition-colors text-slate-400 hover:text-blue-600 flex-shrink-0">
                                                    <span class="material-symbols-outlined text-[16px]">search</span>
                                                </a>
                                            </div>
                                        </div>
                                        `;
                            }).join('')}
                                </div>
                                ${allNightlife.length > 4 ? `
                                <button onclick="var items=this.closest('section').querySelectorAll('.view-more-item');var showing=items[0]&&!items[0].classList.contains('hidden');items.forEach(function(el){el.classList.toggle('hidden')});this.innerHTML=showing?'<span class=\\'material-symbols-outlined text-[16px]\\'>expand_more</span> View More (${allNightlife.length - 4} more)':'<span class=\\'material-symbols-outlined text-[16px]\\'>expand_less</span> View Less';" class="mt-3 w-full py-2 text-sm font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center gap-1">
                                    <span class="material-symbols-outlined text-[16px]">expand_more</span> View More (${allNightlife.length - 4} more)
                                </button>
                                ` : ''}
                            </section>
                            ` : ''}

                            <!-- Restaurants & Cafes -->
                            ${allRestaurants.length > 0 ? `
                            <section>
                                <h3 class="text-xl font-bold mb-4 inline-flex items-center gap-2 dark-pill">
                                    <span class="material-symbols-outlined">restaurant</span>
                                    Restaurants & Cafes
                                </h3>
                                <div class="grid grid-cols-2 gap-3">
                                    ${allRestaurants.map((r, i) => {
                                let color = 'pride-orange'; // default restaurant
                                const t = (r.type || '').toLowerCase();
                                if (t.includes('cafe') || t.includes('coffee') || t.includes('bakery')) color = 'pride-orange';
                                else if (t.includes('shop') || t.includes('store')) color = 'pride-green';
                                const icon = getRestaurantIcon(r.type);
                                const firstTag = r.tags && r.tags.length > 0 ? r.tags[0] : '';
                                return `
                                        <div class="${i >= 2 ? 'view-more-item hidden' : ''} bg-white p-4 rounded-xl border-2 border-${color}/20 group hover:bg-${color} transition-colors duration-300 cursor-default flex flex-col">
                                            <!-- Line 1: Icon -->
                                            <div class="w-10 h-10 bg-${color} rounded-full flex items-center justify-center text-white mb-3 group-hover:bg-white dark:bg-white dark:text-${color} group-hover:text-${color} flex-shrink-0">
                                                ${icon}
                                            </div>
                                            <!-- Line 2: Name -->
                                            <p class="font-bold group-hover:text-white text-black break-words mb-1" style="color: black !important;">${r.name}</p>
                                            <!-- Line 3: Tag -->
                                            <p class="text-xs text-slate-700 dark:text-slate-300 dark:text-slate-300 group-hover:text-white break-words mb-3">${r.type}${firstTag ? ' &bull; ' + firstTag : ''}</p>
                                            <!-- Line 4: Actions -->
                                            <div class="flex items-center gap-2">
                                                <button onclick="window.psBookmarkPlace('${r.name.replace(/'/g, "\\'")}', 'Dining', '${data.name.replace(/'/g, "\\'")}', '${origin.replace(/'/g, "\\'")}', '${dateStart}', '${dateEnd}', this)" title="Bookmark this place" class="w-11 h-11 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-400 flex-shrink-0">
                                                    <span class="material-symbols-outlined text-[16px]">bookmark</span>
                                                </button>
                                                <a href="https://www.google.com/search?q=${encodeURIComponent(r.name + ' ' + data.name.split(',')[0].trim())}" target="_blank" rel="noopener noreferrer" title="Search on Google" class="w-11 h-11 flex items-center justify-center rounded-full bg-slate-100 hover:bg-blue-100 transition-colors text-slate-400 hover:text-blue-600 flex-shrink-0">
                                                    <span class="material-symbols-outlined text-[16px]">search</span>
                                                </a>
                                            </div>
                                        </div>
                                        `;
                            }).join('')}
                                </div>
                                ${allRestaurants.length > 2 ? `
                                <button onclick="var items=this.closest('section').querySelectorAll('.view-more-item');var showing=items[0]&&!items[0].classList.contains('hidden');items.forEach(function(el){el.classList.toggle('hidden')});this.innerHTML=showing?'<span class=\\'material-symbols-outlined text-[16px]\\'>expand_more</span> View More (${allRestaurants.length - 2} more)':'<span class=\\'material-symbols-outlined text-[16px]\\'>expand_less</span> View Less';" class="mt-3 w-full py-2 text-sm font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center gap-1">
                                    <span class="material-symbols-outlined text-[16px]">expand_more</span> View More (${allRestaurants.length - 2} more)
                                </button>
                                ` : ''}
                            </section>
                            ` : ''}

                            <!-- LGBTQ Publications & Magazines -->
                            ${allNewspapers.length > 0 ? `
                            <section>
                                <h3 class="text-xl font-bold mb-4 inline-flex items-center gap-2 dark-pill">
                                    <span class="material-symbols-outlined text-pride-purple text-xl">menu_book</span>
                                    LGBTQ+ Publications
                                </h3>
                                <div class="grid grid-cols-2 gap-3">
                                    ${allNewspapers.map((p, pubIdx) => {
                                const pubName = typeof p === 'object' ? p.name : p;
                                const pubType = typeof p === 'object' ? (p.type || 'Magazine') : 'Magazine';
                                const pubUrl = typeof p === 'object' && p.url ? (p.url.startsWith('http') ? p.url : 'https://' + p.url) : '';
                                const cardTag = pubUrl ? 'a' : 'div';
                                const cardAttrs = pubUrl ? `href="${pubUrl}" target="_blank" rel="noopener noreferrer"` : '';
                                const isHiddenPub = pubIdx >= 2;
                                return `
                                        <${cardTag} ${cardAttrs} class="${isHiddenPub ? 'view-more-item hidden' : ''} bg-white p-4 rounded-xl border-2 border-pride-purple/20 group hover:bg-pride-purple transition-colors duration-300 flex flex-col ${pubUrl ? 'cursor-pointer' : 'cursor-default'} block no-underline">
                                            <!-- Line 1: Icon -->
                                            <div class="w-10 h-10 bg-pride-purple rounded-full flex items-center justify-center text-white mb-3 group-hover:bg-white dark:bg-white dark:text-pride-purple group-hover:text-pride-purple flex-shrink-0">
                                                <span class="material-symbols-outlined text-[20px]">${pubUrl ? 'open_in_new' : 'menu_book'}</span>
                                            </div>
                                            <!-- Line 2: Name -->
                                            <p class="font-bold group-hover:text-white text-black break-words mb-1" style="color: black !important;">${pubName}</p>
                                            <!-- Line 3: Tag/URL -->
                                            <p class="text-xs text-slate-700 dark:text-slate-300 dark:text-slate-300 group-hover:text-white break-words mb-3">${pubUrl ? p.url : pubType}</p>
                                            <!-- Line 4: Bookmark -->
                                            <button onclick="event.preventDefault();event.stopPropagation();window.psBookmarkPlace('${pubName.replace(/'/g, "\\'")}', 'Publication', '${data.name.replace(/'/g, "\\'")}', '${origin.replace(/'/g, "\\'")}', '${dateStart}', '${dateEnd}', this)" title="Bookmark this publication" class="w-11 h-11 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-400 flex-shrink-0 self-start">
                                                <span class="material-symbols-outlined text-[16px]">bookmark</span>
                                            </button>
                                        </${cardTag}>
                                        `;
                            }).join('')}
                                </div>
                                ${allNewspapers.length > 2 ? `
                                <button onclick="var items=this.closest('section').querySelectorAll('.view-more-item');var showing=items[0]&&!items[0].classList.contains('hidden');items.forEach(function(el){el.classList.toggle('hidden')});this.innerHTML=showing?'<span class=\\'material-symbols-outlined text-[16px]\\'>expand_more</span> View More (${allNewspapers.length - 2} more)':'<span class=\\'material-symbols-outlined text-[16px]\\'>expand_less</span> View Less';" class="mt-3 w-full py-2 text-sm font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center gap-1">
                                    <span class="material-symbols-outlined text-[16px]">expand_more</span> View More (${allNewspapers.length - 2} more)
                                </button>
                                ` : ''}
                            </section>
                            ` : ''}

                            <!-- LGBTQ Beaches -->
                            ${randomBeaches.length > 0 ? `
                            <section>
                                <h3 class="text-xl font-bold mb-4 inline-flex items-center gap-2 dark-pill">
                                    <span class="material-symbols-outlined text-pride-blue text-xl">waves</span>
                                    LGBTQ+ Beaches
                                </h3>
                                <div class="grid grid-cols-2 gap-3">
                                    ${randomBeaches.map(b => {
                                const beachName = typeof b === 'object' ? b.name : b;
                                const beachType = typeof b === 'object' ? (b.type || 'Beach') : 'Beach';
                                return `
                                        <div class="bg-white p-4 rounded-xl border-2 border-pride-blue/20 group hover:bg-pride-blue transition-colors duration-300 flex flex-col cursor-default">
                                            <!-- Line 1: Icon -->
                                            <div class="w-10 h-10 bg-pride-blue rounded-full flex items-center justify-center text-white mb-3 group-hover:bg-white dark:bg-white dark:text-pride-blue group-hover:text-pride-blue flex-shrink-0">
                                                <span class="material-symbols-outlined text-[20px]">waves</span>
                                            </div>
                                            <!-- Line 2: Name -->
                                            <p class="font-bold group-hover:text-white text-black break-words mb-1" style="color: black !important;">${beachName}</p>
                                            <!-- Line 3: Tag -->
                                            <p class="text-xs text-slate-700 dark:text-slate-300 dark:text-slate-300 group-hover:text-white break-words mb-3">${beachType}</p>
                                            <!-- Line 4: Bookmark -->
                                            <button onclick="window.psBookmarkPlace('${beachName.replace(/'/g, "\\'")}', 'Beach', '${data.name.replace(/'/g, "\\'")}', '${origin.replace(/'/g, "\\'")}', '${dateStart}', '${dateEnd}', this)" title="Bookmark this beach" class="w-11 h-11 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-400 flex-shrink-0 self-start">
                                                <span class="material-symbols-outlined text-[16px]">bookmark</span>
                                            </button>
                                        </div>
                                        `;
                            }).join('')}
                                </div>
                            </section>
                            ` : ''}

                            <!-- LGBTQ Community Engagement -->
                            ${allCommunity.length > 0 ? `
                            <section>
                                <h3 class="text-xl font-bold mb-4 inline-flex items-center gap-2 dark-pill">
                                    <span class="material-symbols-outlined text-pride-orange text-xl">account_balance</span>
                                    Community Engagement
                                </h3>
                                <div class="grid grid-cols-2 gap-3">
                                    ${allCommunity.map((c, commIdx) => {
                                const placeName = typeof c === 'object' ? c.name : c;
                                const placeType = typeof c === 'object' ? (c.type || 'Community') : 'Community';
                                return `
                                        <div class="${commIdx >= 2 ? 'view-more-item hidden' : ''} bg-white p-4 rounded-xl border-2 border-pride-orange/20 group hover:bg-pride-orange transition-colors duration-300 flex flex-col cursor-default">
                                            <!-- Line 1: Icon -->
                                            <div class="w-10 h-10 bg-pride-orange rounded-full flex items-center justify-center text-white mb-3 group-hover:bg-white dark:bg-white dark:text-pride-orange group-hover:text-pride-orange flex-shrink-0">
                                                <span class="material-symbols-outlined text-[20px]">account_balance</span>
                                            </div>
                                            <!-- Line 2: Name -->
                                            <p class="font-bold group-hover:text-white text-black break-words mb-1" style="color: black !important;">${placeName}</p>
                                            <!-- Line 3: Tag -->
                                            <p class="text-xs text-slate-700 dark:text-slate-300 dark:text-slate-300 group-hover:text-white break-words mb-3">${placeType}</p>
                                            <!-- Line 4: Actions -->
                                            <div class="flex items-center gap-2">
                                                <button onclick="window.psBookmarkPlace('${placeName.replace(/'/g, "\\'")}', 'Community', '${data.name.replace(/'/g, "\\'")}', '${origin.replace(/'/g, "\\'")}', '${dateStart}', '${dateEnd}', this)" title="Bookmark this place" class="w-11 h-11 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-400 flex-shrink-0">
                                                    <span class="material-symbols-outlined text-[16px]">bookmark</span>
                                                </button>
                                                <a href="https://www.google.com/search?q=${encodeURIComponent(placeName + ' ' + data.name.split(',')[0].trim())}" target="_blank" rel="noopener noreferrer" title="Search on Google" class="w-11 h-11 flex items-center justify-center rounded-full bg-slate-100 hover:bg-blue-100 transition-colors text-slate-400 hover:text-blue-600 flex-shrink-0">
                                                    <span class="material-symbols-outlined text-[16px]">search</span>
                                                </a>
                                            </div>
                                        </div>
                                        `;
                            }).join('')}
                                </div>
                                ${allCommunity.length > 2 ? `
                                <button onclick="var items=this.closest('section').querySelectorAll('.view-more-item');var showing=items[0]&&!items[0].classList.contains('hidden');items.forEach(function(el){el.classList.toggle('hidden')});this.innerHTML=showing?'<span class=\\'material-symbols-outlined text-[16px]\\'>expand_more</span> View More (${allCommunity.length - 2} more)':'<span class=\\'material-symbols-outlined text-[16px]\\'>expand_less</span> View Less';" class="mt-3 w-full py-2 text-sm font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center gap-1">
                                    <span class="material-symbols-outlined text-[16px]">expand_more</span> View More (${allCommunity.length - 2} more)
                                </button>
                                ` : ''}
                            </section>
                            ` : ''}

                            <!-- 7. Weather Forecast -->
                            <section class="bg-gradient-to-r from-pride-red/10 via-pride-yellow/10 to-pride-purple/10 rounded-xl p-5 border-2 border-primary/20">
                                ${(() => {
                                const safeDate = (dateStart && dateStart !== 'undefined' && dateStart !== 'null') ? dateStart : new Date().toISOString();
                                const monthIndex = new Date(safeDate).getUTCMonth();
                                const monthName = getMonthName(safeDate);
                                const mWeather = data.monthlyWeather ? data.monthlyWeather[monthIndex] : null;
                                const highTemp = (mWeather && mWeather.high) ? mWeather.high : '72°F';
                                const lowTemp = (mWeather && mWeather.low) ? mWeather.low : '55°F';
                                const summary = mWeather && mWeather.summary ? mWeather.summary : (mWeather && mWeather.description ? mWeather.description.split(/[;.]/)[0].trim() : '');
                                const description = (mWeather && mWeather.description) ? mWeather.description : (data.weather ? data.weather.replace(/[.\s]*\d+[°&]?(deg;)?\s*[CF]/g, '').trim() : '');
                                const gear = (mWeather && mWeather.gear) ? mWeather.gear : 'Light layers and comfortable walking shoes.';

                                return `
                                <div class="mb-4">
                                    <h3 class="text-xl font-bold dark-pill mb-1"><a href="https://www.google.com/search?q=Weather+in+${encodeURIComponent(data.name)}+in+${encodeURIComponent(monthName)}" target="_blank" class="pride-gradient-text hover:underline">${monthName} Weather</a></h3>
                                    <p class="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-snug">${description}</p>
                                </div>
                                <div class="w-full flex items-start gap-4 p-4 bg-white dark:bg-slate-800/60 rounded-xl">
                                    <div class="flex-shrink-0 pr-4 border-r border-slate-200 dark:border-slate-700">${getWeatherIcon(description || summary)}</div>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-2">${monthName} Average</p>
                                        <div class="flex flex-wrap gap-x-4 gap-y-1 mb-3">
                                            <span class="text-base font-black text-slate-900 dark:text-white">${highTemp} <span class="font-bold text-slate-400 dark:text-slate-300">High</span></span>
                                            <span class="text-base font-bold text-slate-700 dark:text-slate-300">${lowTemp} <span class="font-bold text-slate-400 dark:text-slate-300">Low</span></span>
                                        </div>
                                        <p class="text-sm font-bold text-primary leading-snug">Gear &amp; Packing: <span class="font-normal text-slate-600 dark:text-slate-400">${gear}</span></p>
                                    </div>
                                </div>
                                `;
                            })()}
                            </section>

                            <!-- 8. Must-See Tours & Excursions -->
                            <section class="pb-4">
                                <h3 class="text-xl font-bold mb-4 inline-block" style="background-color: #a855f7; color: white; padding: 0.25rem 1rem; border-radius: 9999px;">
                                    Unmissable Tours
                                </h3>
                                <div class="space-y-4">
                                    ${allToursDisplay.map((t, tourIdx) => {
                                const tourName = typeof t === 'object' ? t.name : t;
                                const activityLevels = ['low', 'moderate', 'high', 'easy', 'adventurous'];
                                const priceLevels = ['Budget', 'Moderate', 'Luxury'];
                                // Prefer explicit activity field; fall back to style if it is a valid activity level
                                let tourActivity = typeof t === 'object' ? (t.activity || '') : '';
                                let tourStyleRaw = typeof t === 'object' ? (t.style || '') : '';
                                let tourPrice = typeof t === 'object' ? (t.price || t.pricing || '') : '';
                                if (typeof t === 'object' && t.tags && Array.isArray(t.tags)) {
                                    if (!tourActivity && !tourStyleRaw) tourActivity = t.tags.find(tag => activityLevels.includes(tag.toLowerCase())) || '';
                                    if (!tourPrice) tourPrice = t.tags.find(tag => priceLevels.includes(tag)) || '';
                                }
                                // Determine what to show: activity beats style if style is not an activity level
                                const styleIsActivity = activityLevels.includes(tourStyleRaw.toLowerCase());
                                const activityDisplay = tourActivity || (styleIsActivity ? tourStyleRaw : '');
                                const typeDisplay = styleIsActivity ? '' : tourStyleRaw;
                                const activityLabel = activityDisplay ? `Activity Level: ${activityDisplay}` : (typeDisplay || 'Featured Tour');
                                const tourDesc = typeDisplay && activityDisplay
                                    ? `${typeDisplay} &bull; Activity Level: ${activityDisplay}`
                                    : `Approx. 3 hrs &bull; ${activityLabel}`;
                                const priceBadgeClass = tourPrice === 'Budget' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : tourPrice === 'Luxury' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : tourPrice === 'Moderate' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : '';
                                const priceBadge = tourPrice ? `<span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${priceBadgeClass}">${tourPrice}</span>` : '';
                                const isThisLgbtqTour = isLgbtqTour(t);
                                const isTourHidden = tourIdx >= randomTours.length;
                                return `
                                    <div class="${isTourHidden ? 'view-more-item hidden' : ''} flex gap-4 items-center bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm group cursor-pointer border-4 ${isThisLgbtqTour ? 'border-pride-purple/30 bg-gradient-to-r from-white to-purple-50 dark:from-slate-800 dark:to-purple-950/20' : 'border-slate-100 dark:border-slate-700'} hover:border-primary/20">
                                        ${isThisLgbtqTour ? '<div class="text-2xl leading-none flex-shrink-0 select-none" title="LGBTQ+ Tour">🏳️‍🌈</div>' : ''}
                                        <div class="flex-1 min-w-0">
                                            <div class="flex items-center gap-2 mb-0.5 flex-wrap">
                                                <p class="font-bold text-sm text-slate-900 dark:text-white">${tourName}</p>
                                                ${isThisLgbtqTour ? '<span class="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-pride-purple/10 text-pride-purple flex-shrink-0">LGBTQ+</span>' : ''}
                                                ${priceBadge}
                                            </div>
                                            <p class="text-xs text-slate-700 dark:text-slate-300 dark:text-slate-300">${tourDesc}</p>
                                        </div>
                                        <button onclick="window.psBookmarkPlace('${tourName.replace(/'/g, "\\'")}', 'Tour', '${data.name.replace(/'/g, "\\'")}', '${origin.replace(/'/g, "\\'")}', '${dateStart}', '${dateEnd}', this)" title="Bookmark this tour" class="w-11 h-11 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-slate-400 flex-shrink-0">
                                            <span class="material-symbols-outlined text-[18px]">bookmark</span>
                                        </button>
                                        <a href="https://www.google.com/search?q=${encodeURIComponent(tourName + ' viator')}" target="_blank" rel="noopener noreferrer" title="Search on Viator" class="w-11 h-11 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-slate-400 hover:text-blue-600 flex-shrink-0">
                                            <span class="material-symbols-outlined text-[18px]">search</span>
                                        </a>
                                    </div>
                                    `;
                            }).join('')}
                                </div>
                                ${allToursDisplay.length > randomTours.length ? `
                                <button onclick="var items=this.closest('section').querySelectorAll('.view-more-item');var showing=items[0]&&!items[0].classList.contains('hidden');items.forEach(function(el){el.classList.toggle('hidden')});this.innerHTML=showing?'<span class=\\'material-symbols-outlined text-[16px]\\'>expand_more</span> View More (${allToursDisplay.length - randomTours.length} more)':'<span class=\\'material-symbols-outlined text-[16px]\\'>expand_less</span> View Less';" class="mt-3 w-full py-2 text-sm font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center gap-1">
                                    <span class="material-symbols-outlined text-[16px]">expand_more</span> View More (${allToursDisplay.length - randomTours.length} more)
                                </button>
                                ` : ''}
                                <a href="${getViatorLink(data.name, dateStart, dateEnd)}" target="_blank"
                                   class="mt-3 block w-full py-3 bg-purple-600 text-white dark:bg-purple-700 dark:text-white rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-colors hover:bg-purple-700 dark:hover:bg-purple-600">
                                    Explore all tours on Viator
                                </a>
                            </section>

                            <!-- 9. Nearby Amusement Parks -->
                            ${randomParks.length > 0 ? `
                            <section class="pb-4">
                                <h3 class="text-xl font-bold mb-4 inline-flex items-center gap-2 dark-pill">
                                    <span class="material-symbols-outlined text-pride-purple text-xl">attractions</span>
                                    Nearby Theme Parks
                                </h3>
                                <div class="space-y-3">
                                    ${randomParks.map(p => {
                                        const parkName = p.name || '';
                                        const parkLocation = p.location || '';
                                        const parkType = p.type || 'Amusement Park';
                                        const badgeClass = parkType === 'Disney' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : parkType === 'Universal' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
                                        return `
                                    <div class="flex gap-4 items-center bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border-2 border-slate-100 dark:border-slate-700">
                                        <span class="material-symbols-outlined text-2xl text-pride-purple flex-shrink-0">attractions</span>
                                        <div class="flex-1 min-w-0">
                                            <div class="flex items-center gap-2 mb-0.5">
                                                <p class="font-bold text-sm text-slate-900 dark:text-white truncate">${parkName}</p>
                                                <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0 ${badgeClass}">${parkType}</span>
                                            </div>
                                            <p class="text-xs text-slate-700 dark:text-slate-300 truncate">${parkLocation}</p>
                                        </div>
                                        <button onclick="window.psBookmarkPlace('${parkName.replace(/'/g, "\\'")}', 'Amusement Park', '${data.name.replace(/'/g, "\\'")}', '${origin.replace(/'/g, "\\'")}', '${dateStart}', '${dateEnd}', this)" title="Bookmark this park" class="w-11 h-11 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-slate-400 flex-shrink-0">
                                            <span class="material-symbols-outlined text-[18px]">bookmark</span>
                                        </button>
                                    </div>`;
                                    }).join('')}
                                </div>
                            </section>` : ''}
                        </div>
                        `;
                        container.appendChild(card);
                    });

                });
            }

            function formatDisplayName(data) {
                // Desired: "City, Airport Code, Country or Region"
                // data.name is typically "City, Country"
                // data.iata is "CODE" or "CODE, CODE2"
                const displayIata = data.iata ? String(data.iata).replace(/,\s*/g, '/') : '';

                if (data.name.includes(',')) {
                    const parts = data.name.split(',');
                    const city = parts[0].trim();
                    const country = parts.slice(1).join(',').trim();
                    return `${city}, ${displayIata}, ${country} `;
                }
                return `${data.name}, ${displayIata} `;
            }

            function getRandomSubset(arr, count) {
                if (!arr) return [];
                const shuffled = [...arr].sort(() => 0.5 - Math.random());
                return shuffled.slice(0, count);
            }

            function isPastEvent(event) {
                if (!event || !event.start) return false;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const eventStart = new Date(event.start + 'T00:00:00');
                return eventStart < today;
            }

            function countryCodeToFlag(code) {
                if (!code || code.length !== 2) return '🌍';
                const codePoints = [...code.toUpperCase()].map(char => 127397 + char.charCodeAt());
                return String.fromCodePoint(...codePoints);
            }

            function getCityGradient(city, code) {
                const c = (city || '').toLowerCase();
                const gradients = {
                    amsterdam:'bg-gradient-to-br from-orange-500 via-white to-red-600',
                    'new york city':'bg-gradient-to-br from-slate-700 via-blue-900 to-slate-900',
                    'san francisco':'bg-gradient-to-br from-orange-400 via-amber-300 to-sky-500',
                    paris:'bg-gradient-to-br from-blue-800 via-white to-red-600',
                    london:'bg-gradient-to-br from-blue-900 via-red-600 to-blue-900',
                    berlin:'bg-gradient-to-br from-slate-900 via-red-700 to-amber-400',
                    barcelona:'bg-gradient-to-br from-yellow-400 via-red-600 to-yellow-400',
                    madrid:'bg-gradient-to-br from-red-700 via-yellow-400 to-red-700',
                    sydney:'bg-gradient-to-br from-blue-400 via-sky-200 to-emerald-400',
                    miami:'bg-gradient-to-br from-cyan-400 via-pink-300 to-orange-400',
                    'los angeles':'bg-gradient-to-br from-amber-400 via-orange-300 to-sky-500',
                    tokyo:'bg-gradient-to-br from-red-600 via-pink-200 to-white',
                    dubai:'bg-gradient-to-br from-amber-400 via-yellow-200 to-green-600',
                    bangkok:'bg-gradient-to-br from-blue-800 via-white to-red-600',
                    'mexico city':'bg-gradient-to-br from-green-600 via-white to-red-600',
                    'buenos aires':'bg-gradient-to-br from-sky-400 via-white to-sky-400',
                    'rio de janeiro':'bg-gradient-to-br from-green-600 via-yellow-400 to-blue-700',
                    toronto:'bg-gradient-to-br from-red-600 via-white to-red-600',
                    chicago:'bg-gradient-to-br from-blue-600 via-red-600 to-blue-600',
                    'las vegas':'bg-gradient-to-br from-purple-700 via-pink-500 to-amber-400',
                    mykonos:'bg-gradient-to-br from-blue-500 via-white to-sky-300',
                    ibiza:'bg-gradient-to-br from-orange-500 via-pink-400 to-purple-600',
                    rome:'bg-gradient-to-br from-green-600 via-white to-red-600',
                    vienna:'bg-gradient-to-br from-red-700 via-white to-red-700',
                    prague:'bg-gradient-to-br from-blue-600 via-white to-red-600',
                    amsterdam:'bg-gradient-to-br from-red-600 via-white to-blue-600',
                };
                if (gradients[c]) return gradients[c];
                // Country-code fallback palettes
                const codeMap = {
                    US:'bg-gradient-to-br from-blue-700 via-white to-red-600',
                    GB:'bg-gradient-to-br from-blue-900 via-red-600 to-blue-900',
                    AU:'bg-gradient-to-br from-blue-700 via-red-600 to-yellow-400',
                    FR:'bg-gradient-to-br from-blue-700 via-white to-red-600',
                    DE:'bg-gradient-to-br from-slate-900 via-red-700 to-amber-400',
                    ES:'bg-gradient-to-br from-red-700 via-yellow-400 to-red-700',
                    IT:'bg-gradient-to-br from-green-600 via-white to-red-600',
                    NL:'bg-gradient-to-br from-red-600 via-white to-blue-700',
                    PT:'bg-gradient-to-br from-green-600 via-red-600 to-green-600',
                    BR:'bg-gradient-to-br from-green-600 via-yellow-400 to-blue-700',
                    MX:'bg-gradient-to-br from-green-600 via-white to-red-600',
                    CA:'bg-gradient-to-br from-red-600 via-white to-red-600',
                    JP:'bg-gradient-to-br from-white via-red-100 to-red-600',
                    TH:'bg-gradient-to-br from-red-600 via-white to-blue-700',
                    GR:'bg-gradient-to-br from-blue-600 via-white to-blue-600',
                    ZA:'bg-gradient-to-br from-green-700 via-yellow-400 to-red-600',
                    AR:'bg-gradient-to-br from-sky-400 via-white to-sky-400',
                };
                return codeMap[code] || 'bg-gradient-to-br from-pride-purple via-pride-blue to-pride-green';
            }

            // Featured destination photo map — only these 28 cities show real photos on landing/view-more cards
            const FEATURED_CITIES = ['amsterdam','new york','orlando','los angeles','chicago','san francisco','paris','tokyo','honolulu','bangkok','las vegas','sydney','palm springs','puerto vallarta','rio de janeiro','miami','new orleans','toronto','fort lauderdale','berlin','san juan','vancouver','london','cancun','washington','sitges','barcelona','madrid'];

            const FEATURED_PHOTO_MAP = {
                'amsterdam':      ['https://images.unsplash.com/photo-1722888488018-54d2fa4f79a1?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=800&q=80'],
                'new york':       ['https://images.unsplash.com/photo-1715725832589-59689198819c?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1602940659805-770d1b3b9911?auto=format&fit=crop&w=800&q=80'],
                'orlando':        ['https://images.unsplash.com/photo-1588882929086-51acd6e39954?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1646506810472-5947b05f1cee?auto=format&fit=crop&w=800&q=80'],
                'los angeles':    ['https://images.unsplash.com/photo-1587654980578-e7e1a26f309b?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1580655653885-65763b2597d0?auto=format&fit=crop&w=800&q=80'],
                'chicago':        ['https://images.unsplash.com/photo-1593059232496-e1f0950069f2?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1746044203846-b1c9d04f8a80?auto=format&fit=crop&w=800&q=80'],
                'san francisco':  ['https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1656306197068-c1256592534f?auto=format&fit=crop&w=800&q=80'],
                'paris':          ['https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1671485429799-249e8acb2ee6?auto=format&fit=crop&w=800&q=80'],
                'tokyo':          ['https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1554797589-7241bb691973?auto=format&fit=crop&w=800&q=80'],
                'honolulu':       ['https://images.unsplash.com/photo-1547537352-ae90c682877e?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1567416421547-5d627e718089?auto=format&fit=crop&w=800&q=80'],
                'bangkok':        ['https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80','https://plus.unsplash.com/premium_photo-1661882283038-a3af3337783e?auto=format&fit=crop&w=800&q=80'],
                'las vegas':      ['https://plus.unsplash.com/premium_photo-1671132512859-f50459af3812?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1676345338852-29fb1026c12f?auto=format&fit=crop&w=800&q=80'],
                'sydney':         ['https://images.unsplash.com/photo-1528072164453-f4e8ef0d475a?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1547538160-bbd967711070?auto=format&fit=crop&w=800&q=80'],
                'palm springs':   ['https://images.unsplash.com/photo-1621881806763-1b8128f374a7?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1666081390937-2af460ef68f7?auto=format&fit=crop&w=800&q=80'],
                'puerto vallarta':['https://images.unsplash.com/photo-1640819916480-e5adc6888a41?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1662044158875-8323c0cb22cd?auto=format&fit=crop&w=800&q=80'],
                'rio de janeiro': ['https://images.unsplash.com/photo-1589137846286-b70355bb0d07?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1668194645738-ef8dbb426086?auto=format&fit=crop&w=800&q=80'],
                'miami':          ['https://images.unsplash.com/photo-1535498730771-e735b998cd64?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?auto=format&fit=crop&w=800&q=80'],
                'new orleans':    ['https://images.unsplash.com/photo-1635352934507-cd4ad73275c6?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1610746799307-e5b7872b6537?auto=format&fit=crop&w=800&q=80'],
                'toronto':        ['https://images.unsplash.com/photo-1517090504586-fde19ea6066f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1507992781348-310259076fe0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
                'fort lauderdale':['https://images.unsplash.com/photo-1692678813200-d746a746bf07?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1723460691049-fff69b3f16a8?auto=format&fit=crop&w=800&q=80'],
                'berlin':         ['https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1587330979470-3595ac045ab0?auto=format&fit=crop&w=800&q=80'],
                'san juan':       ['https://images.unsplash.com/photo-1580254237448-f76e1fc0cf91?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1569861612889-cbe3cf0dac5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
                'vancouver':      ['https://images.unsplash.com/photo-1560814304-4f05b62af116?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1609825488888-3a766db05542?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
                'london':         ['https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&w=800&q=80'],
                'cancun':         ['https://images.unsplash.com/photo-1510097467424-192d713fd8b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1573843981267-be1999ff37cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
                'washington':     ['https://images.unsplash.com/photo-1501775570656-3e4398303ecc?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1617581629397-a72507c3de9e?auto=format&fit=crop&w=800&q=80'],
                'sitges':         ['https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1555881400-74d7acaacd8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
                'barcelona':      ['https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1464790719320-516ecd75af6c?auto=format&fit=crop&w=800&q=80'],
                'madrid':         ['https://images.unsplash.com/photo-1520038622504-ef66a54f12a5?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1568697531347-5b9e3f46dbd8?auto=format&fit=crop&w=800&q=80'],
            };
            // Cities that have user-provided photos — carousel slots 2 & 3 rotate only within this set until all 28 are updated
            const CAROUSEL_PHOTO_READY = ['amsterdam','new york','orlando','los angeles','chicago','san francisco','paris','tokyo','honolulu','bangkok','las vegas','sydney','palm springs','puerto vallarta','rio de janeiro','miami','new orleans','toronto','fort lauderdale','berlin','san juan','vancouver','london','cancun','washington','sitges','barcelona','madrid'];

            function getFeaturedPhotoUrl(city) {
                if (!city) return null;
                const c = city.toLowerCase();
                let photos = null;
                // Direct match
                if (FEATURED_PHOTO_MAP[c]) photos = FEATURED_PHOTO_MAP[c];
                else {
                    // Partial match (e.g. "New York City (All Airports)" → "new york")
                    for (const key of FEATURED_CITIES) {
                        if (c.includes(key) || c.startsWith(key)) { photos = FEATURED_PHOTO_MAP[key] || null; break; }
                    }
                }
                if (!photos || !photos.length) return null;
                return photos[Math.floor(Math.random() * photos.length)];
            }

            function isFeaturedCity(city) {
                if (!city) return false;
                const c = city.toLowerCase();
                return FEATURED_CITIES.some(k => c === k || c.includes(k) || c.startsWith(k));
            }

            // Returns the image HTML block for a featured destination card (photo or gradient fallback)
            function featuredCardImageHtml(city, code, heightClass) {
                const h = heightClass || 'h-56';
                const photoUrl = getFeaturedPhotoUrl(city);
                const grad = getCityGradient(city, code);
                const flagEmoji = countryCodeToFlag(code || 'US');
                if (photoUrl) {
                    return `<div class="w-full ${h} relative overflow-hidden"><img src="${photoUrl}" alt="${city}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="eager" referrerpolicy="no-referrer" onerror="this.parentElement.className='w-full ${h} ${grad} flex items-center justify-center text-8xl select-none drop-shadow-lg group-hover:scale-105 transition-transform duration-700';this.parentElement.innerHTML='${flagEmoji}';"></div>`;
                }
                return `<div class="w-full ${h} ${grad} flex items-center justify-center text-8xl select-none drop-shadow-lg group-hover:scale-105 transition-transform duration-700">${flagEmoji}</div>`;
            }

            function getHotelBadge(h) {
                if (!h) return 'Unknown';
                if (h.type === 'Event Special') return 'Event Special';
                let specialTags = ['LGBTQ Owned/Operated', 'LGBTQ Friendly', 'LGBTQ Hotels & Resorts', 'LGBTQ Resort', 'LGBTQ Hotel', 'LGBTQ Owned', 'Gay Hotel', 'Men Only', 'Adults Only', 'Adults-Only', 'Mens Only', 'World Rainbow Hotels Member', 'IGLTA Accredited', 'World Rainbow Hotel', 'Event Hotel'];
                if (h.tags) {
                    let found = h.tags.find(t => specialTags.includes(t));
                    if (found) {
                        if (found === 'Men Only' || found === 'Mens Only') found = 'Men-Only';
                        if (found === 'Adults Only') found = 'Adults-Only';
                        if (h.type && found.toLowerCase().includes(h.type.toLowerCase())) {
                            return found;
                        }
                        return `${h.type || 'Hotel'} ${found}`;
                    }
                }
                return h.type || 'Hotel';
            }

            function getHotelTagsInfo(h) {
                if (!h) return { specialty: null, priceTag: null, certifications: [] };

                const tags = h.tags || [];
                let specialty = null;
                let priceTag = null;
                let certifications = [];
                const priceLevels = ['Budget', 'Mid-priced', 'Mid-Priced', 'Moderate', 'Luxury'];

                for (const tag of tags) {
                    // Specialty tags
                    if (tag === 'Luxury') {
                        specialty = 'Luxury';
                    } else if (tag === 'LGBTQ Friendly') {
                        specialty = specialty === 'Luxury' ? 'Luxury' : 'LGBTQ Friendly';
                    } else if (tag === 'LGBTQ Owned & Operated' || tag === 'LGBTQ Owned' ||
                               tag === 'LGBTQ Owned/Operated' || tag === 'LGBTQ Owned & Operated' ||
                               tag === 'LGBTQ Hotel' || tag === 'Gay Hotel') {
                        specialty = 'LGBTQ Owned';
                    } else if (tag === 'Event Hotel') {
                        specialty = specialty === 'Luxury' ? 'Luxury' : 'Event Hotel';
                    }

                    // Price tag (some destinations store price in tags)
                    if (priceLevels.includes(tag)) {
                        priceTag = tag;
                    }

                    // Certification tags
                    if (tag === 'World Rainbow Hotels Member' || tag === 'IGLTA Accredited' ||
                        tag === 'World Rainbow Hotel' || tag === 'IGLTA Member' ||
                        tag === 'Rainbow Registered (CGLCC)' || tag === 'World Rainbow Hotels') {
                        certifications.push(tag);
                    }
                }

                // Also check h.pricing / h.type / h.price for price (different destinations use different fields)
                if (!priceTag) {
                    if (h.pricing && priceLevels.includes(h.pricing)) priceTag = h.pricing;
                    else if (h.price && priceLevels.includes(h.price)) priceTag = h.price;
                    else if (h.type && priceLevels.includes(h.type)) priceTag = h.type;
                }

                // Don't show priceTag if it duplicates the specialty tag
                if (priceTag === specialty) priceTag = null;

                return { specialty, priceTag, certifications };
            }

            function calculateFareEstimate(baseRange) {
                if (!baseRange) return "$500 - $1600";
                const min = baseRange[0];
                const max = baseRange[1] * 2; // Double top end
                return `$${min} - $${max} `;
            }

            function getGoogleFlightsLink(origin, destination, start, end, dataObj) {
                // Check if destination has nearby airports (e.g., Fire Island, Provincetown)
                let destString = destination;
                if (dataObj && dataObj.nearbyAirports && dataObj.nearbyAirports.length > 0) {
                    destString = `${dataObj.nearbyAirports.join(' or ')}`;
                }
                const q = `Flights from ${origin} to ${destString} on ${start} returning ${end} `;
                return `https://www.google.com/travel/flights?q=${encodeURIComponent(q)}`;
            }

            function getNightlifeIcon(type) {
                const t = (type || '').toLowerCase();
                if (t.includes('sauna') || t.includes('bath')) return '<span class="material-symbols-outlined">hot_tub</span>';
                if (t.includes('club') || t.includes('disco')) return '<span class="material-symbols-outlined">celebration</span>';
                if (t.includes('bar')) return '<span class="material-symbols-outlined">local_bar</span>';
                if (t.includes('cruising')) return '<span class="material-symbols-outlined">visibility</span>';
                if (t.includes('cafe') || t.includes('bakery')) return '<span class="material-symbols-outlined">local_cafe</span>';
                if (t.includes('shop') || t.includes('store')) return '<span class="material-symbols-outlined">shopping_bag</span>';
                if (t.includes('restaurant') || t.includes('dining')) return '<span class="material-symbols-outlined">restaurant</span>';
                return '<span class="material-symbols-outlined">music_note</span>';
            }

            function getRestaurantIcon(type) {
                const t = (type || '').toLowerCase();
                if (t.includes('cafe') || t.includes('coffee')) return '<span class="material-symbols-outlined">coffee</span>';
                return '<span class="material-symbols-outlined">restaurant</span>';
            }

            function getExpediaLink(destination, start, end) {
                return `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(destination)}&startDate=${start}&endDate=${end}&amenities=LGBTQ_WELCOMING`;
            }

            function getBookingComLink(destination, start, end) {
                // Appends the Travel Proud filter if applicable (or uses keyword search workaround)
                return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination + ' LGBTQ Friendly')}&checkin=${start}&checkout=${end}&nflt=property_type%3D204`;
            }

            function getViatorLink(destination, start, end) {
                return `https://www.viator.com/searchResults/all?text=${encodeURIComponent(destination)}&startDate=${start}&endDate=${end}`;
            }

            function getEmailLink(origin, data, start, end) {
                const subject = `Trip Idea: ${data.name} for Pride Travel`;
                const body = `Hey,\n\nI found a great trip idea using OutAtlas!\n\nDestination: ${data.name}\nDates: ${start} to ${end}\nFrom: ${origin}\n\nWeather: ${data.weather}\nLGBTQ Safety: ${data.lgbtqSafety}\n\nCheck out flights:\nGoogle Flights: ${getGoogleFlightsLink(origin, data.name, start, end, data)}\n\nSent from OutAtlas`;
                return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            }

            function getWeatherIcon(weatherString) {
                const w = (weatherString || '').toLowerCase();
                if (w.includes('snow') || w.includes('freez')) return '<span class="material-symbols-outlined text-slate-200">snowing</span>';
                if (w.includes('rain') || w.includes('shower') || w.includes('drizzle') || w.includes('wet') || w.includes('humid')) return '<span class="material-symbols-outlined text-pride-blue">rainy</span>';
                if (w.includes('cloud') || w.includes('overcast') || w.includes('grey') || w.includes('gray') || w.includes('fog') || w.includes('mist')) return '<span class="material-symbols-outlined text-slate-400 dark:text-slate-300">cloudy</span>';
                if (w.includes('wind') || w.includes('storm') || w.includes('thunder')) return '<span class="material-symbols-outlined text-slate-400 dark:text-slate-300">air</span>';
                if (w.includes('warm') || w.includes('hot') || w.includes('sunny') || w.includes('dry') || w.includes('clear')) return '<span class="material-symbols-outlined text-pride-orange">sunny</span>';
                if (w.includes('cool') || w.includes('cold') || w.includes('mild') || w.includes('crisp')) return '<span class="material-symbols-outlined text-pride-blue">thermostat</span>';
                return '<span class="material-symbols-outlined text-pride-orange">sunny</span>';
            }

            function getEventsLink(destination, dateString) {
                const month = getMonthName(dateString);
                const q = `LGBTQ Events in ${destination} in ${month}`;
                return `https://www.google.com/search?q=${encodeURIComponent(q)}`;
            }

            function getMonthName(dateString) {
                const date = new Date(dateString);
                return date.toLocaleString('default', { month: 'long', timeZone: 'UTC' });
            }

            function formatDateShort(dateString) {
                if (!dateString) return '';
                const date = new Date(dateString + 'T00:00:00');
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            }

            function showEventsOnlyView(targets) {
                const container = document.getElementById('eventsOnlyContainer');
                if (!container) return;
                container.innerHTML = '';
                if (typeof showView === 'function') showView('eventsOnlyView');

                targets.forEach(targetKey => {
                    const data = DATABASE.details[targetKey];
                    if (!data) return;

                    const normalize = s => s ? s.toLowerCase().trim() : '';
                    const targetCityName = normalize(data.name.split(',')[0]);

                    const specialEvents = SPECIAL_EVENTS_DATA.filter(e => {
                        const ec = normalize(e.city);
                        return ec === normalize(targetKey) || ec === targetCityName;
                    });

                    const internalEvents = Array.isArray(data.events) ? data.events : [];

                    const seen = new Set();
                    const allEvents = [];
                    [...specialEvents, ...internalEvents].forEach(ev => {
                        if (ev && ev.name && !seen.has(ev.name)) { seen.add(ev.name); allEvents.push(ev); }
                    });

                    const byDate = (a, b) => new Date(a.start || 0) - new Date(b.start || 0);
                    const prideEvents = allEvents.filter(e => e.type !== 'Cruise').sort(byDate);
                    const cruises    = allEvents.filter(e => e.type === 'Cruise').sort(byDate);

                    // Renders a card matching the trending events style on the home page
                    const renderEventCard = ev => {
                        const s = getEventTypeStyle(ev.type);
                        const city      = (ev.city || targetKey).replace(/'/g, "\\'");
                        const safeStart = (ev.start || '').replace(/'/g, "\\'");
                        const safeEnd   = (ev.end   || '').replace(/'/g, "\\'");
                        const cityLabel = ev.city || data.name.split(',')[0];
                        const isPast = window.isPastEvent(ev);
                        const pastLabel = isPast ? '<span class="past-event-label" style="display:inline-block;background:rgba(100,100,100,0.5);color:white;padding:2px 6px;border-radius:3px;font-size:11px;font-weight:600;margin-left:6px;opacity:0.7;">Past Event</span>' : '';
                        return `
                        <div onclick="quickSearch('${city}', '${safeStart}', '${safeEnd}')"
                             class="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-lg border-l-4 ${s.border} flex gap-4 cursor-pointer hover:scale-[1.02] transition-transform relative group ${isPast ? 'opacity-60' : ''}">
                            <div class="w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center shrink-0 text-2xl leading-none">
                                ${s.emoji}
                            </div>
                            <div class="overflow-hidden pr-6 flex-1">
                                <p class="font-black text-slate-900 dark:text-white break-words leading-snug text-base">${ev.name}${pastLabel}</p>
                                ${buildTypeBadges(ev.type)}
                                <p class="text-xs font-bold text-slate-500 uppercase tracking-tighter">${cityLabel} &bull; ${formatDateShort(ev.start)}</p>
                            </div>
                            <div class="flex items-center">
                                <span class="material-symbols-outlined text-slate-200 group-hover:text-primary transition-colors">arrow_forward_ios</span>
                            </div>
                        </div>`;
                    };

                    const sectionHeader = (title, color, icon) => `
                        <div class="mb-3 mt-5">
                            <div class="px-4 py-2 bg-${color}/10 rounded-xl inline-flex items-center gap-2 border-l-4 border-${color} shadow-sm">
                                <span class="material-symbols-outlined text-${color}">${icon}</span>
                                <span class="font-extrabold text-lg pride-gradient-text">${title}</span>
                            </div>
                        </div>`;

                    // Group all events by type for labeled sections
                    const groupOrder = ['Pride Event','Bear','Fetish','Cruise','Circuit','Lesbian','Festival','Carnival','Carnival, Mardi Gras','Mardi Gras','Halloween','Christmas','NYE','Christmas, NYE','Christmas,NYE','Easter','4th of July','Labor Day','Memorial Day','Thanksgiving','Themed Event','Drag','Con','Amusement Park','Awards','Event'];
                    const groupMap = {};
                    allEvents.sort(byDate).forEach(ev => {
                        const k = ev.type || 'Pride Event';
                        if (!groupMap[k]) groupMap[k] = [];
                        groupMap[k].push(ev);
                    });
                    const orderedKeys = [...groupOrder.filter(k => groupMap[k]), ...Object.keys(groupMap).filter(k => !groupOrder.includes(k))];
                    let sectionsHtml = '';
                    orderedKeys.forEach(k => {
                        const s = getEventTypeStyle(k);
                        const label = k === 'Pride Event' ? 'Pride Events' : k === 'Cruise' ? 'LGBTQ Cruises' : k;
                        sectionsHtml += sectionHeader(label, s.border.replace('border-',''), s.icon) + `<div class="grid grid-cols-1 md:grid-cols-2 gap-3">${groupMap[k].map(renderEventCard).join('')}</div>`;
                    });
                    if (!sectionsHtml) sectionsHtml = `<p class="text-sm text-slate-700 dark:text-slate-300 py-6 text-center italic">No events currently listed for ${data.name}.</p>`;

                    const total = allEvents.length;
                    const card = document.createElement('div');
                    card.className = 'bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-primary/10 overflow-hidden fade-in-up mb-6';
                    card.innerHTML = `
                        <div class="pride-gradient-bg p-5 flex items-center gap-4">
                            <div class="text-4xl select-none filter drop-shadow-md">${data.image || '🏳️‍🌈'}</div>
                            <div class="flex-1 min-w-0">
                                <h2 class="text-lg font-black text-white truncate">${data.name}</h2>
                                <span class="text-[10px] font-bold text-white uppercase tracking-widest">${total} event${total !== 1 ? 's' : ''} found</span>
                            </div>
                            <a href="https://www.google.com/search?q=${encodeURIComponent('LGBTQ events ' + data.name + ' 2026')}" target="_blank"
                               class="shrink-0 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-full text-xs font-bold flex items-center gap-1 transition-colors">
                                <span class="material-symbols-outlined text-[13px]">search</span> All Events
                            </a>
                        </div>
                        <div class="p-4 space-y-1">${sectionsHtml}</div>
                        <div class="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700">
                            <p class="text-xs text-slate-700 dark:text-slate-300 mb-3 font-medium">Want full trip details — flights, hotels &amp; venues?</p>
                            <button onclick="document.getElementById('dateStart').focus(); toggleView('homeView');"
                                class="w-full py-2.5 btn-pride-yellow font-black rounded-full text-sm flex items-center justify-center gap-2 active:scale-95 transition-all border-b-2 border-orange-500">
                                <span class="material-symbols-outlined text-sm">calendar_today</span> Add Dates for Full Results
                            </button>
                        </div>`;
                    container.appendChild(card);
                });
            }

            window.showAllHotspots = function () {
                populateAllHotspots();
                toggleView('allHotspotsView');
            };

            function populateAllHotspots() {
                const grid = document.getElementById('allHotspotsGrid');
                if (!grid) return;

                if (!SPECIAL_EVENTS_DATA.length) {
                    grid.innerHTML = '<div class="col-span-full text-center py-10"><p class="text-slate-500">Loading your pride guide...</p></div>';
                    return;
                }

                const eventPool = SPECIAL_EVENTS_DATA.filter(e => e.type !== 'Cruise');
                const cruisePool = SPECIAL_EVENTS_DATA.filter(e => e.type === 'Cruise');
                const selEvents = getRandomSubset(eventPool, 20);
                const selCruises = getRandomSubset(cruisePool, 5);

                // Section helper for list-style cards (Events & Cruises)
                function listSection(title, color, icon, items) {
                    if (!items.length) return '';
                    const titleBox = `
                        <div class="col-span-full mt-8 mb-4">
                            <div class="px-4 py-2 bg-${color}/10 rounded-xl inline-flex items-center gap-2 border-l-4 border-${color} shadow-sm">
                                <span class="material-symbols-outlined text-${color}">${icon}</span>
                                <span class="font-extrabold text-xl pride-gradient-text">${title}</span>
                            </div>
                        </div>`;
                    const cards = items.map(h => {
                        const s = getEventTypeStyle(h.type);
                        const location = h.location || h.city || '';
                        const meta = h.date ? `${location} • ${h.date}` : location;
                        const query = h.searchQuery || h.city || h.name;
                        return `
                            <div onclick="quickSearch('${query.replace(/'/g, "\\'")}', '${h.start || ''}', '${h.end || ''}')"
                                 class="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-lg border-l-4 ${s.border} flex gap-4 cursor-pointer hover:scale-[1.02] transition-transform group relative">
                                <div class="w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center shrink-0 text-2xl leading-none">
                                    ${s.emoji}
                                </div>
                                <div class="overflow-hidden flex-1 pr-6">
                                    <p class="font-black text-slate-900 dark:text-white break-words leading-snug text-lg">${h.name}</p>
                                    ${buildTypeBadges(h.type)}
                                    <p class="text-xs font-bold text-slate-500 uppercase tracking-tighter">${meta}</p>
                                </div>
                                <div class="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span class="material-symbols-outlined text-slate-300">chevron_right</span>
                                </div>
                            </div>`;
                    }).join('');
                    return titleBox + `<div class="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">${cards}</div>`;
                }

                // More Featured Destinations section — 6 randomly selected from featured destinations with Unsplash images, excluding Amsterdam
                const allDestinations = (SAFE_HOTSPOTS_DATA || []).filter(h => h.city && h.city.toLowerCase() !== 'amsterdam' && CAROUSEL_PHOTO_READY.includes(h.city.toLowerCase()));
                const featuredDestinations = getRandomSubset(allDestinations, 6);
                const destTitleBox = `
                    <div class="col-span-full mt-8 mb-4">
                        <div class="px-4 py-2 bg-white dark:bg-slate-800 rounded-full inline-flex items-center gap-2 shadow-sm">
                            <span class="material-symbols-outlined text-slate-600 dark:text-slate-300">location_on</span>
                            <span class="font-extrabold text-lg text-slate-900 dark:text-white">More Featured Destination</span>
                        </div>
                    </div>`;
                const destCards = featuredDestinations.map(h => {
                    const cityEvents = SPECIAL_EVENTS_DATA.filter(e => e.city?.toLowerCase() === h.city?.toLowerCase() && e.type !== 'Cruise');
                    let tag = `<span class="bg-pride-blue text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase mb-2 inline-block shadow-lg">Featured Destination</span>`;
                    let params = `'${h.city.replace(/'/g, "\\'")}'`;
                    if (h.city === 'Amsterdam') {
                        tag = `<span class="bg-pride-orange text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase mb-2 inline-block shadow-lg">World Pride & Amsterdam Pride 2026</span>`;
                        params = `'Amsterdam', '2026-07-25', '2026-08-08'`;
                    } else if (cityEvents.length) {
                        tag = `<span class="bg-pride-orange text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase mb-2 inline-block shadow-lg truncate max-w-[200px]">Event: ${cityEvents[0].name}</span>`;
                        params = `'${h.city.replace(/'/g, "\\'")}', '${cityEvents[0].start}', '${cityEvents[0].end}'`;
                    }
                    const borderClass = h.city === 'Amsterdam' ? 'rainbow-border' : '';
                    return `
                        <div onclick="quickSearch(${params})"
                             class="rounded-3xl overflow-hidden relative group shadow-2xl cursor-pointer active:scale-95 transition-transform ${borderClass}">
                            ${featuredCardImageHtml(h.city, h.image, 'h-56')}
                            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
                            <div class="absolute bottom-5 left-5 right-5">
                                ${tag}
                                <h4 class="text-white text-xl font-black mb-1">${h.city}, ${h.country}</h4>
                                <div class="flex items-center gap-2 text-white/90 text-xs font-bold">
                                    <span class="material-symbols-outlined text-sm text-green-400 fill-1">verified_user</span> Equality Index: ${h.safetyScore || 'N/A'}/100
                                </div>
                            </div>
                        </div>`;
                }).join('');

                // Index all events by type for dynamic filter rendering
                // Split comma-separated types so multi-type events appear in all relevant filters
                // Events starting within 7 days of today are excluded from display
                _evtByType = {};
                SPECIAL_EVENTS_DATA.filter(e => !isEventTooSoon(e)).forEach(e => {
                    const types = (e.type || 'Pride Event').split(',').map(t => t.trim()).filter(Boolean);
                    types.forEach(t => {
                        if (!_evtByType[t]) _evtByType[t] = [];
                        _evtByType[t].push(e);
                    });
                });

                const FILTER_TYPES = [
                    {key:'all',         emoji:'✦',  label:'All Events'},
                    {key:'Pride Event',  emoji:'🌈', label:'Pride'},
                    {key:'Lesbian',     emoji:'🌺', label:'Lesbian'},
                    {key:'Fetish',      emoji:'⛓️', label:'Fetish'},
                    {key:'Bear',        emoji:'🐻', label:'Bear'},
                    {key:'Cruise',      emoji:'🚢', label:'Cruise'},
                    {key:'Circuit',     emoji:'🎵', label:'Circuit'},
                    {key:'Carnival',    emoji:'🎭', label:'Carnival / Mardi Gras'},
                    {key:'Festival',    emoji:'🎉', label:'Festival'},
                    {key:'Christmas',   emoji:'🎄', label:'Christmas'},
                    {key:'NYE',         emoji:'🥂', label:'NYE'},
                    {key:'Halloween',   emoji:'🎃', label:'Halloween'},
                ];

                const filterBtns = FILTER_TYPES.map(f => `
                    <button onclick="hotspotFilter('${f.key}')" data-fkey="${f.key}"
                        class="hotspot-filter-btn shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-black border-2 transition-all
                               ${f.key==='all' ? 'border-primary bg-primary text-white' : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-primary hover:text-primary'}">
                        <span class="text-base leading-none">${f.emoji}</span> ${f.label}
                    </button>`).join('');

                const filterHeader = `
                    <div class="col-span-full mt-8 mb-2">
                        <div class="px-4 py-2 bg-white dark:bg-slate-800 rounded-full inline-flex items-center gap-2 shadow-sm mb-4">
                            <span class="material-symbols-outlined text-slate-600 dark:text-slate-300">filter_list</span>
                            <span class="font-extrabold text-lg text-slate-900 dark:text-white">Browse LGBTQ Events</span>
                        </div>
                        <div class="flex flex-wrap gap-3 pb-2">${filterBtns}</div>
                    </div>`;

                grid.innerHTML =
                    destTitleBox +
                    `<div class="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">${destCards}</div>` +
                    filterHeader +
                    `<div id="hotspotEventGrid" class="col-span-full"></div>`;

                // Render initial "all" state
                hotspotFilter('all');
            }

            function buildHotspotEventCard(h) {
                const s = getEventTypeStyle(h.type);
                const query = (h.city || h.name || '').replace(/'/g, "\\'");
                const isPast = window.isPastEvent(h);
                const pastLabel = isPast ? '<span class="past-event-label" style="display:inline-block;background:rgba(100,100,100,0.5);color:white;padding:2px 6px;border-radius:3px;font-size:11px;font-weight:600;margin-left:6px;opacity:0.7;">Past Event</span>' : '';
                return `
                    <div onclick="quickSearch('${query}','${h.start||''}','${h.end||''}')"
                         class="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-lg border-l-4 ${s.border} flex gap-4 cursor-pointer hover:scale-[1.02] transition-transform group relative ${isPast ? 'opacity-60' : ''}">
                        <div class="w-14 h-14 rounded-xl ${s.bg} flex items-center justify-center shrink-0 text-3xl leading-none">${s.emoji}</div>
                        <div class="overflow-hidden flex-1 pr-6">
                            <p class="font-black text-slate-900 dark:text-white break-words leading-snug text-lg">${h.name}${pastLabel}</p>
                            ${buildTypeBadges(h.type)}
                            <p class="text-xs font-bold text-slate-500 uppercase tracking-tighter">${h.city||''} &bull; ${formatDateShort(h.start)}</p>
                        </div>
                        <div class="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span class="material-symbols-outlined text-slate-300">chevron_right</span>
                        </div>
                    </div>`;
            }

            function buildFilterSectionHead(label, s) {
                return `
                    <div class="col-span-full mt-5 mb-2">
                        <div class="px-4 py-2 ${s.bg} dark:bg-white text-slate-900 dark:text-slate-900 rounded-full inline-flex items-center gap-2 shadow-sm">
                            <span class="text-xl leading-none">${s.emoji}</span>
                            <span class="font-extrabold text-lg text-slate-900 dark:text-slate-900" style="font-weight: 900;">${label}</span>
                        </div>
                    </div>`;
            }

            // Tracks the currently active filter — reset to 'all' each time the view loads (never persisted)
            // Must be on window so the inline onclick button can read it (IIFE scope isn't accessible from HTML attributes)
            window._currentHotspotType = 'all';

            window.hotspotFilter = function(type, compact) {
                // compact=true → limit to 25 results (mobile-friendly); default=false → full results
                // compact is NEVER stored/remembered — each new view load or filter click uses full results
                window._currentHotspotType = type;
                // otherLimit: for 'all' view (full=20, compact=5); for specific filter (full=10, compact=5)
                const otherLimit = compact ? 5 : (type === 'all' ? 20 : 10);

                // Update pill button states
                document.querySelectorAll('.hotspot-filter-btn').forEach(btn => {
                    const active = btn.dataset.fkey === type;
                    btn.classList.toggle('bg-primary', active);
                    btn.classList.toggle('text-white', active);
                    btn.classList.toggle('border-primary', active);
                    btn.classList.toggle('bg-white', !active);
                    btn.classList.toggle('dark:bg-slate-800', !active);
                    btn.classList.toggle('text-slate-700', !active);
                    btn.classList.toggle('dark:text-slate-200', !active);
                    btn.classList.toggle('border-slate-200', !active);
                    btn.classList.toggle('dark:border-slate-600', !active);
                });

                const grid = document.getElementById('hotspotEventGrid');
                if (!grid) return;

                let html = '';

                if (type === 'all') {
                    // Full: 15 Pride + up to 20 Other + 5 Cruises = ~40 | Compact: 15 + 5 + 5 = 25
                    const pride   = getRandomSubset(_evtByType['Pride Event'] || [], 15);
                    const cruises = getRandomSubset(_evtByType['Cruise'] || [], 5);
                    const otherPool = [];
                    Object.keys(_evtByType).forEach(t => {
                        if (t === 'Pride Event' || t === 'Cruise') return;
                        otherPool.push(...(_evtByType[t] || []));
                    });
                    const others = getRandomSubset(otherPool, otherLimit);
                    if (pride.length) {
                        const s = getEventTypeStyle('Pride Event');
                        html += buildFilterSectionHead(`Pride Events (${pride.length})`, s);
                        html += `<div class="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${pride.map(buildHotspotEventCard).join('')}</div>`;
                    }
                    if (others.length) {
                        const sO = {emoji:'✨',border:'border-slate-400',bg:'bg-slate-100 dark:bg-slate-700/30',badge:'bg-slate-500 text-white'};
                        html += buildFilterSectionHead(`More LGBTQ Events (${others.length})`, sO);
                        html += `<div class="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${others.map(buildHotspotEventCard).join('')}</div>`;
                    }
                    if (cruises.length) {
                        const s = getEventTypeStyle('Cruise');
                        html += buildFilterSectionHead(`LGBTQ Cruises (${cruises.length})`, s);
                        html += `<div class="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${cruises.map(buildHotspotEventCard).join('')}</div>`;
                    }

                } else if (type === 'Cruise') {
                    // Cruise selected: show up to 25 cruises
                    const cruises = getRandomSubset(_evtByType['Cruise'] || [], 25);
                    const s = getEventTypeStyle('Cruise');
                    html += buildFilterSectionHead(`LGBTQ Cruises (${cruises.length})`, s);
                    html += `<div class="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${cruises.map(buildHotspotEventCard).join('')}</div>`;

                } else {
                    // Full: 40 of type + up to 10 other + 5 cruises = ~55 | Compact: 15 + 5 + 5 = 25
                    const selected = getRandomSubset(_evtByType[type] || [], compact ? 15 : 40);
                    const s = getEventTypeStyle(type);
                    if (selected.length) {
                        html += buildFilterSectionHead(`${s.label} Events (${selected.length})`, s);
                        html += `<div class="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${selected.map(buildHotspotEventCard).join('')}</div>`;
                    }
                    // Other mixed events (excluding selected type and cruises)
                    const othersPool = [];
                    Object.keys(_evtByType).forEach(t => {
                        if (t === type || t === 'Cruise') return;
                        othersPool.push(...(_evtByType[t] || []));
                    });
                    const others = getRandomSubset(othersPool, otherLimit);
                    if (others.length) {
                        const sO = {emoji:'✨',border:'border-slate-400',bg:'bg-slate-100 dark:bg-slate-700/30',badge:'bg-slate-500 text-white'};
                        html += buildFilterSectionHead(`More LGBTQ Events (${others.length})`, sO);
                        html += `<div class="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${others.map(buildHotspotEventCard).join('')}</div>`;
                    }
                    // Always 5 cruises at the bottom
                    const cruises = getRandomSubset(_evtByType['Cruise'] || [], 5);
                    if (cruises.length) {
                        const sc = getEventTypeStyle('Cruise');
                        html += buildFilterSectionHead(`LGBTQ Cruises (${cruises.length})`, sc);
                        html += `<div class="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${cruises.map(buildHotspotEventCard).join('')}</div>`;
                    }
                }

                grid.innerHTML = html;
            };

            // Returns true if the event starts within 7 days of today (should be hidden)
            function isEventTooSoon(e) {
                if (!e.start) return false;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const threshold = new Date(today);
                threshold.setDate(threshold.getDate() + 7);
                const eventStart = new Date(e.start + 'T00:00:00');
                return eventStart < threshold;
            }

            function populateTrendingEvents() {
                const grid = document.getElementById('eventsGrid');
                if (!grid) return;

                if (!SPECIAL_EVENTS_DATA || SPECIAL_EVENTS_DATA.length === 0) {
                    grid.innerHTML = '<p class="col-span-full text-center text-slate-400 py-10 italic">Checking for upcoming pride events...</p>';
                    return;
                }

                const cruises = SPECIAL_EVENTS_DATA.filter(e => e.type === 'Cruise' && !isEventTooSoon(e));
                const events = SPECIAL_EVENTS_DATA.filter(e => e.type !== 'Cruise' && !isEventTooSoon(e));

                // User wants 6 total: 4 events and 2 cruises
                const selEvents = getRandomSubset(events, 4);
                const selCruises = getRandomSubset(cruises, 2);

                let html = '';

                if (selEvents.length) {
                    html += `
                        <div class="col-span-full mb-4">
                            <div class="px-4 py-2 bg-white dark:bg-white/95 rounded-xl inline-flex items-center gap-2 border-l-4 border-pride-purple shadow-sm">
                                <span class="material-symbols-outlined text-pride-purple">event_upcoming</span>
                                <span class="font-extrabold text-xl pride-gradient-text dark:text-pride-purple">Upcoming LGBTQ Events</span>
                            </div>
                        </div>` + selEvents.map(e => renderTrendingCardSnippet(e)).join('');
                }

                if (selCruises.length) {
                    html += `
                        <div class="col-span-full mt-8 mb-4">
                            <div class="px-4 py-2 bg-white dark:bg-white/95 rounded-xl inline-flex items-center gap-2 border-l-4 border-pride-blue shadow-sm">
                                <span class="material-symbols-outlined text-pride-blue">directions_boat</span>
                                <span class="font-extrabold text-xl pride-gradient-text dark:text-pride-blue">Trending Cruises</span>
                            </div>
                        </div>` + selCruises.map(e => renderTrendingCardSnippet(e)).join('');
                }

                grid.innerHTML = html;
            }

            function getEventTypeStyle(type) {
                const t = (type || '').toLowerCase().trim();
                if (t.includes('christmas') && t.includes('nye')) return {emoji:'🎄🥂',icon:'celebration',border:'border-green-600',bg:'bg-green-100 dark:bg-green-900/20',text:'text-black',badge:'bg-green-600 text-white',gradient:'from-green-700 to-yellow-500',label:'Christmas & NYE',bannerTextColor:'text-yellow-200',eventNameColor:'text-black'};
                if (t.includes('carnival') || t.includes('mardi gras')) return {emoji:'🎭',icon:'masks',border:'border-purple-500',bg:'bg-purple-100 dark:bg-purple-900/20',text:'text-white',badge:'bg-purple-500 text-white',gradient:'from-purple-600 to-fuchsia-500',label:'Carnival / Mardi Gras',bannerTextColor:'text-white',eventNameColor:'text-white'};
                if (t.includes('lesbian')) return {emoji:'🌺',icon:'favorite',border:'border-rose-400',bg:'bg-rose-50 dark:bg-rose-900/20',text:'text-black',badge:'bg-rose-500 text-white',gradient:'from-rose-500 to-pink-400',label:'Lesbian',bannerTextColor:'text-white',eventNameColor:'text-black'};
                if (t.includes('fetish') && t.includes('bear')) return {emoji:'⛓️🐻',icon:'link',border:'border-slate-600',bg:'bg-slate-200 dark:bg-slate-700/50',text:'text-white',badge:'bg-slate-700 text-black dark:text-white',gradient:'from-slate-800 to-amber-700',label:'Fetish / Bear',bannerTextColor:'text-white',eventNameColor:'text-white'};
                if (t.includes('cruise') && t.includes('bear')) return {emoji:'🚢🐻',icon:'directions_boat',border:'border-blue-500',bg:'bg-blue-100 dark:bg-blue-900/20',text:'text-black',badge:'bg-blue-600 text-white',gradient:'from-blue-600 to-amber-700',label:'Bear Cruise',bannerTextColor:'text-white',eventNameColor:'text-black'};
                if (t.includes('cruise') && t.includes('lesbian')) return {emoji:'🚢🌺',icon:'directions_boat',border:'border-blue-400',bg:'bg-blue-50 dark:bg-blue-900/20',text:'text-black',badge:'bg-blue-500 text-white',gradient:'from-blue-500 to-rose-400',label:'Lesbian Cruise',bannerTextColor:'text-white',eventNameColor:'text-black'};
                if (t.includes('lesbian') && t.includes('circuit')) return {emoji:'🌺🎵',icon:'favorite',border:'border-rose-400',bg:'bg-rose-50 dark:bg-rose-900/20',text:'text-black',badge:'bg-rose-500 text-white',gradient:'from-rose-500 to-pink-500',label:'Lesbian Circuit',bannerTextColor:'text-white',eventNameColor:'text-black'};
                switch(t) {
                    case 'cruise':       return {emoji:'🚢',icon:'directions_boat',border:'border-blue-500',bg:'bg-blue-100 dark:bg-blue-900/20',text:'text-black',badge:'bg-blue-600 text-black',gradient:'from-blue-600 to-cyan-500',label:'Cruise',bannerTextColor:'text-white',eventNameColor:'text-black'};
                    case 'bear':         return {emoji:'🐻',icon:'pets',border:'border-amber-700',bg:'bg-amber-100 dark:bg-amber-900/20',text:'text-black',badge:'bg-amber-700 text-black',gradient:'from-amber-800 to-amber-600',label:'Bear',bannerTextColor:'text-white',eventNameColor:'text-black'};
                    case 'fetish':       return {emoji:'⛓️',icon:'link',border:'border-slate-600',bg:'bg-slate-200 dark:bg-slate-700/50',text:'text-white',badge:'bg-slate-700 text-black dark:text-white',gradient:'from-slate-800 to-slate-600',label:'Fetish',bannerTextColor:'text-white',eventNameColor:'text-white'};
                    case 'halloween':    return {emoji:'🎃',icon:'dark_mode',border:'border-orange-500',bg:'bg-orange-100 dark:bg-orange-900/20',text:'text-orange-600 dark:text-orange-400',badge:'bg-orange-500 text-white',gradient:'from-orange-600 to-amber-500',label:'Halloween',bannerTextColor:'text-white',eventNameColor:'text-orange-600 dark:text-orange-400'};
                    case 'christmas':    return {emoji:'🎄',icon:'park',border:'border-green-600',bg:'bg-green-100 dark:bg-green-900/20',text:'text-black',badge:'bg-green-600 text-black',gradient:'from-green-700 to-emerald-500',label:'Christmas',bannerTextColor:'text-white',eventNameColor:'text-black'};
                    case 'nye':          return {emoji:'🥂',icon:'celebration',border:'border-yellow-500',bg:'bg-yellow-100 dark:bg-yellow-900/20',text:'text-black',badge:'bg-yellow-500 text-black',gradient:'from-yellow-500 to-amber-400',label:"New Year's Eve",bannerTextColor:'text-yellow-200',eventNameColor:'text-black'};
                    case 'circuit':      return {emoji:'🎵',icon:'music_note',border:'border-pink-500',bg:'bg-pink-100 dark:bg-pink-900/20',text:'text-white',badge:'bg-pink-500 text-black dark:text-white',gradient:'from-pink-600 to-rose-500',label:'Circuit',bannerTextColor:'text-white',eventNameColor:'text-white'};
                    case 'lesbian':      return {emoji:'🌺',icon:'favorite',border:'border-rose-400',bg:'bg-rose-50 dark:bg-rose-900/20',text:'text-black',badge:'bg-rose-500 text-black',gradient:'from-rose-500 to-pink-400',label:'Lesbian',bannerTextColor:'text-white',eventNameColor:'text-black'};
                    case 'easter':       return {emoji:'🐣',icon:'egg_alt',border:'border-yellow-400',bg:'bg-yellow-50 dark:bg-yellow-900/20',text:'text-yellow-600 dark:text-yellow-400',badge:'bg-yellow-400 text-slate-800',gradient:'from-yellow-400 to-lime-400',label:'Easter',bannerTextColor:'text-yellow-200',eventNameColor:'text-yellow-600 dark:text-yellow-400'};
                    case '4th of july':  return {emoji:'🎆',icon:'flag',border:'border-red-600',bg:'bg-red-100 dark:bg-red-900/20',text:'text-red-700 dark:text-red-400',badge:'bg-red-600 text-white',gradient:'from-red-700 to-red-500',label:'4th of July',bannerTextColor:'text-white',eventNameColor:'text-red-700 dark:text-red-400'};
                    case 'labor day':    return {emoji:'☀️',icon:'beach_access',border:'border-sky-500',bg:'bg-sky-100 dark:bg-sky-900/20',text:'text-sky-600 dark:text-sky-400',badge:'bg-sky-500 text-white',gradient:'from-sky-600 to-blue-400',label:'Labor Day',bannerTextColor:'text-white',eventNameColor:'text-sky-600 dark:text-sky-400'};
                    case 'festival':     return {emoji:'🎉',icon:'festival',border:'border-rose-500',bg:'bg-rose-100 dark:bg-rose-900/20',text:'text-black',badge:'bg-rose-500 text-black',gradient:'from-rose-600 to-pink-500',label:'Festival',bannerTextColor:'text-white',eventNameColor:'text-black'};
                    case 'themed event': return {emoji:'🎊',icon:'celebration',border:'border-violet-500',bg:'bg-violet-100 dark:bg-violet-900/20',text:'text-violet-600 dark:text-violet-400',badge:'bg-violet-500 text-white',gradient:'from-violet-600 to-purple-500',label:'Themed Event',bannerTextColor:'text-white',eventNameColor:'text-violet-600 dark:text-violet-400'};
                    case 'carnival':     return {emoji:'🎭',icon:'masks',border:'border-purple-500',bg:'bg-purple-100 dark:bg-purple-900/20',text:'text-white',badge:'bg-purple-500 text-white',gradient:'from-purple-600 to-fuchsia-500',label:'Carnival / Mardi Gras',bannerTextColor:'text-white',eventNameColor:'text-white'};
                    case 'mardi gras':   return {emoji:'🎭',icon:'masks',border:'border-purple-500',bg:'bg-purple-100 dark:bg-purple-900/20',text:'text-white',badge:'bg-purple-500 text-white',gradient:'from-purple-600 to-fuchsia-500',label:'Carnival / Mardi Gras',bannerTextColor:'text-white',eventNameColor:'text-white'};
                    case 'drag':         return {emoji:'👑',icon:'auto_awesome',border:'border-fuchsia-500',bg:'bg-fuchsia-100 dark:bg-fuchsia-900/20',text:'text-fuchsia-600 dark:text-fuchsia-400',badge:'bg-fuchsia-500 text-white',gradient:'from-fuchsia-600 to-pink-500',label:'Drag',bannerTextColor:'text-white',eventNameColor:'text-fuchsia-600 dark:text-fuchsia-400'};
                    case 'con':          return {emoji:'🎮',icon:'sports_esports',border:'border-indigo-500',bg:'bg-indigo-100 dark:bg-indigo-900/20',text:'text-indigo-600 dark:text-indigo-400',badge:'bg-indigo-500 text-white',gradient:'from-indigo-600 to-blue-500',label:'Con',bannerTextColor:'text-white',eventNameColor:'text-indigo-600 dark:text-indigo-400'};
                    case 'amusement park': return {emoji:'🎡',icon:'attractions',border:'border-orange-400',bg:'bg-orange-100 dark:bg-orange-900/20',text:'text-orange-500 dark:text-orange-300',badge:'bg-orange-400 text-white',gradient:'from-orange-500 to-yellow-400',label:'Amusement Park',bannerTextColor:'text-yellow-200',eventNameColor:'text-orange-500 dark:text-orange-300'};
                    case 'awards':       return {emoji:'🏆',icon:'emoji_events',border:'border-yellow-600',bg:'bg-yellow-100 dark:bg-yellow-900/20',text:'text-yellow-700 dark:text-yellow-400',badge:'bg-yellow-600 text-white',gradient:'from-yellow-600 to-amber-500',label:'Awards',bannerTextColor:'text-yellow-200',eventNameColor:'text-yellow-700 dark:text-yellow-400'};
                    case 'memorial day': return {emoji:'🇺🇸',icon:'flag',border:'border-red-600',bg:'bg-red-100 dark:bg-red-900/20',text:'text-red-700 dark:text-red-400',badge:'bg-red-600 text-white',gradient:'from-red-700 to-blue-600',label:'Memorial Day',bannerTextColor:'text-white',eventNameColor:'text-red-700 dark:text-red-400'};
                    case 'thanksgiving': return {emoji:'🦃',icon:'set_meal',border:'border-orange-700',bg:'bg-orange-100 dark:bg-orange-900/20',text:'text-orange-700 dark:text-orange-400',badge:'bg-orange-700 text-white',gradient:'from-orange-700 to-amber-600',label:'Thanksgiving',bannerTextColor:'text-white',eventNameColor:'text-orange-700 dark:text-orange-400'};
                    case 'event':        return {emoji:'✨',icon:'star',border:'border-slate-400',bg:'bg-slate-100 dark:bg-slate-700/30',text:'text-slate-700 dark:text-slate-300',badge:'bg-slate-500 text-white',gradient:'from-slate-600 to-slate-500',label:'Event',bannerTextColor:'text-white',eventNameColor:'text-slate-700 dark:text-slate-300'};
                    default:             return {emoji:'🌈',icon:'celebration',border:'border-pride-purple',bg:'bg-pride-purple/10',text:'text-white',badge:'bg-pride-purple text-black dark:text-white',gradient:'from-pride-purple to-pride-blue',label:'Pride Event',bannerTextColor:'text-white',eventNameColor:'text-white'};
                }
            }

            // Returns one badge per distinct type for comma-separated multi-type events
            function buildTypeBadges(type) {
                const types = (type || 'Pride Event').split(',').map(t => t.trim()).filter(Boolean);
                const seen = new Set();
                const badges = types.map(t => {
                    const s = getEventTypeStyle(t);
                    if (seen.has(s.label)) return '';
                    seen.add(s.label);
                    return `<span class="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide ${s.badge} px-2 py-0.5 rounded-full">${s.emoji} ${s.label}</span>`;
                }).join('');
                return `<div class="flex flex-wrap gap-1 mt-0.5 mb-1">${badges}</div>`;
            }

            function renderTrendingCardSnippet(e) {
                const s = getEventTypeStyle(e.type);
                const cityName = (e.city || e.name || 'All').replace(/'/g, "\\'");
                const isPast = window.isPastEvent(e);
                const pastLabel = isPast ? '<span class="past-event-label" style="display:inline-block;background:rgba(100,100,100,0.5);color:white;padding:2px 6px;border-radius:3px;font-size:11px;font-weight:600;margin-left:6px;opacity:0.7;">Past Event</span>' : '';
                return `
                    <div onclick="quickSearch('${cityName}', '${e.start}', '${e.end}')"
                         class="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-lg border-l-4 ${s.border} flex gap-4 cursor-pointer hover:scale-[1.02] transition-transform relative group ${isPast ? 'opacity-60' : ''}">
                        <div class="w-14 h-14 rounded-xl ${s.bg} flex items-center justify-center shrink-0 text-3xl leading-none">
                            ${s.emoji}
                        </div>
                        <div class="overflow-hidden pr-6 flex-1">
                            <p class="font-black text-slate-900 dark:text-white break-words leading-snug text-lg">${e.name}${pastLabel}</p>
                            ${buildTypeBadges(e.type)}
                            <p class="text-xs font-bold text-slate-500 uppercase tracking-tighter">${e.city} &bull; ${formatDateShort(e.start)}</p>
                        </div>
                        <div class="flex items-center">
                            <span class="material-symbols-outlined text-slate-200 group-hover:text-primary transition-colors">arrow_forward_ios</span>
                        </div>
                    </div>`;
            }

            function populateSafeHotspots() {
                const container = document.getElementById('hotspotsContainer');
                if (!container) return;

                // Amsterdam (World Pride 2026) is always 1st — pulled from safeHotspots data
                const amsterdam = (SAFE_HOTSPOTS_DATA || []).find(h => h.city && h.city.toLowerCase() === 'amsterdam') || {
                    city: 'Amsterdam', country: 'Netherlands', safetyScore: 76, image: 'NL', featured: true
                };

                // Rotating 2 slots: only pick from cities with user-provided photos (excludes Amsterdam which is slot 1)
                const others = (SAFE_HOTSPOTS_DATA || []).filter(h => h.city && h.city.toLowerCase() !== 'amsterdam' && CAROUSEL_PHOTO_READY.includes(h.city.toLowerCase()));
                const selectedOthers = getRandomSubset(others, 2);
                const selected = [amsterdam, ...selectedOthers];

                container.innerHTML = selected.filter(h => h).map((h, index) => {
                    const cityEvents = SPECIAL_EVENTS_DATA.filter(e => e.city?.toLowerCase() === h.city?.toLowerCase() && e.type !== 'Cruise' && !isPastEvent(e));
                    let tag = `<span class="bg-pride-blue text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase mb-2 inline-block shadow-lg">Trending Destination</span>`;
                    let params = `'${h.city.replace(/'/g, "\\'")}'`;

                    if (h.city === 'Amsterdam') {
                        tag = `<span class="bg-pride-orange text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase mb-2 inline-block shadow-lg truncate max-w-[200px]">World Pride & Amsterdam Pride 2026</span>`;
                        params = `'Amsterdam', '2026-07-25', '2026-08-08'`;
                    } else if (cityEvents.length) {
                        tag = `<span class="bg-pride-orange text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase mb-2 inline-block shadow-lg truncate max-w-[200px]">Event: ${cityEvents[0].name}</span>`;
                        params = `'${h.city.replace(/'/g, "\\'")}', '${cityEvents[0].start}', '${cityEvents[0].end}'`;
                    }

                    const borderClass = h.city === 'Amsterdam' ? 'rainbow-border' : '';

                    return `
                        <div onclick="quickSearch(${params})"
                             class="min-w-[280px] snap-center rounded-3xl overflow-hidden relative group shadow-2xl cursor-pointer active:scale-95 transition-transform ${borderClass}">
                            ${featuredCardImageHtml(h.city, h.image, 'h-72')}
                            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
                            <div class="absolute bottom-6 left-6 right-6">
                                ${tag}
                                <h4 class="text-white text-2xl font-black mb-1">${h.city}, ${h.country}</h4>
                                <div class="flex items-center gap-2 text-white/90 text-xs font-bold">
                                    <span class="material-symbols-outlined text-sm text-green-400 fill-1">verified_user</span> Equality Index: ${h.safetyScore || 'N/A'}/100
                                </div>
                            </div>
                        </div>`;
                }).join('');
            }
        })();

// ── extracted script block ──────────────────────────────────────────────
if (typeof navigator.serviceWorker !== 'undefined') {
            navigator.serviceWorker.register('sw.js')
                .then(function (registration) { console.log('Service Worker registered'); })
                .catch(function (error) { console.log('Service Worker failed', error); });
        }

// ── extracted script block ──────────────────────────────────────────────
/* ============================================================================
           DARK MODE TOGGLE
           Toggle between dark and light modes with localStorage persistence
           ============================================================================ */
        function toggleDarkMode() {
            // Get current theme
            const currentTheme = getSavedTheme();

            // Determine new theme
            let newTheme;
            if (currentTheme === 'dark') {
                newTheme = 'light';
            } else if (currentTheme === 'light') {
                newTheme = 'dark';
            } else {
                // If in clear mode, switch to dark
                newTheme = 'dark';
            }

            // Apply new theme
            setTheme(newTheme);

            // Update theme selection in modal if it's open
            const modal = document.getElementById('settingsModal');
            if (modal && modal.classList.contains('open')) {
                updateThemeSelection();
            }
        }

        /* ============================================================================
           SETTINGS MODAL MANAGEMENT
           Handles modal open/close and theme selection UI updates
           ============================================================================ */

        /**
         * Open the Settings Modal
         */
        function openSettingsModal() {
            try {
                const modal = document.getElementById('settingsModal');
                if (!modal) {
                    console.error('Settings modal element not found');
                    return;
                }

                // Add open class to display modal
                modal.classList.add('open');
                console.log('Modal opened - open class added');

                // Prevent body scroll
                document.body.style.overflow = 'hidden';

                // Update all state displays
                updateThemeSelection();
                updateReduceMotionCheckbox();
                updateHighContrastCheckbox();

                // Focus on modal for accessibility
                modal.focus();
            } catch (error) {
                console.error('Error opening settings modal:', error);
            }
        }

        /**
         * Close the Settings Modal
         */
        function closeSettingsModal() {
            try {
                const modal = document.getElementById('settingsModal');
                if (!modal) {
                    console.error('Settings modal element not found');
                    return;
                }

                // Remove open class to hide modal
                modal.classList.remove('open');
                console.log('Modal closed - open class removed');

                // Restore body scroll
                document.body.style.overflow = '';
            } catch (error) {
                console.error('Error closing settings modal:', error);
            }
        }

        /**
         * Show the Search Warning Modal
         * Called when user tries to search for past dates
         */
        function showSearchWarningModal() {
            try {
                const modal = document.getElementById('searchWarningModal');
                if (!modal) {
                    console.error('Search warning modal element not found');
                    return;
                }
                modal.style.display = 'flex';
            } catch (error) {
                console.error('Error showing search warning modal:', error);
            }
        }

        /**
         * Close the Search Warning Modal
         */
        function closeSearchWarningModal() {
            try {
                const modal = document.getElementById('searchWarningModal');
                if (!modal) {
                    console.error('Search warning modal element not found');
                    return;
                }
                modal.style.display = 'none';
            } catch (error) {
                console.error('Error closing search warning modal:', error);
            }
        }

        /**
         * Update active state of theme buttons to match current theme
         */
        function updateThemeSelection() {
            const currentTheme = getSavedTheme();

            // Remove active class from all theme options
            document.querySelectorAll('.theme-option').forEach(option => {
                option.classList.remove('active');
            });

            // Add active class to current theme
            const themeMap = {
                'clear': '.clear-view',
                'light': '.light-mode',
                'dark': '.dark-mode'
            };

            const activeButton = document.querySelector(themeMap[currentTheme]);
            if (activeButton) {
                activeButton.classList.add('active');
            }
        }

        /**
         * Update reduce motion checkbox state
         */
        function updateReduceMotionCheckbox() {
            const checkbox = document.getElementById('reduceAnimations');
            const preferReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const savedPreference = store.getSync('reduce-motion') === 'true';

            checkbox.checked = savedPreference || preferReduceMotion;
        }

        /**
         * Toggle reduce motion preference
         */
        function toggleReduceMotion() {
            const checkbox = document.getElementById('reduceAnimations');
            const isChecked = checkbox.checked;

            store.set('reduce-motion', isChecked ? 'true' : 'false');

            if (isChecked) {
                document.documentElement.style.setProperty('--transition-base', 'none');
                document.body.classList.add('reduce-motion');
                console.log('Reduce motion enabled');
            } else {
                document.documentElement.style.removeProperty('--transition-base');
                document.body.classList.remove('reduce-motion');
                console.log('Reduce motion disabled');
            }
        }

        /**
         * Update high contrast checkbox state
         */
        function updateHighContrastCheckbox() {
            const checkbox = document.getElementById('highContrast');
            const preferHighContrast = window.matchMedia('(prefers-contrast: more)').matches;
            const savedPreference = store.getSync('high-contrast') === 'true';

            checkbox.checked = savedPreference || preferHighContrast;
        }

        /**
         * Toggle high contrast preference
         */
        function toggleHighContrast() {
            const checkbox = document.getElementById('highContrast');
            const isChecked = checkbox.checked;

            store.set('high-contrast', isChecked ? 'true' : 'false');

            if (isChecked) {
                document.body.classList.add('high-contrast');
                console.log('High contrast enabled');
            } else {
                document.body.classList.remove('high-contrast');
                console.log('High contrast disabled');
            }
        }

        /**
         * Initialize modal event listeners
         */
        document.addEventListener('DOMContentLoaded', function() {
            const modal = document.getElementById('settingsModal');

            // Safety check: ensure modal exists before proceeding
            if (!modal) {
                console.error('Settings modal element not found on page load');
                return;
            }

            const modalContent = modal.querySelector('.modal-content');
            const closeBtn = document.getElementById('close-modal');
            const themeButtons = document.querySelectorAll('[data-theme]');
            const darkModeToggle = document.getElementById('dark-mode-toggle');

            // Initialize with current theme on page load
            updateThemeSelection();
            updateReduceMotionCheckbox();
            updateHighContrastCheckbox();

            // Dark mode toggle button listener
            if (darkModeToggle) {
                darkModeToggle.addEventListener('click', toggleDarkMode);
            }

            // Close when clicking outside the modal content (on overlay background)
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    closeSettingsModal();
                }
            });

            // Prevent closing when clicking inside modal content
            if (modalContent) {
                modalContent.addEventListener('click', function(e) {
                    e.stopPropagation();
                });
            }

            // Close button click handler
            if (closeBtn) {
                closeBtn.addEventListener('click', closeSettingsModal);
            }

            // Theme button click handlers (alternative to inline onclick)
            themeButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const theme = this.getAttribute('data-theme');
                    if (theme) {
                        setTheme(theme);
                        updateThemeSelection();
                    }
                });
            });

            // Close on Escape key (globally)
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && modal.classList.contains('open')) {
                    closeSettingsModal();
                }
            });
        });

        // Listen for theme changes and update UI
        window.addEventListener('themechange', function(e) {
            updateThemeSelection();
            // Update dark mode toggle icon visibility
            const darkModeToggle = document.getElementById('dark-mode-toggle');
            if (darkModeToggle) {
                // Icon will automatically update based on dark-mode class on body
                // No need to manually update as CSS handles visibility via dark: pseudo-class
            }
        });

        // Expose functions to global scope for onclick handlers
        window.openSettingsModal = openSettingsModal;
        window.closeSettingsModal = closeSettingsModal;
        window.toggleDarkMode = toggleDarkMode;
        window.setTheme = setTheme;
        window.toggleReduceMotion = toggleReduceMotion;
        window.toggleHighContrast = toggleHighContrast;


// ── Event listeners (converted from inline onclick) ──────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('[data-sp-id="sp-auto-1"]')?.addEventListener('click', () => { toggleView('homeView'); });
  document.querySelector('[data-sp-id="sp-auto-2"]')?.addEventListener('click', () => { cycleTheme(); });
  document.querySelector('[data-sp-id="sp-auto-3"]')?.addEventListener('click', () => { showAllHotspots(); });
  document.querySelector('[data-sp-id="sp-auto-4"]')?.addEventListener('click', () => { showAllHotspots(); });
  document.querySelector('[data-sp-id="sp-auto-5"]')?.addEventListener('click', () => { toggleView('homeView'); });
  document.querySelector('[data-sp-id="sp-auto-6"]')?.addEventListener('click', () => { cycleTheme(); });
  document.querySelector('[data-sp-id="sp-auto-7"]')?.addEventListener('click', () => { toggleView('homeView'); });
  document.querySelector('[data-sp-id="sp-auto-8"]')?.addEventListener('click', () => { cycleTheme(); });
  document.querySelector('[data-sp-id="sp-auto-9"]')?.addEventListener('click', () => { toggleView('homeView'); });
  document.querySelector('[data-sp-id="sp-auto-10"]')?.addEventListener('click', () => { cycleTheme(); });
  document.querySelector('[data-sp-id="sp-auto-11"]')?.addEventListener('click', () => { hotspotFilter(_currentHotspotType, true); });
  document.querySelector('[data-sp-id="sp-auto-12"]')?.addEventListener('click', () => { psCloseModal(); });
  document.getElementById('ps-tab-in')?.addEventListener('click', () => { psSwitchTab('in'); });
  document.getElementById('ps-tab-up')?.addEventListener('click', () => { psSwitchTab('up'); });
  document.getElementById('ps-auth-forgot')?.addEventListener('click', () => { psForgotPassword(event); });
  document.getElementById('ps-auth-submit')?.addEventListener('click', () => { psSubmitAuth(); });
  document.querySelector('[data-sp-id="sp-auto-13"]')?.addEventListener('click', () => { psGoogleSignIn(); });
  document.getElementById('ps-trips-panel')?.addEventListener('click', () => { psCloseTripPanel(event); });
  document.querySelector('[data-sp-id="sp-auto-14"]')?.addEventListener('click', () => { psToggleTripPanelFullscreen(); });
  document.querySelector('[data-sp-id="sp-auto-15"]')?.addEventListener('click', () => { psTripPanel(false); });
  document.getElementById('ps-upcoming-trips-panel')?.addEventListener('click', () => { psCloseUpcomingTripsPanel(event); });
  document.querySelector('[data-sp-id="sp-auto-16"]')?.addEventListener('click', () => { psToggleUpcomingTripsFullscreen(); });
  document.querySelector('[data-sp-id="sp-auto-17"]')?.addEventListener('click', () => { psCloseUpcomingTripsPanel(); });
  document.getElementById('close-modal')?.addEventListener('click', () => { closeSettingsModal(); });
  document.querySelector('[data-sp-id="sp-auto-18"]')?.addEventListener('click', () => { setTheme('clear'); updateThemeSelection(); });
  document.querySelector('[data-sp-id="sp-auto-19"]')?.addEventListener('click', () => { setTheme('light'); updateThemeSelection(); });
  document.querySelector('[data-sp-id="sp-auto-20"]')?.addEventListener('click', () => { setTheme('dark'); updateThemeSelection(); });
  document.querySelector('[data-sp-id="sp-auto-21"]')?.addEventListener('click', () => { closeSearchWarningModal(); });
});
