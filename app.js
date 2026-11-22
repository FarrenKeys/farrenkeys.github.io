/* Farren Keys — player file interactions */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- loader ---------- */
  var loader = document.getElementById("loader");
  var fill = document.getElementById("loaderFill");
  var pct = document.getElementById("loaderPct");
  var tip = document.getElementById("loaderTip");
  var tips = ["Loading story mode…", "Indexing missions…", "Calibrating abilities…", "Player found."];
  var done = false;

  function finishLoader() {
    if (done) return;
    done = true;
    if (fill) fill.style.width = "100%";
    if (pct) pct.textContent = "100%";
    if (loader) {
      loader.classList.add("is-done");
      setTimeout(function () {
        if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
      }, 450);
    }
    document.body.classList.add("ready");
    revealAbilities();
  }

  if (loader) {
    loader.addEventListener("click", finishLoader);
    loader.addEventListener("keydown", finishLoader);
    if (reduce) {
      finishLoader();
    } else {
      var p = 0;
      var timer = setInterval(function () {
        p = Math.min(100, p + Math.random() * 22 + 12);
        if (fill) fill.style.width = p + "%";
        if (pct) pct.textContent = Math.round(p) + "%";
        if (tip) tip.textContent = tips[Math.min(tips.length - 1, Math.floor(p / 26))];
        if (p >= 100) { clearInterval(timer); finishLoader(); }
      }, 150);
    }
  } else {
    finishLoader();
  }

  /* ---------- mission accordions ---------- */
  var missions = Array.prototype.slice.call(document.querySelectorAll(".mission"));
  missions.forEach(function (m) {
    var btn = m.querySelector(".mission__toggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var open = m.classList.contains("is-open");
      missions.forEach(function (other) {
        if (other === m) return;
        other.classList.remove("is-open");
        var b = other.querySelector(".mission__toggle");
        if (b) b.setAttribute("aria-expanded", "false");
      });
      m.classList.toggle("is-open", !open);
      btn.setAttribute("aria-expanded", String(!open));
    });
  });

  /* ---------- ability bars ---------- */
  var stats = Array.prototype.slice.call(document.querySelectorAll(".stat"));
  function revealAbilities() {
    stats.forEach(function (s, i) {
      var v = Number(s.getAttribute("data-value")) || 0;
      var bar = s.querySelector(".stat__bar");
      if (!bar) return;
      var delay = reduce ? 0 : i * 90;
      setTimeout(function () {
        bar.style.setProperty("--w", (v / 10) * 100 + "%");
      }, delay);
    });
  }

  /* ---------- scroll spy + radar ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll("[data-nav]"));
  var sections = links
    .map(function (a) { return document.getElementById(a.getAttribute("data-nav")); })
    .filter(Boolean);
  var radar = document.querySelector(".radar");

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("data-nav") === e.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  if (radar) {
    window.addEventListener("scroll", function () {
      radar.classList.toggle("is-on", window.scrollY > 420);
    }, { passive: true });
  }

  /* ---------- live clock + time of day ---------- */
  var clock = document.getElementById("clock");
  var scene = document.querySelector(".scene");
  function tick() {
    var d = new Date();
    var h = d.getHours();
    if (clock) clock.textContent = String(h).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    if (scene) {
      scene.classList.toggle("is-day", h >= 7 && h < 16);
      scene.classList.toggle("is-dusk", h >= 16 && h < 19);
      scene.classList.toggle("is-night", h >= 19 || h < 7);
    }
  }
  tick();
  setInterval(tick, 15000);

  /* ---------- wanted stars from scroll ---------- */
  var starEls = Array.prototype.slice.call(document.querySelectorAll("#wanted svg"));
  function paintStars(level) {
    starEls.forEach(function (s, i) { s.classList.toggle("is-on", i < level); });
  }
  if (starEls.length) {
    paintStars(3);
    window.addEventListener("scroll", function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? window.scrollY / max : 0;
      paintStars(Math.min(5, 1 + Math.round(p * 4)));
    }, { passive: true });
  }

  /* ---------- counters + cash ---------- */
  function animateNumber(el, target, opts) {
    opts = opts || {};
    var pad = opts.pad || 0;
    var suffix = opts.suffix || "";
    var start = performance.now();
    var dur = reduce ? 0 : 1100;
    function frame(now) {
      var t = dur ? Math.min(1, (now - start) / dur) : 1;
      var eased = 1 - Math.pow(1 - t, 3);
      var val = Math.round(target * eased);
      var out = pad ? String(val).padStart(pad, "0") : String(val);
      el.textContent = out + (t === 1 ? suffix : "");
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function runCounters() {
    Array.prototype.slice.call(document.querySelectorAll("[data-count]")).forEach(function (el) {
      animateNumber(el, Number(el.getAttribute("data-count")) || 0, {
        pad: Number(el.getAttribute("data-pad")) || 0,
        suffix: el.getAttribute("data-suffix") || ""
      });
    });
    var cash = document.getElementById("cash");
    if (cash) animateNumber(cash, 74000);
  }

  /* ---------- toasts ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  var seen = {};
  var toasts = {
    education: "Mission passed",
    skills: "Abilities unlocked",
    work: "Shift complete",
    awards: "Award collected",
    contact: "Contact unlocked"
  };

  function showToast(small, big, ms) {
    if (!toastEl) return;
    toastEl.innerHTML =
      '<span class="toast__small">' + small + "</span>" +
      '<span class="toast__big">' + big + "</span>" +
      '<span class="toast__bar"></span>';
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-on"); }, ms || 2400);
  }

  if ("IntersectionObserver" in window) {
    var toastSpy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting || seen[e.target.id]) return;
        seen[e.target.id] = true;
        var label = toasts[e.target.id];
        if (label) showToast(label, "Mission passed");
      });
    }, { rootMargin: "-40% 0px -50% 0px" });
    Object.keys(toasts).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) toastSpy.observe(s);
    });
  }

  runCounters();

  /* ---------- copy buttons ---------- */
  function say(msg) {
    showToast(msg, "Copied", 1900);
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-copy]")).forEach(function (btn) {
    btn.addEventListener("click", function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      var text = btn.getAttribute("data-copy");
      function ok() {
        btn.classList.add("is-done");
        btn.textContent = "Copied";
        say(text + " copied");
        setTimeout(function () {
          btn.classList.remove("is-done");
          btn.textContent = "Copy";
        }, 1800);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(ok, fallback);
      } else {
        fallback();
      }
      function fallback() {
        var t = document.createElement("textarea");
        t.value = text;
        t.setAttribute("readonly", "");
        t.style.position = "fixed";
        t.style.opacity = "0";
        document.body.appendChild(t);
        t.select();
        try { document.execCommand("copy"); ok(); } catch (e) { say("Copy failed — select the text instead"); }
        document.body.removeChild(t);
      }
    });
  });
})();
