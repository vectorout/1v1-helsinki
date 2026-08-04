/* ============================================================
   1V1 HELSINKI — interactions & scroll animation
   GSAP 3 + ScrollTrigger + Lenis (all loaded via CDN)
   ============================================================ */

(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  /* ---------- nav background on scroll (always on) ---------- */
  var nav = document.querySelector(".nav");
  function onScroll() {
    nav.classList.toggle("is-scrolled", window.scrollY > 60);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- FAQ accordion (always on) ---------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var btn = item.querySelector(".faq-q");
    var panel = item.querySelector(".faq-a");
    btn.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function (other) {
        other.classList.remove("open");
        other.querySelector(".faq-q").setAttribute("aria-expanded", "false");
        other.querySelector(".faq-a").style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });

  /* ---------- booking form (always on) ---------- */
  // Swap for a real endpoint (e.g. https://formspree.io/f/xxxxxxx) before launch.
  var FORM_ENDPOINT = "https://formspree.io/f/REPLACE_ME";

  var form = document.querySelector(".book-form");
  var note = document.querySelector(".form-note");

  /* message strings come from data-msg-* attributes so translated pages
     (e.g. /fi/) localize them in markup; English is the fallback */
  var msgs = {
    unconnected: form.getAttribute("data-msg-unconnected") || "The form isn't connected yet — use the phone number or email next to the form and you'll get the same free session.",
    success: form.getAttribute("data-msg-success") || "Application received. You'll hear back within 48 hours to schedule your free session.",
    error: form.getAttribute("data-msg-error") || "Something went wrong — email or call instead, details next to the form.",
    sending: form.getAttribute("data-msg-sending") || "Sending…"
  };

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (FORM_ENDPOINT.indexOf("REPLACE_ME") !== -1) {
      note.textContent = msgs.unconnected;
      note.classList.add("show", "warn");
      return;
    }

    var btn = form.querySelector(".btn-submit");
    var btnLabel = btn.textContent;
    btn.disabled = true;
    btn.textContent = msgs.sending;

    fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(form)
    })
      .then(function (res) {
        if (!res.ok) throw new Error("send failed");
        form.reset();
        note.textContent = msgs.success;
        note.classList.remove("warn");
        note.classList.add("show");
      })
      .catch(function () {
        note.textContent = msgs.error;
        note.classList.add("show", "warn");
      })
      .finally(function () {
        btn.disabled = false;
        btn.textContent = btnLabel;
      });
  });

  /* ---------- TikTok lightbox (always on) ----------
     Tiles are plain links to TikTok; with JS we upgrade them to an
     in-page player. The TikTok iframe (and its trackers) loads ONLY
     after the visitor clicks a clip — fast page, EU-friendly. */
  var ttModal = document.querySelector(".tt-modal");
  if (ttModal) {
    var ttPlayer = ttModal.querySelector(".tt-player");
    var ttOpener = null;

    var ttClose = function () {
      ttModal.hidden = true;
      ttPlayer.innerHTML = "";
      document.documentElement.style.overflow = "";
      if (typeof lenis !== "undefined" && lenis) lenis.start();
      if (ttOpener) ttOpener.focus();
    };

    document.querySelectorAll(".tile-media[data-tiktok-id]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        ttOpener = a;
        var iframe = document.createElement("iframe");
        iframe.src = "https://www.tiktok.com/embed/v2/" + a.getAttribute("data-tiktok-id");
        iframe.allow = "autoplay; encrypted-media; fullscreen; picture-in-picture";
        iframe.setAttribute("allowfullscreen", "");
        var img = a.querySelector("img");
        iframe.title = img ? img.alt : "TikTok video";
        ttPlayer.innerHTML = "";
        ttPlayer.appendChild(iframe);
        ttModal.hidden = false;
        document.documentElement.style.overflow = "hidden";
        if (typeof lenis !== "undefined" && lenis) lenis.stop();
        ttModal.querySelector(".tt-close").focus();
      });
    });

    ttModal.querySelectorAll("[data-tt-close]").forEach(function (el) {
      el.addEventListener("click", ttClose);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !ttModal.hidden) ttClose();
    });
  }

  /* ---------- animation setup ---------- */
  if (!hasGsap || prefersReduced) {
    document.documentElement.classList.add("no-anim");
    return; // content stays fully visible; CSS-only motion still applies
  }

  gsap.registerPlugin(ScrollTrigger);

  /* smooth scroll */
  var lenis = null;
  if (typeof window.Lenis !== "undefined") {
    document.documentElement.classList.add("has-lenis");
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  /* anchor links through lenis */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(target, { offset: -60, duration: 1.4 });
      } else {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  /* hero intro */
  gsap.set(".line-inner", { yPercent: 135 });
  gsap.set("[data-fade]", { opacity: 0, y: 26 });

  gsap.timeline({ defaults: { ease: "power4.out" } })
    .to(".line-inner", { yPercent: 0, duration: 1.15, stagger: 0.14 }, 0.2)
    .to("[data-fade]", { opacity: 1, y: 0, duration: 0.85, stagger: 0.09 }, 0.75);

  /* hero parallax */
  gsap.to(".hero-pitch", {
    yPercent: 22,
    rotate: -8,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
  });
  gsap.to(".hero-inner", {
    yPercent: -8,
    opacity: 0.25,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 25%", scrub: true }
  });

  /* generic reveals */
  document.querySelectorAll("[data-reveal]").forEach(function (el) {
    gsap.from(el, {
      opacity: 0,
      y: 44,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 86%" }
    });
  });

  /* method — pinned horizontal scroll on desktop, simple reveals on mobile */
  var track = document.querySelector(".method-track");
  var mm = gsap.matchMedia();

  mm.add("(min-width: 900px)", function () {
    function distance() {
      return track.scrollWidth - window.innerWidth;
    }
    gsap.to(track, {
      x: function () { return -distance(); },
      ease: "none",
      scrollTrigger: {
        trigger: ".method-pin",
        start: "top top",
        end: function () { return "+=" + distance(); },
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    /* panel numbers drift slower than the track for depth */
    document.querySelectorAll(".panel-num").forEach(function (num) {
      gsap.to(num, {
        xPercent: -18,
        ease: "none",
        scrollTrigger: {
          trigger: ".method-pin",
          start: "top top",
          end: function () { return "+=" + distance(); },
          scrub: 1
        }
      });
    });
  });

  mm.add("(max-width: 899px)", function () {
    document.querySelectorAll(".method-panel").forEach(function (panel) {
      var body = panel.querySelector(".panel-body");
      var num = panel.querySelector(".panel-num");

      gsap.from(body.children, {
        opacity: 0,
        y: 36,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: panel, start: "top 78%" }
      });

      /* the giant outlined number drifts sideways as the panel passes — the
         mobile stand-in for the desktop horizontal pin */
      gsap.fromTo(num, { xPercent: 14 }, {
        xPercent: -14,
        ease: "none",
        scrollTrigger: { trigger: panel, start: "top bottom", end: "bottom top", scrub: true }
      });
    });
  });

  /* proof tiles — clip-mask cascade in, plus a scrubbed column drift on desktop */
  var tiles = gsap.utils.toArray(".tile");
  if (tiles.length) {
    gsap.set(tiles, { clipPath: "inset(14% 10% 14% 10%)", opacity: 0, scale: 0.96 });
    ScrollTrigger.batch(tiles, {
      start: "top 88%",
      onEnter: function (batch) {
        gsap.to(batch, {
          clipPath: "inset(0% 0% 0% 0%)",
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "power3.out",
          stagger: 0.12
        });
      }
    });

    mm.add("(min-width: 1000px)", function () {
      tiles.forEach(function (tile, i) {
        var dir = i % 3 === 1 ? 1 : -1;
        gsap.fromTo(tile, { y: dir * 26 }, {
          y: dir * -26,
          ease: "none",
          scrollTrigger: { trigger: ".proof-grid", start: "top bottom", end: "bottom top", scrub: true }
        });
      });
    });
  }

  /* stat counters */
  document.querySelectorAll(".stat-num").forEach(function (el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var state = { v: 0 };
    gsap.to(state, {
      v: target,
      duration: 1.8,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
      onUpdate: function () {
        el.textContent = Math.round(state.v);
      }
    });
  });

  /* statement — word-by-word scrub */
  var statement = document.querySelector(".statement-text");
  if (statement) {
    var words = statement.textContent.trim().split(/\s+/);
    statement.innerHTML = words
      .map(function (w) { return '<span class="w">' + w + "</span>"; })
      .join(" ");
    gsap.fromTo(
      statement.querySelectorAll(".w"),
      { opacity: 0.13 },
      {
        opacity: 1,
        stagger: 0.05,
        ease: "none",
        scrollTrigger: { trigger: statement, start: "top 76%", end: "bottom 48%", scrub: true }
      }
    );
  }

  /* coach media parallax */
  var coachPh = document.querySelector(".coach-ph");
  if (coachPh) {
    gsap.fromTo(
      coachPh,
      { yPercent: -6 },
      {
        yPercent: 6,
        ease: "none",
        scrollTrigger: { trigger: ".coach-media", start: "top bottom", end: "bottom top", scrub: true }
      }
    );
  }
})();
