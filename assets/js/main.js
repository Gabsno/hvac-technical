/* HVAC Technical GH  -  site behaviour (no dependencies) */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Sticky nav shadow */
  var nav = document.querySelector(".nav");
  if (nav) {
    var onScroll = function () { nav.classList.toggle("is-scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Active nav link */
  var here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav__links a, .drawer__links a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === here || (here === "" && href === "index.html")) a.setAttribute("aria-current", "page");
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
    if (open && closeBtn) closeBtn.focus();
    if (!open && burger) burger.focus();
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
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-in"); io.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* Count-up stats */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    var runCount = function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var suffix = el.getAttribute("data-suffix") || "";
      if (reduce) { el.textContent = target + suffix; return; }
      var start = null, dur = 1400;
      var step = function (ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if ("IntersectionObserver" in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { runCount(entry.target); cio.unobserve(entry.target); }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { cio.observe(el); });
    } else {
      counters.forEach(runCount);
    }
  }

  /* Contact form -> WhatsApp (no backend required) */
  var form = document.querySelector("[data-wa-form]");
  if (form) {
    var status = form.querySelector(".form__status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = new FormData(form);
      var lines = [
        "Hello HVAC Technical, I would like to request a quote.",
        "",
        "Name: " + (f.get("name") || ""),
        "Phone: " + (f.get("phone") || ""),
        "Email: " + (f.get("email") || ""),
        "Location: " + (f.get("location") || ""),
        "Service: " + (f.get("service") || ""),
        "Property: " + (f.get("property") || ""),
        "",
        "Details: " + (f.get("message") || "")
      ];
      var url = "https://wa.me/" + form.getAttribute("data-wa-number") + "?text=" + encodeURIComponent(lines.join("\n"));
      window.open(url, "_blank", "noopener");
      if (status) status.textContent = "Opening WhatsApp with your request. If nothing happened, call us on 050 773 2410.";
    });
  }

  /* Footer year */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
