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

  /* ---- clients rail ----
     It drifts on its own, but the visitor can take over whenever: swipe on
     touch, two-finger on a trackpad, arrow keys, or the buttons that surface
     on hover. The logo set is duplicated in the markup so the drift loops with
     no seam, and scrollLeft wraps at the halfway mark where it repeats. */
  var rail = document.getElementById("client-rail");
  if (rail) {
    var track = rail.querySelector(".rail__track");
    var SPEED = 42;                                  // px per second
    var paused = false, touching = false, smoothUntil = 0, idle = 0, last = 0;
    var half = function () { return track ? track.scrollWidth / 2 : 0; };
    var hold = function (ms) {                       // visitor took over; drift resumes after a beat
      paused = true;
      clearTimeout(idle);
      idle = setTimeout(function () { paused = false; }, ms || 2600);
    };
    if (!reduce) {
      // scrollLeft only stores whole pixels, so a sub-pixel step read back from
      // the element rounds straight off again and the drift stalls on a fast
      // display. Keep the real position here as a float and let the element round.
      var pos = rail.scrollLeft;
      var frame = function (t) {
        if (!last) last = t;
        var dt = Math.min(t - last, 50);             // ignore the gap after a background tab
        last = t;
        var h = half();
        if (Math.abs(rail.scrollLeft - pos) > 2) pos = rail.scrollLeft;   // a swipe, key or arrow moved it
        if (!touching && t > smoothUntil && h) {     // never wrap mid-drag or mid-smooth-scroll
          if (pos >= h) { pos -= h; rail.scrollLeft = pos; }
          else if (pos < 0) { pos += h; rail.scrollLeft = pos; }
        }
        if (!paused && !document.hidden) {
          pos += SPEED * dt / 1000;
          rail.scrollLeft = pos;
        }
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);

      ["wheel", "keydown"].forEach(function (ev) {
        rail.addEventListener(ev, function () { hold(); }, { passive: true });
      });
      rail.addEventListener("touchstart", function () { touching = true; hold(); }, { passive: true });
      rail.addEventListener("touchend", function () { touching = false; hold(); }, { passive: true });
      rail.addEventListener("touchcancel", function () { touching = false; hold(); }, { passive: true });
      rail.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") { clearTimeout(idle); paused = true; } });
      rail.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") hold(400); });
      rail.addEventListener("focusin", function () { clearTimeout(idle); paused = true; });
      rail.addEventListener("focusout", function () { hold(400); });
      document.addEventListener("visibilitychange", function () { last = 0; });
    }

    // Arrows page across. There is no end to reach, so they never disable: going
    // back past the start jumps forward by one identical set first, invisibly.
    var page = function () { return Math.max(rail.clientWidth * 0.7, 200); };
    document.querySelectorAll("[data-rail]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var dir = btn.getAttribute("data-rail") === "next" ? 1 : -1;
        hold(3600);
        var h = half();
        if (dir < 0 && h && rail.scrollLeft - page() < 0) rail.scrollLeft += h;
        smoothUntil = performance.now() + 800;
        rail.scrollBy({ left: dir * page(), behavior: reduce ? "auto" : "smooth" });
      });
    });
  }
})();


/* Room by room sizing, then a quotation request.
   Indicative only, not a design. 600 BTU/hr per square metre is the usual
   tropical starting point for a room of normal ceiling height; the rest
   adjusts for how hard that room has to work. The real figure comes from a
   heat-load calculation on site, which the page says plainly. */
(function () {
  "use strict";
  var list = document.getElementById("rooms");
  var tpl = document.getElementById("room-tpl");
  if (!list || !tpl) return;

  var MAX_ROOMS = 12;
  var SIZES = [
    { btu: 9000, hp: "1 HP" }, { btu: 12000, hp: "1.5 HP" }, { btu: 18000, hp: "2 HP" },
    { btu: 24000, hp: "2.5 HP" }, { btu: 30000, hp: "3 HP" }, { btu: 36000, hp: "4 HP" },
    { btu: 48000, hp: "5 HP" }, { btu: 60000, hp: "6 HP" }
  ];
  var USE = {
    bedroom: { k: 0.95, add: 0,    label: "Bedroom" },
    living:  { k: 1.00, add: 0,    label: "Living room" },
    office:  { k: 1.05, add: 0,    label: "Office" },
    retail:  { k: 1.15, add: 0,    label: "Shop or restaurant" },
    kitchen: { k: 1.00, add: 4000, label: "Kitchen" }   // cooking equipment
  };

  var $ = function (id) { return document.getElementById(id); };
  var fmt = function (n) { return n.toLocaleString("en-GB"); };
  var cards = function () { return Array.prototype.slice.call(list.querySelectorAll(".room")); };

  function clampVal(el, min, max, dflt) {
    var v = parseFloat(el.value);
    if (!isFinite(v)) return dflt;
    return Math.min(Math.max(v, min), max);
  }

  function read(card) {
    var q = function (k) { return card.querySelector('[data-k="' + k + '"]'); };
    var sun = q("sun");
    return {
      name: q("name").value.trim(),
      l: clampVal(q("l"), 1, 60, 4),
      w: clampVal(q("w"), 1, 60, 4),
      people: Math.round(clampVal(q("people"), 1, 80, 2)),
      useKey: q("use").value,
      sun: parseFloat(sun.value) || 1,
      sunText: sun.options[sun.selectedIndex].text,
      glass: q("glass").checked,
      roof: q("roof").checked
    };
  }

  function size(r) {
    var use = USE[r.useKey] || USE.living;
    var area = r.l * r.w;
    var btu = area * 600 * use.k * r.sun;
    if (r.glass) btu *= 1.10;
    if (r.roof) btu *= 1.12;
    btu += Math.max(0, r.people - 2) * 600;   // about 600 BTU/hr per extra body
    btu += use.add;
    btu = Math.round(btu / 500) * 500;
    var pick = null;
    for (var i = 0; i < SIZES.length; i++) { if (SIZES[i].btu >= btu) { pick = SIZES[i]; break; } }
    return { area: area, btu: btu, pick: pick, useLabel: use.label };
  }

  function totals() {
    var out = { rooms: [], btu: 0, area: 0, big: false, tally: {} };
    cards().forEach(function (card, i) {
      var r = read(card), s = size(r);
      r.index = i + 1;
      out.rooms.push({ r: r, s: s });
      out.btu += s.btu;
      out.area += s.area;
      if (s.btu > 30000) out.big = true;
      if (s.pick) out.tally[s.pick.hp] = (out.tally[s.pick.hp] || 0) + 1;
    });
    if (out.rooms.length >= 3 || out.btu > 48000) out.approach = "Multi-split or VRF worth pricing";
    else if (out.big) out.approach = "Cassette or ducted";
    else out.approach = "Individual wall splits";
    return out;
  }

  function message() {
    var t = totals(), L = [];
    L.push("Hello HVAC Technical, I would like a quotation.", "");
    L.push("Name: " + $("q-name").value.trim());
    L.push("Phone: " + $("q-phone").value.trim());
    if ($("q-email").value.trim()) L.push("Email: " + $("q-email").value.trim());
    if ($("q-location").value.trim()) L.push("Location: " + $("q-location").value.trim());
    L.push("Property: " + $("q-property").value);
    L.push("Timing: " + $("q-when").value);
    L.push("", "Rooms sized on your website:");
    t.rooms.forEach(function (x) {
      L.push(x.r.index + ". " + (x.r.name || "Room " + x.r.index) + " - " +
        x.r.l + "m x " + x.r.w + "m, " + x.s.useLabel.toLowerCase() + ", " +
        x.r.sunText.toLowerCase() + ", " + x.r.people + " people" +
        (x.r.glass ? ", large windows" : "") + (x.r.roof ? ", roof above" : "") +
        " -> " + fmt(x.s.btu) + " BTU" + (x.s.pick
          ? ", about " + x.s.pick.hp + (x.s.btu > 30000 ? " of capacity, likely more than one unit" : "")
          : ", over a single unit"));
    });
    L.push("", "Total: " + t.rooms.length + " room" + (t.rooms.length === 1 ? "" : "s") +
      ", " + t.area.toFixed(0) + " m2, " + fmt(t.btu) + " BTU/hr");
    L.push("Likely approach: " + t.approach);
    if ($("q-notes").value.trim()) L.push("", "Notes: " + $("q-notes").value.trim());
    L.push("", "Please confirm the sizing on site and send a quotation.");
    return L.join("\n");
  }

  function refresh() {
    var t = totals(), list_ = cards();
    list_.forEach(function (card, i) {
      var x = t.rooms[i];
      card.querySelector('[data-out="btu"]').textContent = fmt(x.s.btu);
      // past about 30,000 BTU nobody hangs one box on the wall, so say "of
      // capacity" rather than let the HP read as a single unit
      card.querySelector('[data-out="hp"]').textContent = x.s.pick
        ? "/ " + x.s.pick.hp + (x.s.btu > 30000 ? " of capacity" : "")
        : "/ over a single unit";
      card.querySelector('[data-k="name"]').placeholder = "Room " + (i + 1);
      card.querySelector("[data-del]").disabled = list_.length < 2;
    });
    $("sum-btu").textContent = fmt(t.btu);
    $("sum-rooms").textContent = String(list_.length);
    $("sum-area").textContent = t.area.toFixed(t.area < 10 ? 1 : 0) + " m\u00B2";
    $("sum-approach").textContent = t.approach;
    var units = SIZES.filter(function (s) { return t.tally[s.hp]; })
      .map(function (s) { return t.tally[s.hp] + " x " + s.hp; }).join(", ");
    $("sum-units").textContent = units || "Over single-unit sizes";
    $("sum-sr").textContent = list_.length + " rooms, " + fmt(t.btu) + " BTU per hour in total";
    $("q-mail").href = "mailto:info@hvactechnicalgh.com?subject=" +
      encodeURIComponent("Quotation request from the website") + "&body=" + encodeURIComponent(message());
  }

  function addRoom() {
    if (cards().length >= MAX_ROOMS) return null;
    var node = tpl.content.firstElementChild.cloneNode(true);
    list.appendChild(node);
    var full = cards().length >= MAX_ROOMS;
    $("add-room").hidden = full;
    $("room-cap").hidden = !full;
    refresh();
    return node;
  }

  list.addEventListener("input", refresh);
  list.addEventListener("change", refresh);
  list.addEventListener("click", function (e) {
    var del = e.target.closest ? e.target.closest("[data-del]") : null;
    if (!del || del.disabled) return;
    var card = del.closest(".room");
    if (cards().length < 2) return;
    var neighbour = card.nextElementSibling || card.previousElementSibling;
    card.remove();
    $("add-room").hidden = false;
    $("room-cap").hidden = true;
    refresh();
    if (neighbour) { var f = neighbour.querySelector('[data-k="l"]'); if (f) f.focus(); }
  });
  $("add-room").addEventListener("click", function () {
    var node = addRoom();
    if (node) { var f = node.querySelector('[data-k="name"]'); if (f) f.focus(); }
  });

  var form = $("quote-form");
  var status = form.querySelector(".form__status");
  form.addEventListener("input", refresh);
  form.addEventListener("change", refresh);
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var missing = [];
    if (!$("q-name").value.trim()) missing.push($("q-name"));
    if (!$("q-phone").value.trim()) missing.push($("q-phone"));
    if (missing.length) {
      status.textContent = "Please add your name and phone number so we can reply to you.";
      missing[0].focus();
      return;
    }
    window.open("https://wa.me/233599333103?text=" + encodeURIComponent(message()), "_blank", "noopener");
    status.textContent = "Opening WhatsApp with your rooms attached. If nothing happened, call 059 933 3103.";
  });

  addRoom();   // start with one room ready to fill in
})();

/* ---------------------------------------------------------------------------
   The floating WhatsApp button sits fixed over the bottom-right corner, which
   on a phone lands on top of form controls: a text input, a select and the
   textarea on both the sizer and the contact form. Tapping the right edge of
   one of those opened WhatsApp instead of the field. Hide it while a form is
   on screen - every form here ends in its own WhatsApp action, so the route is
   never lost.
   --------------------------------------------------------------------------- */
(function () {
  var fab = document.querySelector(".wa-float");
  if (!fab || !("IntersectionObserver" in window)) return;
  var forms = document.querySelectorAll("form, .builder");
  if (!forms.length) return;

  // Track the set rather than a counter: an observer can report the same
  // target twice and a counter would drift out of step with reality.
  var onScreen = new Set();
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) onScreen.add(e.target);
      else onScreen.delete(e.target);
    });
    fab.classList.toggle("is-hidden", onScreen.size > 0);
  }, { rootMargin: "0px 0px -10% 0px" });

  forms.forEach(function (f) { io.observe(f); });
})();

/* ---------------------------------------------------------------------------
   Sector focus on the work page.

   The home page's sector tiles link here with a hash. Before this, every one of
   them landed on a page listing all six sectors, so clicking "Apartments and
   homes" opened something showing offices, restaurants and the rest - the
   destination never matched what was clicked. Arriving with a sector hash now
   shows that sector on its own, with a filter row to reach the others.

   The row is built here rather than in the markup, so with JavaScript off the
   page keeps its old behaviour and shows everything.
   --------------------------------------------------------------------------- */
(function () {
  var wrap = document.querySelector(".sectors");
  if (!wrap) return;
  var sectors = Array.prototype.slice.call(wrap.querySelectorAll(".sector"));
  if (sectors.length < 2) return;

  var bar = document.createElement("div");
  bar.className = "sectors__filter";
  bar.setAttribute("aria-label", "Filter by sector");

  var defs = [{ id: "all", label: "All sectors" }].concat(sectors.map(function (s) {
    return { id: s.id, label: s.dataset.short || s.querySelector("h3").textContent.trim() };
  }));

  var buttons = defs.map(function (d) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = d.label;
    b.dataset.id = d.id;
    b.addEventListener("click", function () { show(d.id, false, true); });
    bar.appendChild(b);
    return b;
  });

  function show(id, jump, writeHash) {
    var known = id === "all" || sectors.some(function (s) { return s.id === id; });
    if (!known) id = "all";
    sectors.forEach(function (s) { s.hidden = id !== "all" && s.id !== id; });
    buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.id === id)); });

    // Keep the address bar honest so a filtered view can be linked to - but
    // only once the visitor has actually chosen something. Landing on the page
    // with no hash should not rewrite the URL under them.
    if (writeHash && history.replaceState) {
      history.replaceState(null, "", id === "all" ? "#sectors" : "#" + id);
    }

    if (jump) settle();
  }

  // Put the section heading just below the fixed bar, so the visitor sees the
  // heading, the filter row and the sector they picked - not the sector alone,
  // which reads as though the page only has one.
  function settle() {
    var head = document.getElementById("sectors") || wrap;
    var nav = document.querySelector(".nav");
    var navH = nav ? nav.getBoundingClientRect().height : 0;
    var top = head.getBoundingClientRect().top + window.pageYOffset - navH - 24;
    window.scrollTo({ top: Math.max(0, top) });
  }

  wrap.parentNode.insertBefore(bar, wrap);

  var landed = location.hash.slice(1);
  show(landed, false);
  if (landed) {
    // The browser performs its own fragment jump after the document loads, and
    // it would land past the heading and undo the scroll above. Run last.
    var after = function () { requestAnimationFrame(settle); };
    if (document.readyState === "complete") after();
    else window.addEventListener("load", after);
  }

  window.addEventListener("hashchange", function () {
    show(location.hash.slice(1), true, false);
  });
})();
