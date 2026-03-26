// ============================================
// CONFIGURATION - Change these values
// ============================================
const OGADS_LOCKER_URL = "YOUR_OGADS_LOCKER_LINK_HERE";

// ============================================
// STATE
// ============================================
let selectedPlan = null;
let currentStep = "hero";
let queueInterval = null;

// ============================================
// DOM REFERENCES
// ============================================
const steps = {
  hero: document.getElementById("step-hero"),
  plans: document.getElementById("step-plans"),
  connect: document.getElementById("step-connect"),
  progress: document.getElementById("step-progress"),
  verify: document.getElementById("step-verify"),
};

const btnGetStarted = document.getElementById("btn-get-started");
const btnConnect = document.getElementById("btn-connect");
const btnVerify = document.getElementById("btn-verify");
const emailInput = document.getElementById("email-input");
const usernameInput = document.getElementById("username-input");
const inputError = document.getElementById("input-error");
const selectedPlanTag = document.getElementById("selected-plan-tag");
const planCards = document.querySelectorAll(".plan-card");

const progressBar = document.getElementById("progress-bar");
const progressPercent = document.getElementById("progress-percent");
const progressTitle = document.getElementById("progress-title");
const progressStatus = document.getElementById("progress-status");

const lockerModal = document.getElementById("locker-modal");
const lockerIframe = document.getElementById("locker-iframe");
const modalClose = document.getElementById("modal-close");

// ============================================
// PARTICLES BACKGROUND — Block-shaped (voxel)
// ============================================
(function initParticles() {
  var canvas = document.getElementById("particles-canvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var particles = [];
  var count = 40;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function createParticle() {
    var rng = Math.random();
    var hue;
    if (rng < 0.45) hue = "gold";
    else if (rng < 0.8) hue = "blue";
    else hue = "green";

    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 4 + 2,
      dx: (Math.random() - 0.5) * 0.4,
      dy: -(Math.random() * 0.3 + 0.1),
      opacity: Math.random() * 0.5 + 0.2,
      hue: hue,
      diamond: Math.random() > 0.75,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
    };
  }

  function init() {
    resize();
    particles = [];
    for (var i = 0; i < count; i++) {
      particles.push(createParticle());
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.dx;
      p.y += p.dy;
      p.rotation += p.rotSpeed;

      if (p.y < -10 || p.x < -10 || p.x > canvas.width + 10) {
        particles[i] = createParticle();
        particles[i].y = canvas.height + 10;
        p = particles[i];
      }

      var color;
      if (p.hue === "gold") color = "rgba(210, 159, 50, " + p.opacity + ")";
      else if (p.hue === "blue") color = "rgba(89, 138, 195, " + p.opacity + ")";
      else color = "rgba(74, 222, 128, " + p.opacity + ")";

      ctx.save();
      ctx.translate(p.x, p.y);

      if (p.diamond) {
        ctx.rotate(p.rotation);
        ctx.fillStyle = color;
        ctx.beginPath();
        var s = p.size;
        ctx.moveTo(0, -s);
        ctx.lineTo(s * 0.7, 0);
        ctx.lineTo(0, s);
        ctx.lineTo(-s * 0.7, 0);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.rotate(p.rotation);
        ctx.fillStyle = color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      }

      ctx.restore();
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  init();
  draw();
})();

// ============================================
// LIVE STATS TICKER
// ============================================
(function initStatsTicker() {
  var keysEl = document.getElementById("stat-keys-today");
  var onlineEl = document.getElementById("stat-online");
  if (!keysEl || !onlineEl) return;

  var keys = 307;
  var online = 31431;

  setInterval(function () {
    keys += Math.floor(Math.random() * 3) + 1;
    keysEl.textContent = keys.toLocaleString();
  }, 4000);

  setInterval(function () {
    online += Math.floor(Math.random() * 11) - 5;
    if (online < 31000) online = 31000;
    onlineEl.textContent = online.toLocaleString();
  }, 3000);
})();

// ============================================
// COUNTDOWN TIMER (localStorage persistence)
// ============================================
(function initCountdown() {
  var cdHours = document.getElementById("cd-hours");
  var cdMins = document.getElementById("cd-mins");
  var cdSecs = document.getElementById("cd-secs");
  if (!cdHours) return;

  var storageKey = "hytale_countdown_end";
  var endTime = localStorage.getItem(storageKey);

  if (!endTime || parseInt(endTime) <= Date.now()) {
    endTime = Date.now() + (2 * 3600 + 47 * 60 + 33) * 1000;
    localStorage.setItem(storageKey, endTime.toString());
  } else {
    endTime = parseInt(endTime);
  }

  function update() {
    var remaining = Math.max(0, endTime - Date.now());
    var totalSecs = Math.floor(remaining / 1000);
    var h = Math.floor(totalSecs / 3600);
    var m = Math.floor((totalSecs % 3600) / 60);
    var s = totalSecs % 60;

    cdHours.textContent = h.toString().padStart(2, "0");
    cdMins.textContent = m.toString().padStart(2, "0");
    cdSecs.textContent = s.toString().padStart(2, "0");

    if (remaining <= 0) {
      endTime = Date.now() + (2 * 3600 + 47 * 60 + 33) * 1000;
      localStorage.setItem(storageKey, endTime.toString());
    }
  }

  update();
  setInterval(update, 1000);
})();

// ============================================
// STEP NAVIGATION — Portal transitions
// ============================================
function goToStep(stepName) {
  var outEl = steps[currentStep];
  var inEl = steps[stepName];
  if (!outEl || !inEl) return;

  outEl.classList.add("portal-out");

  setTimeout(function () {
    outEl.classList.remove("active", "portal-out");
    currentStep = stepName;
    window.scrollTo(0, 0);
    inEl.classList.add("active");

    // Trigger connect step animations
    if (stepName === "connect") {
      initConnectAnimations();
    }
  }, 300);
}

// ============================================
// STEP 1 -> 2: Hero "Get Started" click
// ============================================
btnGetStarted.addEventListener("click", function () {
  goToStep("plans");
});

// ============================================
// STEP 2: Plan card selection + 3D tilt
// ============================================
planCards.forEach(function (card) {
  card.addEventListener("click", function () {
    planCards.forEach(function (c) {
      c.classList.remove("selected");
    });
    card.classList.add("selected");
    selectedPlan = card.getAttribute("data-plan");

    setTimeout(function () {
      goToStep("connect");
      var labels = { standard: "Standard", deluxe: "Deluxe", founders: "Founder's Edition" };
      selectedPlanTag.textContent = "Edition: " + (labels[selectedPlan] || selectedPlan);

      // Update loot box edition text
      var lootEdition = document.getElementById("loot-edition");
      if (lootEdition) {
        lootEdition.textContent = "Hytale " + (labels[selectedPlan] || selectedPlan) + " Key";
      }
    }, 400);
  });

  // 3D tilt on hover (desktop only)
  if (window.matchMedia("(hover: hover)").matches) {
    card.addEventListener("mousemove", function (e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var centerX = rect.width / 2;
      var centerY = rect.height / 2;
      var rotateY = ((x - centerX) / centerX) * 3;
      var rotateX = ((centerY - y) / centerY) * 3;
      card.style.transform = "perspective(600px) rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg)";
    });

    card.addEventListener("mouseleave", function () {
      card.style.transform = "";
    });
  }
});

// ============================================
// STEP 3: Connect animations
// ============================================
function initConnectAnimations() {
  // Queue position countdown
  var queueEl = document.getElementById("queue-position");
  if (!queueEl) return;

  var queuePos = 47;
  queueEl.textContent = queuePos;

  if (queueInterval) clearInterval(queueInterval);
  queueInterval = setInterval(function () {
    queuePos -= Math.floor(Math.random() * 3) + 1;
    if (queuePos < 1) queuePos = 1;
    queueEl.textContent = queuePos;
    if (queuePos <= 1) clearInterval(queueInterval);
  }, 2000);
}

// ============================================
// STEP 3: Username input validation & connect
// ============================================
btnConnect.addEventListener("click", function () {
  var email = emailInput.value.trim();
  var username = usernameInput.value.trim();

  inputError.textContent = "";
  emailInput.classList.remove("error");
  usernameInput.classList.remove("error");

  if (!email) {
    inputError.textContent = "Please enter your email address.";
    emailInput.classList.add("error");
    emailInput.focus();
    return;
  }

  if (!email.includes("@") || !email.includes(".")) {
    inputError.textContent = "Please enter a valid email address.";
    emailInput.classList.add("error");
    emailInput.focus();
    return;
  }

  if (!username) {
    inputError.textContent = "Please choose a username.";
    usernameInput.classList.add("error");
    usernameInput.focus();
    return;
  }

  if (username.length < 3) {
    inputError.textContent = "Username must be at least 3 characters.";
    usernameInput.classList.add("error");
    usernameInput.focus();
    return;
  }

  if (queueInterval) clearInterval(queueInterval);
  goToStep("progress");
  runProgress();
});

emailInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    usernameInput.focus();
  }
});

usernameInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    btnConnect.click();
  }
});

// ============================================
// STEP 4: Dungeon Crawl Progress
// ============================================
function runProgress() {
  var phases = [
    { to: 15, title: "Entering the Gate...", status: "Establishing secure connection to the realm.", room: 0 },
    { to: 35, title: "Opening the Vault...", status: "Accessing the key archives.", room: 1 },
    { to: 55, title: "Forging Your Key...", status: "Crafting a unique license key.", room: 2 },
    { to: 75, title: "Enchanting Access...", status: "Applying edition enchantments.", room: 3 },
    { to: 92, title: "Preparing Claim...", status: "Almost there, sealing the key.", room: 4 },
    { to: 100, title: "Key Ready!", status: "One more step to claim your reward.", room: 4 },
  ];

  var current = 0;
  var phaseIndex = 0;
  var dungeonRooms = document.querySelectorAll(".dungeon-room");
  var dungeonPaths = document.querySelectorAll(".dungeon-path");

  // Reset dungeon tracker
  dungeonRooms.forEach(function (r, i) {
    r.classList.remove("active", "complete");
    if (i === 0) r.classList.add("active");
  });
  dungeonPaths.forEach(function (p) {
    p.classList.remove("filled");
  });

  function applyPhase(phase) {
    progressTitle.textContent = phase.title;
    progressStatus.textContent = phase.status;

    // Update dungeon rooms
    dungeonRooms.forEach(function (r, i) {
      if (i < phase.room) {
        r.classList.add("complete");
        r.classList.remove("active");
      } else if (i === phase.room) {
        r.classList.add("active");
        r.classList.remove("complete");
      } else {
        r.classList.remove("active", "complete");
      }
    });

    // Fill paths up to current room
    dungeonPaths.forEach(function (p, i) {
      if (i < phase.room) {
        p.classList.add("filled");
      } else {
        p.classList.remove("filled");
      }
    });
  }

  applyPhase(phases[0]);

  var interval = setInterval(function () {
    current += Math.random() * 2.5 + 0.5;

    if (current >= phases[phaseIndex].to) {
      current = phases[phaseIndex].to;
      phaseIndex++;

      if (phaseIndex < phases.length) {
        applyPhase(phases[phaseIndex]);
      }
    }

    if (current >= 100) {
      current = 100;
      clearInterval(interval);

      // Light up all rooms
      dungeonRooms.forEach(function (r) {
        r.classList.add("complete");
      });
      dungeonPaths.forEach(function (p) {
        p.classList.add("filled");
      });

      setTimeout(function () {
        goToStep("verify");
      }, 800);
    }

    progressBar.style.width = Math.round(current) + "%";
    progressPercent.textContent = Math.round(current) + "% XP";
  }, 120);
}

// ============================================
// STEP 5: Verification button -> open locker
// ============================================
btnVerify.addEventListener("click", function () {
  openLocker();
});

// ============================================
// LOCKER MODAL
// ============================================
function openLocker() {
  if (!OGADS_LOCKER_URL || OGADS_LOCKER_URL === "YOUR_OGADS_LOCKER_LINK_HERE") {
    alert("Locker URL not configured. Open js/main.js and set your OGAds locker link in the OGADS_LOCKER_URL variable.");
    return;
  }

  lockerIframe.src = OGADS_LOCKER_URL;
  lockerModal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeLocker() {
  lockerModal.classList.remove("open");
  document.body.style.overflow = "";
  lockerIframe.src = "about:blank";
}

modalClose.addEventListener("click", function () {
  closeLocker();
});

lockerModal.addEventListener("click", function (e) {
  if (e.target === lockerModal) {
    closeLocker();
  }
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && lockerModal.classList.contains("open")) {
    closeLocker();
  }
});
