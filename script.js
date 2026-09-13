(() => {
  "use strict";

  /*
   * ============================================================
   * SPIDER-LINK
   * Original futuristic wearable-tech interface
   * Version: 0.1.0
   *
   * This is a software/UI prototype.
   * No dangerous hardware/projectile systems are implemented.
   * ============================================================
   */

  const STORAGE_KEY = "spiderlink_v1";

  const VALID_SUITS = [
    "CLASSIC",
    "SHADOW",
    "APEX",
    "CUSTOM"
  ];

  const VALID_HUDS = [
    "MINIMAL",
    "TACTICAL",
    "STEALTH",
    "DEVELOPER"
  ];

  const state = {
    suit: "CLASSIC",
    hud: "MINIMAL",
    aiName: ""
  };

  let notificationTimer = null;
  let splashFinished = false;

  /*
   * ------------------------------------------------------------
   * DOM HELPERS
   * ------------------------------------------------------------
   */

  const $ = (selector, root = document) => {
    return root.querySelector(selector);
  };

  const $$ = (selector, root = document) => {
    return Array.from(root.querySelectorAll(selector));
  };

  /*
   * ------------------------------------------------------------
   * STORAGE
   * ------------------------------------------------------------
   */

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return;
      }

      const saved = JSON.parse(raw);

      if (
        saved &&
        typeof saved.suit === "string" &&
        VALID_SUITS.includes(saved.suit.toUpperCase())
      ) {
        state.suit = saved.suit.toUpperCase();
      }

      if (
        saved &&
        typeof saved.hud === "string" &&
        VALID_HUDS.includes(saved.hud.toUpperCase())
      ) {
        state.hud = saved.hud.toUpperCase();
      }

      if (
        saved &&
        typeof saved.aiName === "string"
      ) {
        state.aiName = saved.aiName
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 20);
      }
    } catch (error) {
      console.warn("SPIDER-LINK: storage could not be loaded.", error);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state)
      );
    } catch (error) {
      console.warn("SPIDER-LINK: storage could not be saved.", error);
    }
  }

  /*
   * ------------------------------------------------------------
   * NOTIFICATION SYSTEM
   * ------------------------------------------------------------
   */

  function showNotification(message) {
    const notification = $("#notification");
    const notificationText = $("#notificationText");

    if (!notification || !notificationText) {
      console.info(`SPIDER-LINK → ${message}`);
      return;
    }

    notificationText.textContent = message;

    notification.classList.remove("show");

    // Force reflow so repeated notifications animate correctly.
    void notification.offsetWidth;

    notification.classList.add("show");

    clearTimeout(notificationTimer);

    notificationTimer = setTimeout(() => {
      notification.classList.remove("show");
    }, 2400);
  }

  /*
   * ------------------------------------------------------------
   * STATUS HELPERS
   * ------------------------------------------------------------
   */

  function setText(selector, value) {
    const element = $(selector);

    if (element) {
      element.textContent = value;
    }
  }

  function updateSystemStatus() {
    setText("#hudMode", state.hud);
    setText("#hudSuit", state.suit);

    setText(
      "#hudAI",
      state.aiName ? "ONLINE" : "OFFLINE"
    );

    setText(
      "#heroSuitName",
      state.suit
    );

    setText(
      "#selectedSuitName",
      state.suit
    );

    setText(
      "#heroAIName",
      state.aiName || "UNCONFIGURED"
    );

    setText(
      "#aiNameDisplay",
      state.aiName || "UNCONFIGURED"
    );
  }

  /*
   * ------------------------------------------------------------
   * SUIT SYSTEM
   * ------------------------------------------------------------
   *
   * Suit selection is controlled ONLY by data-suit.
   * Nothing is inferred from headings or card text.
   */

  function setSuit(suit, notify = true) {
    const normalized = String(suit || "")
      .trim()
      .toUpperCase();

    if (!VALID_SUITS.includes(normalized)) {
      console.warn(
        `SPIDER-LINK: invalid suit "${suit}".`
      );
      return;
    }

    state.suit = normalized;

    const suitCards = $$(".suit-card");

    suitCards.forEach((card) => {
      const cardSuit = String(
        card.dataset.suit || ""
      ).toUpperCase();

      const isActive = cardSuit === state.suit;

      card.classList.toggle(
        "active",
        isActive
      );

      const status = $(".suit-status", card);

      if (status) {
        status.textContent = isActive
          ? "SELECTED"
          : "AVAILABLE";
      }

      card.setAttribute(
        "aria-pressed",
        String(isActive)
      );
    });

    updateSystemStatus();
    saveState();

    if (notify) {
      showNotification(
        `SUIT SYSTEM → ${state.suit}`
      );
    }

    console.log(
      `SPIDER-LINK SUIT → ${state.suit}`
    );
  }

  function initializeSuits() {
    const suitCards = $$(".suit-card");

    suitCards.forEach((card) => {
      card.addEventListener("click", () => {
        setSuit(card.dataset.suit);
      });

      card.addEventListener("keydown", (event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
          setSuit(card.dataset.suit);
        }
      });
    });

    setSuit(state.suit, false);
  }

  /*
   * ------------------------------------------------------------
   * HUD SYSTEM
   * ------------------------------------------------------------
   */

  function setHUD(hud, notify = true) {
    const normalized = String(hud || "")
      .trim()
      .toUpperCase();

    if (!VALID_HUDS.includes(normalized)) {
      console.warn(
        `SPIDER-LINK: invalid HUD "${hud}".`
      );
      return;
    }

    state.hud = normalized;

    const hudButtons = $$(".hud-option");

    hudButtons.forEach((button) => {
      const buttonHUD = String(
        button.dataset.hud || ""
      ).toUpperCase();

      const isActive =
        buttonHUD === state.hud;

      button.classList.toggle(
        "active",
        isActive
      );

      button.setAttribute(
        "aria-pressed",
        String(isActive)
      );
    });

    updateSystemStatus();
    saveState();

    if (notify) {
      showNotification(
        `HUD MODE → ${state.hud}`
      );
    }
  }

  function initializeHUD() {
    const hudButtons = $$(".hud-option");

    hudButtons.forEach((button) => {
      button.addEventListener("click", () => {
        setHUD(button.dataset.hud);
      });
    });

    setHUD(state.hud, false);
  }

  /*
   * ------------------------------------------------------------
   * AI SYSTEM
   * ------------------------------------------------------------
   */

  function cleanAIName(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 20);
  }

  function updateAIUI() {
    const configured =
      Boolean(state.aiName);

    const displayName =
      state.aiName || "UNCONFIGURED";

    setText(
      "#heroAIName",
      displayName
    );

    setText(
      "#aiNameDisplay",
      displayName
    );

    setText(
      "#hudAI",
      configured
        ? "ONLINE"
        : "OFFLINE"
    );
  }

  function saveAIName() {
    const input = $("#aiNameInput");

    if (!input) {
      return;
    }

    const name = cleanAIName(input.value);

    if (!name) {
      showNotification(
        "ENTER AN AI DESIGNATION"
      );

      input.focus();
      return;
    }

    state.aiName = name;

    saveState();
    updateAIUI();

    input.value = "";

    showNotification(
      `AI LINK → ${name.toUpperCase()}`
    );
  }

  function initializeAI() {
    const saveButton = $("#saveAI");
    const input = $("#aiNameInput");
    const commandButton = $("#commandAI");

    if (saveButton) {
      saveButton.addEventListener(
        "click",
        saveAIName
      );
    }

    if (input) {
      input.addEventListener(
        "keydown",
        (event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            saveAIName();
          }
        }
      );
    }

    if (commandButton) {
      commandButton.addEventListener(
        "click",
        () => {
          if (!state.aiName) {
            showNotification(
              "AI NOT CONFIGURED"
            );
            return;
          }

          showNotification(
            `${state.aiName.toUpperCase()} → SYSTEM NOMINAL`
          );
        }
      );
    }

    updateAIUI();
  }

  /*
   * ------------------------------------------------------------
   * NAVIGATION
   * ------------------------------------------------------------
   */

  function initializeNavigation() {
    const links = $$(
      'a[href^="#"]'
    );

    links.forEach((link) => {
      link.addEventListener(
        "click",
        (event) => {
          const targetID =
            link.getAttribute("href");

          if (
            !targetID ||
            targetID === "#"
          ) {
            return;
          }

          const target =
            $(targetID);

          if (!target) {
            return;
          }

          event.preventDefault();

          target.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      );
    });
  }

  /*
   * ------------------------------------------------------------
   * SMALL INTERFACE EFFECTS
   * ------------------------------------------------------------
   */

  function initializeCardInteractions() {
    const cards = $$(
      ".system-card, .architecture-card, .safety-card"
    );

    cards.forEach((card) => {
      card.addEventListener(
        "mouseenter",
        () => {
          card.classList.add(
            "is-hovered"
          );
        }
      );

      card.addEventListener(
        "mouseleave",
        () => {
          card.classList.remove(
            "is-hovered"
          );
        }
      );
    });
  }

  /*
   * ------------------------------------------------------------
   * KEYBOARD SHORTCUTS
   * ------------------------------------------------------------
   */

  function initializeKeyboardControls() {
    document.addEventListener(
      "keydown",
      (event) => {
        // Ignore shortcuts while typing.
        const activeElement =
          document.activeElement;

        const isTyping =
          activeElement &&
          (
            activeElement.tagName === "INPUT" ||
            activeElement.tagName === "TEXTAREA" ||
            activeElement.isContentEditable
          );

        if (isTyping) {
          return;
        }

        switch (event.key.toLowerCase()) {
          case "1":
            setHUD("MINIMAL");
            break;

          case "2":
            setHUD("TACTICAL");
            break;

          case "3":
            setHUD("STEALTH");
            break;

          case "4":
            setHUD("DEVELOPER");
            break;

          case "q":
            setSuit("CLASSIC");
            break;

          case "w":
            setSuit("SHADOW");
            break;

          case "e":
            setSuit("APEX");
            break;

          case "r":
            setSuit("CUSTOM");
            break;

          default:
            break;
        }
      }
    );
  }

  /*
   * ------------------------------------------------------------
   * SPLASH SCREEN
   * ------------------------------------------------------------
   */

  function updateSplash(
    status,
    progress
  ) {
    setText(
      "#splashStatus",
      status
    );

    setText(
      "#splashPercent",
      `${Math.round(progress)}%`
    );

    const progressBar =
      $("#splashProgressBar");

    if (progressBar) {
      progressBar.style.width =
        `${Math.max(
          0,
          Math.min(100, progress)
        )}%`;
    }
  }

  function wait(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  async function runSplash() {
    if (splashFinished) {
      return;
    }

    splashFinished = true;

    const splash =
      $("#splashScreen");

    // If splash markup doesn't exist,
    // the rest of the website still works.
    if (!splash) {
      return;
    }

    const bootSequence = [
      {
        progress: 8,
        status: "INITIALIZING CORE"
      },
      {
        progress: 24,
        status: "CHECKING INTERFACE"
      },
      {
        progress: 42,
        status: "LINKING SYSTEMS"
      },
      {
        progress: 61,
        status: "LOADING HUD"
      },
      {
        progress: 78,
        status: "SYNCING SUIT"
      },
      {
        progress: 92,
        status: "VERIFYING AI LINK"
      },
      {
        progress: 100,
        status: "SYSTEM READY"
      }
    ];

    updateSplash(
      "INITIALIZING CORE",
      0
    );

    await wait(180);

    for (const step of bootSequence) {
      updateSplash(
        step.status,
        step.progress
      );

      await wait(180);
    }

    await wait(300);

    splash.classList.add("hidden");

    await wait(500);

    // Remove from accessibility tree after
    // the visual transition is complete.
    splash.setAttribute(
      "aria-hidden",
      "true"
    );
  }

  /*
   * ------------------------------------------------------------
   * SYSTEM RESET
   * ------------------------------------------------------------
   *
   * Useful while developing.
   * Run in browser console:
   *
   * SPIDERLINK.reset()
   */

  function resetSystem() {
    try {
      localStorage.removeItem(
        STORAGE_KEY
      );
    } catch (error) {
      console.warn(
        "SPIDER-LINK: reset failed.",
        error
      );
    }

    state.suit = "CLASSIC";
    state.hud = "MINIMAL";
    state.aiName = "";

    setSuit("CLASSIC", false);
    setHUD("MINIMAL", false);
    updateAIUI();

    showNotification(
      "SYSTEM RESET COMPLETE"
    );
  }

  /*
   * ------------------------------------------------------------
   * DEBUG API
   * ------------------------------------------------------------
   */

  window.SPIDERLINK = {
    state,

    setSuit,
    setHUD,

    showNotification,

    reset: resetSystem,

    version: "0.1.0"
  };

  /*
   * ------------------------------------------------------------
   * MAIN INITIALIZATION
   * ------------------------------------------------------------
   */

  async function initializeSPIDERLINK() {
    console.log(
      "%cSPIDER-LINK",
      "font-weight:900;font-size:24px;"
    );

    console.log(
      "Initializing SPIDER-LINK v0.1.0..."
    );

    loadState();

    initializeSuits();
    initializeHUD();
    initializeAI();
    initializeNavigation();
    initializeCardInteractions();
    initializeKeyboardControls();

    updateSystemStatus();

    console.log(
      `SUIT → ${state.suit}`
    );

    console.log(
      `HUD → ${state.hud}`
    );

    console.log(
      `AI → ${
        state.aiName || "UNCONFIGURED"
      }`
    );

    await runSplash();

    showNotification(
      "SPIDER-LINK ONLINE"
    );
  }

  /*
   * ------------------------------------------------------------
   * BOOT
   * ------------------------------------------------------------
   */

  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initializeSPIDERLINK,
      { once: true }
    );
  } else {
    initializeSPIDERLINK();
  }

})();
