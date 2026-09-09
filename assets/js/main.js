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
