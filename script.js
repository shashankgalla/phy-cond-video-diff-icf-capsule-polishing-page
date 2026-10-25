// Physics-Conditioned Video Diffusion project page interactions.
// Vanilla JS, no dependencies.

(function () {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- scroll reveal ---------- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in-view"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });

    // Safety net: if something stops the observer from ever firing for an
    // element (unusual layout, browser quirk), don't leave content hidden.
    setTimeout(function () {
      els.forEach(function (el) { el.classList.add("in-view"); });
    }, 4000);
  }

  /* ---------- animated stat counters ---------- */
  function animateCount(el) {
    var target = parseFloat(el.dataset.target);
    if (isNaN(target)) return;
    var decimals = el.dataset.decimals ? parseInt(el.dataset.decimals, 10) : 0;
    var prefix = el.dataset.prefix || "";
    var suffix = el.dataset.suffix || "";
    var duration = 1100;
    var startTime = null;

    if (reduceMotion) {
      el.textContent = prefix + target.toFixed(decimals) + suffix;
      return;
    }

    function step(ts) {
      if (startTime === null) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = target * eased;
      el.textContent = prefix + value.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function initCounters() {
    var els = document.querySelectorAll(".stat-value[data-target]");
    if (!els.length || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- nav active state + shadow ---------- */
  function initNav() {
    var nav = document.querySelector(".topnav");
    var links = document.querySelectorAll(".topnav-links a");
    var sections = [];
    links.forEach(function (link) {
      var id = link.getAttribute("href");
      if (id && id.charAt(0) === "#") {
        var sec = document.querySelector(id);
        if (sec) sections.push({ link: link, el: sec });
      }
    });

    window.addEventListener("scroll", function () {
      if (nav) nav.classList.toggle("scrolled", window.scrollY > 8);
    }, { passive: true });

    if (!sections.length || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var match = sections.find(function (s) { return s.el === entry.target; });
        if (!match) return;
        if (entry.isIntersecting) {
          links.forEach(function (l) { l.classList.remove("active"); });
          match.link.classList.add("active");
        }
      });
    }, { threshold: 0.3, rootMargin: "-20% 0px -60% 0px" });
    sections.forEach(function (s) { io.observe(s.el); });
  }

  /* ---------- methodology diagram stepper ---------- */
  function initStepper() {
    var root = document.getElementById("method-stepper");
    if (!root) return;

    var steps = JSON.parse(root.dataset.steps);
    var titles = JSON.parse(root.dataset.titles);
    var captions = JSON.parse(root.dataset.captions);
    // Optional: % of the image height occupied by the main (top) diagram band.
    // When set, the final step reveals the remaining band below it (e.g. an
    // "Inference" row) instead of just sweeping further right.
    var band = root.dataset.band ? parseFloat(root.dataset.band) : null;

    var frame = root.querySelector(".stepper-frame");
    var dotsWrap = document.getElementById("stepper-dots");
    var captionEl = document.getElementById("stepper-caption");
    var prevBtn = document.getElementById("stepper-prev");
    var nextBtn = document.getElementById("stepper-next");

    var current = 0;
    var autoplayTimer = null;
    var autoplayDelay = 3600;

    titles.forEach(function (title, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "stepper-dot";
      btn.innerHTML = "<b>Stage " + (i + 1) + "</b>" + title;
      btn.addEventListener("click", function () {
        stopAutoplay();
        setStep(i);
      });
      dotsWrap.appendChild(btn);
    });

    function setStep(i) {
      current = ((i % steps.length) + steps.length) % steps.length;
      var pct = steps[current];
      var isLast = current === steps.length - 1;
      frame.style.setProperty("--hide", (100 - pct) + "%");
      frame.style.setProperty("--edge", pct + "%");
      if (band !== null) {
        // Sweep left-to-right within the top band for every step except the
        // last, which also reveals the band below (e.g. Inference) in full.
        var bandPct = isLast ? 100 : band;
        var clip = "polygon(0% 0%, " + pct + "% 0%, " + pct + "% " + bandPct + "%, 0% " + bandPct + "%)";
        frame.style.setProperty("--clip", clip);
      }
      captionEl.textContent = captions[current];
      Array.prototype.forEach.call(dotsWrap.children, function (el, idx) {
        el.classList.toggle("active", idx === current);
      });
    }

    function startAutoplay() {
      if (reduceMotion || autoplayTimer) return;
      autoplayTimer = setInterval(function () { setStep(current + 1); }, autoplayDelay);
    }
    function stopAutoplay() {
      if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; }
    }

    prevBtn.addEventListener("click", function () { stopAutoplay(); setStep(current - 1); });
    nextBtn.addEventListener("click", function () { stopAutoplay(); setStep(current + 1); });

    setStep(0);

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) startAutoplay();
          else stopAutoplay();
        });
      }, { threshold: 0.4 });
      io.observe(root);
    } else {
      startAutoplay();
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initReveal();
    initCounters();
    initNav();
    initStepper();
  });
})();
