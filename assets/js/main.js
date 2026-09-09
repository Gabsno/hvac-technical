/* HVAC Technical Services - site behaviour (no dependencies) */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* Nav hairline once scrolled (IntersectionObserver on a sentinel, no scroll listener) */
  var nav = document.querySelector(".nav");
  if (nav && "IntersectionObserver" in window) {
    var sentinel = document.createElement("div");
    sentinel.style.cssText = "position:absolute;top:0;left:0;height:1px;width:1px;pointer-events:none;";
    document.body.prepend(sentinel);
    new IntersectionObserver(function (e) { nav.classList.toggle("is-scrolled", !e[0].isIntersecting); }).observe(sentinel);
  }

  /* Active nav link */
  var here = (location.pathname.split("/").pop() || "index.html").replace(/\.html$/, "") || "index";
  document.querySelectorAll(".nav__links a, .drawer__links a").forEach(function (a) {
    var target = (a.getAttribute("href") || "").replace(/\.html$/, "");
    if (target === here) a.setAttribute("aria-current", "page");
  });

  /* Mobile drawer */
  var drawer = document.querySelector(".drawer");
  var burger = document.querySelector(".nav__burger");
  var closeBtn = document.querySelector(".drawer__close");
  function setDrawer(open) {
    if (!drawer) return;
    drawer.setAttribute("data-open", open ? "true" : "false");
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
    if (burger) burger.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
    (open ? closeBtn : burger) && (open ? closeBtn : burger).focus();
  }
  if (burger) burger.addEventListener("click", function () { setDrawer(true); });
  if (closeBtn) closeBtn.addEventListener("click", function () { setDrawer(false); });
  if (drawer) {
    drawer.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setDrawer(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && drawer.getAttribute("data-open") === "true") setDrawer(false); });
  }

  /* Reveal on scroll */
  var revealEls = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) { entry.target.classList.add("is-in"); io.unobserve(entry.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* Services accordion: one open at a time, sticky image follows the open row */
  var rows = document.querySelectorAll(".svc__row");
  if (rows.length) {
    var frameImgs = document.querySelectorAll(".svc__frame img");
    function openRow(row) {
      rows.forEach(function (r) {
        var on = r === row;
        r.setAttribute("aria-expanded", on ? "true" : "false");
        var panel = document.getElementById(r.getAttribute("aria-controls"));
        if (panel) panel.classList.toggle("is-open", on);
      });
      var key = row.getAttribute("data-img");
      frameImgs.forEach(function (img) { img.classList.toggle("is-on", img.getAttribute("data-key") === key); });
    }
    rows.forEach(function (row) {
      row.addEventListener("click", function () { openRow(row); });
      if (canHover) row.addEventListener("mouseenter", function () { openRow(row); });
    });
    openRow(document.querySelector('.svc__row[aria-expanded="true"]') || rows[0]);
  }

  /* Services page: highlight the index entry currently in view */
  var entries = document.querySelectorAll(".entry[id]");
  var indexLinks = document.querySelectorAll(".index__nav a");
  if (entries.length && indexLinks.length && "IntersectionObserver" in window) {
    var eio = new IntersectionObserver(function (list) {
      list.forEach(function (e) {
        if (!e.isIntersecting) return;
        indexLinks.forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-30% 0px -55% 0px", threshold: 0 });
    entries.forEach(function (el) { eio.observe(el); });
  }

  /* Magnetic pull on primary buttons (pointer-driven transform only) */
  if (canHover && !reduce) {
    document.querySelectorAll(".btn--primary").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        var dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        btn.style.transform = "translate(" + (dx * 8).toFixed(1) + "px," + (dy * 6).toFixed(1) + "px)";
      });
      btn.addEventListener("pointerleave", function () { btn.style.transform = ""; });
    });
  }

  /* Contact form -> WhatsApp (no backend required) */
  var form = document.querySelector("[data-wa-form]");
  if (form) {
    var status = form.querySelector(".form__status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = new FormData(form);
      var lines = [
        "Hello HVAC Technical, I would like to request a quote.", "",
        "Name: " + (f.get("name") || ""),
        "Phone: " + (f.get("phone") || ""),
        "Email: " + (f.get("email") || ""),
        "Location: " + (f.get("location") || ""),
        "Service: " + (f.get("service") || ""),
        "Property: " + (f.get("property") || ""), "",
        "Details: " + (f.get("message") || "")
      ];
      window.open("https://wa.me/" + form.getAttribute("data-wa-number") + "?text=" + encodeURIComponent(lines.join("\n")), "_blank", "noopener");
      if (status) status.textContent = "Opening WhatsApp with your request. If nothing happened, call 059 933 3103.";
    });
  }

  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();


/* v3.2 energy layer */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* Rotating headline word */
  var rot = document.querySelector(".rotator");
  if (rot) {
    var words = (rot.getAttribute("data-words") || "").split("|").filter(Boolean), wi = 0;
    if (words.length > 1 && !reduce) {
      setInterval(function () {
        rot.classList.add("is-out");
        setTimeout(function () {
          wi = (wi + 1) % words.length;
          rot.textContent = words[wi];
          rot.classList.add("is-prep");
          rot.classList.remove("is-out");
          void rot.offsetWidth;
          rot.classList.remove("is-prep");
        }, 320);
      }, 2800);
    }
  }

  /* Drifting particles over the hero photo: cool air rising */
  var cv = document.querySelector(".hero__air");
  if (cv && !reduce && cv.getContext) {
    var ctx = cv.getContext("2d"), dpr = Math.min(window.devicePixelRatio || 1, 2), W = 0, H = 0, P = [], raf = 0;
    var mk = function (anywhere) {
      return { x: Math.random() * W, y: anywhere ? Math.random() * H : H + 10, r: (Math.random() * 1.5 + 0.6) * dpr,
        vx: (Math.random() * 0.22 + 0.05) * dpr, vy: -(Math.random() * 0.32 + 0.1) * dpr, a: Math.random() * 0.45 + 0.15, ph: Math.random() * 6.28 };
    };
    var size = function () { W = cv.width = Math.round(cv.offsetWidth * dpr); H = cv.height = Math.round(cv.offsetHeight * dpr); };
    var seed = function () { P = []; var n = Math.min(Math.max(Math.round(W * H / (30000 * dpr * dpr)), 30), 110); for (var k = 0; k < n; k++) P.push(mk(true)); };
    var tick = function (t) {
      ctx.clearRect(0, 0, W, H);
      for (var k = 0; k < P.length; k++) {
        var p = P[k];
        p.x += p.vx + Math.sin(t / 1400 + p.ph) * 0.15 * dpr; p.y += p.vy;
        if (p.y < -10 || p.x > W + 10) P[k] = mk(false);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fillStyle = "rgba(185,211,234," + p.a + ")"; ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    size(); seed(); raf = requestAnimationFrame(tick);
    window.addEventListener("resize", function () { size(); seed(); }, { passive: true });
    document.addEventListener("visibilitychange", function () { if (document.hidden) cancelAnimationFrame(raf); else raf = requestAnimationFrame(tick); });
  }

  /* Hero photo follows the pointer a little */
  var hero = document.querySelector(".hero"), shift = document.querySelector(".hero__shift");
  if (hero && shift && fine && !reduce) {
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      var dx = (e.clientX - r.left) / r.width - 0.5, dy = (e.clientY - r.top) / r.height - 0.5;
      shift.style.transform = "translate3d(" + (-dx * 18).toFixed(1) + "px," + (-dy * 12).toFixed(1) + "px,0)";
    });
    hero.addEventListener("pointerleave", function () { shift.style.transform = ""; });
  }

  /* Spotlight that follows the pointer on tiles, process cards and panels */
  if (fine) {
    document.querySelectorAll(".tile, .pcard, .panel").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--mx", (e.clientX - r.left) + "px");
        el.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* Count-up numbers */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    var run = function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      if (reduce) { el.textContent = target; return; }
      var start = null, dur = 1400;
      var step = function (ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if ("IntersectionObserver" in window) {
      var cio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { run(e.target); cio.unobserve(e.target); } }); }, { threshold: 0.5 });
      counters.forEach(function (el) { cio.observe(el); });
    } else { counters.forEach(run); }
  }
})();
