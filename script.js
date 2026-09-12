/* =========================================================
   SPIDER-LINK
   Futuristic Wearable Technology Interface
   script.js
   ========================================================= */

"use strict";


/* =========================================================
   SPIDER-LINK GLOBAL STATE
   ========================================================= */

const SPIDERLINK = {

    version: "0.1.0",

    system: {
        online: true,
        mode: "NORMAL",
        battery: 87,
        connection: 2,
        temperature: 31,
        stability: 99
    },

    mask: {
        online: true,
        expression: "NORMAL",
        camera: true,
        audio: true
    },

    suit: {
        current: "CLASSIC"
    },

    ai: {
        name: "LARA",
        online: true
    },

    hud: {
        activePanel: "SYSTEM"
    },

    boot: {
        complete: false
    }

};


/* =========================================================
   DOM HELPERS
   ========================================================= */

const $ = (selector, parent = document) =>
    parent.querySelector(selector);

const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];


/* =========================================================
   STORAGE
   ========================================================= */

const STORAGE_KEY = "spiderlink_state";


/* =========================================================
   SAFE HTML ESCAPE
   ========================================================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   LOAD SAVED STATE
   ========================================================= */

function loadSavedState() {

    try {

        const saved =
            localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return;
        }

        const parsed =
            JSON.parse(saved);


        /* SYSTEM */

        if (parsed.system) {

            SPIDERLINK.system = {
                ...SPIDERLINK.system,
                ...parsed.system
            };

        }


        /* MASK */

        if (parsed.mask) {

            SPIDERLINK.mask = {
                ...SPIDERLINK.mask,
                ...parsed.mask
            };

        }


        /* SUIT */

        if (parsed.suit) {

            SPIDERLINK.suit = {
                ...SPIDERLINK.suit,
                ...parsed.suit
            };

        }


        /* AI */

        if (parsed.ai) {

            SPIDERLINK.ai = {
                ...SPIDERLINK.ai,
                ...parsed.ai
            };

        }


        /* HUD */

        if (parsed.hud) {

            SPIDERLINK.hud = {
                ...SPIDERLINK.hud,
                ...parsed.hud
            };

        }


        /*
         * Validate saved suit.
         * This prevents corrupted/old values from
         * breaking the suit selector.
         */

        const validSuits = [
            "CLASSIC",
            "SHADOW",
            "APEX",
            "CUSTOM"
        ];

        const savedSuit =
            String(
                SPIDERLINK.suit.current || ""
            )
            .trim()
            .toUpperCase();


        if (
            validSuits.includes(savedSuit)
        ) {

            SPIDERLINK.suit.current =
                savedSuit;

        } else {

            SPIDERLINK.suit.current =
                "CLASSIC";

        }


        /*
         * Validate AI name.
         */

        if (
            !SPIDERLINK.ai.name ||
            !String(
                SPIDERLINK.ai.name
            ).trim()
        ) {

            SPIDERLINK.ai.name =
                "LARA";

        }


        SPIDERLINK.boot.complete =
            false;

    } catch (error) {

        console.warn(
            "SPIDER-LINK: Could not load saved state.",
            error
        );

        localStorage.removeItem(
            STORAGE_KEY
        );

    }

}


/* =========================================================
   SAVE STATE
   ========================================================= */

function saveState() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(SPIDERLINK)
        );

    } catch (error) {

        console.warn(
            "SPIDER-LINK: Could not save state.",
            error
        );

    }

}


/* =========================================================
   SPLASH SCREEN
   ========================================================= */

function createSplashScreen() {

    /*
     * Your index.html already contains:
     *
     * #splashScreen
     *
     * Use that first.
     */

    let splash =
        $("#splashScreen");


    /*
     * Compatibility with the older
     * dynamically-created splash.
     */

    if (!splash) {

        splash =
            $("#spiderlink-splash");

    }


    /*
     * If the HTML already contains a splash,
     * use it instead of creating a second one.
     */

    if (splash) {

        return splash;

    }


    /*
     * Fallback splash.
     */

    splash =
        document.createElement("div");

    splash.id =
        "spiderlink-splash";

    splash.className =
        "splash-screen";

    splash.setAttribute(
        "aria-label",
        "SPIDER-LINK system initialization"
    );

    splash.innerHTML = `

        <div class="splash-grid"></div>

        <div class="splash-scan"></div>

        <div class="splash-content">

            <div class="splash-logo">

                <div class="splash-ring splash-ring-outer"></div>

                <div class="splash-ring splash-ring-inner"></div>

                <div class="splash-core">
                    <span></span>
                </div>

            </div>

            <div class="splash-brand">
                SPIDER-LINK
            </div>

            <div class="splash-subtitle">
                FUTURISTIC WEARABLE TECHNOLOGY
            </div>

            <div
                class="splash-status"
                id="splashStatus"
            >
                INITIALIZING SYSTEM
            </div>

            <div class="splash-progress">

                <div
                    class="splash-progress-bar"
                    id="splashProgressBar"
                ></div>

            </div>

            <div
                class="splash-percent"
                id="splashPercent"
            >
                0%
            </div>

        </div>

    `;

    document.body.prepend(
        splash
    );

    return splash;

}


/* =========================================================
   SPLASH ELEMENT HELPERS
   ========================================================= */

function getSplashElement(selector) {

    const splash =
        $("#splashScreen") ||
        $("#spiderlink-splash");

    if (!splash) {
        return null;
    }

    return $(
        selector,
        splash
    );

}


/* =========================================================
   SPLASH BOOT STEP
   ========================================================= */

function bootStep(
    percent,
    status,
    log,
    delay
) {

    return new Promise((resolve) => {

        window.setTimeout(() => {

            const progress =
                getSplashElement(
                    "#splashProgressBar"
                );

            const percentText =
                getSplashElement(
                    "#splashPercent"
                );

            const statusText =
                getSplashElement(
                    "#splashStatus"
                );


            if (progress) {

                progress.style.width =
                    `${percent}%`;

            }


            if (percentText) {

                percentText.textContent =
                    `${percent}%`;

            }


            if (statusText) {

                statusText.textContent =
                    status;

            }


            /*
             * New splash version uses
             * splash-details instead of splashLog.
             */

            const logText =
                getSplashElement(
                    "#splashLog"
                );


            if (logText) {

                logText.textContent =
                    log;

            }


            console.log(
                `[SPIDER-LINK BOOT] ${percent}% → ${status} → ${log}`
            );


            resolve();

        }, delay);

    });

}


/* =========================================================
   SPLASH EXIT
   ========================================================= */

function closeSplashScreen(splash) {

    if (!splash) {
        return;
    }


    splash.classList.add(
        "hidden"
    );


    /*
     * Compatibility with splash-screen CSS.
     */

    splash.classList.add(
        "splash-hidden"
    );


    document.body.style.overflow =
        "";


    window.setTimeout(() => {

        /*
         * Remove only dynamically-created
         * splash screens.
         *
         * The original HTML splash can remain
         * hidden safely.
         */

        if (
            splash.id ===
            "spiderlink-splash"
        ) {

            if (splash.isConnected) {

                splash.remove();

            }

        }

    }, 850);

}


/* =========================================================
   BOOT SEQUENCE
   ========================================================= */

async function runBootSequence() {

    const splash =
        createSplashScreen();


    document.body.style.overflow =
        "hidden";


    /*
     * Reset visible splash state.
     */

    splash.classList.remove(
        "hidden",
        "splash-hidden"
    );


    await bootStep(
        4,
        "INITIALIZING",
        "SPIDER-LINK BOOT SEQUENCE STARTING...",
        150
    );


    await bootStep(
        12,
        "POWER CORE",
        "POWER CORE INITIALIZED...",
        160
    );


    await bootStep(
        28,
        "SYSTEM CHECK",
        "SYSTEM TELEMETRY ONLINE...",
        180
    );


    await bootStep(
        43,
        "MASK LINK",
        "MASK INTERFACE CONNECTED...",
        180
    );


    await bootStep(
        57,
        "SUIT LINK",
        "SUIT PROFILE DATABASE READY...",
        180
    );


    await bootStep(
        71,
        "HUD CORE",
        "HUD RENDERING ENGINE ONLINE...",
        180
    );


    await bootStep(
        84,
        "AI CORE",
        `${escapeHTML(
            SPIDERLINK.ai.name
        )} AI CORE INITIALIZING...`,
        180
    );


    await bootStep(
        94,
        "SYNC",
        "PHONE // MASK // SUIT SYNCHRONIZED...",
        180
    );


    await bootStep(
        100,
        "SYSTEM ONLINE",
        "SPIDER-LINK READY.",
        260
    );


    SPIDERLINK.boot.complete =
        true;


    saveState();


    await new Promise(
        (resolve) => {

            window.setTimeout(
                resolve,
                650
            );

        }
    );


    closeSplashScreen(
        splash
    );

}


/* =========================================================
   DOM REFERENCES
   ========================================================= */

const heroAIName =
    $("#heroAIName");

const aiNameDisplay =
    $("#aiNameDisplay");

const aiNameInput =
    $("#aiNameInput");

const saveAI =
    $("#saveAI");

const commandAI =
    $("#commandAI");

const hudOptions =
    $$(".hud-option");

const suitCards =
    $$(".suit-card");

const systemOnlineElements =
    $$(".system-online");

const navLinks =
    $$(".nav-links a");


/* =========================================================
   AI NAME SYSTEM
   ========================================================= */

function updateAINameUI() {

    const name =
        SPIDERLINK.ai.name ||
        "LARA";


    if (heroAIName) {

        heroAIName.textContent =
            name;

    }


    if (aiNameDisplay) {

        aiNameDisplay.textContent =
            name;

    }


    if (aiNameInput) {

        aiNameInput.value =
            name;

    }


    if (commandAI) {

        commandAI.textContent =
            `${name}, system status.`;

    }

}


/* =========================================================
   SAVE AI NAME
   ========================================================= */

function saveAIName() {

    if (!aiNameInput) {
        return;
    }


    let newName =
        aiNameInput.value.trim();


    if (!newName) {

        newName =
            "LARA";

    }


    newName =
        newName
            .replace(/\s+/g, " ")
            .slice(0, 20);


    SPIDERLINK.ai.name =
        newName;


    updateAINameUI();


    saveState();


    showNotification(
        `AI identity updated → ${newName}`
    );

}


if (saveAI) {

    saveAI.addEventListener(
        "click",
        saveAIName
    );

}


if (aiNameInput) {

    aiNameInput.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                saveAIName();

            }

        }
    );

}


/* =========================================================
   HUD DATA
   ========================================================= */

const HUD_DATA = {

    SYSTEM: {

        title:
            "SYSTEM OVERVIEW",

        description:
            "Core SPIDER-LINK system telemetry.",

        mode:
            "NORMAL"

    },

    SUIT: {

        title:
            "SUIT CONTROL",

        description:
            "Current wearable suit configuration.",

        mode:
            "SUIT"

    },

    AI: {

        title:
            "AI CORE",

        description:
            "Personal intelligence and command interface.",

        mode:
            "AI"

    },

    CAMERA: {

        title:
            "CAMERA SYSTEM",

        description:
            "Mask camera and visual subsystem.",

        mode:
            "CAMERA"

    },

    SENSORS: {

        title:
            "SENSOR ARRAY",

        description:
            "Wearable sensor monitoring interface.",

        mode:
            "SENSORS"

    }

};


/* =========================================================
   HUD HEADER
   ========================================================= */

function getHUDMainHeader() {

    return $(".hud-main-header");

}


/* =========================================================
   HUD SCREEN MESSAGE
   ========================================================= */

function showHUDPanelMessage(panel) {

    const screen =
        $(".hud-screen");


    if (!screen) {
        return;
    }


    const existing =
        $(".hud-screen-label", screen);


    if (existing) {

        existing.remove();

    }


    if (!HUD_DATA[panel]) {
        return;
    }


    const label =
        document.createElement("div");


    label.className =
        "hud-screen-label";


    label.textContent =
        `${panel} // ${HUD_DATA[panel].mode}`;


    Object.assign(
        label.style,
        {

            position:
                "absolute",

            bottom:
                "18px",

            left:
                "50%",

            transform:
                "translateX(-50%)",

            color:
                "rgba(255,255,255,.5)",

            fontFamily:
                "Orbitron, sans-serif",

            fontSize:
                "8px",

            letterSpacing:
                ".14em"

        }
    );


    screen.appendChild(
        label
    );

}


/* =========================================================
   SET HUD PANEL
   ========================================================= */

function setHUDPanel(panel) {

    if (!HUD_DATA[panel]) {

        panel =
            "SYSTEM";

    }


    SPIDERLINK.hud.activePanel =
        panel;


    hudOptions.forEach(
        (button) => {

            const buttonText =
                button.textContent
                    .trim()
                    .toUpperCase();


            button.classList.toggle(
                "active",
                buttonText === panel
            );

        }
    );


    const header =
        getHUDMainHeader();


    if (header) {

        const title =
            $("h3", header);

        const description =
            $("p", header);


        if (title) {

            title.textContent =
                HUD_DATA[panel].title;

        }


        if (description) {

            description.textContent =
                HUD_DATA[panel].description;

        }

    }


    showHUDPanelMessage(
        panel
    );


    saveState();

}


hudOptions.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                const panel =
                    button.textContent
                        .trim()
                        .toUpperCase();


                setHUDPanel(
                    panel
                );

            }
        );

    }
);


/* =========================================================
   SUIT SYSTEM
   ========================================================= */

const SUIT_NAMES = {

    classic:
        "CLASSIC",

    shadow:
        "SHADOW",

    apex:
        "APEX",

    custom:
        "CUSTOM"

};


/* =========================================================
   NORMALIZE SUIT NAME
   ========================================================= */

function normalizeSuitName(name) {

    return String(
        name || ""
    )
        .trim()
        .toUpperCase()
        .replace(
            /\s+/g,
            "_"
        );

}


/* =========================================================
   GET SUIT NAME FROM CARD
   ========================================================= */

function getSuitNameFromCard(card) {

    if (!card) {

        return "CLASSIC";

    }


    /*
     * PRIMARY METHOD:
     *
     * Read the actual CSS class.
     *
     * Your HTML:
     *
     * .classic
     * .shadow
     * .apex
     * .custom
     */

    for (
        const className in SUIT_NAMES
    ) {

        if (
            card.classList.contains(
                className
            )
        ) {

            return SUIT_NAMES[
                className
            ];

        }

    }


    /*
     * SECONDARY METHOD:
     *
     * Read the H3 text.
     */

    const title =
        $("h3", card);


    if (title) {

        const titleName =
            normalizeSuitName(
                title.textContent
            );


        if (
            Object.values(
                SUIT_NAMES
            ).includes(
                titleName
            )
        ) {

            return titleName;

        }

    }


    /*
     * Final fallback.
     */

    return "CLASSIC";

}


/* =========================================================
   FORMAT SUIT NAME
   ========================================================= */

function formatSuitName(suit) {

    return String(
        suit || "CLASSIC"
    )
        .replaceAll(
            "_",
            " "
        )
        .toLowerCase()
        .replace(
            /\b\w/g,
            char =>
                char.toUpperCase()
        );

}


/* =========================================================
   SET SUIT
   ========================================================= */

function setSuit(
    suit,
    notify = true
) {

    const normalized =
        normalizeSuitName(
            suit
        );


    const validSuits =
        Object.values(
            SUIT_NAMES
        );


    const validSuit =
        validSuits.includes(
            normalized
        )
            ? normalized
            : "CLASSIC";


    /*
     * Update global state.
     */

    SPIDERLINK.suit.current =
        validSuit;


    /*
     * Get cards fresh from DOM.
     */

    const cards =
        $$(".suit-card");


    /*
     * Update each suit card.
     */

    cards.forEach(
        (card) => {

            const cardSuit =
                getSuitNameFromCard(
                    card
                );


            const isActive =
                cardSuit ===
                validSuit;


            card.classList.toggle(
                "active",
                isActive
            );


            /*
             * Optional status
             * element support.
             */

            const status =
                $(".suit-status", card);


            if (status) {

                status.textContent =
                    isActive
                        ? "SELECTED"
                        : "AVAILABLE";

            }

        }
    );


    /*
     * Store suit on BODY.
     */

    document.body.dataset.suit =
        validSuit;


    /*
     * Update optional UI labels.
     */

    updateSuitUI(
        validSuit
    );


    /*
     * Save selected suit.
     */

    saveState();


    /*
     * Notification.
     */

    if (notify) {

        showNotification(
            `SUIT PROFILE LOADED → ${formatSuitName(
                validSuit
            )}`
        );

    }


    /*
     * Developer console.
     */

    console.log(
        `%cSPIDER-LINK SUIT → ${validSuit}`,
        "color:#ff2638;font-weight:bold;"
    );

}


/* =========================================================
   UPDATE SUIT UI
   ========================================================= */

function updateSuitUI(suit) {

    /*
     * Supports future elements such as:
     *
     * <span data-suit></span>
     */

    const labels =
        $$("[data-suit]");


    labels.forEach(
        (element) => {

            element.textContent =
                formatSuitName(
                    suit
                );

        }
    );


    /*
     * Supports:
     *
     * <span class="current-suit"></span>
     */

    const currentSuitElements =
        $$(".current-suit");


    currentSuitElements.forEach(
        (element) => {

            element.textContent =
                formatSuitName(
                    suit
                );

        }
    );

}


/* =========================================================
   INITIALIZE SUIT SYSTEM
   ========================================================= */

function initializeSuitSystem() {

    const cards =
        $$(".suit-card");


    if (!cards.length) {

        console.warn(
            "SPIDER-LINK: No suit cards found."
        );

        return;

    }


    cards.forEach(
        (card) => {

            /*
             * Prevent duplicate listeners.
             */

            if (
                card.dataset.suitInitialized ===
                "true"
            ) {

                return;

            }


            card.dataset.suitInitialized =
                "true";


            card.addEventListener(
                "click",
                () => {

                    const selectedSuit =
                        getSuitNameFromCard(
                            card
                        );


                    console.log(
                        `[SPIDER-LINK] Selected suit: ${selectedSuit}`
                    );


                    setSuit(
                        selectedSuit,
                        true
                    );

                }
            );

        }
    );


    /*
     * Restore saved suit.
     */

    setSuit(
        SPIDERLINK.suit.current ||
        "CLASSIC",
        false
    );

}


/* =========================================================
   SYSTEM TELEMETRY
   ========================================================= */

function updateSystemStatus() {

    /*
     * Simulated battery drain.
     */

    if (
        Math.random() < 0.15
    ) {

        SPIDERLINK.system.battery -=
            1;

    }


    if (
        SPIDERLINK.system.battery < 20
    ) {

        SPIDERLINK.system.battery =
            87;

    }


    SPIDERLINK.system.connection =
        Math.floor(
            1 +
            Math.random() * 4
        );


    SPIDERLINK.system.temperature =
        Math.floor(
            29 +
            Math.random() * 7
        );


    SPIDERLINK.system.stability =
        Math.floor(
            97 +
            Math.random() * 3
        );


    updateTelemetryUI();

}


function updateTelemetryUI() {

    const labels =
        $$(".stat-label");


    labels.forEach(
        (label) => {

            const text =
                label.textContent
                    .trim()
                    .toUpperCase();


            const parent =
                label.parentElement;


            const value =
                parent
                    ? $(".stat-value", parent)
                    : null;


            if (!value) {
                return;
            }


            if (
                text.includes(
                    "BATTERY"
                )
            ) {

                value.textContent =
                    `${SPIDERLINK.system.battery}%`;


                value.classList.toggle(
                    "red",
                    SPIDERLINK.system.battery <=
                    20
                );


                value.classList.toggle(
                    "green",
                    SPIDERLINK.system.battery >
                    40
                );

            }


            if (
                text.includes(
                    "CONNECTION"
                ) ||
                text.includes(
                    "LATENCY"
                )
            ) {

                value.textContent =
                    `${SPIDERLINK.system.connection}ms`;

            }


            if (
                text.includes(
                    "TEMP"
                ) ||
                text.includes(
                    "TEMPERATURE"
                )
            ) {

                value.textContent =
                    `${SPIDERLINK.system.temperature}°C`;

            }


            if (
                text.includes(
                    "STABILITY"
                ) ||
                text.includes(
                    "SYSTEM"
                )
            ) {

                value.textContent =
                    `${SPIDERLINK.system.stability}%`;

            }

        }
    );

}


window.setInterval(
    updateSystemStatus,
    4000
);


/* =========================================================
   ONLINE INDICATORS
   ========================================================= */

function updateOnlineIndicators() {

    systemOnlineElements.forEach(
        (element) => {

            const text =
                element.querySelector(
                    "span"
                );


            if (
                SPIDERLINK.system.online
            ) {

                element.classList.add(
                    "online"
                );


                if (text) {

                    text.textContent =
                        "SYSTEM ONLINE";

                }

            } else {

                element.classList.remove(
                    "online"
                );


                if (text) {

                    text.textContent =
                        "SYSTEM OFFLINE";

                }

            }

        }
    );

}


/* =========================================================
   NOTIFICATION SYSTEM
   ========================================================= */

let notificationTimer =
    null;


function createNotificationElement() {

    let notification =
        $("#spiderlink-notification");


    if (notification) {

        return notification;

    }


    notification =
        document.createElement(
            "div"
        );


    notification.id =
        "spiderlink-notification";


    Object.assign(
        notification.style,
        {

            position:
                "fixed",

            right:
                "22px",

            bottom:
                "22px",

            zIndex:
                "99999",

            maxWidth:
                "320px",

            padding:
                "14px 18px",

            border:
                "1px solid rgba(255,38,56,.4)",

            borderRadius:
                "10px",

            background:
                "rgba(5,7,9,.92)",

            backdropFilter:
                "blur(15px)",

            color:
                "#f5f7fa",

            fontFamily:
                "Orbitron, sans-serif",

            fontSize:
                "9px",

            letterSpacing:
                ".08em",

            boxShadow:
                "0 15px 50px rgba(0,0,0,.45)",

            opacity:
                "0",

            transform:
                "translateY(10px)",

            transition:
                "opacity .2s ease, transform .2s ease",

            pointerEvents:
                "none"

        }
    );


    document.body.appendChild(
        notification
    );


    return notification;

}


function showNotification(message) {

    const notification =
        createNotificationElement();


    notification.textContent =
        message;


    notification.style.opacity =
        "1";


    notification.style.transform =
        "translateY(0)";


    clearTimeout(
        notificationTimer
    );


    notificationTimer =
        window.setTimeout(
            () => {

                notification.style.opacity =
                    "0";


                notification.style.transform =
                    "translateY(10px)";

            },
            2600
        );

}


/* =========================================================
   BUTTON RIPPLE
   ========================================================= */

function initializeButtonRipples() {

    $$("button").forEach(
        (button) => {

            button.addEventListener(
                "click",
                function(event) {

                    const rect =
                        button.getBoundingClientRect();


                    const ripple =
                        document.createElement(
                            "span"
                        );


                    Object.assign(
                        ripple.style,
                        {

                            position:
                                "absolute",

                            left:
                                `${event.clientX - rect.left}px`,

                            top:
                                `${event.clientY - rect.top}px`,

                            width:
                                "5px",

                            height:
                                "5px",

                            borderRadius:
                                "50%",

                            background:
                                "rgba(255,255,255,.35)",

                            transform:
                                "translate(-50%, -50%) scale(0)",

                            pointerEvents:
                                "none",

                            transition:
                                "transform .4s ease, opacity .4s ease"

                        }
                    );


                    if (
                        !button.style.position
                    ) {

                        button.style.position =
                            "relative";

                    }


                    button.style.overflow =
                        "hidden";


                    button.appendChild(
                        ripple
                    );


                    requestAnimationFrame(
                        () => {

                            ripple.style.transform =
                                "translate(-50%, -50%) scale(35)";


                            ripple.style.opacity =
                                "0";

                        }
                    );


                    window.setTimeout(
                        () => {

                            ripple.remove();

                        },
                        450
                    );

                }
            );

        }
    );

}


/* =========================================================
   SMOOTH NAVIGATION
   ========================================================= */

function initializeNavigation() {

    navLinks.forEach(
        (link) => {

            link.addEventListener(
                "click",
                (event) => {

                    const href =
                        link.getAttribute(
                            "href"
                        );


                    if (
                        !href ||
                        !href.startsWith("#")
                    ) {

                        return;

                    }


                    const target =
                        document.querySelector(
                            href
                        );


                    if (!target) {

                        return;

                    }


                    event.preventDefault();


                    target.scrollIntoView(
                        {

                            behavior:
                                "smooth",

                            block:
                                "start"

                        }
                    );

                }
            );

        }
    );

}


/* =========================================================
   ACTIVE NAVIGATION
   ========================================================= */

function updateActiveNavigation() {

    let current =
        "";


    const sections =
        $$("section[id]");


    const scrollPosition =
        window.scrollY +
        160;


    sections.forEach(
        (section) => {

            if (
                scrollPosition >=
                section.offsetTop
            ) {

                current =
                    section.id;

            }

        }
    );


    navLinks.forEach(
        (link) => {

            const href =
                link.getAttribute(
                    "href"
                );


            link.classList.toggle(
                "active",
                href ===
                `#${current}`
            );

        }
    );

}


window.addEventListener(
    "scroll",
    updateActiveNavigation,
    {
        passive: true
    }
);


/* =========================================================
   MASK EXPRESSIONS
   ========================================================= */

const MASK_EXPRESSIONS = [

    "NORMAL",
    "ALERT",
    "FOCUS",
    "STEALTH",
    "WARNING"

];


function setMaskExpression(
    expression
) {

    expression =
        String(
            expression || ""
        ).toUpperCase();


    if (
        !MASK_EXPRESSIONS.includes(
            expression
        )
    ) {

        expression =
            "NORMAL";

    }


    SPIDERLINK.mask.expression =
        expression;


    document.body.dataset.maskExpression =
        expression.toLowerCase();


    updateMaskExpressionUI();


    saveState();

}


function updateMaskExpressionUI() {

    const status =
        $(".mask-status");


    if (status) {

        status.textContent =
            `MASK // ${SPIDERLINK.mask.expression}`;

    }

}


function cycleMaskExpression() {

    const currentIndex =
        MASK_EXPRESSIONS.indexOf(
            SPIDERLINK.mask.expression
        );


    const nextIndex =
        (
            currentIndex + 1
        ) %
        MASK_EXPRESSIONS.length;


    setMaskExpression(
        MASK_EXPRESSIONS[
            nextIndex
        ]
    );

}


/* =========================================================
   AI COMMAND SYSTEM
   ========================================================= */

function processAICommand(
    command
) {

    const cleanCommand =
        String(
            command || ""
        )
        .trim()
        .toLowerCase();


    if (!cleanCommand) {
        return;
    }


    const aiName =
        String(
            SPIDERLINK.ai.name
        )
        .toLowerCase();


    let response =
        "COMMAND RECOGNIZED.";


    if (
        cleanCommand.includes(
            "system status"
        ) ||
        cleanCommand.includes(
            "status"
        )
    ) {

        response =
            `SYSTEM ONLINE • BATTERY ${SPIDERLINK.system.battery}% • STABILITY ${SPIDERLINK.system.stability}%`;

    }


    else if (
        cleanCommand.includes(
            "battery"
        )
    ) {

        response =
            `BATTERY LEVEL ${SPIDERLINK.system.battery}%`;

    }


    else if (
        cleanCommand.includes(
            "suit"
        )
    ) {

        response =
            `CURRENT SUIT → ${formatSuitName(
                SPIDERLINK.suit.current
            )}`;

    }


    else if (
        cleanCommand.includes(
            "camera"
        )
    ) {

        response =
            SPIDERLINK.mask.camera
                ? "CAMERA SYSTEM READY."
                : "CAMERA SYSTEM OFFLINE.";

    }


    else if (
        cleanCommand.includes(
            "hello"
        ) ||
        cleanCommand.includes(
            "hi"
        )
    ) {

        response =
            `HELLO. ${SPIDERLINK.ai.name} AI CORE IS ONLINE.`;

    }


    else if (
        cleanCommand.includes(
            "stealth"
        )
    ) {

        SPIDERLINK.system.mode =
            "STEALTH";


        setMaskExpression(
            "STEALTH"
        );


        response =
            "STEALTH MODE SIMULATED.";

    }


    else if (
        cleanCommand.includes(
            "normal"
        )
    ) {

        SPIDERLINK.system.mode =
            "NORMAL";


        setMaskExpression(
            "NORMAL"
        );


        response =
            "NORMAL MODE RESTORED.";

    }


    else if (
        cleanCommand.includes(
            aiName
        )
    ) {

        response =
            `${SPIDERLINK.ai.name} ONLINE. AWAITING COMMAND.`;

    }


    showNotification(
        response
    );


    saveState();

}


/* =========================================================
   AI COMMAND INPUT
   ========================================================= */

function initializeAICommands() {

    const input =
        $("#aiCommandInput");


    const button =
        $("#aiCommandButton");


    if (
        !input ||
        !button
    ) {

        return;

    }


    button.addEventListener(
        "click",
        () => {

            processAICommand(
                input.value
            );


            input.value =
                "";

        }
    );


    input.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();


                processAICommand(
                    input.value
                );


                input.value =
                    "";

            }

        }
    );

}


/* =========================================================
   HUD PARALLAX
   ========================================================= */

function initializeHUDParallax() {

    const hudFrame =
        $(".hud-frame");


    if (!hudFrame) {

        return;

    }


    hudFrame.addEventListener(
        "mousemove",
        (event) => {

            const rect =
                hudFrame.getBoundingClientRect();


            const x =
                (
                    event.clientX -
                    rect.left
                ) /
                rect.width;


            const y =
                (
                    event.clientY -
                    rect.top
                ) /
                rect.height;


            const rotateX =
                (y - 0.5) * -5;


            const rotateY =
                (x - 0.5) * 5;


            hudFrame.style.transform =
                `perspective(900px)
                 rotateX(${rotateX}deg)
                 rotateY(${rotateY}deg)`;

        }
    );


    hudFrame.addEventListener(
        "mouseleave",
        () => {

            hudFrame.style.transform =
                "perspective(900px) rotateX(0deg) rotateY(0deg)";

        }
    );

}


/* =========================================================
   INTERSECTION OBSERVER
   ========================================================= */

function initializeAnimations() {

    const animatedElements =
        $(
            ".system-card, .suit-card, .feature-row, .arch-node, .ai-panel"
        );


    if (
        !("IntersectionObserver" in window)
    ) {

        return;

    }


    const observer =
        new IntersectionObserver(
            (entries) => {

                entries.forEach(
                    (entry) => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "visible"
                            );


                            observer.unobserve(
                                entry.target
                            );

                        }

                    }
                );

            },
            {
                threshold: 0.12
            }
        );


    animatedElements.forEach(
        (element) => {

            element.style.opacity =
                "0";


            element.style.transform =
                "translateY(18px)";


            element.style.transition =
                "opacity .6s ease, transform .6s ease";


            observer.observe(
                element
            );

        }
    );

}


/* =========================================================
   VISIBILITY STYLES
   ========================================================= */

function addVisibilityStyles() {

    if (
        $("#spiderlink-visibility-styles")
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "spiderlink-visibility-styles";


    style.textContent = `

        .system-card.visible,
        .suit-card.visible,
        .feature-row.visible,
        .arch-node.visible,
        .ai-panel.visible {

            opacity:
                1 !important;

            transform:
                translateY(0) !important;

        }

        .nav-links a.active {
            color: #f5f7fa;
        }

        .nav-links a.active::after {
            width: 100%;
        }

    `;


    document.head.appendChild(
        style
    );

}


/* =========================================================
   KEYBOARD SHORTCUTS
   ========================================================= */

function initializeKeyboardShortcuts() {

    document.addEventListener(
        "keydown",
        (event) => {

            const active =
                document.activeElement;


            const typing =
                active &&
                (
                    active.tagName ===
                    "INPUT" ||
                    active.tagName ===
                    "TEXTAREA"
                );


            if (typing) {

                return;

            }


            /*
             * M
             * Cycle mask expression.
             */

            if (
                event.key.toLowerCase() ===
                "m"
            ) {

                cycleMaskExpression();


                showNotification(
                    `Mask expression → ${SPIDERLINK.mask.expression}`
                );

            }


            /*
             * 1–5
             * HUD panels.
             */

            const panelKeys = {

                "1":
                    "SYSTEM",

                "2":
                    "SUIT",

                "3":
                    "AI",

                "4":
                    "CAMERA",

                "5":
                    "SENSORS"

            };


            if (
                panelKeys[event.key]
            ) {

                setHUDPanel(
                    panelKeys[event.key]
                );

            }

        }
    );

}


/* =========================================================
   INITIALIZE UI
   ========================================================= */

function initializeUI() {

    updateAINameUI();


    updateOnlineIndicators();


    updateTelemetryUI();


    setHUDPanel(
        SPIDERLINK.hud.activePanel
    );


    /*
     * IMPORTANT:
     *
     * initializeSuitSystem()
     * handles suit cards AND
     * restores the saved suit.
     */

    initializeSuitSystem();


    setMaskExpression(
        SPIDERLINK.mask.expression
    );

}


/* =========================================================
   INITIALIZE INTERACTIONS
   ========================================================= */

function initializeInteractions() {

    initializeButtonRipples();


    initializeNavigation();


    initializeAICommands();


    initializeHUDParallax();


    initializeAnimations();


    initializeKeyboardShortcuts();


    addVisibilityStyles();


    updateActiveNavigation();

}


/* =========================================================
   CONSOLE DIAGNOSTICS
   ========================================================= */

function printDiagnostics() {

    console.log(
        "%cSPIDER-LINK",
        "color:#ff2638;font-size:24px;font-weight:bold;"
    );


    console.log(
        `%cSYSTEM ONLINE // v${SPIDERLINK.version}`,
        "color:#49ff9b;font-size:12px;"
    );


    console.log(
        `%cSUIT → ${SPIDERLINK.suit.current}`,
        "color:#ff2638;font-size:12px;font-weight:bold;"
    );


    console.log(
        `%cAI → ${SPIDERLINK.ai.name}`,
        "color:#49ff9b;font-size:12px;"
    );


    console.log(
        "%cPrototype interface initialized.",
        "color:#9aa3ad;font-size:11px;"
    );

}


/* =========================================================
   MAIN INITIALIZATION
   ========================================================= */

async function initializeSPIDERLINK() {

    /*
     * Load persistent configuration.
     */

    loadSavedState();


    /*
     * Build UI state.
     */

    initializeUI();


    /*
     * Start interactions.
     */

    initializeInteractions();


    /*
     * Diagnostics.
     */

    printDiagnostics();


    /*
     * Run cinematic boot.
     */

    await runBootSequence();

}


/* =========================================================
   START SYSTEM
   ========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeSPIDERLINK,
        {
            once: true
        }
    );

} else {

    initializeSPIDERLINK();

}


/* =========================================================
   PUBLIC DEBUG API
   ========================================================= */

window.SPIDERLINK =
    SPIDERLINK;


window.setSuit =
    setSuit;


window.getSuitNameFromCard =
    getSuitNameFromCard;


window.setMaskExpression =
    setMaskExpression;


window.setHUDPanel =
    setHUDPanel;


window.processAICommand =
    processAICommand;


window.runSPIDERLINKBoot =
    runBootSequence;


/* =========================================================
   END OF SPIDER-LINK
   ========================================================= */
