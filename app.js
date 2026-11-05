/* ==========================================================================
   Credibiliti-AI | Pure Black Dark Mode, Loader Buffer, CIBIL Switch & Icon UI
   Concept & Built by Mohd Amir Ali (https://techwithamir.com)
   ========================================================================== */

(function () {
  "use strict";

  const ARCHETYPES = {
    aarav: {
      key: "aarav",
      passkey: "CRED-401-IN",
      name: "Aarav Sharma",
      roleTitle: "Senior Cloud Architect, Bengaluru",
      email: "aarav.sharma@bengaluru-cloud.in",
      nationalId: "IN-PAN-AAAPS8921K",
      employer: "Vanguard Cloud Systems India Pvt Ltd",
      iban: "HDFC0001204 / 501004928172",
      creditScore: 765,
      annualIncome: 3200000,
      monthlyDebt: 18000,
      utilization: 21,
      tenure: 6.5,
      delinq: 0,
      loanAmount: 2800000,
      loanTerm: 48,
      collateral: 650000,
      apr: 9.2
    },
    zoya: {
      key: "zoya",
      passkey: "CRED-502-IN",
      name: "Zoya Khan",
      roleTitle: "Biotech Founder, Hyderabad",
      email: "zoya.khan@deccan-biotech.in",
      nationalId: "IN-PAN-ABNPK4410M",
      employer: "Deccan Genomic Therapeutics Pvt Ltd",
      iban: "ICIC0000008 / 000805019284",
      creditScore: 655,
      annualIncome: 2400000,
      monthlyDebt: 28000,
      utilization: 49,
      tenure: 3.0,
      delinq: 0,
      loanAmount: 3200000,
      loanTerm: 36,
      collateral: 350000,
      apr: 10.4
    },
    david: {
      key: "david",
      passkey: "CRED-603-IN",
      name: "David D'Souza",
      roleTitle: "Marine Logistics Director, Mumbai",
      email: "david.dsouza@konkan-maritime.in",
      nationalId: "IN-PAN-ADUPD7732C",
      employer: "Konkan Freight & Maritime Terminals Ltd",
      iban: "SBIN0000300 / 30994817261",
      creditScore: 715,
      annualIncome: 2900000,
      monthlyDebt: 22000,
      utilization: 29,
      tenure: 5.0,
      delinq: 0,
      loanAmount: 3000000,
      loanTerm: 60,
      collateral: 900000,
      apr: 9.6
    },
    harpreet: {
      key: "harpreet",
      passkey: "CRED-704-IN",
      name: "Harpreet Singh Gill",
      roleTitle: "Agri-Tech Entrepreneur, Chandigarh",
      email: "harpreet.gill@punjab-coldchain.in",
      nationalId: "IN-PAN-AGMPG5519R",
      employer: "Satluj Cold-Chain & Agri Logistics LLP",
      iban: "UTIB0000042 / 918020044192",
      creditScore: 610,
      annualIncome: 1650000,
      monthlyDebt: 34000,
      utilization: 68,
      tenure: 2.0,
      delinq: 1,
      loanAmount: 2600000,
      loanTerm: 36,
      collateral: 250000,
      apr: 11.5
    }
  };

  const state = {
    theme: "dark",
    loginRole: "client",
    clientAuthSubMode: "signin",
    scoreMode: "global", // "global" (300-850) or "cibil" (300-900)
    activePortal: "client",
    activeView: "client-overview",
    wizardStep: 1,
    activeProfileKey: "aarav",
    profile: Object.assign({}, ARCHETYPES.aarav),
    lastEvaluation: null,
    toastTimerId: null,
    pendingTargetPortal: null,
    pendingTargetView: null
  };

  /* ========================================================================
     GLOBAL SCORE (300-850) <-> CIBIL SCORE (300-900) CONVERSION HELPERS
     ======================================================================== */

  function globalToCibil(globalScore) {
    const clamped = Math.max(300, Math.min(850, Number(globalScore) || 300));
    return Math.round(300 + ((clamped - 300) / 550) * 600);
  }

  function cibilToGlobal(cibilScore) {
    const clamped = Math.max(300, Math.min(900, Number(cibilScore) || 300));
    return Math.round(300 + ((clamped - 300) / 600) * 550);
  }

  function getDisplayedScore(p) {
    return state.scoreMode === "cibil" ? globalToCibil(p.creditScore) : Math.round(p.creditScore);
  }

  /* ========================================================================
     INDIAN RUPEE (INR) FORMATTER, SYSTEM DATE & CRYPTOGRAPHIC HASHING
     ======================================================================== */

  function formatINR(amount) {
    const num = Math.round(Number(amount) || 0);
    return "₹" + num.toLocaleString("en-IN");
  }

  function formatINRLakhs(amount) {
    const num = Number(amount) || 0;
    if (num >= 10000000) {
      return "₹" + (num / 10000000).toFixed(2) + " Cr";
    }
    if (num >= 100000) {
      return "₹" + (num / 100000).toFixed(2) + " L";
    }
    return formatINR(num);
  }

  function getCurrentLocalSystemDate() {
    const now = new Date();
    try {
      return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }).format(now);
    } catch (e) {
      return now.toLocaleDateString();
    }
  }

  function deterministicHash(prefix, rawValue) {
    const str = prefix + "::" + String(rawValue || "").trim().toUpperCase() + "::CREDIBILITI-SALT";
    let h1 = 0xdeadbeef ^ str.length;
    let h2 = 0x41c6ce57 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    const hex1 = (h1 >>> 0).toString(16).toUpperCase().padStart(8, "0");
    const hex2 = (h2 >>> 0).toString(16).toUpperCase().padStart(8, "0");
    return "ZK-" + prefix + "-" + hex1.slice(0, 4) + "-" + hex2.slice(0, 4);
  }

  function calculateMonthlyEMI(principal, annualAprPct, termMonths) {
    if (termMonths <= 0 || principal <= 0) return 0;
    const r = annualAprPct / 100 / 12;
    if (r <= 0) return principal / termMonths;
    const factor = Math.pow(1 + r, termMonths);
    return (principal * (r * factor)) / (factor - 1);
  }

  /* ========================================================================
     BASEL III, FOIR/DTI, SHAP & COUNTERFACTUAL ENGINE
     ======================================================================== */

  function evaluateApplication(p) {
    const monthlyIncome = Math.max(p.annualIncome / 12, 1);
    const emi = calculateMonthlyEMI(p.loanAmount, p.apr, p.loanTerm);
    const preDti = (p.monthlyDebt / monthlyIncome) * 100;
    const postDti = ((p.monthlyDebt + emi) / monthlyIncome) * 100;
    const lti = p.loanAmount / Math.max(p.annualIncome, 1);
    const collateralCoveragePct = (p.collateral / Math.max(p.loanAmount, 1)) * 100;
    const netLtv = Math.max(10, Math.min(100, 100 - collateralCoveragePct * 0.85));

    const scoreContrib = ((p.creditScore - 650) / 200) * 38;
    const dtiContrib = ((40 - postDti) / 40) * 28;
    const utilContrib = ((35 - p.utilization) / 65) * 16;
    const ltvContrib = Math.min(18, (p.collateral / Math.max(p.loanAmount, 1) - 0.15) * 26);
    const tenureContrib = Math.min(12, (p.tenure - 1.5) * 2.4);
    const delinqContrib = -(p.delinq * 14.5);
    const ltiContrib = ((2.2 - lti) / 2.2) * 10;

    const rawRiskIndex =
      -2.15 -
      scoreContrib * 0.042 -
      dtiContrib * 0.038 -
      utilContrib * 0.025 -
      ltvContrib * 0.028 -
      tenureContrib * 0.022 -
      delinqContrib * 0.055 -
      ltiContrib * 0.02;

    const pd12m = 1 / (1 + Math.exp(-rawRiskIndex));
    const pdPct = Math.max(0.35, Math.min(68.0, pd12m * 100));

    const securedCoverage = Math.min(0.85, (p.collateral / Math.max(p.loanAmount, 1)) * 0.78);
    const lgdPct = Math.max(12.0, (1 - securedCoverage) * 62.0);
    const eadInr = p.loanAmount;
    const eclInr = eadInr * (pdPct / 100) * (lgdPct / 100);

    const approvalOdds = Math.round(Math.max(8, Math.min(99, 100 - pdPct * 2.25)));

    let decision = "DECLINED";
    let statusClass = "declined";
    let tierLabel = "Tier-3 Adverse Risk";

    if (pdPct <= 8.8 && postDti <= 43.0 && p.creditScore >= 660 && p.delinq === 0) {
      decision = "APPROVED";
      statusClass = "approved";
      tierLabel = "Tier-1 Prime Sovereign";
    } else if (pdPct <= 17.5 && postDti <= 52.0 && p.creditScore >= 600 && p.delinq <= 1) {
      decision = "CONDITIONAL";
      statusClass = "conditional";
      tierLabel = "Tier-2 Near-Prime Restructurable";
    }

    const zkTokens = [
      { label: "Client Legal Name (Verified)", token: p.name },
      { label: "PAN / KYC Protection Token", token: deterministicHash("KYC", p.nationalId) },
      { label: "Employer Protection Token", token: deterministicHash("EMP", p.employer) },
      { label: "Account / IFSC Protection Token", token: deterministicHash("ACC", p.iban) }
    ];

    const scorePredicateTitle =
      state.scoreMode === "cibil" ? "CIBIL Score >= 680" : "Bureau Score >= 650";

    const predicates = [
      {
        title: scorePredicateTitle,
        passed: p.creditScore >= 650,
        detail: p.creditScore >= 650 ? "ZK Bureau Proof Verified" : "Below Policy Threshold"
      },
      {
        title: "Post-Loan FOIR/DTI <= 42%",
        passed: postDti <= 42.0,
        detail: postDti <= 42.0 ? "Within RBI / Basel Serviceability" : "Exceeds 42% FOIR Cap"
      },
      {
        title: "Revolving Util <= 45%",
        passed: p.utilization <= 45.0,
        detail: p.utilization <= 45.0 ? "Healthy Credit Line Usage" : "High Line Utilization"
      },
      {
        title: "Tenure >= 1yr / Secured",
        passed: p.tenure >= 1.0 || collateralCoveragePct >= 25.0,
        detail: "Stability Predicate Verified"
      }
    ];

    const shapFactors = [
      {
        name: state.scoreMode === "cibil" ? "CIBIL Credit Score (300-900)" : "Global Credit Bureau Score",
        impact: scoreContrib
      },
      { name: "Post-Loan FOIR / DTI Ratio", impact: dtiContrib },
      { name: "Revolving Credit Utilization", impact: utilContrib },
      { name: "Collateral & LTV Security", impact: ltvContrib },
      { name: "Employment / Business Tenure", impact: tenureContrib },
      { name: "24M Delinquency Record", impact: delinqContrib },
      { name: "Loan-to-Income (LTI) Multiple", impact: ltiContrib }
    ];

    const targetMaxEmi = Math.max(10000, monthlyIncome * 0.36 - p.monthlyDebt);
    const r = p.apr / 100 / 12;
    const factor = Math.pow(1 + r, p.loanTerm);
    const safePrincipalRaw = r > 0 ? (targetMaxEmi * (factor - 1)) / (r * factor) : targetMaxEmi * p.loanTerm;
    const safePrincipal = Math.max(300000, Math.min(p.loanAmount, Math.round(safePrincipalRaw / 100000) * 100000));
    const extendedTerm = Math.min(84, Math.max(60, p.loanTerm + 24));
    const boostedCollateral = Math.max(p.collateral, Math.round((p.loanAmount * 0.30) / 50000) * 50000);
    const boostedEmi = calculateMonthlyEMI(safePrincipal, p.apr, extendedTerm);

    const boosters = [
      {
        id: "booster-tenure",
        title: "Path A: Tenure Extension & Collateral Shield",
        summary:
          "Extend repayment tenure to " +
          extendedTerm +
          " months and pledge " +
          formatINR(boostedCollateral) +
          " in security to reduce monthly EMI and LGD severity.",
        patch: { loanTerm: extendedTerm, collateral: boostedCollateral, creditScore: Math.max(p.creditScore, 680) }
      },
      {
        id: "booster-principal",
        title: "Path B: Instant Principal Right-Sizing",
        summary:
          "Right-size facility principal to " +
          formatINR(safePrincipal) +
          " and bring credit utilization to 20% for immediate Tier-1 sanction.",
        patch: {
          loanAmount: safePrincipal,
          utilization: Math.min(p.utilization, 20),
          creditScore: Math.max(p.creditScore, 675),
          delinq: 0
        }
      },
      {
        id: "booster-cure",
        title: "Path C: Revolving Debt Consolidation Cure",
        summary:
          "Consolidate existing monthly EMI to " +
          formatINR(Math.round(p.monthlyDebt * 0.55)) +
          "/mo and lower card utilization to 15%.",
        patch: {
          utilization: 15,
          monthlyDebt: Math.round((p.monthlyDebt * 0.55) / 1000) * 1000,
          creditScore: Math.min(850, Math.max(p.creditScore + 50, 710)),
          delinq: 0,
          loanTerm: Math.max(p.loanTerm, 60)
        }
      }
    ];

    return {
      decision: decision,
      statusClass: statusClass,
      tierLabel: tierLabel,
      approvalOdds: approvalOdds,
      emi: emi,
      boostedEmi: boostedEmi,
      preDti: preDti,
      postDti: postDti,
      lti: lti,
      collateralCoveragePct: collateralCoveragePct,
      netLtv: netLtv,
      pdPct: pdPct,
      lgdPct: lgdPct,
      eadInr: eadInr,
      eclInr: eclInr,
      zkTokens: zkTokens,
      predicates: predicates,
      shapFactors: shapFactors,
      boosters: boosters
    };
  }

  /* ========================================================================
     THEME & SOLID DUOTONE BRAND CONTROLLER (WITH DYNAMIC HOVER TOOLTIPS)
     ======================================================================== */

  function setTheme(nextTheme) {
    state.theme = nextTheme;
    document.documentElement.setAttribute("data-theme", nextTheme);
    const nextTooltip =
      nextTheme === "dark" ? "Click to change to Light Mode" : "Click to change to Dark Mode";
    const loginToggle = document.getElementById("login-theme-toggle");
    const appToggle = document.getElementById("app-theme-toggle");
    if (loginToggle) loginToggle.setAttribute("data-tooltip", nextTooltip);
    if (appToggle) appToggle.setAttribute("data-tooltip", nextTooltip);
  }

  function toggleTheme() {
    setTheme(state.theme === "dark" ? "light" : "dark");
  }

  function setBrandPalette(brandRole) {
    document.documentElement.setAttribute("data-brand", brandRole);
  }

  /* ========================================================================
     BRANDED FULL-SCREEN TRANSITION LOADER BUFFER (4-STAGE CIRCULAR EXPANSION)
     - Expands a 100% solid Teal (Client) or Amber-Orange (Bank) circle from
       the exact clicked point on the button (`--click-x`, `--click-y`)
     - Converts flowing wave lines & 12 geometric finance icons to Jet Black
       (#000000) while gliding the Credibiliti-AI brand lockup to mid-screen
     ======================================================================== */

  const lastPointerCoords = {
    x: Math.round(window.innerWidth * 0.68),
    y: Math.round(window.innerHeight * 0.68)
  };

  window.addEventListener(
    "pointerdown",
    function (ev) {
      if (typeof ev.clientX === "number" && typeof ev.clientY === "number") {
        lastPointerCoords.x = ev.clientX;
        lastPointerCoords.y = ev.clientY;
      }
    },
    { passive: true }
  );

  function resolveClickOrigin(originEvent) {
    if (originEvent && typeof originEvent.clientX === "number" && originEvent.clientX > 0) {
      return { x: originEvent.clientX, y: originEvent.clientY };
    }
    if (originEvent && originEvent.submitter && originEvent.submitter.getBoundingClientRect) {
      const rect = originEvent.submitter.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        // Use last pointer position if inside the submitter button, otherwise button center
        if (
          lastPointerCoords.x >= rect.left &&
          lastPointerCoords.x <= rect.right &&
          lastPointerCoords.y >= rect.top &&
          lastPointerCoords.y <= rect.bottom
        ) {
          return { x: lastPointerCoords.x, y: lastPointerCoords.y };
        }
        return {
          x: Math.round(rect.left + rect.width / 2),
          y: Math.round(rect.top + rect.height / 2)
        };
      }
    }
    return { x: lastPointerCoords.x, y: lastPointerCoords.y };
  }

  function setLoaderStepProgress(activeStageCount, linearPct) {
    [1, 2, 3, 4].forEach(function (idx) {
      const seg = document.getElementById("loader-step-" + idx);
      if (seg) {
        seg.classList.toggle("active", idx <= activeStageCount);
      }
    });
    const fillEl = document.getElementById("loader-progress-fill");
    if (fillEl) fillEl.style.width = linearPct + "%";
  }

  function launchPortalWithLoader(targetPortal, targetView, originEvent) {
    setBrandPalette(targetPortal);
    const loader = document.getElementById("login-transition-loader");
    const stagePillEl = document.getElementById("loader-stage-pill");
    const titleEl = document.getElementById("loader-title-text");
    const subEl = document.getElementById("loader-subtitle-text");

    if (!loader) {
      document.getElementById("login-gateway").classList.add("hidden");
      document.getElementById("app-shell").classList.remove("hidden");
      switchPortal(targetPortal, targetView);
      return;
    }

    const origin = resolveClickOrigin(originEvent);
    loader.style.setProperty("--click-x", origin.x + "px");
    loader.style.setProperty("--click-y", origin.y + "px");

    // Stage 1 (0.0s - 1.1s): Circular Flood & Black-Ink Wave Inversion
    if (stagePillEl) stagePillEl.textContent = "STAGE 1 OF 4 • PORTAL HANDSHAKE";
    titleEl.textContent = "Initializing Credibiliti-AI...";
    subEl.textContent =
      targetPortal === "client"
        ? "Establishing encrypted client session & activating Selective KYC Privacy Shield..."
        : "Establishing institutional risk session & verifying Basel III desk token...";
    setLoaderStepProgress(1, 25);

    loader.classList.remove("hidden", "is-expanding", "is-exiting");
    // Force layout reflow so clip-path circle(0px) transitions smoothly from click point
    void loader.offsetWidth;
    loader.classList.add("is-expanding");

    // Stage 2 (1.1s - 2.25s): Identity & Zero-Knowledge Vault Setup
    setTimeout(function () {
      if (stagePillEl) stagePillEl.textContent = "STAGE 2 OF 4 • ZERO-KNOWLEDGE KYC SHIELD";
      if (targetPortal === "client") {
        titleEl.textContent = "Setting up your Client Workspace...";
        subEl.textContent =
          "Masking sensitive PAN, Bank Account/IFSC & raw Bureau Score via SHA-256...";
      } else {
        titleEl.textContent = "Setting up Bank Underwriter Desk...";
        subEl.textContent =
          "Synchronizing incoming client passkeys & cryptographic KYC verification proofs...";
      }
      setLoaderStepProgress(2, 50);
    }, 1100);

    // Stage 3 (2.25s - 3.40s): Financial & Risk Engine Calibration
    setTimeout(function () {
      if (stagePillEl) stagePillEl.textContent = "STAGE 3 OF 4 • FINANCIAL RISK CALIBRATION";
      if (targetPortal === "client") {
        titleEl.textContent = "Calibrating Loan Eligibility Engine...";
        subEl.textContent =
          "Evaluating RBI Fair Practices predicates, FOIR/DTI serviceability & Approval Boosters...";
      } else {
        titleEl.textContent = "Calibrating Basel III & SHAP Telemetry...";
        subEl.textContent =
          "Computing 12-Month Probability of Default (PD), LGD, ECL & 7-factor SHAP impacts...";
      }
      setLoaderStepProgress(3, 78);
    }, 2250);

    // Stage 4 (3.40s - 4.50s): Workspace Ready & Smooth Curtain Reveal (4.5s Total)
    setTimeout(function () {
      if (stagePillEl) stagePillEl.textContent = "STAGE 4 OF 4 • WORKSPACE READY";
      titleEl.textContent =
        targetPortal === "client"
          ? "Ready - Entering Client Workspace..."
          : "Ready - Launching Underwriter Desk...";
      subEl.textContent = "All financial models, CIBIL/Bureau scales & privacy proofs synchronized.";
      setLoaderStepProgress(4, 100);

      // Swap the underlying screen while completely covered by the solid loader
      document.getElementById("login-gateway").classList.add("hidden");
      document.getElementById("app-shell").classList.remove("hidden");
      switchPortal(targetPortal, targetView);
    }, 3400);

    setTimeout(function () {
      loader.classList.add("is-exiting");
    }, 4150);

    setTimeout(function () {
      loader.classList.add("hidden");
      loader.classList.remove("is-expanding", "is-exiting");
      setLoaderStepProgress(0, 0);
    }, 4500);
  }

  /* ========================================================================
     DUAL-SCENE CAROUSEL LOGIN CONTROLLER
     ======================================================================== */

  function renderLoginRoleState(role) {
    state.loginRole = role;
    setBrandPalette(role);

    const gateway = document.getElementById("login-gateway");
    if (gateway) gateway.setAttribute("data-login-role", role);

    const clientTab = document.getElementById("role-tab-client");
    const bankTab = document.getElementById("role-tab-bank");
    if (clientTab && bankTab) {
      clientTab.classList.toggle("active", role === "client");
      clientTab.setAttribute("aria-selected", String(role === "client"));
      bankTab.classList.toggle("active", role === "bank");
      bankTab.setAttribute("aria-selected", String(role === "bank"));
    }

    const clientSelect = document.getElementById("client-profile-select");
    const bankSelect = document.getElementById("bank-profile-select");
    if (clientSelect) clientSelect.value = state.activeProfileKey;
    if (bankSelect) bankSelect.value = state.activeProfileKey;

    const clientIdInput = document.getElementById("client-login-identifier");
    if (clientIdInput) clientIdInput.value = state.profile.email;
  }

  function setClientAuthSubMode(subMode) {
    state.clientAuthSubMode = subMode;
    const btnSignIn = document.getElementById("btn-mode-signin");
    const btnRegister = document.getElementById("btn-mode-register");
    const loginForm = document.getElementById("client-login-form");
    const registerForm = document.getElementById("register-form");

    btnSignIn.classList.toggle("active", subMode === "signin");
    btnRegister.classList.toggle("active", subMode === "register");
    loginForm.classList.toggle("hidden", subMode !== "signin");
    registerForm.classList.toggle("hidden", subMode !== "register");
  }

  /* ========================================================================
     ROLE RE-AUTHENTICATION LOGIN MODAL
     ======================================================================== */

  function openPortalAuthModal(targetPortal, targetView) {
    state.pendingTargetPortal = targetPortal;
    state.pendingTargetView = targetView || (targetPortal === "bank" ? "bank-overview" : "client-overview");

    const modal = document.getElementById("portal-auth-modal");
    const heading = document.getElementById("auth-modal-heading");
    const subtext = document.getElementById("auth-modal-subtext");
    const badgeText = document.getElementById("auth-modal-badge-text");
    const idLabel = document.getElementById("modal-auth-id-label");
    const idInput = document.getElementById("modal-auth-id");
    const secretLabel = document.getElementById("modal-auth-secret-label");
    const secretInput = document.getElementById("modal-auth-secret");
    const submitText = document.getElementById("modal-auth-submit-text");

    if (targetPortal === "bank") {
      badgeText.textContent = "BANK DESK AUTHENTICATION REQUIRED";
      heading.textContent = "Authenticate Bank Underwriter Desk";
      subtext.textContent =
        "Clients cannot directly access the Bank Underwriter Console. Please verify Institutional Officer credentials to proceed.";
      idLabel.textContent = "Institutional Officer ID / Desk Code";
      idInput.value = "DESK-RBI-BASEL-MUMBAI-01";
      secretLabel.textContent = "Basel III Risk Committee Token";
      secretInput.value = "CREDIBILITI-BANK-KEY";
      submitText.textContent = "Authenticate & Enter Bank";
    } else {
      badgeText.textContent = "CLIENT AUTHENTICATION REQUIRED";
      heading.textContent = "Sign in to Client Workspace";
      subtext.textContent =
        "Switching from the Bank Desk back to the Client Portal requires verifying the Client Vault credentials.";
      idLabel.textContent = "Client Email or Sovereign ID";
      idInput.value = state.profile.email;
      secretLabel.textContent = "Zero-Knowledge Vault Passphrase";
      secretInput.value = "CREDIBILITI-SOVEREIGN-KEY";
      submitText.textContent = "Authenticate & Enter Client";
    }

    modal.classList.remove("hidden");
  }

  function closePortalAuthModal() {
    document.getElementById("portal-auth-modal").classList.add("hidden");
    state.pendingTargetPortal = null;
    state.pendingTargetView = null;
  }

  /* ========================================================================
     POST-LOGIN AUTO-CLOSING CASE SUMMARY TOAST (5-SECOND TIMER)
     ======================================================================== */

  function triggerPostLoginCaseToast(portalRole, customTitle, customMessage) {
    const toast = document.getElementById("case-brief-toast");
    const fill = document.getElementById("toast-timer-fill");
    const countdownLabel = document.getElementById("toast-countdown-label");
    if (!toast || !fill) return;

    if (state.toastTimerId) {
      clearInterval(state.toastTimerId);
      state.toastTimerId = null;
    }

    const p = state.profile;
    const ev = evaluateApplication(p);

    document.getElementById("toast-role-eyebrow").textContent =
      customTitle || (portalRole === "client" ? "CLIENT PROFILE LOADED" : "BANK UNDERWRITING CASE BRIEF");
    document.getElementById("toast-profile-name").textContent = p.name + " (" + p.passkey + ")";
    const pill = document.getElementById("toast-verdict-pill");
    pill.textContent = ev.decision;
    pill.className = "status-pill " + ev.statusClass;

    document.getElementById("toast-case-summary").textContent =
      customMessage ||
      "Facility: " +
        formatINR(p.loanAmount) +
        " (" +
        p.loanTerm +
        "m) | Post-Loan FOIR/DTI: " +
        ev.postDti.toFixed(1) +
        "% | Basel 12M PD: " +
        ev.pdPct.toFixed(2) +
        "%.";

    toast.classList.remove("hidden");
    let remainingMs = 5000;
    fill.style.width = "100%";
    countdownLabel.textContent = "Auto-closing in 5.0s...";

    state.toastTimerId = setInterval(function () {
      remainingMs -= 100;
      const pct = Math.max(0, (remainingMs / 5000) * 100);
      fill.style.width = pct + "%";
      countdownLabel.textContent = "Auto-closing in " + (Math.max(0, remainingMs) / 1000).toFixed(1) + "s...";
      if (remainingMs <= 0) {
        clearInterval(state.toastTimerId);
        state.toastTimerId = null;
        toast.classList.add("hidden");
      }
    }, 100);
  }

  /* ========================================================================
     PORTAL ROUTING & VIEW SWITCHING
     ======================================================================== */

  const VIEW_TITLES = {
    "client-overview": "Client Overview & How Credibiliti-AI Protects You",
    "client-wizard": "3-Step Guided Loan Eligibility Check",
    "client-zk-vault": "Selective Zero-Knowledge Privacy Shield & Passkey",
    "client-certificate": "Official Authorization & Pre-Approval Letter",
    "bank-overview": "Institutional Underwriting Desk Overview",
    "bank-queue": "Client Passkey Underwriting Queue",
    "bank-basel": "Basel III, SHAP Attribution & Visual Diagnostics",
    "bank-certificate": "Institutional Basel III Sanction & Audit Letter"
  };

  function switchPortal(portalRole, targetView) {
    state.activePortal = portalRole;
    setBrandPalette(portalRole);

    const appShell = document.getElementById("app-shell");
    appShell.setAttribute("data-portal", portalRole);

    const clientNav = document.getElementById("client-sidebar-nav");
    const bankNav = document.getElementById("bank-sidebar-nav");
    const subtitle = document.getElementById("sidebar-portal-subtitle");
    const userBadge = document.getElementById("active-user-badge");
    const roleTag = document.getElementById("active-role-tag");
    const switchBtn = document.getElementById("quick-switch-portal-btn");

    if (portalRole === "client") {
      clientNav.classList.remove("hidden");
      bankNav.classList.add("hidden");
      subtitle.textContent = "Client Workspace";
      userBadge.textContent = state.profile.name;
      roleTag.textContent = "CLIENT";
      if (switchBtn) switchBtn.setAttribute("data-tooltip", "Switch to Bank • Login Required");
      activateView(targetView || "client-overview");
    } else {
      clientNav.classList.add("hidden");
      bankNav.classList.remove("hidden");
      subtitle.textContent = "Bank Underwriter Desk";
      userBadge.textContent = "Risk Desk (" + state.profile.name + ")";
      roleTag.textContent = "BANK";
      if (switchBtn) switchBtn.setAttribute("data-tooltip", "Switch to Client • Login Required");
      activateView(targetView || "bank-overview");
    }

    renderAllViews();
    triggerPostLoginCaseToast(portalRole);
  }

  function activateView(viewId) {
    state.activeView = viewId;
    document.querySelectorAll(".view-panel").forEach(function (panel) {
      panel.classList.toggle("hidden", panel.id !== "view-" + viewId);
    });
    document.querySelectorAll(".nav-item-btn").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-view") === viewId);
    });
    const titleEl = document.getElementById("topbar-view-title");
    if (titleEl && VIEW_TITLES[viewId]) {
      titleEl.textContent = VIEW_TITLES[viewId];
    }
  }

  function setWizardStep(stepNum) {
    state.wizardStep = Number(stepNum);
    [1, 2, 3].forEach(function (n) {
      const panel = document.getElementById("wizard-step-panel-" + n);
      if (panel) panel.classList.toggle("hidden", n !== state.wizardStep);
    });
    document.querySelectorAll(".wizard-step-tab").forEach(function (tab) {
      tab.classList.toggle("active", Number(tab.getAttribute("data-wizard-step")) === state.wizardStep);
    });
  }

  /* ========================================================================
     GLOBAL SCORE <-> CIBIL SCORE SWITCHER
     ======================================================================== */

  function setScoreScaleMode(nextMode) {
    state.scoreMode = nextMode;
    const btnGlobal = document.getElementById("btn-score-global");
    const btnCibil = document.getElementById("btn-score-cibil");
    const scoreSlider = document.getElementById("input-credit-score");
    const scoreLabel = document.getElementById("score-slider-label");

    if (btnGlobal && btnCibil) {
      btnGlobal.classList.toggle("active", nextMode === "global");
      btnCibil.classList.toggle("active", nextMode === "cibil");
    }

    if (scoreSlider && scoreLabel) {
      if (nextMode === "cibil") {
        scoreLabel.textContent = "CIBIL Credit Score (300-900)";
        scoreSlider.max = "900";
        scoreSlider.value = String(globalToCibil(state.profile.creditScore));
      } else {
        scoreLabel.textContent = "Global Credit Bureau Score (300-850)";
        scoreSlider.max = "850";
        scoreSlider.value = String(Math.round(state.profile.creditScore));
      }
    }

    renderAllViews();
  }

  /* ========================================================================
     PIXEL-ALIGNED VISUAL DIAGNOSTIC CHARTS & FORMAL AUTHORIZATION LETTER
     ======================================================================== */

  function syncSlidersFromState() {
    const p = state.profile;
    document.getElementById("input-loan-amount").value = p.loanAmount;
    document.getElementById("input-loan-term").value = p.loanTerm;
    document.getElementById("input-collateral").value = p.collateral;
    document.getElementById("input-apr").value = p.apr;
    const scoreSlider = document.getElementById("input-credit-score");
    if (scoreSlider) {
      scoreSlider.max = state.scoreMode === "cibil" ? "900" : "850";
      scoreSlider.value = String(getDisplayedScore(p));
    }
    document.getElementById("input-income").value = p.annualIncome;
    document.getElementById("input-monthly-debt").value = p.monthlyDebt;
    document.getElementById("input-utilization").value = p.utilization;
    document.getElementById("input-tenure").value = p.tenure;
    document.getElementById("input-delinq").value = p.delinq;
  }

  function renderVisualCharts(p, ev) {
    const outflowContainer = document.getElementById("chart-outflow-container");
    if (outflowContainer) {
      const curEmi = Math.round(ev.emi);
      const optEmi = Math.round(ev.boostedEmi);
      const curEcl = Math.round(ev.eclInr);
      const optEcl = Math.round(ev.eclInr * 0.42);
      const savedEcl = Math.max(0, curEcl - optEcl);
      const maxEmi = Math.max(curEmi, optEmi, 1);
      const curPct = Math.min(100, Math.max(12, Math.round((curEmi / maxEmi) * 100)));
      const optPct = Math.min(100, Math.max(12, Math.round((optEmi / maxEmi) * 100)));

      outflowContainer.innerHTML =
        '<div class="diag-section-title">' +
        "<span>Monthly EMI Outflow Comparison</span>" +
        '<span class="mono" style="color:var(--status-success); font-size:11.5px;">-' +
        formatINR(Math.max(0, curEmi - optEmi)) +
        "/mo relief</span>" +
        "</div>" +
        '<div class="diag-bar-group">' +
        '<div class="diag-bar-row">' +
        "<span>Baseline EMI</span>" +
        '<div class="diag-bar-track"><div class="diag-bar-fill" style="width:' +
        curPct +
        '%; background:#E5A93C;"></div></div>' +
        '<strong class="mono" style="text-align:right;">' +
        formatINR(curEmi) +
        "/mo</strong>" +
        "</div>" +
        '<div class="diag-bar-row">' +
        "<span>Boosted EMI</span>" +
        '<div class="diag-bar-track"><div class="diag-bar-fill" style="width:' +
        optPct +
        '%; background:#14B8A6;"></div></div>' +
        '<strong class="mono" style="text-align:right; color:#14B8A6;">' +
        formatINR(optEmi) +
        "/mo</strong>" +
        "</div>" +
        "</div>" +
        '<div class="diag-ecl-grid">' +
        '<div class="diag-ecl-cell"><span>Current ECL</span><strong class="mono">' +
        formatINR(curEcl) +
        "</strong></div>" +
        '<div class="diag-ecl-cell"><span>Post-Booster ECL</span><strong class="mono">' +
        formatINR(optEcl) +
        "</strong></div>" +
        '<div class="diag-ecl-cell"><span>Reserve Saved</span><strong class="mono" style="color:#14B8A6;">' +
        formatINR(savedEcl) +
        "</strong></div>" +
        "</div>";
    }

    const quadContainer = document.getElementById("chart-quadrant-container");
    if (quadContainer) {
      const targetFoir = Math.min(34.0, ev.postDti * 0.72);
      const targetPd = Math.min(4.8, ev.pdPct * 0.45);

      const curX = Math.min(418, Math.max(54, 46 + (Math.min(80, ev.postDti) / 80) * 384));
      const curY = Math.min(124, Math.max(24, 132 - (Math.min(45, ev.pdPct) / 45) * 116));

      const targetX = Math.min(418, Math.max(54, 46 + (targetFoir / 80) * 384));
      const targetY = Math.min(124, Math.max(24, 132 - (targetPd / 45) * 116));

      const curAnchor = curX > 290 ? "end" : "start";
      const curLabelX = curX > 290 ? curX - 10 : curX + 10;
      const curLabelY = Math.max(26, curY - 6);

      quadContainer.innerHTML =
        '<div class="quadrant-legend-bar">' +
        '<span class="legend-item"><span class="legend-dot" style="background:#14B8A6;"></span>Safe Tier-1 Zone (FOIR &lt;= 42%, PD &lt;= 8.8%)</span>' +
        '<span class="legend-item"><span class="legend-dot" style="background:#E5A93C;"></span>Current</span>' +
        '<span class="legend-item"><span class="legend-dot" style="background:#14B8A6; border:2px solid #FFFFFF;"></span>Boosted Target</span>' +
        "</div>" +
        '<svg viewBox="0 0 460 152" width="100%" height="152" style="display:block;">' +
        '<line x1="46" y1="45" x2="430" y2="45" stroke="currentColor" stroke-opacity="0.10" />' +
        '<line x1="46" y1="88" x2="430" y2="88" stroke="currentColor" stroke-opacity="0.10" />' +
        '<rect x="46" y="86" width="202" height="46" fill="#14B8A6" fill-opacity="0.15" stroke="#14B8A6" stroke-dasharray="4 3" rx="4" />' +
        '<text x="56" y="103" fill="#14B8A6" font-size="9.5" font-weight="700">SAFE TIER-1 ZONE</text>' +
        '<line x1="46" y1="16" x2="46" y2="132" stroke="currentColor" stroke-opacity="0.45" />' +
        '<line x1="46" y1="132" x2="430" y2="132" stroke="currentColor" stroke-opacity="0.45" />' +
        '<text x="38" y="24" text-anchor="end" fill="currentColor" fill-opacity="0.65" font-size="9.5">40%</text>' +
        '<text x="38" y="89" text-anchor="end" fill="currentColor" fill-opacity="0.65" font-size="9.5">10%</text>' +
        '<text x="38" y="132" text-anchor="end" fill="currentColor" fill-opacity="0.65" font-size="9.5">0%</text>' +
        '<text x="46" y="146" text-anchor="middle" fill="currentColor" fill-opacity="0.65" font-size="9.5">0%</text>' +
        '<text x="248" y="146" text-anchor="middle" fill="#14B8A6" font-size="9.5" font-weight="700">42% FOIR Cap</text>' +
        '<text x="420" y="146" text-anchor="end" fill="currentColor" fill-opacity="0.65" font-size="9.5">80% FOIR</text>' +
        '<line x1="' +
        curX.toFixed(1) +
        '" y1="' +
        curY.toFixed(1) +
        '" x2="' +
        targetX.toFixed(1) +
        '" y2="' +
        targetY.toFixed(1) +
        '" stroke="#14B8A6" stroke-width="1.8" stroke-dasharray="4 3" />' +
        '<circle cx="' +
        curX.toFixed(1) +
        '" cy="' +
        curY.toFixed(1) +
        '" r="5.5" fill="#E5A93C" />' +
        '<text x="' +
        curLabelX.toFixed(1) +
        '" y="' +
        curLabelY.toFixed(1) +
        '" text-anchor="' +
        curAnchor +
        '" fill="currentColor" font-size="10" font-weight="700">Current (' +
        ev.postDti.toFixed(0) +
        "% FOIR)</text>" +
        '<circle cx="' +
        targetX.toFixed(1) +
        '" cy="' +
        targetY.toFixed(1) +
        '" r="5.5" fill="#14B8A6" stroke="#FFFFFF" stroke-width="1.5" />' +
        '<text x="' +
        (targetX + 9).toFixed(1) +
        '" y="' +
        Math.min(126, targetY + 4).toFixed(1) +
        '" text-anchor="start" fill="#14B8A6" font-size="10" font-weight="700">Boosted (' +
        targetFoir.toFixed(0) +
        "%)</text>" +
        "</svg>" +
        '<div class="quadrant-footer-bar mono">' +
        "<span>Current: " +
        ev.postDti.toFixed(1) +
        "% FOIR | " +
        ev.pdPct.toFixed(2) +
        "% PD</span>" +
        '<span style="color:#14B8A6;">Target: ' +
        targetFoir.toFixed(1) +
        "% FOIR | " +
        targetPd.toFixed(2) +
        "% PD</span>" +
        "</div>";
    }
  }

  function buildFormalLetterHTML(p, ev, isBankCopy) {
    const liveDateStr = getCurrentLocalSystemDate();
    const sealSignature = deterministicHash("SEAL", p.passkey + "::" + p.name + "::" + ev.decision);
    const docHeading = isBankCopy
      ? "INSTITUTIONAL BASEL III SANCTION & REGULATORY AUDIT AUTHORIZATION"
      : "OFFICIAL CREDIT ELIGIBILITY & PRE-APPROVAL AUTHORIZATION LETTER";

    return (
      '<div class="cert-letterhead">' +
      "<div>" +
      '<div style="font-size:11px; font-weight:700; color:#0D9488; letter-spacing:0.08em;">CREDIBILITI-AI | SMART PRIVATE ELIGIBILITY &amp; INSTANT APPROVAL SYSTEM</div>' +
      '<h2 style="font-size:18px; color:#0F172A; margin-top:4px; line-height:1.3;">' +
      docHeading +
      "</h2>" +
      "</div>" +
      '<div class="cert-ref-box mono">' +
      "<div><strong>Passkey Ref: " +
      p.passkey +
      "</strong></div>" +
      '<div style="margin-top:3px;">System Date: ' +
      liveDateStr +
      "</div>" +
      "</div>" +
      "</div>" +
      '<div class="cert-meta-bar">' +
      '<div class="cert-meta-item"><span>Client Legal Name</span><strong>' +
      p.name +
      "</strong></div>" +
      '<div class="cert-meta-item"><span>Protected KYC Token</span><strong class="mono">' +
      ev.zkTokens[1].token +
      "</strong></div>" +
      '<div class="cert-meta-item"><span>Regulatory Standard</span><strong>Based on RBI Fair Practices &amp; Basel III</strong></div>' +
      "</div>" +
      '<div class="cert-salutation">' +
      "<strong>To Whom It May Concern / Institutional Credit Committee,</strong><br/>" +
      "This formal authorization letter certifies that the credit facility application for <strong>" +
      p.name +
      "</strong> has been evaluated under the Credibiliti-AI Zero-Knowledge &amp; Basel III Underwriting System. We protect the client's sensitive PAN, Settlement Account/IFSC, and raw Bureau Score locally via SHA-256 commitments without cleartext exposure." +
      "</div>" +
      '<div class="cert-grid">' +
      '<div class="cert-cell"><span>Underwriting Decision &amp; Risk Tier</span><strong>' +
      ev.decision +
      " | " +
      ev.tierLabel +
      " (" +
      ev.approvalOdds +
      "% Score)</strong></div>" +
      '<div class="cert-cell"><span>Evaluated Loan Facility</span><strong>' +
      formatINR(p.loanAmount) +
      " (" +
      p.loanTerm +
      " Months @ " +
      p.apr.toFixed(1) +
      "% APR)</strong></div>" +
      '<div class="cert-cell"><span>Monthly EMI &amp; Post-Loan FOIR/DTI</span><strong>' +
      formatINR(ev.emi) +
      "/mo (Post-Loan FOIR: " +
      ev.postDti.toFixed(1) +
      "%)</strong></div>" +
      '<div class="cert-cell"><span>Basel III 12M PD, LGD &amp; ECL</span><strong class="mono">PD: ' +
      ev.pdPct.toFixed(2) +
      "% | LGD: " +
      ev.lgdPct.toFixed(1) +
      "% | ECL: " +
      formatINR(ev.eclInr) +
      "</strong></div>" +
      "</div>" +
      '<div class="cert-legitimacy-box">' +
      "<h4>Why This Credibiliti-AI Authorization Is Legitimate &amp; Regulator-Auditable</h4>" +
      '<ol class="cert-legitimacy-list">' +
      "<li><strong>Cryptographic Selective KYC Protection:</strong> Sensitive PAN (" +
      ev.zkTokens[1].token +
      ") and Account/IFSC (" +
      ev.zkTokens[3].token +
      ") are bound via deterministic SHA-256 commitments, preventing identity tampering.</li>" +
      "<li><strong>Basel III &amp; IFRS 9 Actuarial Compliance:</strong> Facility risk is quantified using 12-Month Probability of Default (PD), collateral-adjusted Loss Given Default (LGD), and Exposure at Default (EAD).</li>" +
      "<li><strong>Based on RBI Fair Practices &amp; Explainable AI:</strong> Every decision is backed by a 7-factor SHAP log-odds attribution audit and actionable counterfactual recourse.</li>" +
      "<li><strong>Counterfactual Pre-Approved Restructuring Path:</strong> " +
      ev.boosters[0].summary +
      "</li>" +
      "</ol>" +
      "</div>" +
      '<div class="cert-seal-footer">' +
      '<div style="font-size:11.5px; color:#334155;">' +
      "<div><strong>Authorized Algorithmic Signatory:</strong> Credibiliti-AI Risk System</div>" +
      '<div class="mono" style="margin-top:3px;">Seal Signature Hash: ' +
      sealSignature +
      "</div>" +
      '<div style="margin-top:3px;">Concept &amp; Built by: <strong>techwithamir.com</strong></div>' +
      "</div>" +
      '<div class="official-seal-stamp" data-seal-hash="' +
      sealSignature +
      '" title="Click to verify cryptographic seal authenticity">' +
      '<svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<circle cx="12" cy="12" r="10" />' +
      '<path d="M9 12l2 2 4-4" />' +
      "</svg>" +
      "<div>" +
      '<div style="font-size:11px; font-weight:800; letter-spacing:0.06em;">CREDIBILITI-AI APPROVED</div>' +
      '<div class="mono" style="font-size:10px;">VERIFIED CRYPTOGRAPHIC SEAL</div>' +
      "</div>" +
      "</div>" +
      "</div>"
    );
  }

  function renderAllViews() {
    const p = state.profile;
    const ev = evaluateApplication(p);
    state.lastEvaluation = ev;
    const displayedScore = getDisplayedScore(p);

    document.getElementById("val-loan-amount").textContent =
      formatINR(p.loanAmount) + " (" + formatINRLakhs(p.loanAmount) + ")";
    document.getElementById("val-loan-term").textContent = p.loanTerm + " Months";
    document.getElementById("val-collateral").textContent = formatINR(p.collateral);
    document.getElementById("val-apr").textContent = p.apr.toFixed(1) + "%";
    document.getElementById("val-credit-score").textContent =
      String(displayedScore) + (state.scoreMode === "cibil" ? " CIBIL" : "");
    document.getElementById("val-income").textContent =
      formatINR(p.annualIncome) + " (" + formatINRLakhs(p.annualIncome) + ")";
    document.getElementById("val-monthly-debt").textContent = formatINR(p.monthlyDebt);
    document.getElementById("val-utilization").textContent = p.utilization + "%";
    document.getElementById("val-tenure").textContent = p.tenure.toFixed(1) + " Years";
    document.getElementById("val-delinq").textContent = p.delinq + " Events";
    document.getElementById("step1-emi-preview").textContent = formatINR(ev.emi) + "/mo";

    // Sidebar & Top-Bar Profile Hover Popover
    document.getElementById("sidebar-passkey-code").textContent = p.passkey;
    document.getElementById("active-user-badge").textContent =
      state.activePortal === "client" ? p.name : "Risk Desk (" + p.name + ")";

    document.getElementById("popover-user-name").textContent = p.name;
    document.getElementById("popover-user-passkey").textContent = p.passkey;
    document.getElementById("popover-user-role").textContent =
      state.activePortal === "client" ? "Client Workspace" : "Bank Underwriter Desk";
    document.getElementById("popover-user-title").textContent = p.roleTitle || p.employer;
    document.getElementById("popover-user-loan").textContent = formatINR(p.loanAmount);
    document.getElementById("popover-user-income").textContent = formatINR(p.annualIncome);

    // Client Overview: Color-Coded Eligibility Status (Green / Amber / Red)
    document.getElementById("client-welcome-name").textContent = p.name;
    const overviewVerdictEl = document.getElementById("client-kpi-verdict");
    overviewVerdictEl.textContent = ev.decision;
    overviewVerdictEl.className = "kpi-value verdict-" + ev.statusClass;
    document.getElementById("client-kpi-score-band").textContent =
      "Approval Odds: " + ev.approvalOdds + "% | Est. EMI: " + formatINR(ev.emi) + "/mo";
    document.getElementById("client-kpi-passkey").textContent = p.passkey;

    // 3-Step Wizard Verdict & Bottom-Center Live Verdict Tracker
    const wizBadge = document.getElementById("wizard-verdict-badge");
    wizBadge.textContent = ev.decision;
    wizBadge.className = "status-pill " + ev.statusClass;
    document.getElementById("wizard-verdict-heading").textContent =
      ev.decision === "APPROVED"
        ? "Pre-Approved: Facility Meets All Institutional Thresholds"
        : "Actionable 1-Click Approval Boosters Available for " + p.name;
    document.getElementById("wiz-approval-index").textContent = ev.approvalOdds + "%";
    document.getElementById("wiz-post-dti").textContent = ev.postDti.toFixed(1) + "%";
    document.getElementById("wiz-monthly-emi").textContent = formatINR(ev.emi);
    document.getElementById("wiz-ltv-cov").textContent = ev.collateralCoveragePct.toFixed(1) + "%";

    const trackerPill = document.getElementById("tracker-verdict-pill");
    if (trackerPill) {
      trackerPill.textContent = ev.decision;
      trackerPill.className = "status-pill " + ev.statusClass;
      document.getElementById("tracker-odds-val").textContent = ev.approvalOdds + "%";
      document.getElementById("tracker-emi-val").textContent = formatINR(ev.emi) + "/mo";
      document.getElementById("tracker-foir-val").textContent = ev.postDti.toFixed(1) + "%";
      document.getElementById("tracker-score-label").textContent =
        state.scoreMode === "cibil" ? "CIBIL Score" : "Global Score";
      document.getElementById("tracker-score-val").textContent = String(displayedScore);
    }

    document.getElementById("client-booster-grid").innerHTML = ev.boosters
      .map(function (b, idx) {
        return (
          '<div class="booster-card">' +
          "<div><h4>" +
          b.title +
          "</h4><p>" +
          b.summary +
          "</p></div>" +
          '<button type="button" class="primary-submit-btn apply-booster-btn" data-booster-idx="' +
          idx +
          '">' +
          (ev.decision === "APPROVED" ? "Optimized Structure Active" : "Apply 1-Click Booster") +
          "</button></div>"
        );
      })
      .join("");

    document.getElementById("zk-banner-name").textContent = p.name;
    document.getElementById("zk-raw-name").textContent = p.name;
    document.getElementById("zk-raw-id").textContent = p.nationalId;
    document.getElementById("zk-raw-employer").textContent = p.employer;
    document.getElementById("zk-raw-iban").textContent = p.iban;

    document.getElementById("zk-blinded-token-list").innerHTML = ev.zkTokens
      .map(function (t) {
        return (
          '<div class="data-row-item"><span>' +
          t.label +
          '</span><strong class="mono" style="color:var(--duotone-accent);">' +
          t.token +
          "</strong></div>"
        );
      })
      .join("");

    document.getElementById("zk-predicate-grid").innerHTML = ev.predicates
      .map(function (pr) {
        const cls = pr.passed ? "approved" : "declined";
        const badgeText = pr.passed ? "PASS" : "ACTION NEEDED";
        return (
          '<div class="slider-control-card">' +
          '<span class="status-pill ' +
          cls +
          '">' +
          badgeText +
          "</span>" +
          '<strong style="font-size:14px;">' +
          pr.title +
          "</strong>" +
          '<span class="kpi-sub">' +
          pr.detail +
          "</span></div>"
        );
      })
      .join("");

    document.getElementById("bank-kpi-applicant").textContent = p.name;
    document.getElementById("bank-kpi-passkey").textContent = "Passkey: " + p.passkey;
    document.getElementById("bank-kpi-pd").textContent = ev.pdPct.toFixed(2) + "%";
    document.getElementById("bank-kpi-ecl").textContent =
      "Expected Credit Loss (ECL): " + formatINR(ev.eclInr);

    document.getElementById("bank-archetype-cards").innerHTML = Object.keys(ARCHETYPES)
      .map(function (key) {
        const item = ARCHETYPES[key];
        const isCurrent = state.activeProfileKey === key;
        return (
          '<div class="uniform-card" style="border-color:' +
          (isCurrent ? "var(--duotone-accent)" : "var(--border-subtle)") +
          ';">' +
          '<span class="card-eyebrow mono">' +
          item.passkey +
          "</span>" +
          '<h4 style="font-size:15px;">' +
          item.name +
          "</h4>" +
          '<span class="kpi-sub">Loan: ' +
          formatINR(item.loanAmount) +
          " (" +
          item.loanTerm +
          "m)</span>" +
          '<button type="button" class="secondary-btn select-queue-case-btn" data-case-key="' +
          key +
          '">' +
          (isCurrent ? "Active Case" : "Inspect Client") +
          "</button></div>"
        );
      })
      .join("");

    document.getElementById("bank-blinded-pii-list").innerHTML = ev.zkTokens
      .map(function (t) {
        return (
          '<div class="data-row-item"><span>' +
          t.label +
          '</span><strong class="mono">' +
          t.token +
          "</strong></div>"
        );
      })
      .join("");

    document.getElementById("bank-predicate-list").innerHTML = ev.predicates
      .map(function (pr) {
        return (
          '<div class="data-row-item"><span>' +
          pr.title +
          '</span><span class="status-pill ' +
          (pr.passed ? "approved" : "declined") +
          '">' +
          (pr.passed ? "ZK PROOF PASS" : "THRESHOLD FAIL") +
          "</span></div>"
        );
      })
      .join("");

    document.getElementById("basel-pd-val").textContent = ev.pdPct.toFixed(2) + "%";
    document.getElementById("basel-tier-label").textContent = ev.tierLabel;
    document.getElementById("basel-lgd-val").textContent = ev.lgdPct.toFixed(1) + "%";
    document.getElementById("basel-ecl-val").textContent = formatINR(ev.eclInr);
    document.getElementById("basel-ead-label").textContent = "EAD Principal: " + formatINR(ev.eadInr);
    document.getElementById("basel-dti-val").textContent = ev.postDti.toFixed(1) + "%";
    document.getElementById("basel-lti-label").textContent = "LTI Multiple: " + ev.lti.toFixed(2) + "x";

    document.getElementById("bank-shap-list").innerHTML = ev.shapFactors
      .map(function (f) {
        const isPos = f.impact >= 0;
        const widthPct = Math.min(100, Math.max(8, Math.abs(f.impact) * 3.2));
        const sign = isPos ? "+" : "";
        return (
          '<div class="shap-row">' +
          "<span>" +
          f.name +
          "</span>" +
          '<div class="shap-bar-track"><div class="shap-bar-fill ' +
          (isPos ? "positive" : "negative") +
          '" style="width:' +
          widthPct.toFixed(0) +
          '%;"></div></div>' +
          '<strong class="mono" style="text-align:right; color:' +
          (isPos ? "var(--status-success)" : "var(--status-danger)") +
          ';">' +
          sign +
          f.impact.toFixed(1) +
          " pts</strong></div>"
        );
      })
      .join("");

    document.getElementById("bank-recourse-list").innerHTML = ev.boosters
      .map(function (b, idx) {
        return (
          '<div class="data-row-item" style="flex-direction:column; align-items:flex-start; gap:8px;">' +
          "<div><strong>" +
          b.title +
          '</strong><p class="kpi-sub">' +
          b.summary +
          "</p></div>" +
          '<button type="button" class="secondary-btn apply-booster-btn" data-booster-idx="' +
          idx +
          '">Issue Restructured Sanction Offer</button></div>'
        );
      })
      .join("");

    renderVisualCharts(p, ev);

    const clientSheet = document.getElementById("client-certificate-sheet");
    if (clientSheet) clientSheet.innerHTML = buildFormalLetterHTML(p, ev, false);

    const bankSheet = document.getElementById("bank-certificate-sheet");
    if (bankSheet) bankSheet.innerHTML = buildFormalLetterHTML(p, ev, true);
  }

  function exportCertificatePdf(elementId, filename) {
    const el = document.getElementById(elementId);
    if (!el) return;
    if (window.html2pdf) {
      window
        .html2pdf()
        .set({
          margin: 8,
          filename: filename,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
        })
        .from(el)
        .save();
    } else {
      window.print();
    }
  }

  /* ========================================================================
     EVENT BINDINGS & INITIALIZATION
     ======================================================================== */

  function handleProfileSelectChange(selectedKey) {
    if (ARCHETYPES[selectedKey]) {
      state.activeProfileKey = selectedKey;
      state.profile = Object.assign({}, ARCHETYPES[selectedKey]);
      const clientSelect = document.getElementById("client-profile-select");
      const bankSelect = document.getElementById("bank-profile-select");
      if (clientSelect) clientSelect.value = selectedKey;
      if (bankSelect) bankSelect.value = selectedKey;
      const clientIdInput = document.getElementById("client-login-identifier");
      if (clientIdInput) clientIdInput.value = state.profile.email;
      syncSlidersFromState();
      renderAllViews();
    }
  }

  function init() {
    if (typeof document === "undefined") return;

    setTheme("dark");
    renderLoginRoleState("client");
    syncSlidersFromState();
    renderAllViews();

    document.getElementById("login-theme-toggle").addEventListener("click", toggleTheme);
    document.getElementById("app-theme-toggle").addEventListener("click", toggleTheme);

    document.getElementById("role-tab-client").addEventListener("click", function () {
      renderLoginRoleState("client");
    });
    document.getElementById("role-tab-bank").addEventListener("click", function () {
      renderLoginRoleState("bank");
    });

    document.getElementById("btn-mode-signin").addEventListener("click", function () {
      setClientAuthSubMode("signin");
    });
    document.getElementById("btn-mode-register").addEventListener("click", function () {
      setClientAuthSubMode("register");
    });

    // Global Score <-> CIBIL Score Switch Buttons
    document.getElementById("btn-score-global").addEventListener("click", function () {
      setScoreScaleMode("global");
    });
    document.getElementById("btn-score-cibil").addEventListener("click", function () {
      setScoreScaleMode("cibil");
    });

    document.getElementById("client-profile-select").addEventListener("change", function (e) {
      handleProfileSelectChange(e.target.value);
    });
    document.getElementById("bank-profile-select").addEventListener("change", function (e) {
      handleProfileSelectChange(e.target.value);
    });

    // Scene 1: Client Sign-In Submit -> Launch via Branded Transition Loader
    document.getElementById("client-login-form").addEventListener("submit", function (e) {
      e.preventDefault();
      launchPortalWithLoader("client", null, e);
    });

    // Scene 2: Bank Sign-In Submit -> Launch via Branded Transition Loader
    document.getElementById("bank-login-form").addEventListener("submit", function (e) {
      e.preventDefault();
      launchPortalWithLoader("bank", null, e);
    });

    // Scene 1: New Client Registration Submit -> Launch via Branded Transition Loader
    document.getElementById("register-form").addEventListener("submit", function (e) {
      e.preventDefault();
      const nameVal = document.getElementById("reg-name").value.trim() || "Rohan Verma";
      const emailVal = document.getElementById("reg-email").value.trim() || "rohan@enterprise.in";
      const empVal = document.getElementById("reg-employer").value.trim() || "Bharat FinTech Labs Pvt Ltd";
      const panVal = document.getElementById("reg-pan").value.trim().toUpperCase() || "IN-PAN-NEW9921K";
      const incomeVal = Number(document.getElementById("reg-income").value) || 1800000;
      const loanVal = Number(document.getElementById("reg-loan").value) || 2500000;
      const scoreVal = Number(document.getElementById("reg-score").value) || 685;
      const debtVal = Number(document.getElementById("reg-debt").value) || 18000;

      const customKey = "custom_" + Date.now();
      const passkey = "CRED-" + Math.floor(800 + Math.random() * 190) + "-IN";
      const newProfile = {
        key: customKey,
        passkey: passkey,
        name: nameVal,
        roleTitle: empVal,
        email: emailVal,
        nationalId: "IN-PAN-" + panVal,
        employer: empVal,
        iban: "HDFC0009102 / Marked-ZK",
        creditScore: Math.min(850, Math.max(300, scoreVal)),
        annualIncome: incomeVal,
        monthlyDebt: debtVal,
        utilization: 34,
        tenure: 3.5,
        delinq: 0,
        loanAmount: loanVal,
        loanTerm: 48,
        collateral: Math.round(loanVal * 0.2),
        apr: 9.5
      };

      ARCHETYPES[customKey] = newProfile;
      ["client-profile-select", "bank-profile-select"].forEach(function (selId) {
        const selectEl = document.getElementById(selId);
        if (selectEl) {
          const opt = document.createElement("option");
          opt.value = customKey;
          opt.textContent = newProfile.name + " | " + newProfile.roleTitle + " (Registered)";
          selectEl.appendChild(opt);
          selectEl.value = customKey;
        }
      });

      state.activeProfileKey = customKey;
      state.profile = Object.assign({}, newProfile);
      syncSlidersFromState();
      renderAllViews();

      launchPortalWithLoader("client", null, e);
    });

    const copyBtn = document.getElementById("copy-passkey-btn");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(state.profile.passkey);
        }
        copyBtn.textContent = "Copied!";
        setTimeout(function () {
          copyBtn.textContent = "Copy";
        }, 1600);
      });
    }

    document.getElementById("toast-close-btn").addEventListener("click", function () {
      if (state.toastTimerId) {
        clearInterval(state.toastTimerId);
        state.toastTimerId = null;
      }
      document.getElementById("case-brief-toast").classList.add("hidden");
    });

    document.getElementById("logout-btn").addEventListener("click", function () {
      if (state.toastTimerId) {
        clearInterval(state.toastTimerId);
        state.toastTimerId = null;
      }
      closePortalAuthModal();
      document.getElementById("case-brief-toast").classList.add("hidden");
      document.getElementById("app-shell").classList.add("hidden");
      document.getElementById("login-gateway").classList.remove("hidden");
      renderLoginRoleState(state.activePortal);
    });

    document.getElementById("quick-switch-portal-btn").addEventListener("click", function () {
      const nextPortal = state.activePortal === "client" ? "bank" : "client";
      openPortalAuthModal(nextPortal);
    });

    document.getElementById("transmit-passkey-btn").addEventListener("click", function () {
      openPortalAuthModal("bank", "bank-queue");
    });

    document.getElementById("auth-modal-close-btn").addEventListener("click", closePortalAuthModal);
    document.getElementById("modal-return-gateway-btn").addEventListener("click", function () {
      const targetRole = state.pendingTargetPortal || (state.activePortal === "client" ? "bank" : "client");
      closePortalAuthModal();
      document.getElementById("case-brief-toast").classList.add("hidden");
      document.getElementById("app-shell").classList.add("hidden");
      document.getElementById("login-gateway").classList.remove("hidden");
      renderLoginRoleState(targetRole);
    });
    document.getElementById("portal-auth-form").addEventListener("submit", function (e) {
      e.preventDefault();
      const targetPortal = state.pendingTargetPortal || (state.activePortal === "client" ? "bank" : "client");
      const targetView = state.pendingTargetView;
      closePortalAuthModal();
      launchPortalWithLoader(targetPortal, targetView, e);
    });

    document.querySelectorAll(".nav-item-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        activateView(btn.getAttribute("data-view"));
      });
    });

    document.querySelectorAll("[data-goto-view]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        activateView(btn.getAttribute("data-goto-view"));
      });
    });

    document.querySelectorAll(".wizard-step-tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        setWizardStep(tab.getAttribute("data-wizard-step"));
      });
    });
    document.querySelectorAll("[data-next-step]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setWizardStep(btn.getAttribute("data-next-step"));
      });
    });

    // Credit Score Slider (handles Global 300-850 vs CIBIL 300-900 conversion)
    const creditScoreEl = document.getElementById("input-credit-score");
    if (creditScoreEl) {
      creditScoreEl.addEventListener("input", function (e) {
        const rawVal = Number(e.target.value);
        state.profile.creditScore = state.scoreMode === "cibil" ? cibilToGlobal(rawVal) : rawVal;
        renderAllViews();
      });
    }

    const sliderMap = [
      ["input-loan-amount", "loanAmount"],
      ["input-loan-term", "loanTerm"],
      ["input-collateral", "collateral"],
      ["input-apr", "apr"],
      ["input-income", "annualIncome"],
      ["input-monthly-debt", "monthlyDebt"],
      ["input-utilization", "utilization"],
      ["input-tenure", "tenure"],
      ["input-delinq", "delinq"]
    ];
    sliderMap.forEach(function (pair) {
      const el = document.getElementById(pair[0]);
      if (el) {
        el.addEventListener("input", function (e) {
          state.profile[pair[1]] = Number(e.target.value);
          renderAllViews();
        });
      }
    });

    document.addEventListener("click", function (e) {
      const boosterBtn = e.target.closest(".apply-booster-btn");
      if (boosterBtn && state.lastEvaluation) {
        const idx = Number(boosterBtn.getAttribute("data-booster-idx"));
        const booster = state.lastEvaluation.boosters[idx];
        if (booster && booster.patch) {
          Object.assign(state.profile, booster.patch);
          syncSlidersFromState();
          renderAllViews();
          triggerPostLoginCaseToast(state.activePortal);
        }
      }

      const caseBtn = e.target.closest(".select-queue-case-btn");
      if (caseBtn) {
        const key = caseBtn.getAttribute("data-case-key");
        if (ARCHETYPES[key]) {
          handleProfileSelectChange(key);
          triggerPostLoginCaseToast("bank");
        }
      }

      const sealStamp = e.target.closest(".official-seal-stamp");
      if (sealStamp) {
        const sigHash = sealStamp.getAttribute("data-seal-hash") || "ZK-SEAL-VERIFIED";
        triggerPostLoginCaseToast(
          state.activePortal,
          "SEAL AUTHENTICITY VERIFIED",
          "Credibiliti-AI Seal Signature (" +
            sigHash +
            ") verified against SHA-256 KYC commitments & RBI Fair Practices."
        );
      }
    });

    document.getElementById("download-client-pdf-btn").addEventListener("click", function () {
      exportCertificatePdf("client-certificate-sheet", "Credibiliti_AI_Authorization_" + state.profile.passkey + ".pdf");
    });
    document.getElementById("download-bank-pdf-btn").addEventListener("click", function () {
      exportCertificatePdf("bank-certificate-sheet", "Credibiliti_AI_Basel_Sanction_" + state.profile.passkey + ".pdf");
    });
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  }
})();
/* ==========================================================================
   END OF CREDIBILITI-AI DUAL-SCENE APPLICATION CONTROLLER
   Concept & Built by Mohd Amir Ali (https://techwithamir.com)
   ========================================================================== */
