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
    // images for the closed rows carry data-src so they are not fetched on load
    function promote(img) {
      if (!img || !img.getAttribute("data-src")) return;
      var ss = img.getAttribute("data-srcset");
      if (ss) { img.setAttribute("srcset", ss); img.removeAttribute("data-srcset"); }
      img.setAttribute("src", img.getAttribute("data-src"));
      img.removeAttribute("data-src");
    }
    function openRow(row) {
      rows.forEach(function (r) {
        var on = r === row;
        r.setAttribute("aria-expanded", on ? "true" : "false");
        var panel = document.getElementById(r.getAttribute("aria-controls"));
        if (panel) {
          panel.classList.toggle("is-open", on);
          if (on) panel.querySelectorAll("img[data-src]").forEach(promote);
        }
      });
      var key = row.getAttribute("data-img");
      frameImgs.forEach(function (img) {
        var on = img.getAttribute("data-key") === key;
        if (on) promote(img);
        img.classList.toggle("is-on", on);
      });
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

  /* Spotlight follows the pointer on tiles, process cards and panels, and the
     same reading tilts the card towards it (one rect read per move, not two) */
  if (fine) {
    document.querySelectorAll(".tile, .pcard, .panel").forEach(function (el) {
      var tilts = !reduce && (el.classList.contains("tile") || el.classList.contains("pcard"));
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left, y = e.clientY - r.top;
        el.style.setProperty("--mx", x + "px");
        el.style.setProperty("--my", y + "px");
        if (!tilts) return;
        el.style.setProperty("--ry", ((x / r.width - 0.5) * 7).toFixed(2) + "deg");
        el.style.setProperty("--rx", ((0.5 - y / r.height) * 5).toFixed(2) + "deg");
      });
      if (tilts) el.addEventListener("pointerleave", function () {
        el.style.setProperty("--rx", "0deg");
        el.style.setProperty("--ry", "0deg");
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


/* v3.3 motion pass: word-by-word headings, an easing FAQ, a sliding nav
   indicator and a scroll-progress hairline. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---- headings arrive a word at a time ----
     Only elements already carrying .reveal are split, so they are still
     invisible when this runs and nothing can flash. The existing reveal
     observer adds .is-in, which is what starts the words. */
  document.querySelectorAll(".reveal.h2, .reveal.statement").forEach(function (el) {
    if (el.querySelector(".w")) return;
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);  // collect first; replacing invalidates the walk
    var i = 0;
    nodes.forEach(function (node) {
      if (!node.nodeValue.trim() || !node.parentNode) return;
      var frag = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach(function (tok) {
        if (!tok) return;
        if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(tok)); return; }
        var w = document.createElement("span");
        w.className = "w";
        var inner = document.createElement("span");
        inner.textContent = tok;
        inner.style.setProperty("--wi", i++);
        w.appendChild(inner);
        frag.appendChild(w);
      });
      node.parentNode.replaceChild(frag, node);
    });
    if (i) el.classList.add("split");
  });

  /* ---- the FAQ eases open and shut instead of snapping ---- */
  if (!reduce) {
    document.querySelectorAll(".faq details").forEach(function (d) {
      var summary = d.querySelector("summary");
      var body = d.querySelector(".faq__body");
      if (!summary || !body) return;
      var busy = false;
      summary.addEventListener("click", function (e) {
        e.preventDefault();
        if (busy) return;
        busy = true;
        var opening = !d.open, done = false;
        var finish = function () {
          if (done) return;
          done = true;
          body.style.height = "";
          body.style.opacity = "";
          if (!opening) d.open = false;
          busy = false;
        };
        if (opening) d.open = true;            // must be rendered before it can be measured
        body.style.height = "auto";
        var full = body.scrollHeight;
        body.style.height = (opening ? 0 : full) + "px";
        body.style.opacity = opening ? "0" : "1";
        // A panel that was inside closed <details> has no computed style to ease
        // from, so flush layout here: without this the height jumps instead.
        void body.offsetHeight;
        body.style.height = (opening ? full : 0) + "px";
        body.style.opacity = opening ? "1" : "0";
        body.addEventListener("transitionend", function h(ev) {
          if (ev.propertyName !== "height") return;
          body.removeEventListener("transitionend", h);
          finish();
        });
        setTimeout(finish, 700);               // never leave a panel stuck
      });
    });
  }

  /* ---- one indicator slides between the nav items ---- */
  var navLinks = document.querySelector(".nav__links");
  if (navLinks && fine && !reduce) {
    var ink = document.createElement("span");
    ink.className = "nav__ink";
    navLinks.appendChild(ink);
    navLinks.classList.add("has-ink");
    var current = navLinks.querySelector('a[aria-current="page"]');
    var moveTo = function (a) {
      if (!a) { ink.style.opacity = "0"; return; }
      ink.style.opacity = "1";
      ink.style.width = Math.max(0, a.offsetWidth - 29) + "px";
      ink.style.transform = "translateX(" + (a.offsetLeft + 14) + "px)";
    };
    moveTo(current);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { moveTo(current); });
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("pointerenter", function () { moveTo(a); });
    });
    navLinks.addEventListener("pointerleave", function () { moveTo(current); });
    window.addEventListener("resize", function () { moveTo(current); }, { passive: true });
  }

  /* ---- scroll-progress hairline (CSS drives it; this only places it) ---- */
  if (!reduce) {
    var bar = document.createElement("div");
    bar.className = "progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
  }
})();
