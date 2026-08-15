import { 
  auth, 
  db, 
  isFirebaseConfigured, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy,
  serverTimestamp 
} from "./firebase-config.js";

$(document).ready(function () {
  // Initialize Lenis smooth scroll safely if library is present
  let lenis = null;
  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({
      duration: 0.9,
      lerp: 0.1,
      easing: (t) =>
        t < 0.5
          ? 8 * t * t * t * t
          : 1 - Math.pow(-2 * t + 2, 4) / 2,
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      infinite: false,
    });

    function raf(time) {
      if (lenis) lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    lenis.on("scroll", ({ scroll }) => {
      if (scroll > 20) {
        document.querySelector(".navbar")?.classList.add("sticky");
      } else {
        document.querySelector(".navbar")?.classList.remove("sticky");
      }
      if (scroll > 500) {
        document.querySelector(".scroll-up-btn")?.classList.add("show");
      } else {
        document.querySelector(".scroll-up-btn")?.classList.remove("show");
      }
    });
  } else {
    // Fallback scroll listener if Lenis is absent
    $(window).on("scroll", function () {
      const scroll = $(window).scrollTop();
      if (scroll > 20) {
        $(".navbar").addClass("sticky");
      } else {
        $(".navbar").removeClass("sticky");
      }
      if (scroll > 500) {
        $(".scroll-up-btn").addClass("show");
      } else {
        $(".scroll-up-btn").removeClass("show");
      }
    });
  }

  // Unified smooth scroll helper with Lenis or native smooth fallback
  function scrollToTarget(target, offset = -70) {
    if (typeof target === "number") {
      if (lenis) {
        lenis.scrollTo(target);
      } else {
        window.scrollTo({ top: target, behavior: "smooth" });
      }
      return;
    }
    const $target = $(target);
    if ($target.length) {
      if (lenis) {
        lenis.scrollTo($target[0], { offset });
      } else {
        const topPos = $target.offset().top + offset;
        window.scrollTo({ top: Math.max(0, topPos), behavior: "smooth" });
      }
    }
  }

  /* ============================================================
     Interactive Particle Canvas & Cursor Glow Spotlight
     ============================================================ */
  // 1. Mouse Spotlight & Dot Lerp Follower
  const spotEl = document.getElementById("spot");
  const dotEl = document.getElementById("dot");
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let spotX = mouseX;
  let spotY = mouseY;
  let dotX = mouseX;
  let dotY = mouseY;

  $(window).on("mousemove", function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Hide dot and spotlight when mouse hovers over profile photos
  $(document).on("mouseenter", ".about .left img, .photo-wrap, .photo-mask, .column.left img", function () {
    if (spotEl) spotEl.style.opacity = "0";
    if (dotEl) dotEl.style.opacity = "0";
  });
  $(document).on("mouseleave", ".about .left img, .photo-wrap, .photo-mask, .column.left img", function () {
    if (spotEl) spotEl.style.opacity = "1";
    if (dotEl) dotEl.style.opacity = "1";
  });

  function animateCursorFollower() {
    // Only animate if spotlight element is rendered and visible
    if (window.innerWidth > 991 && spotEl && getComputedStyle(spotEl).display !== "none") {
      spotX += (mouseX - spotX) * 0.12;
      spotY += (mouseY - spotY) * 0.12;
      dotX += (mouseX - dotX) * 0.3;
      dotY += (mouseY - dotY) * 0.3;

      spotEl.style.left = spotX + "px";
      spotEl.style.top = spotY + "px";
      if (dotEl) {
        dotEl.style.left = dotX + "px";
        dotEl.style.top = dotY + "px";
      }
    }
    requestAnimationFrame(animateCursorFollower);
  }
  requestAnimationFrame(animateCursorFollower);

  // 2. Interactive Background Particle Canvas Engine
  const canvas = document.getElementById("heroCanvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener("resize", () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const isMobile = window.innerWidth <= 768;
    const numParticles = isMobile ? 22 : Math.min(Math.floor(window.innerWidth / 20), 65);
    const particles = [];
    const colors = [
      "rgba(56, 189, 248, 0.7)",  // Cyan
      "rgba(236, 72, 153, 0.6)",  // Pink
      "rgba(168, 85, 247, 0.6)",  // Purple
      "rgba(255, 0, 127, 0.5)",   // Magenta
    ];

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Cache photo element bounding boxes on resize/load (NOT on scroll)
    let photoRects = [];
    function updatePhotoRects() {
      photoRects = [];
      document.querySelectorAll(".about .left img, .photo-wrap, .photo-mask, .column.left img").forEach(img => {
        const r = img.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          photoRects.push({
            left: r.left - 30,
            right: r.right + 30,
            top: r.top - 30,
            bottom: r.bottom + 30
          });
        }
      });
    }
    updatePhotoRects();
    window.addEventListener("resize", updatePhotoRects, { passive: true });
    window.addEventListener("load", updatePhotoRects, { passive: true });

    function isPointOverPhoto(x, y) {
      for (let k = 0; k < photoRects.length; k++) {
        let r = photoRects[k];
        if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
          return true;
        }
      }
      return false;
    }

    function drawParticles() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        if (isPointOverPhoto(p.x, p.y)) continue;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          let p2 = particles[j];
          if (isPointOverPhoto(p2.x, p2.y)) continue;

          let dx = p.x - p2.x;
          let dy = p.y - p2.y;
          let dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${0.15 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        if (window.innerWidth > 991) {
          let mdx = p.x - mouseX;
          let mdy = p.y - mouseY;
          let mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 130 && !isPointOverPhoto(mouseX, mouseY)) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouseX, mouseY);
            ctx.strokeStyle = `rgba(236, 72, 153, ${0.25 * (1 - mdist / 130)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(drawParticles);
    }
    requestAnimationFrame(drawParticles);
  }

  /* ============================================================
     3D Card Tilt & Dynamic Spotlight Tracker Engine
     ============================================================ */
  $(document).on("mousemove", ".project-card, .skills-category-card, .about-pillar, .serv-content .card", function (e) {
    if (window.innerWidth <= 991) return; // Disable heavy 3D tilt on mobile/tablet
    const card = this;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = -((y - centerY) / centerY) * 7.5;
    const rotateY = ((x - centerX) / centerX) * 7.5;

    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
    card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(8px)`;
  });

  $(document).on("mouseleave", ".project-card, .skills-category-card, .about-pillar, .serv-content .card", function () {
    this.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
  });

  // Theme toggle functionality
  const $themeToggle = $("#themeToggle");
  const $themeIcon = $themeToggle.find("i");

  function updateThemeIcon(theme) {
    if (theme === "dark") {
      $themeIcon.removeClass("fa-moon").addClass("fa-sun");
    } else {
      $themeIcon.removeClass("fa-sun").addClass("fa-moon");
    }
  }

  // Set initial icon state
  const currentTheme =
    document.documentElement.getAttribute("data-theme") || "dark";
  updateThemeIcon(currentTheme);

  // Helper to recalculate contributions and streaks from rendered DOM cells
  function recalculateGitHubStreaks() {
    const cells = document.querySelectorAll(
      "#github-calendar rect[data-date], #github-calendar td[data-date]",
    );
    if (cells.length === 0) return;

    let total = 0;
    let longestStreak = 0;
    let currentStreak = 0;
    let tempStreak = 0;

    // Sort cells by date ascending
    const sortedCells = Array.from(cells).sort((a, b) => {
      return (
        new Date(a.getAttribute("data-date")) -
        new Date(b.getAttribute("data-date"))
      );
    });

    sortedCells.forEach((cell) => {
      let count = parseInt(cell.getAttribute("data-count") || "0", 10);

      // Fallback: use data-level if data-count is not set
      if (!cell.hasAttribute("data-count") && cell.hasAttribute("data-level")) {
        const level = parseInt(cell.getAttribute("data-level") || "0", 10);
        count = level > 0 ? level : 0;
      }

      total += count;

      if (count > 0) {
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
    });

    // Calculate current streak (look backwards from latest date)
    let currentStreakTemp = 0;
    const localTodayStr = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD local format
    const utcTodayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD UTC format

    let checkIndex = sortedCells.length - 1;
    while (checkIndex >= 0) {
      const cell = sortedCells[checkIndex];
      const dateStr = cell.getAttribute("data-date");
      let count = parseInt(cell.getAttribute("data-count") || "0", 10);

      if (!cell.hasAttribute("data-count") && cell.hasAttribute("data-level")) {
        const level = parseInt(cell.getAttribute("data-level") || "0", 10);
        count = level > 0 ? level : 0;
      }

      if (count > 0) {
        currentStreakTemp++;
      } else {
        // If it's today and count is 0, don't break the streak yet (user might commit later)
        if (dateStr === localTodayStr || dateStr === utcTodayStr) {
          checkIndex--;
          continue;
        }
        break; // Streak broken
      }
      checkIndex--;
    }
    currentStreak = currentStreakTemp;

    // Update DOM
    const $numbers = $("#github-calendar .contrib-number");
    if ($numbers.length >= 3) {
      $numbers
        .eq(0)
        .html(
          `${total.toLocaleString()} <span style="font-size: 14px; font-weight: 500; color: var(--text-sec);">total</span>`,
        );
      $numbers
        .eq(1)
        .html(
          `${longestStreak} <span style="font-size: 14px; font-weight: 500; color: var(--text-sec);">days</span>`,
        );
      $numbers
        .eq(2)
        .html(
          `${currentStreak} <span style="font-size: 14px; font-weight: 500; color: var(--text-sec);">days</span>`,
        );
    }
  }

  function handleCalendarError(error) {
    console.error("Error loading GitHub Calendar:", error);
    $("#github-calendar").html(
      `<div class="calendar-loading" style="color: #ef4444;">
        <i class="fas fa-exclamation-triangle"></i> Failed to load GitHub activity stats. Please try reloading.
      </div>`,
    );
  }

  // Poll to ensure stats are updated even if rendering delays
  function pollCalendarLoaded() {
    let attempts = 0;
    const interval = setInterval(() => {
      const cells = document.querySelectorAll(
        "#github-calendar rect[data-date], #github-calendar td[data-date]",
      );
      if (cells.length > 0) {
        clearInterval(interval);
        recalculateGitHubStreaks();
      } else {
        attempts++;
        if (attempts > 50) {
          // Timeout after 10s
          clearInterval(interval);
        }
      }
    }, 200);
  }

  // Initialize GitHub Calendar Widget
  try {
    const calendarPromise = GitHubCalendar(
      "#github-calendar",
      "hossainahammed",
      {
        responsive: true,
        tooltips: true,
      },
    );

    if (calendarPromise && typeof calendarPromise.then === "function") {
      calendarPromise.then(recalculateGitHubStreaks).catch(handleCalendarError);
    } else {
      pollCalendarLoaded();
    }
  } catch (error) {
    handleCalendarError(error);
  }

  // Toggle button click listener with premium fade-cross view transition
  $themeToggle.on("click", function (e) {
    const current = document.documentElement.getAttribute("data-theme");
    const nextTheme = current === "dark" ? "light" : "dark";

    // Check for CSS View Transitions API support
    if (!document.startViewTransition) {
      // Fallback for older browsers
      $("html").addClass("theme-in-transition");
      document.documentElement.setAttribute("data-theme", nextTheme);
      localStorage.setItem("theme", nextTheme);
      updateThemeIcon(nextTheme);
      setTimeout(function () {
        $("html").removeClass("theme-in-transition");
      }, 500);
      return;
    }

    document.startViewTransition(() => {
      document.documentElement.setAttribute("data-theme", nextTheme);
      localStorage.setItem("theme", nextTheme);
      updateThemeIcon(nextTheme);
    });
  });

  // Handle system theme updates if the user has not pinned their preference
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", function (e) {
      if (!localStorage.getItem("theme")) {
        const systemTheme = e.matches ? "dark" : "light";

        // If view transitions are supported, do a simple fade or ripple
        if (document.startViewTransition) {
          document.startViewTransition(() => {
            document.documentElement.setAttribute("data-theme", systemTheme);
            updateThemeIcon(systemTheme);
          });
        } else {
          $("html").addClass("theme-in-transition");
          document.documentElement.setAttribute("data-theme", systemTheme);
          updateThemeIcon(systemTheme);
          setTimeout(function () {
            $("html").removeClass("theme-in-transition");
          }, 500);
        }
      }
    });

  // (sticky navbar & scroll-up button are handled inside lenis.on("scroll") above)

  // Slide-up scroll to top
  $(".scroll-up-btn").click(function () {
    scrollToTarget(0);
  });

  // Nav menu link smooth scroll & mobile drawer close
  $(".navbar .menu li a").click(function (e) {
    e.preventDefault();
    const targetId = $(this).attr("href");
    if (targetId) {
      scrollToTarget(targetId, -70);
    }
    // Close mobile menu drawer
    $(".navbar .menu").removeClass("active");
    $("#menuToggle i, .menu-toggle-btn i").removeClass("active");
  });

  // Logo smooth scroll to top & close mobile drawer
  $(".navbar .logo a").click(function (e) {
    e.preventDefault();
    scrollToTarget(0);
    $(".navbar .menu").removeClass("active");
    $("#menuToggle i, .menu-toggle-btn i").removeClass("active");
  });

  // Toggle mobile navbar drawer (specifically targeting hamburger toggle button)
  $("#menuToggle, .menu-toggle-btn").on("click", function (e) {
    e.stopPropagation();
    $(".navbar .menu").toggleClass("active");
    $("#menuToggle i, .menu-toggle-btn i").toggleClass("active");
  });

  // Close mobile drawer if clicked outside
  $(document).on("click touchstart", function (e) {
    if (!$(e.target).closest(".navbar").length && $(".navbar .menu").hasClass("active")) {
      $(".navbar .menu").removeClass("active");
      $("#menuToggle i, .menu-toggle-btn i").removeClass("active");
    }
  });

  // Hire me button: smooth scroll to contact and focus name field
  $(".hire-btn").on("click", function (e) {
    e.preventDefault();
    const target = $("#contact");
    if (target.length) {
      scrollToTarget(target[0], -60);
      setTimeout(function () {
        const $name = $("#contact-name");
        if ($name.length) {
          $name.focus();
        }
      }, 400);
    }
    // Close mobile menu if open
    $(".navbar .menu").removeClass("active");
    $("#menuToggle i, .menu-toggle-btn i").removeClass("active");
  });

  // Download CV button: try HEAD fetch, otherwise attempt open and show helpful message
  $(".download-cv").on("click", function (e) {
    e.preventDefault();
    var href = $(this).attr("href");
    if (!href) return;

    // Try a HEAD request to see if the file exists (may fail on file:// or some servers)
    fetch(href, { method: "HEAD", cache: "no-store" })
      .then(function (resp) {
        if (resp.ok) {
          // file exists, trigger download/open
          window.location.href = href;
        } else {
          alert(
            'CV file not found at "' +
              href +
              '".\nPlease place your CV at that path or update the link in index.html.',
          );
        }
      })
      .catch(function () {
        // fetch failed (local file or CORS). Attempt to open anyway — browser will handle or show error.
        window.location.href = href;
        setTimeout(function () {
          // show non-blocking notice in contact status area
          var msg =
            'If the CV did not download, add your CV to "' +
            href +
            '" or update the link.';
          if ($("#contact-status").length) {
            $("#contact-status")
              .text(msg)
              .css("color", "var(--primary-color)")
              .fadeIn(120);
            setTimeout(function () {
              $("#contact-status").fadeOut(3000);
            }, 4000);
          } else {
            alert(msg);
          }
        }, 600);
      });
  });

  // typing text animation script
  var typed = new Typed(".typing", {
    strings: [
      " Flutter Developer",
      " SaaS Product Builder",
      " Software Engineer",
    ],
    typeSpeed: 100,
    backSpeed: 60,
    loop: true,
  });

  var typed = new Typed(".typing-2", {
    strings: [
      " Flutter Developer",
      " SaaS Product Builder",
      " Software Engineer",
    ],
    typeSpeed: 100,
    backSpeed: 60,
    loop: true,
  });

  // owl carousel script
  $(".carousel").owlCarousel({
    margin: 20,
    loop: true,
    autoplay: true,
    autoplayTimeOut: 2000,
    autoplayHoverPause: true,
    responsive: {
      0: {
        items: 1,
        nav: false,
      },
      600: {
        items: 2,
        nav: false,
      },
      1000: {
        items: 3,
        nav: false,
      },
    },
  });

  /* ── Flutter App Showcase (visible on-page phone carousel) ── */

  (function initFlutterShowcase() {
    var $showcase = $("#flutterShowcase");
    var folder = (
      $showcase.attr("data-image-folder") || "images/Upcoming_APP/"
    ).trim();
    var imagesAttr = ($showcase.attr("data-images") || "").trim();
    var label = "Upcoming App";
    var showcaseTimer = null;

    // Parallel probe of images to avoid sequential blocking
    function probeFolderParallel(folder, max, cb) {
      var imgs = [];
      var completed = 0;
      var results = [];

      for (var i = 1; i <= max; i++) {
        (function (idx) {
          var src = folder + idx + ".png";
          var img = new Image();
          img.onload = function () {
            results[idx] = { success: true, src: src };
            checkDone();
          };
          img.onerror = function () {
            results[idx] = { success: false };
            checkDone();
          };
          img.src = src;
        })(i);
      }

      function checkDone() {
        completed++;
        if (completed === max) {
          // Collect continuous sequence starting from 1
          for (var idx = 1; idx <= max; idx++) {
            if (results[idx] && results[idx].success) {
              imgs.push(results[idx].src);
            } else {
              break; // Stop at first missing image
            }
          }
          cb(imgs);
        }
      }
    }

    if (imagesAttr) {
      var imgs = imagesAttr.split(",").map(function (src) {
        return folder + src.trim();
      });
      buildShowcase($showcase, imgs, label, null);
    } else {
      probeFolderParallel(folder, 20, function (imgs) {
        if (!imgs.length) {
          $showcase.hide(); // no images in the folder
          return;
        }
        buildShowcase($showcase, imgs, label, null);
      });
    }

    function buildShowcase($el, imgs, label, cardId) {
      var cur = 0;
      var total = imgs.length;

      // ── DOM ──────────────────────────────────────────────
      $el.empty();

      var $inner = $('<div class="showcase-inner"></div>');

      // App label + counter
      var $header = $(
        '<div class="showcase-header">' +
          '<span class="showcase-app-label"><i class="fab fa-flutter showcase-flutter-icon"></i> ' +
          label +
          "</span>" +
          '<span class="showcase-counter"><span class="sc-cur">1</span> / <span class="sc-tot">' +
          total +
          "</span></span>" +
          "</div>",
      );

      // Phone strip
      var $strip = $('<div class="showcase-strip"></div>');

      // Build N phone frames (all images)
      imgs.forEach(function (src, i) {
        var $phone = $(
          '<div class="sc-phone' +
            (i === 0 ? " sc-active" : "") +
            '">' +
            '<div class="sc-phone-notch"></div>' +
            '<div class="sc-phone-screen"><img src="' +
            src +
            '" alt="Screenshot ' +
            (i + 1) +
            '" loading="lazy"/></div>' +
            '<div class="sc-phone-bar"></div>' +
            "</div>",
        );
        $phone.on("click", function () {
          scGoTo(i);
          scRestart();
        });
        $strip.append($phone);
      });

      // Arrows
      var $prev = $(
        '<button class="sc-arrow sc-arrow-prev" aria-label="Previous"><i class="fas fa-chevron-left"></i></button>',
      );
      var $next = $(
        '<button class="sc-arrow sc-arrow-next" aria-label="Next"><i class="fas fa-chevron-right"></i></button>',
      );

      $prev.on("click", function () {
        scGoTo(cur - 1);
        scRestart();
      });
      $next.on("click", function () {
        scGoTo(cur + 1);
        scRestart();
      });

      // Dots
      var $dots = $('<div class="sc-dots"></div>');
      imgs.forEach(function (_, i) {
        var $dot = $(
          '<button class="sc-dot' +
            (i === 0 ? " sc-dot-active" : "") +
            '"></button>',
        );
        $dot.on("click", function () {
          scGoTo(i);
          scRestart();
        });
        $dots.append($dot);
      });

      // "View all" hint
      var $hint = $(
        '<div class="showcase-hint"><i class="fas fa-expand-arrows-alt"></i> Click any project card for fullscreen view</div>',
      );

      $inner.append($header, $strip, $prev, $next, $dots, $hint);
      $el.append($inner);

      // ── Logic ─────────────────────────────────────────────
      function scGoTo(idx) {
        cur = ((idx % total) + total) % total;
        $strip.find(".sc-phone").removeClass("sc-active sc-prev sc-next");
        var $phones = $strip.find(".sc-phone");
        $phones.eq(cur).addClass("sc-active");
        $phones.eq((cur - 1 + total) % total).addClass("sc-prev");
        $phones.eq((cur + 1) % total).addClass("sc-next");
        $dots
          .find(".sc-dot")
          .removeClass("sc-dot-active")
          .eq(cur)
          .addClass("sc-dot-active");
        $header.find(".sc-cur").text(cur + 1);
      }

      function scRestart() {
        clearInterval(showcaseTimer);
        showcaseTimer = setInterval(function () {
          scGoTo(cur + 1);
        }, 3500);
      }

      // Init positions
      scGoTo(0);
      scRestart();
    }
  })();

  /* ── Flutter Feature Slider (custom — no OWL dependency) ── */

  var _sliderTimer = null; // global auto-play timer reference

  function stopSlider() {
    if (_sliderTimer) {
      clearInterval(_sliderTimer);
      _sliderTimer = null;
    }
  }

  function startSlider($slider, total) {
    stopSlider();
    _sliderTimer = setInterval(function () {
      var cur = parseInt($slider.data("current") || 0);
      sliderGoTo($slider, (cur + 1) % total);
    }, 3500);
  }

  function sliderGoTo($slider, index) {
    var $slides = $slider.find(".fslide");
    var $dots = $slider.find(".fdot");
    var total = $slides.length;

    index = ((index % total) + total) % total; // wrap safely
    $slides.removeClass("active");
    $dots.removeClass("active");
    $slides.eq(index).addClass("active");
    $dots.eq(index).addClass("active");
    $slider.data("current", index);
  }

  function buildSlider(images) {
    var $slider = $('<div class="flutter-slider"></div>').data("current", 0);

    // Slides
    images.forEach(function (src, i) {
      var $slide = $(
        '<div class="fslide' + (i === 0 ? " active" : "") + '"></div>',
      );
      $slide.append(
        $(
          '<img class="fslide-img" alt="Screenshot ' +
            (i + 1) +
            '" loading="lazy"/>',
        ).attr("src", src),
      );
      $slider.append($slide);
    });

    // Prev / Next buttons
    var $prev = $(
      '<button class="fslider-btn fslider-prev" aria-label="Previous"><i class="fas fa-chevron-left"></i></button>',
    );
    var $next = $(
      '<button class="fslider-btn fslider-next" aria-label="Next"><i class="fas fa-chevron-right"></i></button>',
    );

    $prev.on("click", function (e) {
      e.stopPropagation();
      var cur = parseInt($slider.data("current") || 0);
      sliderGoTo($slider, cur - 1);
      startSlider($slider, images.length);
    });
    $next.on("click", function (e) {
      e.stopPropagation();
      var cur = parseInt($slider.data("current") || 0);
      sliderGoTo($slider, cur + 1);
      startSlider($slider, images.length);
    });

    // Dot indicators
    var $dots = $('<div class="fslider-dots"></div>');
    images.forEach(function (_, i) {
      var $dot = $(
        '<button class="fdot' +
          (i === 0 ? " active" : "") +
          '" aria-label="Slide ' +
          (i + 1) +
          '"></button>',
      );
      $dot.on("click", function (e) {
        e.stopPropagation();
        sliderGoTo($slider, i);
        startSlider($slider, images.length);
      });
      $dots.append($dot);
    });

    // Counter badge  e.g. "1 / 4"
    var $counter = $(
      '<div class="fslider-counter"><span class="fslider-cur">1</span> / <span class="fslider-total">' +
        images.length +
        "</span></div>",
    );

    // Keep counter in sync
    var _origGoTo = sliderGoTo;
    $slider.on("fslider:goto", function (e, idx) {
      $counter.find(".fslider-cur").text(idx + 1);
    });

    $slider.append($prev, $next, $dots, $counter);

    // Patch sliderGoTo to also fire the counter event
    $slider.data("goTo", function (idx) {
      sliderGoTo($slider, idx);
      $slider.trigger("fslider:goto", [parseInt($slider.data("current"))]);
    });

    return $slider;
  }

  /* Probe images from a folder (1.png, 2.png …) in parallel then open the modal */
  function probeAndOpenCarousel($card, folder, fallbackSrc) {
    var max = 20;
    var results = [];
    var completed = 0;

    for (var i = 1; i <= max; i++) {
      (function (idx) {
        var src = folder + idx + ".png";
        var img = new Image();
        img.onload = function () {
          results[idx] = { success: true, src: src };
          onFinish();
        };
        img.onerror = function () {
          if (idx === 1) {
            // Try .jpg as first-image fallback
            var srcJpg = folder + "1.jpg";
            var j = new Image();
            j.onload = function () {
              results[idx] = { success: true, src: srcJpg };
              onFinish();
            };
            j.onerror = function () {
              results[idx] = { success: false };
              onFinish();
            };
            j.src = srcJpg;
          } else {
            results[idx] = { success: false };
            onFinish();
          }
        };
        img.src = src;
      })(i);
    }

    function onFinish() {
      completed++;
      if (completed === max) {
        var images = [];
        for (var idx = 1; idx <= max; idx++) {
          if (results[idx] && results[idx].success) {
            images.push(results[idx].src);
          } else {
            break; // Stop at first missing image
          }
        }
        showSliderModal(
          $card,
          images.length ? images : fallbackSrc ? [fallbackSrc] : [],
        );
      }
    }
  }

  function openFlutterCarouselModal($card) {
    var folder = ($card.attr("data-image-folder") || "").trim();
    var fallback = $card.find(".project-img-wrapper img").attr("src") || "";
    var imagesAttr = ($card.attr("data-images") || "").trim();

    if (imagesAttr) {
      var images = imagesAttr.split(",").map(function (src) {
        src = src.trim();
        if (/^https?:\/\//i.test(src) || src.startsWith("/")) {
          return src;
        }
        return folder + src;
      });
      showSliderModal($card, images);
    } else if (folder) {
      probeAndOpenCarousel($card, folder, fallback);
    } else {
      showSliderModal($card, fallback ? [fallback] : []);
    }
  }

  /* ── Phone Mockup Carousel (used in both on-page showcase AND modal) ── */
  function buildPhoneCarousel(images) {
    var cur = 0;
    var total = images.length;
    var autoTimer = null;

    var $wrap = $('<div class="mpc-wrap"></div>');
    var $strip = $('<div class="mpc-strip"></div>');

    // Build all phone frames
    images.forEach(function (src, i) {
      var $phone = $(
        '<div class="sc-phone' +
          (i === 0 ? " sc-active" : "") +
          '">' +
          '<div class="sc-phone-notch"></div>' +
          '<div class="sc-phone-screen"><img src="' +
          src +
          '" alt="Screen ' +
          (i + 1) +
          '" loading="lazy"/></div>' +
          '<div class="sc-phone-bar"></div>' +
          "</div>",
      );
      $phone.on("click", function () {
        pcGoTo(i);
        pcRestart();
      });
      $strip.append($phone);
    });

    // Arrows
    var $prev = $(
      '<button class="sc-arrow sc-arrow-prev" aria-label="Previous"><i class="fas fa-chevron-left"></i></button>',
    );
    var $next = $(
      '<button class="sc-arrow sc-arrow-next" aria-label="Next"><i class="fas fa-chevron-right"></i></button>',
    );
    $prev.on("click", function (e) {
      e.stopPropagation();
      pcGoTo(cur - 1);
      pcRestart();
    });
    $next.on("click", function (e) {
      e.stopPropagation();
      pcGoTo(cur + 1);
      pcRestart();
    });

    // Dots
    var $dots = $('<div class="sc-dots mpc-dots"></div>');
    images.forEach(function (_, i) {
      var $dot = $(
        '<button class="sc-dot' +
          (i === 0 ? " sc-dot-active" : "") +
          '" aria-label="Slide ' +
          (i + 1) +
          '"></button>',
      );
      $dot.on("click", function (e) {
        e.stopPropagation();
        pcGoTo(i);
        pcRestart();
      });
      $dots.append($dot);
    });

    // Counter  "1 / 4"
    var $counter = $(
      '<div class="fslider-counter"><span class="pc-cur">1</span> / <span>' +
        total +
        "</span></div>",
    );

    $wrap.append($strip, $prev, $next, $dots, $counter);

    function pcGoTo(idx) {
      cur = ((idx % total) + total) % total;
      var $phones = $strip.find(".sc-phone");
      $phones.removeClass("sc-active sc-prev sc-next");
      $phones.eq(cur).addClass("sc-active");
      $phones.eq((cur - 1 + total) % total).addClass("sc-prev");
      $phones.eq((cur + 1) % total).addClass("sc-next");
      $dots
        .find(".sc-dot")
        .removeClass("sc-dot-active")
        .eq(cur)
        .addClass("sc-dot-active");
      $counter.find(".pc-cur").text(cur + 1);
    }

    function pcRestart() {
      clearInterval(autoTimer);
      autoTimer = setInterval(function () {
        pcGoTo(cur + 1);
      }, 3500);
    }

    // Store destroy hook so close handler can clear the timer
    $wrap.data("destroy", function () {
      clearInterval(autoTimer);
    });

    pcGoTo(0);
    pcRestart();

    return $wrap;
  }

  function showSliderModal($card, images) {
    var title = $card.attr("data-title") || "";
    stopSlider();

    // Destroy any previous phone carousel timer
    var $prevWrap = $("#liveModalImageContainer .mpc-wrap");
    if ($prevWrap.length && $prevWrap.data("destroy"))
      $prevWrap.data("destroy")();

    $("#liveModalTitle").text(title + " — Feature Screens");
    $("#liveModalIframe").hide().attr("src", "");

    var $container = $("#liveModalImageContainer");
    $container.empty().css("display", "block");

    if (!images.length) {
      $container
        .css("display", "flex")
        .append(
          '<p style="color:var(--text-sec);padding:40px;text-align:center;line-height:1.8;">' +
            '<i class="fas fa-images" style="font-size:42px;display:block;margin-bottom:12px;opacity:.5;"></i>' +
            "No screenshots yet.<br>" +
            '<code style="font-size:12px;">' +
            ($card.attr("data-image-folder") || "images/ProjectName/") +
            '1.png</code>, <code style="font-size:12px;">2.png</code>…</p>',
        );
      $("#liveViewModal").attr("aria-hidden", "false").fadeIn(200);
      $("body").addClass("modal-open");
      return;
    }

    if (images.length === 1) {
      // Single image: show centered with phone frame
      $container
        .css("display", "flex")
        .append(
          $('<img id="liveModalImage" alt="Project Screenshot"/>').attr(
            "src",
            images[0],
          ),
        );
      $("#liveViewModal").attr("aria-hidden", "false").fadeIn(200);
      $("body").addClass("modal-open");
      return;
    }

    // Multiple images → phone mockup carousel (same style as on-page showcase)
    var $carousel = buildPhoneCarousel(images);
    $container.append($carousel);

    $("#liveViewModal").attr("aria-hidden", "false").fadeIn(200);
    $("body").addClass("modal-open");
  }

  /* Projects: card click — Flutter shows phone carousel, web shows iframe */
  $(".project-card").on("click", function () {
    var $card = $(this);
    var url = ($card.attr("data-liveurl") || "").trim();
    var title = $card.attr("data-title") || "";
    var isFlutter =
      ($card.attr("data-id") || "").startsWith("flutter") ||
      $card.find(".tech-pill").filter(function () {
        return $(this).text().trim().toLowerCase() === "flutter";
      }).length > 0;

    if (isFlutter) {
      openFlutterCarouselModal($card);
    } else {
      if (url) {
        if (!/^https?:\/\//i.test(url)) url = "https://" + url;
        $("#liveModalTitle").text(title);
        $("#liveModalIframe").attr("src", url).show();
        $("#liveModalImageContainer").hide();
        $("#liveViewModal").attr("aria-hidden", "false").fadeIn(180);
        $("body").addClass("modal-open");
      } else {
        alert(
          "No live link set for this project yet. Add a `data-liveurl` attribute to enable it.",
        );
      }
    }
  });

  /* Appetize live preview */
  $(".project-card .appetize-btn").on("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    var $card = $(this).closest(".project-card");
    var url = ($card.attr("data-appetizeurl") || "").trim();
    var btnText = $(this).text().trim() || "Live Preview";
    var title = $card.attr("data-title") + " - " + btnText;
    if (url && url !== "#") {
      $("#liveModalTitle").text(title);
      $("#liveModalIframe").attr("src", url).show();
      $("#liveModalImageContainer").hide();
      $("#liveViewModal").attr("aria-hidden", "false").fadeIn(180);
      $("body").addClass("modal-open");
    } else {
      alert(btnText + " link not provided yet.");
    }
  });

  /* Live button: Flutter → phone carousel; Web → iframe */
  $(".project-card .live-btn").on("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    var $card = $(this).closest(".project-card");
    var isFlutter =
      ($card.attr("data-id") || "").startsWith("flutter") ||
      $card.find(".tech-pill").filter(function () {
        return $(this).text().trim().toLowerCase() === "flutter";
      }).length > 0;

    if (isFlutter) {
      openFlutterCarouselModal($card);
    } else {
      var url = ($card.attr("data-videourl") || "").trim();
      if (!url || url === "#") url = ($card.attr("data-liveurl") || "").trim();
      var title = $card.attr("data-title") + " - Live Preview";
      if (url && url !== "#") {
        if (!/^https?:\/\//i.test(url)) url = "https://" + url;
        $("#liveModalTitle").text(title);
        $("#liveModalIframe").attr("src", url).show();
        $("#liveModalImageContainer").hide();
        $("#liveViewModal").attr("aria-hidden", "false").fadeIn(180);
        $("body").addClass("modal-open");
      } else {
        alert("Live link not provided yet.");
      }
    }
  });

  // Prevent modal opening when clicking the "Code" button inside project cards
  $(".project-card .code-btn").on("click", function (e) {
    e.stopPropagation();
  });

  // Close modal — destroy carousel timer + clear content
  $(".live-modal__close, .live-modal__overlay").on("click", function () {
    stopSlider();
    var $mpc = $("#liveModalImageContainer .mpc-wrap");
    if ($mpc.length && $mpc.data("destroy")) $mpc.data("destroy")();
    $("#liveModalIframe").attr("src", "");
    $("#liveModalImageContainer").empty();
    $("#liveViewModal").attr("aria-hidden", "true").fadeOut(150);
    $("body").removeClass("modal-open");
  });

  // Helper: allow setting a project's live URL from other scripts
  window.setProjectLiveUrl = function (projectId, url) {
    var $el = $('.project-card[data-id="' + projectId + '"]');
    if (!$el.length) return false;
    $el.attr("data-liveurl", url);
    return true;
  };

  /* Team card rating widgets */
  // Update stars visuals for a rating element
  window._updateTeamStars = function ($ratingEl, rating) {
    $ratingEl.find("i").each(function () {
      var v = parseInt($(this).attr("data-value")) || 0;
      $(this).toggleClass("filled", v <= rating);
    });
  };

  // Initialize ratings from data-rating or localStorage
  $(".teams .carousel .card").each(function () {
    var $card = $(this);
    var id = $card.attr("data-id") || "team-" + $card.index();
    var $rating = $card.find(".rating");
    if (!$rating.length) return;
    var saved = localStorage.getItem("team-rating-" + id);
    var r =
      saved !== null
        ? parseInt(saved)
        : parseInt($rating.attr("data-rating") || 0);
    $rating.attr("data-rating", r);
    window._updateTeamStars($rating, r);
  });

  // Hover and click behavior for interactive star rating
  $(".teams").on("mouseenter", ".rating i", function () {
    var $star = $(this);
    var $rating = $star.closest(".rating");
    var v = parseInt($star.attr("data-value")) || 0;
    $rating.find("i").each(function () {
      $(this).toggleClass("filled", ($(this).attr("data-value") || 0) <= v);
    });
  });
  $(".teams").on("mouseleave", ".rating", function () {
    var $rating = $(this);
    var r = parseInt($rating.attr("data-rating") || 0);
    window._updateTeamStars($rating, r);
  });
  $(".teams").on("click", ".rating i", function () {
    var $star = $(this);
    var $card = $star.closest(".card");
    var id = $card.attr("data-id") || "team-" + $card.index();
    var $rating = $star.closest(".rating");
    var v = parseInt($star.attr("data-value")) || 0;
    $rating.attr("data-rating", v);
    localStorage.setItem("team-rating-" + id, v);
    window._updateTeamStars($rating, v);
  });

  // Helpers to set/get team rating programmatically
  window.setTeamRating = function (teamId, rating) {
    var $card = $('.teams .carousel .card[data-id="' + teamId + '"]');
    if (!$card.length) return false;
    var $rating = $card.find(".rating");
    $rating.attr("data-rating", rating);
    localStorage.setItem("team-rating-" + teamId, rating);
    window._updateTeamStars($rating, parseInt(rating));
    return true;
  };

  window.getTeamRating = function (teamId) {
    var v = localStorage.getItem("team-rating-" + teamId);
    return v ? parseInt(v) : null;
  };

  /* Contact form: AJAX submission using FormSubmit.co */
  $("#contactForm").on("submit", function (e) {
    e.preventDefault();
    var name = $("#contact-name").val().trim();
    var email = $("#contact-email").val().trim();
    var subject = $("#contact-subject").val().trim();
    var message = $("#contact-message").val().trim();

    // basic validation
    if (!name || !email || !message) {
      $("#contact-status")
        .text("Please fill your name, email and message.")
        .css("color", "var(--primary-color)")
        .fadeIn(120);
      setTimeout(function () {
        $("#contact-status").fadeOut(800);
      }, 3000);
      return;
    }
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      $("#contact-status")
        .text("Please enter a valid email address.")
        .css("color", "var(--primary-color)")
        .fadeIn(120);
      setTimeout(function () {
        $("#contact-status").fadeOut(800);
      }, 3000);
      return;
    }

    // Disable submit button during request to prevent double submissions
    const $submitBtn = $("#contact-submit");
    $submitBtn.prop("disabled", true).text("Sending...");

    $("#contact-status")
      .text("Sending message...")
      .css("color", "var(--primary-color)")
      .fadeIn(120);

    // Send via FormSubmit AJAX API
    $.ajax({
      url: "https://formsubmit.co/ajax/hossainahammed627@gmail.com",
      method: "POST",
      data: JSON.stringify({
        name: name,
        email: email,
        _subject: subject || "Contact from Portfolio",
        message: message,
      }),
      dataType: "json",
      contentType: "application/json",
      success: function (response) {
        $("#contact-status")
          .text("Message sent successfully! Thank you.")
          .css("color", "#22c55e")
          .fadeIn(120);
        $("#contactForm")[0].reset();

        setTimeout(function () {
          $("#contact-status").fadeOut(800);
        }, 4000);
      },
      error: function (error) {
        console.error("Contact Form submission error:", error);
        $("#contact-status")
          .text(
            "Failed to send. Please email directly to hossainahammed627@gmail.com",
          )
          .css("color", "#ef4444")
          .fadeIn(120);
      },
      complete: function () {
        $submitBtn.prop("disabled", false).text("Send message");
      },
    });
  });

  // Active navbar link highlighter on scroll (optimized with cached bounds)
  const navLinks = $(".navbar .menu li a");
  let cachedSections = [];

  function updateSectionBounds() {
    cachedSections = [];
    $("section[id]").each(function () {
      const $sec = $(this);
      const top = $sec.offset().top;
      cachedSections.push({
        id: $sec.attr("id"),
        top: top,
        bottom: top + $sec.outerHeight(),
      });
    });
  }

  updateSectionBounds();
  $(window).on("resize load", updateSectionBounds);

  function highlightNavbar() {
    let currentSectionId = "";
    const scrollPos = $(window).scrollTop() + 150;
    const scrollBottom = $(window).scrollTop() + $(window).height();
    const pageHeight = $(document).height();

    if (scrollBottom >= pageHeight - 50) {
      currentSectionId = "contact";
    } else {
      for (let i = 0; i < cachedSections.length; i++) {
        const sec = cachedSections[i];
        if (scrollPos >= sec.top && scrollPos <= sec.bottom) {
          currentSectionId = sec.id;
          break;
        }
      }
    }

    if (currentSectionId) {
      navLinks.removeClass("active");
      $(`.navbar .menu li a[href="#${currentSectionId}"]`).addClass("active");
    }
  }

  $(window).on("scroll", highlightNavbar);
  highlightNavbar(); // Initialize on load

  // Intersection Observer for Scroll Reveals
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            $(entry.target).addClass("active");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: "0px 0px 100px 0px",
      },
    );

    $(".reveal, .reveal-grid").each(function () {
      revealObserver.observe(this);
    });
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    $(".reveal, .reveal-grid").addClass("active");
  }

  // Safety trigger: force all reveal containers active on load so no section stays invisible
  setTimeout(function () {
    $(".reveal, .reveal-grid, .project-card, .skills-category-card").addClass("active");
  }, 300);

  // Card Cursor Spotlight Tracker
  $(document).on(
    "mousemove",
    ".project-card, .services .card, .teams .card",
    function (e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.style.setProperty("--mouse-x", x + "px");
      this.style.setProperty("--mouse-y", y + "px");
    },
  );

  /* ================= Admin Panel Logic ================= */
  window.currentlyEditingCard = null;

  function enableAdminMode() {
    if ($(".admin-edit-btn").length === 0) {
      $(".project-card").each(function () {
        var isHidden = $(this).attr("data-hidden") === "true";
        var eyeIcon = isHidden ? "fa-eye-slash" : "fa-eye";
        $(this).append(
          '<button class="admin-edit-btn" title="Edit Project" style="position: absolute; top: 10px; right: 10px; z-index: 10; background: var(--primary-color); color: white; border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><i class="fas fa-edit"></i></button>',
        );
        if (isHidden) {
          $(this).css("opacity", "0.5");
        }
      });
    }
  }

  /* ============================================================
     Portfolio Backend Admin & Control Panel Controller
     ============================================================ */

  // 1. Admin Authentication Check & View Toggle
  function checkAdminSession() {
    const isLoggedIn = localStorage.getItem("portfolio_admin_logged_in") === "true";
    if (isLoggedIn) {
      $("#admin-login-step").hide();
      $("#admin-dashboard-step").css("display", "flex");
      
      if (isFirebaseConfigured()) {
        $("#adminStatusBadge")
          .text("🔥 Firebase Connected")
          .removeClass("offline");
      } else {
        $("#adminStatusBadge")
          .text("⚡ Local Storage Mode")
          .addClass("offline");
      }
      
      renderAdminProjects();
      loadAdminStats();
      renderAdminInbox();
    } else {
      $("#admin-login-step").show();
      $("#admin-dashboard-step").hide();
    }
  }

  // Open Admin Modal
  $(document).on("dblclick", "#admin-trigger", function (e) {
    e.preventDefault();
    $("#adminModal").show().attr("aria-hidden", "false");
    $("body").addClass("modal-open");
    checkAdminSession();
  });

  $(document).on("click", "#openAdminLogin", function (e) {
    e.preventDefault();
    $("#adminModal").show().attr("aria-hidden", "false");
    $("body").addClass("modal-open");
    checkAdminSession();
  });

  // Close Admin Modal
  $(".admin-close").on("click", function () {
    $("#adminModal").hide().attr("aria-hidden", "true");
    $("body").removeClass("modal-open");
  });

  // Tab Navigation
  $(document).on("click", ".admin-tab-btn", function () {
    const targetTab = $(this).attr("data-tab");
    $(".admin-tab-btn").removeClass("active");
    $(this).addClass("active");

    $(".admin-tab-content").hide().removeClass("active");
    $("#" + targetTab).show().addClass("active");
  });

  // Admin Login Handler
  $("#adminLoginForm").on("submit", async function (e) {
    e.preventDefault();
    const email = $("#admin-email").val().trim();
    const key = $("#admin-key").val().trim();
    const $error = $("#admin-error");
    $error.hide();

    // Check secret master password fallback first for instant access
    if (key === "admin123" || key === "hossain" || email === "hossainahammed627@gmail.com" && key === "admin123") {
      localStorage.setItem("portfolio_admin_logged_in", "true");
      checkAdminSession();
      return;
    }

    if (isFirebaseConfigured() && auth) {
      try {
        await signInWithEmailAndPassword(auth, email, key);
        localStorage.setItem("portfolio_admin_logged_in", "true");
        checkAdminSession();
      } catch (err) {
        $error.text("Firebase Auth: Invalid credentials. Enter 'admin123' as default password.").show();
      }
    } else {
      $error.text("Invalid credentials. Use 'admin123' as default secret key.").show();
    }
  });

  // Admin Logout Handler
  $("#adminLogoutBtn").on("click", async function () {
    if (isFirebaseConfigured() && auth) {
      try {
        await signOut(auth);
      } catch (err) {}
    }
    localStorage.removeItem("portfolio_admin_logged_in");
    checkAdminSession();
  });

  // 2. Projects Manager (CRUD & 100% Dynamic Real-Time Firebase Sync Engine)
  const BASELINE_PROJECTS = [
    {
      id: "flutter-sova",
      title: "SOVA — Night Club App",
      category: "flutter",
      badge: "client",
      image: "images/Sova/1 21.png",
      desc: "Disconnected nightlife experiences, lack of real-time DJ song requests, and fragmented event ticket purchasing for clubgoers.",
      tech: "Flutter, Dart, GetX, HTTP, REST API",
      live: "https://play.google.com/store/apps/details?id=com.zdenko_dikic.sova",
      playstore: "https://play.google.com/store/apps/details?id=com.zdenko_dikic.sova",
      imageFolder: "images/Sova/",
      images: "1 21.png,2 8.png,3 21.png,4 1.png,5 1.png,6 1.png,7 1.png,8 1.png"
    },
    {
      id: "flutter-digital-khanqah",
      title: "Digital Khanqah — Islamic App",
      category: "flutter",
      badge: "both",
      image: "images/maroofkhan/1.png",
      desc: "Fragmented access to authentic Islamic learning, daily prayer tracking, Quran recitations, and AI spiritual guidance in a single mobile experience.",
      tech: "Flutter, Dart, GetX, REST API, AI Integration, Audio Players, Geolocator",
      live: "https://play.google.com/store/apps/details?id=com.digital.khanqah&hl=en",
      playstore: "https://play.google.com/store/apps/details?id=com.digital.khanqah&hl=en",
      imageFolder: "images/maroofkhan/",
      images: "1.png,2.png,3.png,4.png,5.png,6.png,7.png,8.png,9.png,10.png,11.png,12.png,13.png,14.png,15.png,16.png"
    },
    {
      id: "flutter-yestwice",
      title: "Yes Twice — Athletics App",
      category: "flutter",
      badge: "client",
      image: "images/yes_twic/1.png",
      desc: "Fragmented athletic training logs, recovery check-ins, and performance readiness tracking for athletes and coaches.",
      tech: "Flutter, Dart, GetX, REST API, PDF & Printing, Chewie / Video, Google Sign-in",
      live: "#",
      imageFolder: "images/yes_twic/",
      images: "1.png,2.png,3.png,4.png,5.png,6.png,7.png,8.png,9.png,10.png,11.png,12.png,13.png,14.png,15.png"
    },
    {
      id: "flutter-smartplan",
      title: "SmartPlan — AI Study Planner",
      category: "flutter",
      badge: "client",
      image: "images/SmartPlanAi.png",
      desc: "Inefficient study schedules, lack of automated task breakdown, and poor time management for students.",
      tech: "Flutter, Dart, Provider, OpenAI API, SQLite",
      live: "#",
      github: "https://github.com/hossainahammed/SmartPlan-AI-Study-Planner"
    },
    {
      id: "flutter-expense",
      title: "Expense Tracker App",
      category: "flutter",
      badge: "team",
      image: "images/Expences Tracker.png",
      desc: "Manual budget tracking and difficulty visualizing daily spending habits.",
      tech: "Flutter, Dart, Hive DB, Fl Chart",
      live: "#",
      github: "https://github.com/hossainahammed/Expense-Tracker-App"
    },
    {
      id: "web-honda",
      title: "Honda Website",
      category: "web",
      badge: "",
      image: "images/Honda Website.png",
      desc: "Outdated showroom interfaces that fail to capture modern vehicle aesthetics.",
      tech: "HTML5, CSS3, JavaScript, Responsive Design",
      live: "https://melodic-phoenix-e0fc48.netlify.app/"
    },
    {
      id: "web-shop",
      title: "E-Commerce Shop Website",
      category: "web",
      badge: "",
      image: "images/Shop and Product.png",
      desc: "Cluttered checkout flows and slow product browsing on mobile devices.",
      tech: "HTML5, CSS3, JavaScript, LocalStorage",
      live: "https://hossainahammed.github.io/E-commerce-Website/"
    },
    {
      id: "web-travel",
      title: "Travel Booking Landing Page",
      category: "web",
      badge: "",
      image: "images/Travel.png",
      desc: "Low conversion rates on legacy tourism landing pages.",
      tech: "HTML5, CSS3, JavaScript, Smooth Scroll",
      live: "https://hossainahammed.github.io/Travel-Website-Landing-Page/"
    },
    {
      id: "php-gym",
      title: "GYM Website",
      category: "php",
      badge: "",
      image: "images/GYM Website.png",
      desc: "Manual gym membership registration and scheduling overhead.",
      tech: "PHP, MySQL, HTML5, CSS3, JavaScript",
      live: "https://hossainahammed.github.io/Basic-PHP-Gymnesium-Project/"
    },
    {
      id: "php-library",
      title: "Library Management System",
      category: "php",
      badge: "",
      image: "images/Library Management.png",
      desc: "Manual book tracking and lost record logs in educational institutions.",
      tech: "PHP, MySQL, Bootstrap, jQuery",
      live: "https://github.com/hossainahammed/Library-Management-System-PHP"
    },
    {
      id: "php-crud",
      title: "PHP CRUD Application",
      category: "php",
      badge: "",
      image: "images/Crud Operation Home View.png",
      desc: "Complex boilerplate code required for standard database record operations.",
      tech: "PHP, MySQL, PDO, HTML/CSS",
      live: "https://github.com/hossainahammed/PHP-CRUD-Operation"
    }
  ];

  let localProjectsCache = JSON.parse(localStorage.getItem("custom_portfolio_projects") || "[]");

  function createProjectCardHtml(proj) {
    const id = proj.id || "proj-" + Math.random().toString(36).substr(2, 5);
    const title = proj.title || "Untitled Project";
    const category = proj.category || "flutter";
    const badge = proj.badge || "";
    const image = proj.image || "images/SmartPlanAi.png";
    const desc = proj.desc || "";
    const tech = proj.tech || "";
    const playstore = proj.playstore || proj.playstoreurl || "";
    const apk = proj.apk || proj.apkurl || "";
    const github = proj.github || proj.codeurl || "";
    const live = proj.live || proj.liveurl || "";
    const images = proj.images || "";
    const imageFolder = proj.imageFolder || proj.image_folder || "";

    let techPillsHtml = "";
    if (tech) {
      techPillsHtml = tech.split(",").map(t => `<span class="tech-pill">${t.trim()}</span>`).join(" ");
    }

    let badgeHtml = "";
    if (badge === "client") badgeHtml = '<span class="client-badge"><i class="fas fa-user-shield"></i> Client Project</span>';
    else if (badge === "team") badgeHtml = '<span class="team-badge"><i class="fas fa-users"></i> Team Project</span>';
    else if (badge === "both") badgeHtml = '<span class="team-badge"><i class="fas fa-users"></i> Team Project</span> <span class="client-badge"><i class="fas fa-user-shield"></i> Client Project</span>';

    let linksHtml = "";
    if (live && live !== "#") {
      linksHtml += `<a href="${live}" target="_blank" rel="noopener" class="proj-link-btn live-btn" onclick="event.stopPropagation();"><i class="fas fa-play"></i> Live</a>`;
    }
    if (playstore && playstore !== "#") {
      linksHtml += `<a href="${playstore}" target="_blank" rel="noopener" class="proj-link-btn playstore-btn" onclick="event.stopPropagation();"><i class="fab fa-google-play"></i> Play Store</a>`;
    }
    if (apk && apk !== "#") {
      linksHtml += `<a href="${apk}" download class="proj-link-btn apk-btn" onclick="event.stopPropagation();"><i class="fas fa-download"></i> Download APK</a>`;
    }
    if (github && github !== "#") {
      linksHtml += `<a href="${github}" target="_blank" rel="noopener" class="proj-link-btn code-btn" onclick="event.stopPropagation();"><i class="fab fa-github"></i> Code</a>`;
    }

    return `
      <div class="project-card reveal active" data-id="${id}" data-title="${title}" data-liveurl="${live || '#'}" data-playstoreurl="${playstore || '#'}" data-apkurl="${apk || '#'}" data-image-folder="${imageFolder}" data-images="${images}">
        <div class="project-img-wrapper">
          ${badgeHtml}
          <img src="${image}" alt="${title}" onerror="this.src='images/SmartPlanAi.png'" />
        </div>
        <div class="project-info-body">
          <div class="proj-title">${title}</div>
          <div class="proj-meta">
            <p class="proj-desc"><strong>Problem Solved:</strong> ${desc}</p>
            <div class="proj-tech">${techPillsHtml}</div>
          </div>
        </div>
        <div class="project-links">
          ${linksHtml}
        </div>
      </div>
    `;
  }

  function getCategoryGrid(category) {
    const cat = (category || "").toLowerCase();
    if (cat === "web") {
      const $g = $("#web-projects .projects-grid");
      return $g.length ? $g : $(".title-web").siblings(".projects-grid");
    } else if (cat === "php") {
      const $g = $("#php-projects .projects-grid");
      return $g.length ? $g : $(".title-php").siblings(".projects-grid");
    } else {
      const $g = $("#projects .projects-grid");
      return $g.length ? $g : $(".projects-grid").first();
    }
  }

  function renderProjectsToDOM(projects) {
    if (!Array.isArray(projects) || projects.length === 0) return;

    const deletedIds = new Set(JSON.parse(localStorage.getItem("deleted_project_ids") || "[]"));

    // Clear placeholders if any exist
    $("#projects .projects-grid, #web-projects .projects-grid, #php-projects .projects-grid").each(function () {
      if ($(this).find(".projects-loading-state").length > 0) {
        $(this).empty();
      }
    });

    projects.forEach((proj) => {
      const projId = proj.id || ("proj-" + String(proj.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-"));
      if (deletedIds.has(projId)) {
        $(`.project-card[data-id="${projId}"]`).remove();
        return;
      }
      if ($(`.project-card[data-id="${projId}"]`).length > 0) return;

      const $grid = getCategoryGrid(proj.category);
      if ($grid.length) {
        const cardHtml = createProjectCardHtml({ ...proj, id: projId });
        $grid.prepend(cardHtml);
      }
    });

    $(".project-card").addClass("reveal active");
    $(".projects-grid").addClass("reveal-grid active");
  }

  async function seedBaselineProjectsToFirestore() {
    if (!isFirebaseConfigured() || !db) return;
    try {
      for (const proj of BASELINE_PROJECTS) {
        await addDoc(collection(db, "projects"), {
          ...proj,
          createdAt: serverTimestamp()
        });
      }
      console.log("🌱 Baseline projects successfully seeded to Firestore!");
    } catch (err) {
      console.warn("Firestore seeding warning:", err);
    }
  }

  function syncProjectsFromBackend() {
    // 1. Initial local cache render
    let localCache = JSON.parse(localStorage.getItem("custom_portfolio_projects") || "[]");
    renderProjectsToDOM(localCache);

    // 2. Real-time Firestore sync if backend connected
    if (isFirebaseConfigured() && db) {
      try {
        const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
        onSnapshot(q, (snapshot) => {
          const remoteProjects = [];
          snapshot.forEach((docSnap) => {
            remoteProjects.push({ id: docSnap.id, ...docSnap.data() });
          });

          if (remoteProjects.length > 0) {
            localProjectsCache = remoteProjects;
            localStorage.setItem("custom_portfolio_projects", JSON.stringify(remoteProjects));
            renderProjectsToDOM(remoteProjects);
            if ($("#adminModal").is(":visible")) {
              renderAdminProjects();
            }
          }
        }, (err) => {
          console.warn("Firestore projects snapshot warning:", err);
        });
      } catch (e) {
        console.warn("Error initializing Firestore projects listener:", e);
      }
    }
  }

  function renderAdminProjects() {
    const $list = $("#adminProjectList");
    $list.empty();

    const deletedIds = new Set(JSON.parse(localStorage.getItem("deleted_project_ids") || "[]"));

    // Collect DOM projects
    const domProjects = [];
    $(".projects-grid .project-card").each(function () {
      const $card = $(this);
      const id = $card.attr("data-id");
      if (id && !deletedIds.has(id)) {
        domProjects.push({
          id: id,
          title: $card.attr("data-title") || $card.find(".proj-title").text() || "Untitled Project",
          category: $card.closest(".projects-grid").parent().attr("id") || "flutter",
          image: $card.find(".project-img-wrapper img").attr("src") || "",
          desc: $card.find(".proj-desc").text().replace("Problem Solved:", "").trim()
        });
      }
    });

    // Dedupe all projects
    const seen = new Set();
    const allProjects = [];
    [...localProjectsCache, ...domProjects].forEach((p) => {
      const key = p.id || p.title;
      if (key && !seen.has(key) && !deletedIds.has(key)) {
        seen.add(key);
        allProjects.push(p);
      }
    });

    if (!allProjects.length) {
      $list.html('<p style="color: var(--text-sec); font-size: 13px;">No project items found.</p>');
      return;
    }

    allProjects.forEach((proj) => {
      const cardHtml = `
        <div class="admin-item-card" data-proj-id="${proj.id}">
          <div>
            <div class="admin-item-title">${proj.title}</div>
            <div class="admin-item-meta">${(proj.desc || "").substring(0, 75)}...</div>
          </div>
          <div class="admin-item-actions">
            <button class="admin-action-btn danger-btn small btn-delete-proj" data-id="${proj.id}"><i class="fas fa-trash"></i> Delete</button>
          </div>
        </div>
      `;
      $list.append(cardHtml);
    });
  }

  // Open Add Project Form
  $("#btnOpenAddProject").on("click", function () {
    $("#portfolioProjectForm")[0].reset();
    $("#pf-id").val("");
    $("#pf-image-preview").hide();
    $("#projectFormTitle").text("Add New Portfolio Project");
    $("#projectFormContainer").slideDown();
  });

  // Handle direct image file upload & live preview
  $(document).on("change", "#pf-file-input", function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (evt) {
        const dataUrl = evt.target.result;
        $("#pf-image").val(dataUrl);
        $("#pf-image-preview").attr("src", dataUrl).fadeIn();
      };
      reader.readAsDataURL(file);
    }
  });

  $(document).on("input", "#pf-image", function () {
    const val = $(this).val().trim();
    if (val) {
      $("#pf-image-preview").attr("src", val).fadeIn();
    } else {
      $("#pf-image-preview").hide();
    }
  });

  $("#btnCloseProjectForm, #btnCancelProjectForm").on("click", function () {
    $("#projectFormContainer").slideUp();
  });

  // Save Project Handler
  $("#portfolioProjectForm").on("submit", async function (e) {
    e.preventDefault();

    const title = $("#pf-title").val().trim();
    const category = $("#pf-category").val();
    const badge = $("#pf-badge").val();
    const image = $("#pf-image").val().trim();
    const desc = $("#pf-desc").val().trim();
    const tech = $("#pf-tech").val().trim();
    const images = $("#pf-images").val().trim();
    const playstore = $("#pf-playstore").val().trim();
    const apk = $("#pf-apk").val().trim();
    const github = $("#pf-github").val().trim();
    const live = $("#pf-live").val().trim();

    const projId = `proj-${Date.now()}`;
    const newProjObj = {
      id: projId,
      title, category, badge, image, desc, tech, playstore, apk, github, live, images
    };

    const newProjectCardHtml = createProjectCardHtml(newProjObj);

    // Prepend to target category grid
    const $targetGrid = getCategoryGrid(category);
    $targetGrid.prepend(newProjectCardHtml);
    $(".project-card").addClass("reveal active");

    // Save to Firestore if configured
    if (isFirebaseConfigured() && db) {
      try {
        await addDoc(collection(db, "projects"), {
          ...newProjObj, createdAt: serverTimestamp()
        });
      } catch (err) {
        console.warn("Firestore project save warning:", err);
      }
    }

    // Save to LocalStorage cache
    localProjectsCache.unshift(newProjObj);
    localStorage.setItem("custom_portfolio_projects", JSON.stringify(localProjectsCache));

    $("#projectFormContainer").slideUp();
    renderAdminProjects();
    alert("✓ Project published live to portfolio!");
  });

  // Delete Project Action
  $(document).on("click", ".btn-delete-proj", function () {
    const projId = $(this).attr("data-id");
    if (!projId) return;

    if (confirm("Are you sure you want to delete this project?")) {
      // 1. Delete from Firestore if connected
      if (isFirebaseConfigured() && db) {
        try {
          deleteDoc(doc(db, "projects", projId)).catch(err => console.warn("Firestore delete warning:", err));
        } catch(e) {
          console.warn("Firestore delete error:", e);
        }
      }

      // 2. Add to deleted IDs set in localStorage
      let deletedIds = JSON.parse(localStorage.getItem("deleted_project_ids") || "[]");
      if (!deletedIds.includes(projId)) {
        deletedIds.push(projId);
        localStorage.setItem("deleted_project_ids", JSON.stringify(deletedIds));
      }

      // 3. Remove card from DOM
      $(`.project-card[data-id="${projId}"]`).fadeOut(300, function() { $(this).remove(); });

      // 4. Filter local Projects Cache
      localProjectsCache = localProjectsCache.filter(p => p.id !== projId);
      localStorage.setItem("custom_portfolio_projects", JSON.stringify(localProjectsCache));

      // 5. Remove card from Admin list
      $(`.admin-item-card[data-proj-id="${projId}"]`).slideUp(200, function() { $(this).remove(); });
    }
  });

  // 3. Stats Counters Controller & Sync
  function syncStatsFromBackend() {
    const applyStats = (data) => {
      if (!data) return;
      const comp = data.comp || data.completed || "30";
      const deliv = data.deliv || data.delivered || "15";
      const pub = data.pub || data.published || "5";
      const exp = data.exp || data.experience || "1+ Years";

      localStorage.setItem("stat_completed", comp);
      localStorage.setItem("stat_delivered", deliv);
      localStorage.setItem("stat_published", pub);
      localStorage.setItem("stat_exp", exp);

      $(".stat-number[data-target]").eq(0).attr("data-target", comp).text(comp + "+");
      $(".stat-number[data-target]").eq(1).attr("data-target", deliv).text(deliv + "+");
      $(".stat-number[data-target]").eq(2).attr("data-target", pub).text(pub + "+");
      $(".stat-exp").text(exp);
    };

    const savedComp = localStorage.getItem("stat_completed");
    if (savedComp) {
      applyStats({
        comp: localStorage.getItem("stat_completed"),
        deliv: localStorage.getItem("stat_delivered"),
        pub: localStorage.getItem("stat_published"),
        exp: localStorage.getItem("stat_exp")
      });
    }

    if (isFirebaseConfigured() && db) {
      try {
        onSnapshot(doc(db, "settings", "stats"), (docSnap) => {
          if (docSnap.exists()) {
            applyStats(docSnap.data());
          }
        }, (err) => console.warn("Firestore stats listener warning:", err));
      } catch (err) {
        console.warn("Error setting up stats listener:", err);
      }
    }
  }

  function loadAdminStats() {
    const savedCompleted = localStorage.getItem("stat_completed") || "30";
    const savedDelivered = localStorage.getItem("stat_delivered") || "15";
    const savedPublished = localStorage.getItem("stat_published") || "5";
    const savedExp = localStorage.getItem("stat_exp") || "1+ Years";

    $("#statInputCompleted").val(savedCompleted);
    $("#statInputDelivered").val(savedDelivered);
    $("#statInputPublished").val(savedPublished);
    $("#statInputExp").val(savedExp);
  }

  $("#adminStatsForm").on("submit", async function (e) {
    e.preventDefault();

    const comp = $("#statInputCompleted").val();
    const deliv = $("#statInputDelivered").val();
    const pub = $("#statInputPublished").val();
    const exp = $("#statInputExp").val();

    localStorage.setItem("stat_completed", comp);
    localStorage.setItem("stat_delivered", deliv);
    localStorage.setItem("stat_published", pub);
    localStorage.setItem("stat_exp", exp);

    // Update live DOM targets
    $(".stat-number[data-target='30'], .stat-number[data-target]").eq(0).attr("data-target", comp).text(comp + "+");
    $(".stat-number[data-target='15'], .stat-number[data-target]").eq(1).attr("data-target", deliv).text(deliv + "+");
    $(".stat-number[data-target='5'], .stat-number[data-target]").eq(2).attr("data-target", pub).text(pub + "+");
    $(".stat-exp").text(exp);

    // Save to Firestore if available
    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, "settings", "stats"), { comp, deliv, pub, exp, updatedAt: serverTimestamp() });
      } catch (err) {}
    }

    $("#statsUpdateStatus").fadeIn().delay(3000).fadeOut();
  });

  // 4. Contact Form Inbox & Form Intercept
  const inboxMessages = JSON.parse(localStorage.getItem("contact_inbox_messages") || "[]");

  $("#contactForm").on("submit", async function (e) {
    e.preventDefault();

    const name = $("#contact-name").val().trim();
    const email = $("#contact-email").val().trim();
    const subject = $("#contact-subject").val().trim();
    const message = $("#contact-message").val().trim();
    const $status = $("#contact-status");

    if (!name || !email || !message) return;

    const msgObj = { name, email, subject, message, time: new Date().toLocaleString() };

    // Save to LocalStorage inbox
    inboxMessages.unshift(msgObj);
    localStorage.setItem("contact_inbox_messages", JSON.stringify(inboxMessages));

    // Save to Firestore if available
    if (isFirebaseConfigured() && db) {
      try {
        await addDoc(collection(db, "messages"), { ...msgObj, timestamp: serverTimestamp() });
      } catch (err) {}
    }

    $status.text("✓ Message sent successfully! I will respond to your email shortly.").css("color", "#22c55e").fadeIn();
    $("#contactForm")[0].reset();
    setTimeout(() => $status.fadeOut(), 5000);
  });

  function renderAdminInbox() {
    const $inbox = $("#adminInboxList");
    $("#inboxBadge").text(inboxMessages.length);
    $inbox.empty();

    if (!inboxMessages.length) {
      $inbox.html('<p style="color: var(--text-sec); font-size: 13px;">Your inbox is empty. Client messages will appear here.</p>');
      return;
    }

    inboxMessages.forEach((msg) => {
      const cardHtml = `
        <div class="admin-inbox-card">
          <div class="admin-inbox-header">
            <span class="admin-inbox-sender">${msg.name} (<a href="mailto:${msg.email}" class="admin-inbox-email">${msg.email}</a>)</span>
            <span style="color: var(--text-sec); font-size: 11px;">${msg.time}</span>
          </div>
          <div class="admin-inbox-subject">Subject: ${msg.subject || 'Portfolio Inquiry'}</div>
          <div class="admin-inbox-body">${msg.message}</div>
        </div>
      `;
      $inbox.append(cardHtml);
    });
  }

  $("#btnClearInbox").on("click", function () {
    if (confirm("Clear all received inbox messages?")) {
      inboxMessages.length = 0;
      localStorage.removeItem("contact_inbox_messages");
      renderAdminInbox();
    }
  });

  /* ============================================================
     Animated Key Stats & Achievements Counter Engine
     ============================================================ */
  function initStatsCounter() {
    const $statsSection = $("#stats");
    if (!$statsSection.length) return;

    let animated = false;

    function runCounterAnimation() {
      if (animated) return;
      animated = true;

      // 1. Numeric Counters (Projects Completed, Delivered, Published Apps)
      $(".stat-number[data-target]").each(function () {
        const $el = $(this);
        const target = parseInt($el.attr("data-target"), 10) || 0;
        const suffix = $el.attr("data-suffix") || "";
        const duration = 1800;
        const startTime = performance.now();

        function step(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          const currentVal = Math.floor(easeProgress * target);

          $el.text(currentVal + (progress >= 1 ? suffix : ""));

          if (progress < 1) {
            requestAnimationFrame(step);
          }
        }
        requestAnimationFrame(step);
      });

      // 2. Experience Counter (Month-to-Year ticker: 0 Months -> 12 Months -> 1+ Years)
      $(".stat-exp").each(function () {
        const $expEl = $(this);
        const totalMonths = 14;
        const duration = 2000;
        const startTime = performance.now();

        function stepExp(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          const currentMonth = Math.floor(easeProgress * totalMonths);

          if (currentMonth < 12) {
            $expEl.text(`${currentMonth} ${currentMonth === 1 ? 'Month' : 'Months'}`);
          } else {
            $expEl.text("1+ Years");
          }

          if (progress < 1) {
            requestAnimationFrame(stepExp);
          }
        }
        requestAnimationFrame(stepExp);
      });
    }

    if ("IntersectionObserver" in window) {
      const statsObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              runCounterAnimation();
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.25 }
      );
      statsObserver.observe($statsSection[0]);
    } else {
      $(window).on("scroll", function () {
        if ($statsSection.length) {
          const top = $statsSection.offset().top;
          const scrollPos = $(window).scrollTop() + $(window).height();

          if (scrollPos > top + 100) {
            runCounterAnimation();
          }
        }
      });
    }
  }

  // Initialize real-time backend data synchronization for projects and stats
  syncProjectsFromBackend();
  syncStatsFromBackend();

  initStatsCounter();
});
