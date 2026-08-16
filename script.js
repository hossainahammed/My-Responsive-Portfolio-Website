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
  // Global timers for carousels
  var autoShowcaseTimer = null;

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
    const numParticles = isMobile ? 12 : Math.min(Math.floor(window.innerWidth / 20), 55);
    const maxConnectDist = isMobile ? 85 : 120;
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
        vx: (Math.random() - 0.5) * (isMobile ? 0.35 : 0.5),
        vy: (Math.random() - 0.5) * (isMobile ? 0.35 : 0.5),
        radius: Math.random() * 1.8 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Cache photo element bounding boxes on resize/load
    let photoRects = [];
    function updatePhotoRects() {
      photoRects = [];
      document.querySelectorAll(".about .left img, .photo-wrap, .photo-mask, .column.left img").forEach(img => {
        const r = img.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          photoRects.push({
            left: r.left - 20,
            right: r.right + 20,
            top: r.top - 20,
            bottom: r.bottom + 20
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

    let laserPulseTime = 0;
    let isCanvasVisible = true;
    let canvasAnimId = null;

    function drawParticles() {
      if (!isCanvasVisible) return;
      ctx.clearRect(0, 0, width, height);
      laserPulseTime += 16;

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

          if (dist < maxConnectDist) {
            const alpha = 0.18 * (1 - dist / maxConnectDist);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();

            // Web3 Laser Energy Pulse traveling along connection line
            if (!isMobile && (i + j) % 3 === 0) {
              const progress = ((laserPulseTime * 0.0012 + (i * 0.4)) % 1);
              const pulseX = p.x + (p2.x - p.x) * progress;
              const pulseY = p.y + (p2.y - p.y) * progress;

              ctx.beginPath();
              ctx.arc(pulseX, pulseY, 1.6, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(255, 0, 127, ${Math.min(alpha * 2.5, 0.8)})`;
              ctx.fill();
            }
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

  /* ============================================================
     "Code → App" Live Morphing Animation Engine & Caches
     ============================================================ */
  let localCodeMorphCache = [
    {
      id: "cm-1",
      active: true,
      title: "SmartPlan AI — Live App",
      filename: "task_manager.dart",
      compileMsg: "Building Flutter APK...",
      image: "images/SmartPlanAi.png",
      code: `class TaskManager extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: TaskScreen(),
    );
  }
}`
    },
    {
      id: "cm-2",
      active: true,
      title: "Sova Fitness — Mobile App",
      filename: "fitness_tracker.dart",
      compileMsg: "Compiling Dart Bytecode...",
      image: "images/Sova/1 21.png",
      code: `class SovaFitness extends StatefulWidget {
  @override
  State<SovaFitness> createState() {
    return _SovaState();
  }
}`
    },
    {
      id: "cm-3",
      active: true,
      title: "Gym Management App",
      filename: "gym_workout.dart",
      compileMsg: "Connecting REST API & State...",
      image: "images/Gymnasium Complete Project.png",
      code: `class GymWorkoutApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      home: GymDashboard(),
    );
  }
}`
    }
  ];

  let localOrbitCache = ["Flutter", "Dart", "Firebase", "REST API", "Git", "Node.js"];
  let currentMorphIdx = 0;

  function runCodeToAppCycle() {
    const $morphLayer = $("#codeAppMorphLayer");
    if (!$morphLayer.length) return;

    const activeItems = (localCodeMorphCache || []).filter(item => item.active !== false);

    if (!activeItems.length) {
      $morphLayer.html(`
        <div class="code-morph-box">
          <div style="color: #94a3b8; font-size: 11px; text-align: center;">No active Code → App items configured in Admin Dashboard.</div>
        </div>
      `);
      return;
    }

    currentMorphIdx = currentMorphIdx % activeItems.length;
    const item = activeItems[currentMorphIdx];

    $("#codeAppFilename").text(item.filename || "app.dart");

    const codeText = item.code || "class TaskManager extends StatelessWidget {}";
    const safeCode = codeText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const highlightedCode = safeCode
      .replace(/\b(class|extends|StatefulWidget|StatelessWidget|Widget|State|return|override|import)\b/g, '<span class="code-keyword">$1</span>')
      .replace(/\b(BuildContext|MaterialApp|GetMaterialApp|Container|Text|Column|Row)\b/g, '<span class="code-class">$1</span>');

    // Step 1: Render Code View
    const codeHtml = `
      <div class="code-morph-box">
        <pre class="code-content-pre"><code>${highlightedCode}</code></pre>
        <div class="compile-status-bar">
          <i class="fas fa-cog fa-spin"></i> <span>${item.compileMsg || 'Building Flutter APK...'}</span>
        </div>
      </div>
    `;
    $morphLayer.html(codeHtml).css("opacity", "1");

    // Step 2: Transition to App UI Screenshot after 2.5 seconds
    setTimeout(() => {
      $morphLayer.css("opacity", "0");

      setTimeout(() => {
        const appUiHtml = `
          <div class="app-ui-morph-box">
            <img src="${item.image}" alt="${item.title}" onerror="this.src='images/SmartPlanAi.png'" />
            <div class="app-ui-tag"><i class="fab fa-flutter"></i> ${item.title}</div>
          </div>
        `;
        $morphLayer.html(appUiHtml).css("opacity", "1");

        // Step 3: Transition back & move to next item after 3.0 seconds
        setTimeout(() => {
          $morphLayer.css("opacity", "0");

          setTimeout(() => {
            currentMorphIdx = (currentMorphIdx + 1) % activeItems.length;
            runCodeToAppCycle();
          }, 400);
        }, 3000);
      }, 400);
    }, 2500);
  }

  // Start Code -> App Morphing loop 2 seconds after page load
  setTimeout(runCodeToAppCycle, 2000);

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
      "#github-calendar rect[data-date], #github-calendar td[data-date]"
    );
    if (cells.length === 0) return;

    let total = 0;
    let longestStreak = 0;
    let currentStreak = 0;
    let tempStreak = 0;

    let tempStreakStart = null;
    let longestStreakStart = null;
    let longestStreakEnd = null;

    // Sort cells by date ascending
    const sortedCells = Array.from(cells).sort((a, b) => {
      return (
        new Date(a.getAttribute("data-date")) -
        new Date(b.getAttribute("data-date"))
      );
    });

    sortedCells.forEach((cell) => {
      let count = parseInt(cell.getAttribute("data-count") || "0", 10);
      if (!cell.hasAttribute("data-count") && cell.hasAttribute("data-level")) {
        const level = parseInt(cell.getAttribute("data-level") || "0", 10);
        count = level > 0 ? level : 0;
      }

      total += count;

      if (count > 0) {
        if (tempStreak === 0) {
          tempStreakStart = cell.getAttribute("data-date");
        }
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
          longestStreakStart = tempStreakStart;
          longestStreakEnd = cell.getAttribute("data-date");
        }
      } else {
        tempStreak = 0;
        tempStreakStart = null;
      }
    });

    // Calculate current streak (look backwards from latest date)
    let currentStreakTemp = 0;
    let currentStreakStart = null;
    let currentStreakEnd = null;

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
        if (!currentStreakEnd) currentStreakEnd = dateStr;
        currentStreakStart = dateStr;
        currentStreakTemp++;
      } else {
        if (dateStr === localTodayStr || dateStr === utcTodayStr) {
          checkIndex--;
          continue;
        }
        break; // Streak broken
      }
      checkIndex--;
    }
    currentStreak = currentStreakTemp;

    // Helper for formatting date strings like "Aug 17, 2025"
    const formatDate = (dateStr) => {
      if (!dateStr) return "";
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      }
      return dateStr;
    };

    // Calculate 1 year date range from sorted cells
    const startDateStr = sortedCells[0] ? sortedCells[0].getAttribute("data-date") : "";
    const endDateStr = sortedCells[sortedCells.length - 1] ? sortedCells[sortedCells.length - 1].getAttribute("data-date") : "";

    const yearRangeText = (startDateStr && endDateStr)
      ? `${formatDate(startDateStr)} – ${formatDate(endDateStr)}`
      : "Past 12 Months";

    const longestStreakSubtext = (longestStreakStart && longestStreakEnd && longestStreak > 1)
      ? `${formatDate(longestStreakStart)} – ${formatDate(longestStreakEnd)}`
      : "Rock - Hard Place";

    const currentStreakSubtext = (currentStreakStart && currentStreak > 0)
      ? (currentStreakEnd && currentStreakStart !== currentStreakEnd
        ? `${formatDate(currentStreakStart)} – ${formatDate(currentStreakEnd)}`
        : `${formatDate(currentStreakStart)}`)
      : "Rock - Hard Place";

    // Hide any legacy default footer elements
    $("#github-calendar > .contrib-column, #github-calendar > .contrib-footer, #github-calendar .table-column").hide();

    // Render or update clean 3-column footer container
    let $footerContainer = $("#github-calendar .contrib-footer-columns");
    if (!$footerContainer.length) {
      $footerContainer = $(`
        <div class="contrib-footer-columns">
          <div class="contrib-column contrib-column-first">
            <span class="contrib-title">Contributions in the last year</span>
            <div class="contrib-number">
              <span class="num">${total.toLocaleString()}</span>
              <span class="unit">total</span>
            </div>
            <span class="contrib-subtext">${yearRangeText}</span>
          </div>

          <div class="contrib-column">
            <span class="contrib-title">Longest streak</span>
            <div class="contrib-number">
              <span class="num">${longestStreak}</span>
              <span class="unit">days</span>
            </div>
            <span class="contrib-subtext">${longestStreakSubtext}</span>
          </div>

          <div class="contrib-column">
            <span class="contrib-title">Current streak</span>
            <div class="contrib-number">
              <span class="num">${currentStreak}</span>
              <span class="unit">days</span>
            </div>
            <span class="contrib-subtext">${currentStreakSubtext}</span>
          </div>
        </div>
      `);
      $("#github-calendar").append($footerContainer);
    } else {
      $footerContainer.find(".contrib-column").eq(0).find(".num").text(total.toLocaleString());
      $footerContainer.find(".contrib-column").eq(0).find(".contrib-subtext").text(yearRangeText);

      $footerContainer.find(".contrib-column").eq(1).find(".num").text(longestStreak);
      $footerContainer.find(".contrib-column").eq(1).find(".contrib-subtext").text(longestStreakSubtext);

      $footerContainer.find(".contrib-column").eq(2).find(".num").text(currentStreak);
      $footerContainer.find(".contrib-column").eq(2).find(".contrib-subtext").text(currentStreakSubtext);
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

  /* ── Flutter App Showcase on-page renderer managed by syncShowcaseFromBackend ── */


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
      if (total > 1) {
        autoTimer = setInterval(function () {
          pcGoTo(cur + 1);
        }, 3000);
      }
    }

    let touchStartX = 0;
    $strip.on("touchstart", function (e) {
      if (e.originalEvent && e.originalEvent.touches) {
        touchStartX = e.originalEvent.touches[0].clientX;
      }
    }).on("touchend", function (e) {
      if (e.originalEvent && e.originalEvent.changedTouches) {
        const touchEndX = e.originalEvent.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 40) {
          if (diff > 0) pcGoTo(cur + 1);
          else pcGoTo(cur - 1);
          pcRestart();
        }
      }
    });

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

  function showAdminLoginScreen() {
    $("#admin-login-step").show();
    $("#admin-reset-step").hide();
    $("#admin-dashboard-step").hide();
    $("#admin-email").val("");
    $("#admin-key").val("");
    $("#admin-error").hide();
    $("#adminLogoutBtn, #adminLogoutBtnHeader").hide();
  }

  function showAdminDashboard() {
    $("#admin-login-step").hide();
    $("#admin-reset-step").hide();
    $("#admin-dashboard-step").css("display", "flex");
    $("#adminLogoutBtn, #adminLogoutBtnHeader").css("display", "inline-flex").show();
    if (isFirebaseConfigured()) {
      $("#adminStatusBadge").text("🔥 Firebase Connected").removeClass("offline");
    } else {
      $("#adminStatusBadge").text("⚡ Local Storage Mode").addClass("offline");
    }
    renderAdminProjects();
    renderAdminInbox();
    loadAdminStats();
  }

  $(document).on("dblclick", "#admin-trigger", function (e) {
    e.preventDefault();
    $("#adminModal").show().attr("aria-hidden", "false");
    $("body").addClass("modal-open");
    if (localStorage.getItem("portfolio_admin_logged_in") === "true") {
      showAdminDashboard();
    } else {
      showAdminLoginScreen();
    }
  });

  $(document).on("click", "#openAdminLogin", function (e) {
    e.preventDefault();
    $("#adminModal").show().attr("aria-hidden", "false");
    $("body").addClass("modal-open");
    if (localStorage.getItem("portfolio_admin_logged_in") === "true") {
      showAdminDashboard();
    } else {
      showAdminLoginScreen();
    }
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

  // Admin Logout Handler
  $(document).on("click", "#adminLogoutBtn, #adminLogoutBtnHeader", async function () {
    if (confirm("Are you sure you want to log out of the Admin Dashboard?")) {
      if (isFirebaseConfigured() && auth) {
        try { await signOut(auth); } catch (e) { }
      }
      localStorage.removeItem("portfolio_admin_logged_in");
      showAdminLoginScreen();
      alert("✓ Logged out successfully.");
    }
  });

  // Admin Login Handler
  $("#adminLoginForm").on("submit", async function (e) {
    e.preventDefault();
    const email = $("#admin-email").val().trim();
    const key = $("#admin-key").val().trim();
    const $error = $("#admin-error");
    $error.hide();

    // Secret master password fallback
    if (key === "admin123" || key === "hossain" || (email === "hossainahammed627@gmail.com" && key === "admin123")) {
      localStorage.setItem("portfolio_admin_logged_in", "true");
      showAdminDashboard();
      return;
    }

    if (isFirebaseConfigured() && auth) {
      try {
        await signInWithEmailAndPassword(auth, email, key);
        localStorage.setItem("portfolio_admin_logged_in", "true");
        showAdminDashboard();
      } catch (err) {
        $error.text("Invalid login credentials. Please verify your email and password.").show();
      }
    } else {
      $error.text("Invalid credentials. Please verify your email and password.").show();
    }
  });

  // Toggle Admin Password Mask / Unmask
  $(document).on("click", "#toggleAdminPassword", function () {
    const $input = $("#admin-key");
    const type = $input.attr("type") === "password" ? "text" : "password";
    $input.attr("type", type);
    $(this).toggleClass("fa-eye fa-eye-slash");
  });

  // Forgot Password Navigation
  $("#btnOpenForgotModal").on("click", function () {
    $("#admin-login-step").hide();
    $("#admin-reset-step").fadeIn(200);
    $("#reset-status-msg").hide();
  });

  $("#btnBackToLogin").on("click", function () {
    $("#admin-reset-step").hide();
    $("#admin-login-step").fadeIn(200);
    $("#admin-error").hide();
  });

  // Send Password Reset Link Handler
  $("#adminResetForm").on("submit", async function (e) {
    e.preventDefault();
    const email = $("#reset-admin-email").val().trim();
    const $msg = $("#reset-status-msg");
    $msg.hide();

    if (!email) return;

    if (isFirebaseConfigured() && auth) {
      try {
        await sendPasswordResetEmail(auth, email);
        $msg.text("✓ Password reset email sent to " + email + "! Please check your inbox (and spam folder).").css("color", "#22c55e").fadeIn();
      } catch (err) {
        console.warn("Reset email error:", err);
        if (err.code === "auth/user-not-found") {
          $msg.text("⚠️ Email not registered in Firebase Auth. Please create user '" + email + "' in Firebase Console > Auth > Users tab first!").css("color", "#eab308").fadeIn();
        } else {
          $msg.text("✓ Password reset request submitted for " + email + ". Check your email inbox.").css("color", "#22c55e").fadeIn();
        }
      }
    } else {
      $msg.text("✓ Password reset simulated: Email sent to " + email + ".").css("color", "#22c55e").fadeIn();
    }
  });

  // Admin Logout Handler
  $("#adminLogoutBtn").on("click", async function () {
    if (isFirebaseConfigured() && auth) {
      try {
        await signOut(auth);
      } catch (err) { }
    }
    localStorage.removeItem("portfolio_admin_logged_in");
    showAdminLoginScreen();
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
      live: "#",
      playstore: "https://play.google.com/store/apps/details?id=com.zdenko_dikic.sova",
      imageFolder: "images/Sova/",
      images: "1 21.png,2 8.png,3 21.png,4 1.png,5 1.png,6 1.png,7 1.png,8 1.png",
      features: [
        "Live club & event discovery with ticket booking",
        "Real-time DJ song requests & fee status",
        "Club communities, group creation & reward coins"
      ]
    },
    {
      id: "flutter-digital-khanqah",
      title: "Digital Khanqah — Islamic App",
      category: "flutter",
      badge: "both",
      image: "images/maroofkhan/1.png",
      desc: "Fragmented access to authentic Islamic learning, daily prayer tracking, Quran recitations, and AI spiritual guidance in a single mobile experience.",
      tech: "Flutter, Dart, GetX, REST API, AI Integration, Audio Players, Geolocator",
      live: "#",
      playstore: "https://play.google.com/store/apps/details?id=com.digital.khanqah&hl=en",
      imageFolder: "images/maroofkhan/",
      images: "1.png,2.png,3.png,4.png,5.png,6.png,7.png,8.png,9.png,10.png,11.png,12.png,13.png,14.png,15.png,16.png",
      features: [
        "AI Murshid for voice & text spiritual Q&A guidance",
        "Full Al-Quran recitations, Hadiths, Duas & 99 Names of Allah",
        "Location-aware Prayer Times, daily logger & Sufism meditation"
      ]
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
      appetize: "#",
      imageFolder: "images/yes_twic/",
      images: "1.png,2.png,3.png,4.png,5.png,6.png,7.png,8.png,9.png,10.png,11.png,12.png,13.png,14.png,15.png",
      features: [
        "Daily athletic training logging & workout routines",
        "Recovery check-ins & body readiness score analytics",
        "Interactive calendar scheduling & performance reporting"
      ]
    },
    {
      id: "flutter-smartplan",
      title: "SmartPlan — AI Study Planner",
      category: "flutter",
      badge: "client",
      image: "images/SmartPlanAi/2.png",
      desc: "Inefficient study schedules, lack of automated task breakdown, and poor time management for students.",
      tech: "Flutter, Dart, Provider, OpenAI API, SQLite",
      live: "#",
      appetize: "#",
      github: "https://github.com/hossainahammed/SmartPlan-AI-Study-Planner",
      imageFolder: "images/SmartPlanAi/",
      images: "1.png,2.png,3.png,4.png,5.png,6.png,7.png,8.png,9.png,10.png,11.png,12.png,13.png,14.png,15.png,16.png,17.png,18.png,19.png,20.png,21.png,22.png",
      features: [
        "AI-powered study schedule generator",
        "Task breakdown & deadline reminders",
        "Progress analytics dashboard"
      ]
    },
    {
      id: "flutter-expense",
      title: "Expense Tracker App",
      category: "flutter",
      badge: "team",
      image: "images/ExpensesTracker/1.png",
      desc: "Manual budget tracking and difficulty visualizing daily spending habits.",
      tech: "Flutter, Dart, Hive DB, Fl Chart",
      live: "#",
      appetize: "#",
      github: "https://github.com/hossainahammed/Expense-Tracker-App",
      imageFolder: "images/ExpensesTracker/",
      images: "1.png,2.png,3.png,4.png,5.png,6.png,7.png,8.png,9.png,11.png,12.png,13.png,14.png,15.png",
      features: [
        "Daily income & expense logging with categories",
        "Visual spending breakdown via dynamic charts",
        "Local offline storage using Hive"
      ]
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

  function normalizeCategory(cat) {
    if (!cat) return "flutter";
    const c = String(cat).toLowerCase().trim();
    if (c === "web" || c === "web-projects" || c.includes("web")) return "web";
    if (c === "php" || c === "php-projects" || c.includes("php")) return "php";
    return "flutter";
  }

  function getCardCategoryFromDOM($card) {
    const dataCat = $card.attr("data-category");
    if (dataCat) return normalizeCategory(dataCat);
    if ($card.closest("#web-projects").length) return "web";
    if ($card.closest("#php-projects").length) return "php";
    return "flutter";
  }

  function createProjectCardHtml(proj) {
    const id = proj.id || "proj-" + Math.random().toString(36).substr(2, 5);
    const title = proj.title || "Untitled Project";
    const category = normalizeCategory(proj.category);
    const badge = proj.badge || "";
    const image = proj.image || "images/SmartPlanAi/2.png";
    const desc = proj.desc || "";
    const tech = proj.tech || "";
    const playstore = proj.playstore || proj.playstoreurl || "";
    const appetize = proj.appetize || proj.appetizeurl || "";
    const apk = proj.apk || proj.apkurl || "";
    const github = proj.github || proj.codeurl || "";
    const live = proj.live || proj.liveurl || "";
    const images = proj.images || "";
    const imageFolder = proj.imageFolder || proj.image_folder || "";
    // codeType: 'open' = show Code button with link, 'locked' = show Locked Code button
    const codeType = proj.codeType || (github && github !== "#" ? "open" : "locked");
    let features = proj.features || [];
    if (typeof features === "string") {
      // Parse from newline-separated or comma-separated string
      features = features.split(/[\n,]/).map(f => f.trim()).filter(Boolean);
    }

    let techPillsHtml = "";
    if (tech) {
      techPillsHtml = tech.split(",").map(t => `<span class="tech-pill">${t.trim()}</span>`).join(" ");
    }

    let badgeHtml = "";
    if (badge === "client") badgeHtml = '<span class="client-badge"><i class="fas fa-user-shield"></i> Client Project</span>';
    else if (badge === "team") badgeHtml = '<span class="team-badge"><i class="fas fa-users"></i> Team Project</span>';
    else if (badge === "both") badgeHtml = '<span class="team-badge"><i class="fas fa-users"></i> Team Project</span> <span class="client-badge"><i class="fas fa-user-shield"></i> Client Project</span>';
    else if (badge === "solo") badgeHtml = '<span class="solo-badge"><i class="fas fa-user"></i> Personal</span>';

    let featuresHtml = "";
    if (Array.isArray(features) && features.length > 0) {
      featuresHtml = `<ul class="proj-features">${features.map(f => `<li>${f}</li>`).join("")}</ul>`;
    }

    let linksHtml = "";
    // Row 1: Live / Play Store / Appetize
    linksHtml += `<span class="proj-link-btn live-btn"><i class="fas fa-play"></i> Live</span>`;
    if (playstore && playstore !== "#") {
      linksHtml += `<a href="${playstore}" target="_blank" rel="noopener" class="proj-link-btn playstore-btn" onclick="event.stopPropagation();"><i class="fab fa-google-play"></i> Play Store</a>`;
    } else {
      linksHtml += `<span class="proj-link-btn appetize-btn"><i class="fas fa-mobile-alt"></i> Appetize</span>`;
    }

    // Row 2: Source Code button — controlled by codeType
    if (codeType === "open" && github && github !== "#") {
      linksHtml += `<a href="${github}" target="_blank" rel="noopener" class="proj-link-btn code-btn full-width" onclick="event.stopPropagation();"><i class="fab fa-github"></i> Code</a>`;
    } else {
      linksHtml += `<span class="proj-link-btn client-code-btn full-width" onclick="event.stopPropagation();"><i class="fas fa-lock"></i> Locked Code</span>`;
    }

    return `
      <div class="project-card reveal active" data-id="${id}" data-category="${category}" data-title="${title}" data-liveurl="${live || '#'}" data-playstoreurl="${playstore || '#'}" data-apkurl="${apk || '#'}" data-image-folder="${imageFolder}" data-images="${images}">
        <div class="project-img-wrapper">
          ${badgeHtml}
          <img src="${image}" alt="${title}" onerror="this.onerror=null; this.src='images/SmartPlanAi.png'" />
        </div>
        <div class="project-info-body">
          <div class="proj-title">${title}</div>
          <div class="proj-meta">
            <p class="proj-desc"><strong>Problem Solved:</strong> ${desc}</p>
            <div class="proj-tech">${techPillsHtml}</div>
            ${featuresHtml}
          </div>
        </div>
        <div class="project-links">
          ${linksHtml}
        </div>
      </div>
    `;
  }

  function getCategoryGrid(category) {
    const cat = normalizeCategory(category);
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

  function renderProjectsToDOM(projects, forceUpdate = false) {
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
      if (deletedIds.has(projId) || (proj.title && proj.title.toLowerCase().includes("dummy"))) {
        $(`.project-card[data-id="${projId}"]`).remove();
        return;
      }

      const cat = normalizeCategory(proj.category);
      const $targetGrid = getCategoryGrid(cat);
      if (!$targetGrid.length) return;

      const $existing = $(`.project-card[data-id="${projId}"]`);
      const cardHtml = createProjectCardHtml({ ...proj, id: projId, category: cat });

      if ($existing.length > 0) {
        // If card is currently inside the wrong category grid (e.g. previously misclassified)
        if ($existing.parent()[0] !== $targetGrid[0]) {
          $existing.remove();
          $targetGrid.prepend(cardHtml);
        } else {
          $existing.replaceWith(cardHtml);
        }
      } else {
        $targetGrid.prepend(cardHtml);
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
    // 1. Initial local cache render with category normalization
    let localCache = JSON.parse(localStorage.getItem("custom_portfolio_projects") || "[]");
    if (Array.isArray(localCache) && localCache.length > 0) {
      localCache = localCache.map(p => ({ ...p, category: normalizeCategory(p.category) }));
      localProjectsCache = localCache;
      localStorage.setItem("custom_portfolio_projects", JSON.stringify(localCache));
      renderProjectsToDOM(localCache);
    }

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

    // Collect DOM projects (with full data)
    const domProjects = [];
    $(".projects-grid .project-card").each(function () {
      const $card = $(this);
      const id = $card.attr("data-id");
      if (id && !deletedIds.has(id)) {
        let rawFeatures = [];
        $card.find(".proj-features li").each(function () { rawFeatures.push($(this).text()); });
        const githubHref = $card.find("a.code-btn").attr("href") || "";
        domProjects.push({
          id: id,
          title: $card.attr("data-title") || $card.find(".proj-title").text() || "Untitled Project",
          category: getCardCategoryFromDOM($card),
          image: $card.find(".project-img-wrapper img").attr("src") || "",
          desc: $card.find(".proj-desc").text().replace("Problem Solved:", "").trim(),
          badge: $card.find(".client-badge").length && $card.find(".team-badge").length ? "both" :
            $card.find(".client-badge").length ? "client" :
              $card.find(".team-badge").length ? "team" :
                $card.find(".solo-badge").length ? "solo" : "",
          codeType: $card.find("a.code-btn").length ? "open" : "locked",
          github: githubHref && githubHref !== "#" ? githubHref : "",
          features: rawFeatures
        });
      }
    });

    // Dedupe: localProjectsCache takes priority (has full data)
    const seen = new Set();
    const allProjects = [];
    [...localProjectsCache, ...domProjects].forEach((p) => {
      const key = p.id || p.title;
      if (key && !seen.has(key) && !deletedIds.has(key)) {
        seen.add(key);
        allProjects.push({
          ...p,
          category: normalizeCategory(p.category)
        });
      }
    });

    if (!allProjects.length) {
      $list.html('<p style="color: var(--text-sec); font-size: 13px;">No project items found.</p>');
      return;
    }

    // Group by category
    const groups = {
      flutter: { label: "📱 Flutter / Mobile Apps", icon: "fa-mobile-alt", projects: [] },
      web: { label: "🌐 Web Applications", icon: "fa-globe", projects: [] },
      php: { label: "🖥️ Backend & API", icon: "fa-server", projects: [] }
    };

    allProjects.forEach(proj => {
      const cat = (proj.category || "flutter").toLowerCase();
      if (groups[cat]) groups[cat].projects.push(proj);
      else groups.flutter.projects.push(proj);
    });

    Object.entries(groups).forEach(([cat, group]) => {
      if (!group.projects.length) return;

      // Section heading
      $list.append(`
        <div class="admin-proj-section-header" style="
          display: flex; align-items: center; gap: 10px;
          margin: 20px 0 10px; padding: 10px 14px;
          background: var(--card-bg); border-left: 3px solid var(--primary-color);
          border-radius: 8px; font-weight: 700; font-size: 14px;
        ">
          <i class="fas ${group.icon}" style="color: var(--primary-color);"></i>
          ${group.label}
          <span style="margin-left: auto; background: var(--primary-color); color: #fff;
            font-size: 11px; padding: 2px 8px; border-radius: 20px; font-weight: 600;">
            ${group.projects.length}
          </span>
        </div>
      `);

      group.projects.forEach((proj) => {
        const codeLabel = proj.codeType === "open" || proj.github ? "🔓 Code" : "🔒 Locked";
        const badgeLabel = proj.badge === "client" ? "Client" :
          proj.badge === "team" ? "Team" :
            proj.badge === "both" ? "Client+Team" :
              proj.badge === "solo" ? "Personal" : "";
        const cardHtml = `
          <div class="admin-item-card" data-proj-id="${proj.id}" style="border-left: 2px solid var(--border-card);">
            <div style="flex: 1; min-width: 0;">
              <div class="admin-item-title" style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                ${proj.title}
                ${badgeLabel ? `<span style="font-size: 10px; padding: 2px 7px; border-radius: 12px; background: rgba(56,189,248,0.15); color: var(--primary-color); font-weight: 600;">${badgeLabel}</span>` : ""}
                <span style="font-size: 10px; padding: 2px 7px; border-radius: 12px; background: rgba(100,100,100,0.15); color: var(--text-sec); font-weight: 600;">${codeLabel}</span>
              </div>
              <div class="admin-item-meta" style="margin-top: 4px;">${(proj.desc || "").substring(0, 80)}${(proj.desc || "").length > 80 ? "…" : ""}</div>
            </div>
            <div class="admin-item-actions" style="display: flex; gap: 4px; flex-shrink: 0; align-items: center;">
              <button class="admin-action-btn cancel-btn small btn-move-proj-up" data-id="${proj.id}" title="Move Up in order"><i class="fas fa-arrow-up"></i></button>
              <button class="admin-action-btn cancel-btn small btn-move-proj-down" data-id="${proj.id}" title="Move Down in order"><i class="fas fa-arrow-down"></i></button>
              <button class="admin-action-btn primary-btn small btn-edit-proj" data-id="${proj.id}"><i class="fas fa-edit"></i> Edit</button>
              <button class="admin-action-btn danger-btn small btn-delete-proj" data-id="${proj.id}"><i class="fas fa-trash"></i></button>
            </div>
          </div>
        `;
        $list.append(cardHtml);
      });
    });
  }

  // Open Add Project Form
  $("#btnOpenAddProject").on("click", function () {
    $("#portfolioProjectForm")[0].reset();
    $("#pf-id").val("");
    $("#pf-image-preview").hide();
    $("#projectFormTitle").html('<i class="fas fa-plus"></i> Add New Portfolio Project');
    $("#btnSaveProject").html('<i class="fas fa-save"></i> Save Project');
    $("#projectFormContainer").slideDown();
  });

  // Edit Project Handler — populate ALL fields from cache or DOM
  $(document).on("click", ".btn-edit-proj", function () {
    const projId = $(this).attr("data-id");
    if (!projId) return;

    let proj = localProjectsCache.find(p => p.id === projId);
    if (!proj) {
      const $card = $(`.project-card[data-id="${projId}"]`);
      if ($card.length) {
        const githubHref = $card.find("a.code-btn").attr("href") || "";
        let rawFeatures = [];
        $card.find(".proj-features li").each(function () { rawFeatures.push($(this).text()); });
        proj = {
          id: projId,
          title: $card.attr("data-title") || $card.find(".proj-title").text() || "",
          category: getCardCategoryFromDOM($card),
          badge: $card.find(".client-badge").length && $card.find(".team-badge").length ? "both" :
            $card.find(".client-badge").length ? "client" :
              $card.find(".team-badge").length ? "team" :
                $card.find(".solo-badge").length ? "solo" : "",
          image: $card.find(".project-img-wrapper img").attr("src") || "",
          desc: $card.find(".proj-desc").text().replace("Problem Solved:", "").trim(),
          tech: $card.find(".tech-pill").map(function () { return $(this).text(); }).get().join(", "),
          features: rawFeatures,
          codeType: $card.find("a.code-btn").length ? "open" : "locked",
          playstore: $card.attr("data-playstoreurl") && $card.attr("data-playstoreurl") !== "#" ? $card.attr("data-playstoreurl") : "",
          apk: $card.attr("data-apkurl") && $card.attr("data-apkurl") !== "#" ? $card.attr("data-apkurl") : "",
          github: githubHref && githubHref !== "#" ? githubHref : "",
          live: $card.attr("data-liveurl") && $card.attr("data-liveurl") !== "#" ? $card.attr("data-liveurl") : "",
          imageFolder: $card.attr("data-image-folder") || "",
          images: $card.attr("data-images") || ""
        };
      }
    }

    if (!proj) { alert("Project data not found!"); return; }

    // Populate all fields
    $("#pf-id").val(proj.id);
    $("#pf-title").val(proj.title || "");
    $("#pf-category").val(proj.category || "flutter");
    $("#pf-badge").val(proj.badge || "");
    $("#pf-image").val(proj.image || "");
    $("#pf-desc").val(proj.desc || "");
    // Features: join array to newline-separated text
    const featArray = Array.isArray(proj.features)
      ? proj.features
      : (typeof proj.features === "string" ? proj.features.split(/[\n,]/).map(f => f.trim()).filter(Boolean) : []);
    $("#pf-features").val(featArray.join("\n"));
    $("#pf-tech").val(proj.tech || "");
    $("#pf-images").val(proj.images || "");
    $("#pf-image-folder").val(proj.imageFolder || proj.image_folder || "");
    // Code type: determine from codeType field or fallback
    const codeType = proj.codeType || (proj.github && proj.github !== "#" ? "open" : "locked");
    $("#pf-code-type").val(codeType);
    $("#pf-github").val(proj.github || proj.codeurl || "");
    $("#pf-playstore").val(proj.playstore || proj.playstoreurl || "");
    $("#pf-apk").val(proj.apk || proj.apkurl || "");
    $("#pf-live").val(proj.live || proj.liveurl || "");

    if (proj.image) {
      $("#pf-image-preview").attr("src", proj.image).show();
    } else {
      $("#pf-image-preview").hide();
    }

    $("#projectFormTitle").html('<i class="fas fa-edit"></i> Edit Portfolio Project');
    $("#btnSaveProject").html('<i class="fas fa-save"></i> Update Project');
    $("#projectFormContainer").slideDown();
    $("#projectFormContainer")[0].scrollIntoView({ behavior: "smooth", block: "nearest" });
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
    $("#portfolioProjectForm")[0].reset();
    $("#pf-id").val("");
  });

  // Save Project Handler (Create & Edit)
  $("#portfolioProjectForm").on("submit", async function (e) {
    e.preventDefault();

    const existingId = $("#pf-id").val().trim();
    const title = $("#pf-title").val().trim();
    const category = normalizeCategory($("#pf-category").val());
    const badge = $("#pf-badge").val();
    const image = $("#pf-image").val().trim();
    const desc = $("#pf-desc").val().trim();
    const tech = $("#pf-tech").val().trim();
    const images = $("#pf-images").val().trim();
    const imageFolder = $("#pf-image-folder").val().trim();
    // Always read codeType and github — codeType controls which button renders on card
    const codeType = $("#pf-code-type").val();
    const github = $("#pf-github").val().trim();
    const playstore = $("#pf-playstore").val().trim();
    const apk = $("#pf-apk").val().trim();
    const live = $("#pf-live").val().trim();

    // Parse features from newline-or-comma textarea
    const featuresRaw = $("#pf-features").val().trim();
    const features = featuresRaw
      ? featuresRaw.split(/[\n,]/).map(f => f.trim()).filter(Boolean)
      : [];

    const isEdit = Boolean(existingId);
    const projId = isEdit ? existingId : `proj-${Date.now()}`;

    const projObj = {
      id: projId,
      title, category, badge, image, desc, tech, features,
      codeType, github, playstore, apk, live, images, imageFolder
    };

    const newProjectCardHtml = createProjectCardHtml(projObj);
    const $targetGrid = getCategoryGrid(category);

    if (isEdit) {
      const $existingCard = $(`.project-card[data-id="${projId}"]`);
      if ($existingCard.length) {
        if ($existingCard.parent()[0] !== $targetGrid[0]) {
          $existingCard.remove();
          $targetGrid.prepend(newProjectCardHtml);
        } else {
          $existingCard.replaceWith(newProjectCardHtml);
        }
      } else {
        $targetGrid.prepend(newProjectCardHtml);
      }
    } else {
      $targetGrid.prepend(newProjectCardHtml);
    }
    $(".project-card").addClass("reveal active");

    // Save to Firestore if configured
    if (isFirebaseConfigured() && db) {
      try {
        if (isEdit) {
          await setDoc(doc(db, "projects", projId), {
            ...projObj, updatedAt: serverTimestamp()
          }, { merge: true });
        } else {
          await addDoc(collection(db, "projects"), {
            ...projObj, createdAt: serverTimestamp()
          });
        }
      } catch (err) {
        console.warn("Firestore project save warning:", err);
      }
    }

    // Save/Update LocalStorage cache
    const existingIdx = localProjectsCache.findIndex(p => p.id === projId);
    if (existingIdx !== -1) {
      localProjectsCache[existingIdx] = projObj;
    } else {
      localProjectsCache.unshift(projObj);
    }
    localStorage.setItem("custom_portfolio_projects", JSON.stringify(localProjectsCache));

    $("#projectFormContainer").slideUp();
    $("#portfolioProjectForm")[0].reset();
    $("#pf-id").val("");
    $("#pf-image-preview").hide();
    renderAdminProjects();
    alert(isEdit ? "\u2713 Project updated live!" : "\u2713 Project published live to portfolio!");
  });

  // Toggle GitHub input visibility based on code type
  $(document).on("change", "#pf-code-type", function () {
    if ($(this).val() === "open") {
      $("#pf-github-group").slideDown(150);
    } else {
      $("#pf-github-group").slideUp(150);
      $("#pf-github").val("");
    }
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
        } catch (e) {
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
      $(`.project-card[data-id="${projId}"]`).fadeOut(300, function () { $(this).remove(); });

      // 4. Filter local Projects Cache
      localProjectsCache = localProjectsCache.filter(p => p.id !== projId);
      localStorage.setItem("custom_portfolio_projects", JSON.stringify(localProjectsCache));

      // 5. Remove card from Admin list
      $(`.admin-item-card[data-proj-id="${projId}"]`).slideUp(200, function () { $(this).remove(); });
    }
  });

  /* ── Experience Counter: converts total months to decimal years display string (e.g. 15 mos -> 1.3 Years+) ── */
  function formatExperienceFromMonths(totalMonths) {
    totalMonths = parseFloat(totalMonths) || 0;
    if (totalMonths <= 0) return "0 Days";
    if (totalMonths < 12) {
      return `${totalMonths} ${totalMonths === 1 ? "Month" : "Months"}+`;
    }
    const yrsNum = totalMonths / 12;
    const yrsStr = yrsNum.toFixed(1).replace(/\.0$/, "");
    return `${yrsStr} Year+`;
  }

  /* ── Animated count-up for experience: 0 days → months → years ── */
  function animateExperienceCounter($el, totalMonths) {
    totalMonths = parseInt(totalMonths, 10) || 0;
    if (totalMonths <= 0) { $el.text("0 Days"); return; }

    // Total "units" to count through: days portion (0→29) then months (0→totalMonths)
    const totalDays = totalMonths * 30; // approximate days for animation range
    const duration = 1800;
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentDays = Math.floor(easeProgress * totalDays);
      const currentMonths = Math.floor(currentDays / 30);
      const remainingDays = currentDays % 30;

      if (currentMonths === 0) {
        // Show days phase
        $el.text(currentDays + " Days");
      } else {
        // Show months/years phase
        $el.text(formatExperienceFromMonths(currentMonths));
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        // Final value
        $el.text(formatExperienceFromMonths(totalMonths));
      }
    }
    requestAnimationFrame(step);
  }

  function updateExperienceDisplay(totalMonths) {
    const $expEl = $(".stat-exp");
    if (!$expEl.length) return;
    const months = parseInt(totalMonths || localStorage.getItem("stat_exp_months") || $expEl.attr("data-exp-months") || "30", 10);
    $expEl.attr("data-exp-months", months);
    $expEl.text(formatExperienceFromMonths(months));
  }

  // Initial call on script load
  updateExperienceDisplay();



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
      } catch (err) { }
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

  // Standalone function to update stat DOM values and run animation
  function applyStatsToDOM(comp, deliv, pub, expMonths) {
    const $statEls = $(".stat-number[data-target]");

    // 1. Set data-target attributes before animating
    $statEls.eq(0).attr("data-target", comp).attr("data-suffix", "+");
    $statEls.eq(1).attr("data-target", deliv).attr("data-suffix", "+");
    $statEls.eq(2).attr("data-target", pub).attr("data-suffix", "+");

    // 2. Animate numeric counters from 0 to target
    $statEls.each(function () {
      const $el = $(this);
      const target = parseInt($el.attr("data-target"), 10);
      if (isNaN(target)) return;
      const suffix = $el.attr("data-suffix") || "+";
      const duration = 1400;
      const startTime = performance.now();

      function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentVal = Math.floor(easeProgress * target);
        $el.text(currentVal + suffix);
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          $el.text(target + suffix);
        }
      }
      requestAnimationFrame(step);
    });

    // 3. Animate experience counter (0 days → months → years)
    const $expEl = $(".stat-exp");
    if ($expEl.length) {
      $expEl.attr("data-exp-months", expMonths);
      animateExperienceCounter($expEl, expMonths);
    }
  }

  function initStatsCounter() {
    const $statsSection = $("#stats");
    if (!$statsSection.length) return;

    let animated = false;

    window.triggerStatsAnimation = function (forceReset = false) {
      if (animated && !forceReset) return;
      animated = true;

      const comp = localStorage.getItem("stat_completed") || "30";
      const deliv = localStorage.getItem("stat_delivered") || "15";
      const pub = localStorage.getItem("stat_published") || "5";
      const expMonths = localStorage.getItem("stat_exp_months") || $(".stat-exp").attr("data-exp-months") || "30";

      applyStatsToDOM(comp, deliv, pub, expMonths);
    };

    if ("IntersectionObserver" in window) {
      const statsObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              window.triggerStatsAnimation();
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );
      statsObserver.observe($statsSection[0]);
    } else {
      window.triggerStatsAnimation();
    }
  }

  // Initialize real-time backend data synchronization for all portfolio sections
  syncProjectsFromBackend();
  syncShowcaseFromBackend();
  syncHeroAboutFromBackend();
  syncCodeMorphFromBackend();
  syncOrbitFromBackend();
  syncServicesFromBackend();
  syncSkillsFromBackend();
  syncStatsFromBackend();
  syncSocialContactFromBackend();

  initStatsCounter();

  // Tab Navigation in Admin Modal
  $(".admin-tab-btn").on("click", function () {
    const targetTab = $(this).attr("data-tab");
    $(".admin-tab-btn").removeClass("active");
    $(this).addClass("active");
    $(".admin-tab-content").hide();
    $("#" + targetTab).fadeIn(150);

    if (targetTab === "tab-projects") renderAdminProjects();
    else if (targetTab === "tab-hero-about") loadAdminHeroAbout();
    else if (targetTab === "tab-code-orbit") { renderAdminCodeMorphList(); loadAdminOrbit(); }
    else if (targetTab === "tab-services") renderAdminServices();
    else if (targetTab === "tab-skills") renderAdminSkills();
    else if (targetTab === "tab-stats") loadAdminStats();
    else if (targetTab === "tab-social") loadAdminSocialContact();
    else if (targetTab === "tab-inbox") renderAdminInbox();
  });

  /* ============================================================
     Full Portfolio Section Sync Engine & Admin Handlers
     ============================================================ */

  // 0. Upcoming App Showcase Manager & Engine


  function renderFlutterShowcase(images, appTitle) {
    const $showcase = $("#flutterShowcase");
    if (!$showcase.length) return;

    if (!images || !images.length) {
      $showcase.hide();
      return;
    }
    $showcase.show();

    let currentIndex = 0;
    const total = images.length;
    $showcase.empty();

    const $inner = $('<div class="showcase-inner"></div>');
    const $header = $(
      '<div class="showcase-header">' +
      '<span class="showcase-app-label"><i class="fab fa-flutter showcase-flutter-icon"></i> ' + (appTitle || "Upcoming App") + '</span>' +
      '<span class="showcase-counter"><span class="sc-cur">1</span> / <span class="sc-tot">' + total + '</span></span>' +
      '</div>'
    );
    const $strip = $('<div class="showcase-strip"></div>');

    images.forEach((src, idx) => {
      const $phone = $(
        '<div class="sc-phone' + (idx === 0 ? ' sc-active' : '') + '">' +
        '<div class="sc-phone-notch"></div>' +
        '<div class="sc-phone-screen"><img src="' + src + '" alt="Screenshot ' + (idx + 1) + '" loading="lazy"/></div>' +
        '<div class="sc-phone-bar"></div>' +
        '</div>'
      );
      $phone.on("click", function () {
        goTo(idx);
        resetTimer();
      });
      $strip.append($phone);
    });

    const $prevBtn = $('<button class="sc-arrow sc-arrow-prev" aria-label="Previous"><i class="fas fa-chevron-left"></i></button>');
    const $nextBtn = $('<button class="sc-arrow sc-arrow-next" aria-label="Next"><i class="fas fa-chevron-right"></i></button>');

    $prevBtn.on("click", function () {
      goTo(currentIndex - 1);
      resetTimer();
    });
    $nextBtn.on("click", function () {
      goTo(currentIndex + 1);
      resetTimer();
    });

    const $dots = $('<div class="sc-dots"></div>');
    images.forEach((src, idx) => {
      const $dot = $('<button class="sc-dot' + (idx === 0 ? ' sc-dot-active' : '') + '"></button>');
      $dot.on("click", function () {
        goTo(idx);
        resetTimer();
      });
      $dots.append($dot);
    });

    const $hint = $('<div class="showcase-hint"><i class="fas fa-expand-arrows-alt"></i> Click any screenshot to preview in phone slider</div>');

    $inner.append($header, $strip, $prevBtn, $nextBtn, $dots, $hint);
    $showcase.append($inner);

    function goTo(idx) {
      currentIndex = (idx % total + total) % total;
      const $phones = $strip.find(".sc-phone");
      $phones.removeClass("sc-active sc-prev sc-next");

      $phones.eq(currentIndex).addClass("sc-active");
      $phones.eq((currentIndex - 1 + total) % total).addClass("sc-prev");
      $phones.eq((currentIndex + 1) % total).addClass("sc-next");

      $dots.find(".sc-dot").removeClass("sc-dot-active").eq(currentIndex).addClass("sc-dot-active");
      $header.find(".sc-cur").text(currentIndex + 1);
    }

    function resetTimer() {
      if (autoShowcaseTimer) clearInterval(autoShowcaseTimer);
      if (total > 1) {
        autoShowcaseTimer = setInterval(function () {
          goTo(currentIndex + 1);
        }, 3000);
      }
    }

    let touchStartX = 0;
    $strip.off("touchstart touchend").on("touchstart", function (e) {
      if (e.originalEvent && e.originalEvent.touches) {
        touchStartX = e.originalEvent.touches[0].clientX;
      }
    }).on("touchend", function (e) {
      if (e.originalEvent && e.originalEvent.changedTouches) {
        const touchEndX = e.originalEvent.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 40) {
          if (diff > 0) goTo(currentIndex + 1);
          else goTo(currentIndex - 1);
          resetTimer();
        }
      }
    });

    goTo(0);
    resetTimer();
  }

  function syncShowcaseFromBackend() {
    const applyShowcase = (data) => {
      const $showcase = $("#flutterShowcase");
      if (!$showcase.length) return;

      const defaultImages = "1.png,2.png,3.png,4.png,5.png,6.png,7.png,8.png,9.png,10.png,11.png,12.png,13.png";
      const title = (data && data.title && data.title.trim().length > 0) ? data.title.trim() : "Upcoming App";
      const folder = (data && data.folder && data.folder.trim().length > 0) ? data.folder.trim() : "images/Upcoming_APP/";
      const rawImages = (data && data.images && data.images.trim().length > 0) ? data.images.trim() : defaultImages;

      const imageList = rawImages.split(",").map(img => {
        const trimmed = img.trim();
        if (!trimmed) return null;
        return /^https?:/i.test(trimmed) || trimmed.startsWith("/") ? trimmed : folder + trimmed;
      }).filter(Boolean);

      renderFlutterShowcase(imageList, title);
    };

    const saved = localStorage.getItem("settings_upcoming_showcase");
    if (saved) {
      try { applyShowcase(JSON.parse(saved)); } catch (e) { }
    } else {
      applyShowcase(null);
    }

    if (isFirebaseConfigured() && db) {
      try {
        onSnapshot(doc(db, "settings", "upcoming_showcase"), (docSnap) => {
          if (docSnap.exists()) {
            localStorage.setItem("settings_upcoming_showcase", JSON.stringify(docSnap.data()));
            applyShowcase(docSnap.data());
          }
        }, (err) => console.warn("Firestore upcoming_showcase listener warning:", err));
      } catch (e) { }
    }
  }

  function renderShowcaseSerializer() {
    const $container = $("#showcaseSerializerContainer");
    if (!$container.length) return;
    $container.empty();

    const folder = $("#adminShowcaseFolder").val().trim() || "images/Upcoming_APP/";
    const rawImagesStr = $("#adminShowcaseImages").val().trim();
    if (!rawImagesStr) {
      $container.html('<p style="font-size: 12px; color: var(--text-sec);">No showcase screenshots added yet.</p>');
      return;
    }

    const items = rawImagesStr.split(",").map(s => s.trim()).filter(Boolean);

    items.forEach((file, idx) => {
      const src = /^https?:/i.test(file) || file.startsWith("/") || file.startsWith("data:") ? file : folder + file;
      const $tile = $(`
        <div class="sc-serializer-tile" data-idx="${idx}" style="
          position: relative; flex-shrink: 0; width: 90px; background: rgba(30,41,59,0.8);
          border: 1px solid var(--border-card); border-radius: 8px; padding: 6px; text-align: center;
        ">
          <div style="
            position: absolute; top: 4px; left: 4px; background: var(--primary-color);
            color: #fff; font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 10px; z-index: 2;
          ">#${idx + 1}</div>
          <img src="${src}" alt="Tile ${idx + 1}" style="width: 100%; height: 75px; object-fit: contain; border-radius: 4px; margin-bottom: 4px;" onerror="this.src='images/SmartPlanAi.png'" />
          <div style="font-size: 9px; color: var(--text-sec); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; margin-bottom: 4px;">${file.length > 15 ? file.substring(0, 12) + '...' : file}</div>
          <div style="display: flex; justify-content: center; gap: 3px;">
            <button type="button" class="btn-sc-move-left admin-action-btn cancel-btn small" data-idx="${idx}" style="padding: 2px 6px; font-size: 10px;" ${idx === 0 ? "disabled style='opacity:0.3; padding: 2px 6px; font-size: 10px;'" : ""} title="Move Left">&leftarrow;</button>
            <button type="button" class="btn-sc-move-right admin-action-btn cancel-btn small" data-idx="${idx}" style="padding: 2px 6px; font-size: 10px;" ${idx === items.length - 1 ? "disabled style='opacity:0.3; padding: 2px 6px; font-size: 10px;'" : ""} title="Move Right">&rightarrow;</button>
            <button type="button" class="btn-sc-delete admin-action-btn danger-btn small" data-idx="${idx}" style="padding: 2px 6px; font-size: 10px;" title="Remove">&times;</button>
          </div>
        </div>
      `);
      $container.append($tile);
    });
  }

  // Handle Move Left in Showcase Serializer
  $(document).on("click", ".btn-sc-move-left", function () {
    const idx = parseInt($(this).attr("data-idx"), 10);
    const items = $("#adminShowcaseImages").val().trim().split(",").map(s => s.trim()).filter(Boolean);
    if (idx > 0 && idx < items.length) {
      const temp = items[idx];
      items[idx] = items[idx - 1];
      items[idx - 1] = temp;
      $("#adminShowcaseImages").val(items.join(","));
      renderShowcaseSerializer();
    }
  });

  // Handle Move Right in Showcase Serializer
  $(document).on("click", ".btn-sc-move-right", function () {
    const idx = parseInt($(this).attr("data-idx"), 10);
    const items = $("#adminShowcaseImages").val().trim().split(",").map(s => s.trim()).filter(Boolean);
    if (idx >= 0 && idx < items.length - 1) {
      const temp = items[idx];
      items[idx] = items[idx + 1];
      items[idx + 1] = temp;
      $("#adminShowcaseImages").val(items.join(","));
      renderShowcaseSerializer();
    }
  });

  // Handle Delete in Showcase Serializer
  $(document).on("click", ".btn-sc-delete", function () {
    const idx = parseInt($(this).attr("data-idx"), 10);
    const items = $("#adminShowcaseImages").val().trim().split(",").map(s => s.trim()).filter(Boolean);
    if (idx >= 0 && idx < items.length) {
      items.splice(idx, 1);
      $("#adminShowcaseImages").val(items.join(","));
      renderShowcaseSerializer();
    }
  });

  // Handle Upload/Add Image to Showcase Serializer
  $(document).on("click", "#btnAddShowcaseFile", function () {
    const fileInput = document.getElementById("showcaseAddFileInput");
    if (fileInput && fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = function (evt) {
        const dataUrl = evt.target.result;
        const items = $("#adminShowcaseImages").val().trim().split(",").map(s => s.trim()).filter(Boolean);
        items.push(dataUrl);
        $("#adminShowcaseImages").val(items.join(","));
        renderShowcaseSerializer();
        fileInput.value = "";
      };
      reader.readAsDataURL(file);
    } else {
      const namePrompt = prompt("Enter image filename (e.g. 14.png) or full URL:");
      if (namePrompt && namePrompt.trim()) {
        const items = $("#adminShowcaseImages").val().trim().split(",").map(s => s.trim()).filter(Boolean);
        items.push(namePrompt.trim());
        $("#adminShowcaseImages").val(items.join(","));
        renderShowcaseSerializer();
      }
    }
  });

  $(document).on("input", "#adminShowcaseImages, #adminShowcaseFolder", function () {
    renderShowcaseSerializer();
  });

  // Move Project Up / Down Serializer Handlers
  $(document).on("click", ".btn-move-proj-up", function () {
    const id = $(this).attr("data-id");
    const idx = localProjectsCache.findIndex(p => p.id === id);
    if (idx > 0) {
      const temp = localProjectsCache[idx];
      localProjectsCache[idx] = localProjectsCache[idx - 1];
      localProjectsCache[idx - 1] = temp;
      localStorage.setItem("custom_portfolio_projects", JSON.stringify(localProjectsCache));
      renderProjectsToDOM(localProjectsCache);
      renderAdminProjects();
    }
  });

  $(document).on("click", ".btn-move-proj-down", function () {
    const id = $(this).attr("data-id");
    const idx = localProjectsCache.findIndex(p => p.id === id);
    if (idx >= 0 && idx < localProjectsCache.length - 1) {
      const temp = localProjectsCache[idx];
      localProjectsCache[idx] = localProjectsCache[idx + 1];
      localProjectsCache[idx + 1] = temp;
      localStorage.setItem("custom_portfolio_projects", JSON.stringify(localProjectsCache));
      renderProjectsToDOM(localProjectsCache);
      renderAdminProjects();
    }
  });

  $("#toggleShowcaseConfigBtn").on("click", function () {
    $("#adminShowcaseForm").slideToggle();
    const saved = localStorage.getItem("settings_upcoming_showcase");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.title) $("#adminShowcaseTitle").val(data.title);
        if (data.folder) $("#adminShowcaseFolder").val(data.folder);
        if (data.images) $("#adminShowcaseImages").val(data.images);
      } catch (e) { }
    }
    renderShowcaseSerializer();
  });

  $("#adminShowcaseForm").on("submit", async function (e) {
    e.preventDefault();
    const title = $("#adminShowcaseTitle").val().trim();
    const folder = $("#adminShowcaseFolder").val().trim();
    const images = $("#adminShowcaseImages").val().trim();

    const dataObj = { title, folder, images };
    localStorage.setItem("settings_upcoming_showcase", JSON.stringify(dataObj));

    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, "settings", "upcoming_showcase"), { ...dataObj, updatedAt: serverTimestamp() });
      } catch (err) { }
    }
    syncShowcaseFromBackend();
    alert("✓ Upcoming App Showcase config updated live!");
  });

  // 1. Hero & About Me Manager Sync
  function syncHeroAboutFromBackend() {
    const applyHeroAbout = (data) => {
      if (!data) return;
      const greeting = data.greeting || "Hello, my name is";
      const name = data.name || "Hossain Ahammed";
      const roles = data.roles || "Flutter Developer, Mobile App Specialist, Frontend Web Dev, Competitive Programmer";
      const heroIntro = data.heroIntro || "I specialize in crafting high-performance, cross-platform mobile applications...";
      const heroAvatarImg = data.heroAvatarImg || "images/banner.png";
      const heroBadge1 = data.heroBadge1 || "Flutter Dev";
      const heroBadge2 = data.heroBadge2 || "Full-Stack Dev";
      const aboutBio = data.aboutBio || "I’m a passionate problem solver...";
      const aboutImg = data.aboutImg || "images/profile-1.jpeg";
      const cvLink = data.cvLink || "https://drive.google.com/uc?export=download&id=1mdkyO72reTrHyIzkd8DbEBbvwZTDHnW2";

      localStorage.setItem("settings_hero_about", JSON.stringify(data));

      $("#home .text-1").text(greeting);
      $("#home .text-2").text(name);
      $("#about .text").html(`I'm ${name} and I'm a <span class="typing-2"></span>`);
      $(".hero-intro").text(heroIntro);
      if (heroAvatarImg) $("#hero-avatar-img").attr("src", heroAvatarImg);
      if (heroBadge1) $(".badge-flutter").html('<i class="fab fa-flutter"></i> ' + heroBadge1);
      if (heroBadge2) $(".badge-exp").html('<i class="fas fa-code"></i> ' + heroBadge2);
      $(".about-description").text(aboutBio);
      $("#about-profile-img, .about .column.left img").attr("src", aboutImg);
      $(".download-cv").attr("href", cvLink);
      $(".contact .icons .row").eq(0).find(".sub-title").text(name);
      $("#admin-trigger").text(name);

      const roleArray = roles.split(",").map(r => " " + r.trim());
      if (typeof Typed !== "undefined") {
        try {
          if (window.typedInstance1) window.typedInstance1.destroy();
          if (window.typedInstance2) window.typedInstance2.destroy();
          window.typedInstance1 = new Typed(".typing", { strings: roleArray, typeSpeed: 100, backSpeed: 60, loop: true });
          window.typedInstance2 = new Typed(".typing-2", { strings: roleArray, typeSpeed: 100, backSpeed: 60, loop: true });
        } catch (e) { }
      }
    };

    const saved = localStorage.getItem("settings_hero_about");
    if (saved) {
      try { applyHeroAbout(JSON.parse(saved)); } catch (e) { }
    }

    if (isFirebaseConfigured() && db) {
      try {
        onSnapshot(doc(db, "settings", "hero_about"), (docSnap) => {
          if (docSnap.exists()) applyHeroAbout(docSnap.data());
        }, (err) => console.warn("Firestore hero_about listener warning:", err));
      } catch (e) { }
    }
  }

  function loadAdminHeroAbout() {
    const saved = localStorage.getItem("settings_hero_about");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.greeting) $("#adminHeroGreeting").val(data.greeting);
        if (data.name) $("#adminHeroName").val(data.name);
        if (data.roles) $("#adminHeroRoles").val(data.roles);
        if (data.heroIntro) $("#adminHeroIntro").val(data.heroIntro);
        if (data.heroAvatarImg) {
          $("#adminHeroAvatarImgUrl").val(data.heroAvatarImg);
          $("#adminHeroAvatarImgPreview").attr("src", data.heroAvatarImg).show();
        }
        if (data.heroBadge1) $("#adminHeroBadge1").val(data.heroBadge1);
        if (data.heroBadge2) $("#adminHeroBadge2").val(data.heroBadge2);
        if (data.aboutBio) $("#adminAboutBio").val(data.aboutBio);
        if (data.aboutImg) {
          $("#adminAboutImgUrl").val(data.aboutImg);
          $("#adminAboutImgPreview").attr("src", data.aboutImg).show();
        }
        if (data.cvLink) $("#adminCvLink").val(data.cvLink);
      } catch (e) { }
    }
  }

  // Handle direct file upload for Hero Circle Avatar Image
  $(document).on("change", "#adminHeroAvatarImgFile", function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (evt) {
        const dataUrl = evt.target.result;
        $("#adminHeroAvatarImgUrl").val(dataUrl);
        $("#adminHeroAvatarImgPreview").attr("src", dataUrl).fadeIn();
      };
      reader.readAsDataURL(file);
    }
  });

  $(document).on("input", "#adminHeroAvatarImgUrl", function () {
    const val = $(this).val().trim();
    if (val) {
      $("#adminHeroAvatarImgPreview").attr("src", val).fadeIn();
    } else {
      $("#adminHeroAvatarImgPreview").hide();
    }
  });

  // Handle direct file upload for About Profile Image
  $(document).on("change", "#adminAboutImgFile", function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (evt) {
        const dataUrl = evt.target.result;
        $("#adminAboutImgUrl").val(dataUrl);
        $("#adminAboutImgPreview").attr("src", dataUrl).fadeIn();
      };
      reader.readAsDataURL(file);
    }
  });

  $(document).on("input", "#adminAboutImgUrl", function () {
    const val = $(this).val().trim();
    if (val) {
      $("#adminAboutImgPreview").attr("src", val).fadeIn();
    } else {
      $("#adminAboutImgPreview").hide();
    }
  });

  $("#adminHeroAboutForm").on("submit", async function (e) {
    e.preventDefault();
    const greeting = $("#adminHeroGreeting").val().trim();
    const name = $("#adminHeroName").val().trim();
    const roles = $("#adminHeroRoles").val().trim();
    const heroIntro = $("#adminHeroIntro").val().trim();
    const heroAvatarImg = $("#adminHeroAvatarImgUrl").val().trim();
    const heroBadge1 = $("#adminHeroBadge1").val().trim();
    const heroBadge2 = $("#adminHeroBadge2").val().trim();
    const aboutBio = $("#adminAboutBio").val().trim();
    const aboutImg = $("#adminAboutImgUrl").val().trim();
    const cvLink = $("#adminCvLink").val().trim();

    const dataObj = { greeting, name, roles, heroIntro, heroAvatarImg, heroBadge1, heroBadge2, aboutBio, aboutImg, cvLink };
    localStorage.setItem("settings_hero_about", JSON.stringify(dataObj));

    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, "settings", "hero_about"), { ...dataObj, updatedAt: serverTimestamp() });
      } catch (err) { }
    }
    syncHeroAboutFromBackend();
    alert("✓ Hero & About Me settings updated live!");
  });

  /* ============================================================
     Code → App Animation & Flutter Stack Orbit Manager & Engine
     ============================================================ */

  // 1. Sync Orbit Pills to DOM
  function syncOrbitFromBackend() {
    const applyOrbit = (arr) => {
      if (!Array.isArray(arr) || !arr.length) return;
      localOrbitCache = arr;
      localStorage.setItem("settings_flutter_orbit", JSON.stringify(arr));

      const $orbitContainer = $("#flutterStackOrbit");
      if (!$orbitContainer.length) return;
      $orbitContainer.empty();

      const iconMap = {
        flutter: "fab fa-flutter",
        dart: "fas fa-code",
        firebase: "fas fa-fire",
        "rest api": "fas fa-network-wired",
        git: "fab fa-github",
        github: "fab fa-github",
        "node.js": "fab fa-node-js",
        node: "fab fa-node-js",
        react: "fab fa-react",
        html: "fab fa-html5",
        css: "fab fa-css3-alt"
      };

      arr.forEach((tech, idx) => {
        const key = tech.toLowerCase().trim();
        const iconClass = iconMap[key] || "fas fa-microchip";
        const classIdx = (idx % 6) + 1;
        $orbitContainer.append(`
          <div class="orbit-item orbit-${classIdx}"><i class="${iconClass}"></i> ${tech}</div>
        `);
      });
    };

    const saved = localStorage.getItem("settings_flutter_orbit");
    if (saved) {
      try { applyOrbit(JSON.parse(saved)); } catch (e) { }
    } else {
      applyOrbit(localOrbitCache);
    }

    if (isFirebaseConfigured() && db) {
      try {
        onSnapshot(doc(db, "settings", "flutter_orbit"), (docSnap) => {
          if (docSnap.exists() && Array.isArray(docSnap.data().techs)) applyOrbit(docSnap.data().techs);
        }, (err) => console.warn("Firestore flutter_orbit listener warning:", err));
      } catch (e) { }
    }
  }

  // 2. Sync Code Morph Items from Backend
  function syncCodeMorphFromBackend() {
    const applyCodeMorph = (arr) => {
      if (!Array.isArray(arr) || !arr.length) return;
      localCodeMorphCache = arr;
      localStorage.setItem("settings_code_morph_items", JSON.stringify(arr));
      if ($("#tab-code-orbit").is(":visible")) renderAdminCodeMorphList();
    };

    const saved = localStorage.getItem("settings_code_morph_items");
    if (saved) {
      try { applyCodeMorph(JSON.parse(saved)); } catch (e) { }
    } else {
      localStorage.setItem("settings_code_morph_items", JSON.stringify(localCodeMorphCache));
    }

    if (isFirebaseConfigured() && db) {
      try {
        onSnapshot(doc(db, "settings", "code_morph_items"), (docSnap) => {
          if (docSnap.exists() && Array.isArray(docSnap.data().items)) applyCodeMorph(docSnap.data().items);
        }, (err) => console.warn("Firestore code_morph_items listener warning:", err));
      } catch (e) { }
    }
  }

  // 3. Render Admin Code Morph List
  function renderAdminCodeMorphList() {
    const $container = $("#adminCodeMorphList");
    if (!$container.length) return;
    $container.empty();

    if (!localCodeMorphCache.length) {
      $container.html('<p style="font-size: 13px; color: var(--text-sec);">No Code → App morph items configured.</p>');
      return;
    }

    localCodeMorphCache.forEach((item, idx) => {
      const isActive = item.active !== false;
      const $card = $(`
        <div class="admin-item-card" data-cm-id="${item.id}" style="border-left: 3px solid ${isActive ? '#22c55e' : 'var(--border-card)'};">
          <div style="display: flex; align-items: center; gap: 10px;">
            <input type="checkbox" class="chk-cm-active" data-id="${item.id}" ${isActive ? 'checked' : ''} title="Toggle active in animation loop" style="width: 16px; height: 16px; cursor: pointer;" />
            <img src="${item.image}" alt="${item.title}" style="width: 44px; height: 44px; border-radius: 8px; object-fit: cover;" onerror="this.src='images/SmartPlanAi.png'" />
          </div>
          <div style="flex: 1; min-width: 0; margin-left: 6px;">
            <div class="admin-item-title">${item.title} <span style="font-size: 11px; font-weight: normal; color: var(--text-sec);">(${item.filename})</span></div>
            <div class="admin-item-meta">${item.compileMsg || 'Compiling...'} • Status: <strong style="color: ${isActive ? '#22c55e' : '#ef4444'};">${isActive ? 'Active in Home Loop' : 'Hidden'}</strong></div>
          </div>
          <div class="admin-item-actions">
            <button type="button" class="btn-cm-move-up admin-action-btn cancel-btn small" data-id="${item.id}" title="Move Up" ${idx === 0 ? 'disabled style="opacity:0.3;"' : ''}>▲</button>
            <button type="button" class="btn-cm-move-down admin-action-btn cancel-btn small" data-id="${item.id}" title="Move Down" ${idx === localCodeMorphCache.length - 1 ? 'disabled style="opacity:0.3;"' : ''}>▼</button>
            <button type="button" class="btn-cm-edit admin-action-btn primary-btn small" data-id="${item.id}"><i class="fas fa-edit"></i> Edit</button>
            <button type="button" class="btn-cm-delete admin-action-btn danger-btn small" data-id="${item.id}"><i class="fas fa-trash-alt"></i></button>
          </div>
        </div>
      `);
      $container.append($card);
    });
  }

  function loadAdminOrbit() {
    $("#adminOrbitTechs").val(localOrbitCache.join(", "));
  }

  // Toggle active checkbox directly from Admin list
  $(document).on("change", ".chk-cm-active", async function () {
    const id = $(this).attr("data-id");
    const isChecked = $(this).is(":checked");
    const item = localCodeMorphCache.find(x => x.id === id);
    if (item) {
      item.active = isChecked;
      localStorage.setItem("settings_code_morph_items", JSON.stringify(localCodeMorphCache));
      if (isFirebaseConfigured() && db) {
        try {
          await setDoc(doc(db, "settings", "code_morph_items"), { items: localCodeMorphCache, updatedAt: serverTimestamp() });
        } catch (e) { }
      }
      renderAdminCodeMorphList();
    }
  });

  // Handle Edit Code Morph Item
  $(document).on("click", ".btn-cm-edit", function () {
    const id = $(this).attr("data-id");
    const item = localCodeMorphCache.find(x => x.id === id);
    if (item) {
      $("#cm-id").val(item.id);
      $("#cm-title").val(item.title || "");
      $("#cm-filename").val(item.filename || "");
      $("#cm-compileMsg").val(item.compileMsg || "");
      $("#cm-image").val(item.image || "");
      $("#cm-code").val(item.code || "");
      $("#cm-active").prop("checked", item.active !== false);
      if (item.image) $("#cm-image-preview").attr("src", item.image).show();
      else $("#cm-image-preview").hide();
      $("#codeMorphFormTitle").html('<i class="fas fa-edit"></i> Edit Code → App Morph Item');
      $("#codeMorphFormContainer").slideDown();
    }
  });

  // Handle Delete Code Morph Item
  $(document).on("click", ".btn-cm-delete", async function () {
    const id = $(this).attr("data-id");
    if (id && confirm("Delete this Code → App morphing item?")) {
      localCodeMorphCache = localCodeMorphCache.filter(x => x.id !== id);
      localStorage.setItem("settings_code_morph_items", JSON.stringify(localCodeMorphCache));
      if (isFirebaseConfigured() && db) {
        try {
          await setDoc(doc(db, "settings", "code_morph_items"), { items: localCodeMorphCache, updatedAt: serverTimestamp() });
        } catch (e) { }
      }
      renderAdminCodeMorphList();
    }
  });

  // Move Code Morph Item Up / Down
  $(document).on("click", ".btn-cm-move-up", async function () {
    const id = $(this).attr("data-id");
    const idx = localCodeMorphCache.findIndex(x => x.id === id);
    if (idx > 0) {
      const temp = localCodeMorphCache[idx];
      localCodeMorphCache[idx] = localCodeMorphCache[idx - 1];
      localCodeMorphCache[idx - 1] = temp;
      localStorage.setItem("settings_code_morph_items", JSON.stringify(localCodeMorphCache));
      if (isFirebaseConfigured() && db) {
        try {
          await setDoc(doc(db, "settings", "code_morph_items"), { items: localCodeMorphCache, updatedAt: serverTimestamp() });
        } catch (e) { }
      }
      renderAdminCodeMorphList();
    }
  });

  $(document).on("click", ".btn-cm-move-down", async function () {
    const id = $(this).attr("data-id");
    const idx = localCodeMorphCache.findIndex(x => x.id === id);
    if (idx >= 0 && idx < localCodeMorphCache.length - 1) {
      const temp = localCodeMorphCache[idx];
      localCodeMorphCache[idx] = localCodeMorphCache[idx + 1];
      localCodeMorphCache[idx + 1] = temp;
      localStorage.setItem("settings_code_morph_items", JSON.stringify(localCodeMorphCache));
      if (isFirebaseConfigured() && db) {
        try {
          await setDoc(doc(db, "settings", "code_morph_items"), { items: localCodeMorphCache, updatedAt: serverTimestamp() });
        } catch (e) { }
      }
      renderAdminCodeMorphList();
    }
  });

  // Open / Close Form Box
  $("#btnOpenAddCodeMorph").on("click", function () {
    $("#adminCodeMorphForm")[0].reset();
    $("#cm-id").val("");
    $("#cm-image-preview").hide();
    $("#cm-active").prop("checked", true);
    $("#codeMorphFormTitle").html('<i class="fas fa-plus"></i> Add Code → App Morphing Item');
    $("#codeMorphFormContainer").slideDown();
  });

  $("#btnCloseCodeMorphForm, #btnCancelCodeMorphForm").on("click", function () {
    $("#codeMorphFormContainer").slideUp();
    $("#adminCodeMorphForm")[0].reset();
    $("#cm-id").val("");
  });

  // Upload image handler
  $(document).on("change", "#cm-file-input", function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (evt) {
        const dataUrl = evt.target.result;
        $("#cm-image").val(dataUrl);
        $("#cm-image-preview").attr("src", dataUrl).fadeIn();
      };
      reader.readAsDataURL(file);
    }
  });

  $(document).on("input", "#cm-image", function () {
    const val = $(this).val().trim();
    if (val) $("#cm-image-preview").attr("src", val).fadeIn();
    else $("#cm-image-preview").hide();
  });

  // Save Code Morph Form
  $("#adminCodeMorphForm").on("submit", async function (e) {
    e.preventDefault();
    const id = $("#cm-id").val().trim();
    const title = $("#cm-title").val().trim();
    const filename = $("#cm-filename").val().trim();
    const compileMsg = $("#cm-compileMsg").val().trim();
    const image = $("#cm-image").val().trim();
    const code = $("#cm-code").val().trim();
    const active = $("#cm-active").is(":checked");

    const isEdit = !!id;
    const itemId = isEdit ? id : `cm-${Date.now()}`;
    const itemObj = { id: itemId, title, filename, compileMsg, image, code, active };

    if (isEdit) {
      const idx = localCodeMorphCache.findIndex(x => x.id === itemId);
      if (idx !== -1) localCodeMorphCache[idx] = itemObj;
      else localCodeMorphCache.unshift(itemObj);
    } else {
      localCodeMorphCache.unshift(itemObj);
    }

    localStorage.setItem("settings_code_morph_items", JSON.stringify(localCodeMorphCache));

    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, "settings", "code_morph_items"), { items: localCodeMorphCache, updatedAt: serverTimestamp() });
      } catch (err) { }
    }

    $("#codeMorphFormContainer").slideUp();
    $("#adminCodeMorphForm")[0].reset();
    $("#cm-id").val("");
    renderAdminCodeMorphList();
    alert(isEdit ? "✓ Code → App item updated live!" : "✓ New Code → App item added live!");
  });

  // Save Orbit Form
  $("#adminOrbitForm").on("submit", async function (e) {
    e.preventDefault();
    const raw = $("#adminOrbitTechs").val().trim();
    const techs = raw ? raw.split(",").map(t => t.trim()).filter(Boolean) : localOrbitCache;

    localOrbitCache = techs;
    localStorage.setItem("settings_flutter_orbit", JSON.stringify(techs));

    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, "settings", "flutter_orbit"), { techs, updatedAt: serverTimestamp() });
      } catch (err) { }
    }

    syncOrbitFromBackend();
    alert("✓ Orbiting Flutter tech stack updated live!");
  });

  // 2. Services Manager Sync
  function syncServicesFromBackend() {
    const applyServices = (services) => {
      if (!Array.isArray(services) || services.length === 0) return;
      const $container = $(".services .serv-content");
      $container.empty();

      services.forEach((s) => {
        const cardHtml = `
          <div class="card reveal active" data-id="${s.id}">
            <div class="box">
              <i class="${s.icon || 'fas fa-cog'}"></i>
              <div class="text">${s.title}</div>
              <p>${s.desc}</p>
            </div>
          </div>
        `;
        $container.append(cardHtml);
      });
    };

    const saved = localStorage.getItem("custom_portfolio_services");
    if (saved) {
      try { applyServices(JSON.parse(saved)); } catch (e) { }
    }

    if (isFirebaseConfigured() && db) {
      try {
        onSnapshot(collection(db, "services"), (snapshot) => {
          const remoteServices = [];
          snapshot.forEach((docSnap) => {
            remoteServices.push({ id: docSnap.id, ...docSnap.data() });
          });
          if (remoteServices.length > 0) {
            localStorage.setItem("custom_portfolio_services", JSON.stringify(remoteServices));
            applyServices(remoteServices);
            if ($("#adminModal").is(":visible")) renderAdminServices();
          }
        }, (err) => console.warn("Firestore services listener warning:", err));
      } catch (e) { }
    }
  }

  function renderAdminServices() {
    const $list = $("#adminServicesList");
    $list.empty();
    const services = JSON.parse(localStorage.getItem("custom_portfolio_services") || "[]");

    if (!services.length) {
      $list.html('<p style="color: var(--text-sec); font-size: 13px;">No custom services added.</p>');
      return;
    }

    services.forEach((s) => {
      const cardHtml = `
        <div class="admin-item-card" data-service-id="${s.id}">
          <div>
            <div class="admin-item-title"><i class="${s.icon}"></i> ${s.title}</div>
            <div class="admin-item-meta">${(s.desc || "").substring(0, 75)}...</div>
          </div>
          <div class="admin-item-actions">
            <button class="admin-action-btn danger-btn small btn-delete-service" data-id="${s.id}"><i class="fas fa-trash"></i> Delete</button>
          </div>
        </div>
      `;
      $list.append(cardHtml);
    });
  }

  $("#btnOpenAddService").on("click", function () {
    $("#adminServiceForm")[0].reset();
    $("#serviceFormContainer").slideDown();
  });
  $("#btnCancelServiceForm").on("click", function () {
    $("#serviceFormContainer").slideUp();
  });

  $("#adminServiceForm").on("submit", async function (e) {
    e.preventDefault();
    const title = $("#adminServTitle").val().trim();
    const icon = $("#adminServIcon").val().trim();
    const desc = $("#adminServDesc").val().trim();

    const servObj = { id: `serv-${Date.now()}`, title, icon, desc };

    let services = JSON.parse(localStorage.getItem("custom_portfolio_services") || "[]");
    services.push(servObj);
    localStorage.setItem("custom_portfolio_services", JSON.stringify(services));

    if (isFirebaseConfigured() && db) {
      try {
        await addDoc(collection(db, "services"), { ...servObj, createdAt: serverTimestamp() });
      } catch (err) { }
    }

    $("#serviceFormContainer").slideUp();
    syncServicesFromBackend();
    renderAdminServices();
    alert("✓ New Service published live!");
  });

  $(document).on("click", ".btn-delete-service", function () {
    const servId = $(this).attr("data-id");
    if (!servId) return;

    if (confirm("Delete this service item?")) {
      if (isFirebaseConfigured() && db) {
        try { deleteDoc(doc(db, "services", servId)); } catch (e) { }
      }
      let services = JSON.parse(localStorage.getItem("custom_portfolio_services") || "[]");
      services = services.filter(s => s.id !== servId);
      localStorage.setItem("custom_portfolio_services", JSON.stringify(services));

      $(`.card[data-id="${servId}"]`).fadeOut(300, function () { $(this).remove(); });
      $(`.admin-item-card[data-service-id="${servId}"]`).slideUp(200, function () { $(this).remove(); });
    }
  });

  // 3. Skills & Expertise Manager Sync
  function syncSkillsFromBackend() {
    const applySkills = (skills) => {
      if (!Array.isArray(skills) || skills.length === 0) return;
      const $grid = $(".skills-content .skills-grid");
      $grid.empty();

      skills.forEach((cat) => {
        const chipsHtml = (cat.chips || "").split(",").map(c => `<span class="skill-chip">${c.trim()}</span>`).join(" ");
        const cardHtml = `
          <div class="skills-category-card reveal active" data-id="${cat.id}">
            <div class="category-header">
              <i class="${cat.icon || 'fas fa-code'}"></i>
              <span>${cat.name}</span>
            </div>
            <div class="category-chips">
              ${chipsHtml}
            </div>
          </div>
        `;
        $grid.append(cardHtml);
      });
    };

    const saved = localStorage.getItem("custom_portfolio_skills");
    if (saved) {
      try { applySkills(JSON.parse(saved)); } catch (e) { }
    }

    if (isFirebaseConfigured() && db) {
      try {
        onSnapshot(collection(db, "skills"), (snapshot) => {
          const remoteSkills = [];
          snapshot.forEach((docSnap) => {
            remoteSkills.push({ id: docSnap.id, ...docSnap.data() });
          });
          if (remoteSkills.length > 0) {
            localStorage.setItem("custom_portfolio_skills", JSON.stringify(remoteSkills));
            applySkills(remoteSkills);
            if ($("#adminModal").is(":visible")) renderAdminSkills();
          }
        }, (err) => console.warn("Firestore skills listener warning:", err));
      } catch (e) { }
    }
  }

  function renderAdminSkills() {
    const $list = $("#adminSkillsList");
    $list.empty();
    const skills = JSON.parse(localStorage.getItem("custom_portfolio_skills") || "[]");

    if (!skills.length) {
      $list.html('<p style="color: var(--text-sec); font-size: 13px;">No custom skill categories added.</p>');
      return;
    }

    skills.forEach((s) => {
      const cardHtml = `
        <div class="admin-item-card" data-skill-id="${s.id}">
          <div>
            <div class="admin-item-title"><i class="${s.icon}"></i> ${s.name}</div>
            <div class="admin-item-meta">${s.chips || ''}</div>
          </div>
          <div class="admin-item-actions">
            <button class="admin-action-btn danger-btn small btn-delete-skill" data-id="${s.id}"><i class="fas fa-trash"></i> Delete</button>
          </div>
        </div>
      `;
      $list.append(cardHtml);
    });
  }

  $("#btnOpenAddSkill").on("click", function () {
    $("#adminSkillForm")[0].reset();
    $("#skillFormContainer").slideDown();
  });
  $("#btnCancelSkillForm").on("click", function () {
    $("#skillFormContainer").slideUp();
  });

  $("#adminSkillForm").on("submit", async function (e) {
    e.preventDefault();
    const name = $("#adminSkillCatName").val().trim();
    const icon = $("#adminSkillCatIcon").val().trim();
    const chips = $("#adminSkillChips").val().trim();

    const skillObj = { id: `skill-${Date.now()}`, name, icon, chips };

    let skills = JSON.parse(localStorage.getItem("custom_portfolio_skills") || "[]");
    skills.push(skillObj);
    localStorage.setItem("custom_portfolio_skills", JSON.stringify(skills));

    if (isFirebaseConfigured() && db) {
      try {
        await addDoc(collection(db, "skills"), { ...skillObj, createdAt: serverTimestamp() });
      } catch (err) { }
    }

    $("#skillFormContainer").slideUp();
    syncSkillsFromBackend();
    renderAdminSkills();
    alert("✓ New Skill category published live!");
  });

  $(document).on("click", ".btn-delete-skill", function () {
    const skillId = $(this).attr("data-id");
    if (!skillId) return;

    if (confirm("Delete this skill category?")) {
      if (isFirebaseConfigured() && db) {
        try { deleteDoc(doc(db, "skills", skillId)); } catch (e) { }
      }
      let skills = JSON.parse(localStorage.getItem("custom_portfolio_skills") || "[]");
      skills = skills.filter(s => s.id !== skillId);
      localStorage.setItem("custom_portfolio_skills", JSON.stringify(skills));

      $(`.skills-category-card[data-id="${skillId}"]`).fadeOut(300, function () { $(this).remove(); });
      $(`.admin-item-card[data-skill-id="${skillId}"]`).slideUp(200, function () { $(this).remove(); });
    }
  });

  // 3.5. Key Stats & Achievements Counter Manager Sync
  function syncStatsFromBackend() {
    const applyStats = (data) => {
      const comp = String(
        (data && data.comp !== undefined && data.comp !== null && data.comp !== "") ? data.comp :
          ((data && data.completed !== undefined && data.completed !== null && data.completed !== "") ? data.completed :
            (localStorage.getItem("stat_completed") || "30"))
      );
      const deliv = String(
        (data && data.deliv !== undefined && data.deliv !== null && data.deliv !== "") ? data.deliv :
          ((data && data.delivered !== undefined && data.delivered !== null && data.delivered !== "") ? data.delivered :
            (localStorage.getItem("stat_delivered") || "15"))
      );
      const pub = String(
        (data && data.pub !== undefined && data.pub !== null && data.pub !== "") ? data.pub :
          ((data && data.published !== undefined && data.published !== null && data.published !== "") ? data.published :
            (localStorage.getItem("stat_published") || "5"))
      );
      const expMonths = String(
        (data && data.expMonths !== undefined && data.expMonths !== null && data.expMonths !== "") ? data.expMonths :
          (localStorage.getItem("stat_exp_months") || "30")
      );

      localStorage.setItem("stat_completed", comp);
      localStorage.setItem("stat_delivered", deliv);
      localStorage.setItem("stat_published", pub);
      localStorage.setItem("stat_exp_months", expMonths);

      applyStatsToDOM(comp, deliv, pub, expMonths);
    };

    const savedComp = localStorage.getItem("stat_completed");
    if (savedComp) {
      applyStats({
        comp: localStorage.getItem("stat_completed"),
        deliv: localStorage.getItem("stat_delivered"),
        pub: localStorage.getItem("stat_published"),
        expMonths: localStorage.getItem("stat_exp_months")
      });
    } else {
      applyStats({ comp: "30", deliv: "15", pub: "5", expMonths: "30" });
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
    const savedExpMonths = localStorage.getItem("stat_exp_months") || "30";

    $("#statInputCompleted").val(savedCompleted);
    $("#statInputDelivered").val(savedDelivered);
    $("#statInputPublished").val(savedPublished);
    $("#statInputExpMonths").val(savedExpMonths);
    $("#statExpPreview").text("Will display as: " + formatExperienceFromMonths(savedExpMonths));
  }

  // Live preview as user types months
  $(document).on("input", "#statInputExpMonths", function () {
    const val = parseInt($(this).val(), 10);
    if (!isNaN(val) && val >= 0) {
      $("#statExpPreview").text("Will display as: " + formatExperienceFromMonths(val));
    } else {
      $("#statExpPreview").text("");
    }
  });

  $("#adminStatsForm").on("submit", async function (e) {
    e.preventDefault();

    const comp = $("#statInputCompleted").val().trim();
    const deliv = $("#statInputDelivered").val().trim();
    const pub = $("#statInputPublished").val().trim();
    const expMonths = $("#statInputExpMonths").val().trim() || "30";

    // Persist to localStorage
    localStorage.setItem("stat_completed", comp);
    localStorage.setItem("stat_delivered", deliv);
    localStorage.setItem("stat_published", pub);
    localStorage.setItem("stat_exp_months", expMonths);

    // Apply live DOM update & animation
    applyStatsToDOM(comp, deliv, pub, expMonths);

    // Save to Firestore if available
    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, "settings", "stats"), { comp, deliv, pub, expMonths, updatedAt: serverTimestamp() });
      } catch (err) { }
    }

    $("#statsUpdateStatus").fadeIn().delay(3000).fadeOut();
    alert("\u2713 Live stats updated successfully!");
  });

  // 4. Social Links & Contact Manager Sync
  function syncSocialContactFromBackend() {
    const applySocialContact = (data) => {
      if (!data) return;
      const email = data.email || "hossainahammed627@gmail.com";
      const address = data.address || "Uttara, Dhaka";
      const github = data.github || "https://github.com/hossainahammed";
      const linkedin = data.linkedin || "https://www.linkedin.com/in/hossain-ahammed";

      localStorage.setItem("settings_social_contact", JSON.stringify(data));

      $(".contact .icons .row").eq(1).find(".sub-title").text(address);
      $(".contact .icons .row").eq(2).find(".sub-title").text(email);
      $("a[href*='github.com']").attr("href", github);
      $("a[href*='linkedin.com']").attr("href", linkedin);
    };

    const saved = localStorage.getItem("settings_social_contact");
    if (saved) {
      try { applySocialContact(JSON.parse(saved)); } catch (e) { }
    }

    if (isFirebaseConfigured() && db) {
      try {
        onSnapshot(doc(db, "settings", "social_contact"), (docSnap) => {
          if (docSnap.exists()) applySocialContact(docSnap.data());
        }, (err) => console.warn("Firestore social_contact listener warning:", err));
      } catch (e) { }
    }
  }

  function loadAdminSocialContact() {
    const saved = localStorage.getItem("settings_social_contact");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.email) $("#adminContactEmail").val(data.email);
        if (data.address) $("#adminContactAddress").val(data.address);
        if (data.github) $("#adminSocialGithub").val(data.github);
        if (data.linkedin) $("#adminSocialLinkedin").val(data.linkedin);
      } catch (e) { }
    }
  }

  $("#adminSocialContactForm").on("submit", async function (e) {
    e.preventDefault();
    const email = $("#adminContactEmail").val().trim();
    const address = $("#adminContactAddress").val().trim();
    const github = $("#adminSocialGithub").val().trim();
    const linkedin = $("#adminSocialLinkedin").val().trim();

    const dataObj = { email, address, github, linkedin };
    localStorage.setItem("settings_social_contact", JSON.stringify(dataObj));

    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, "settings", "social_contact"), { ...dataObj, updatedAt: serverTimestamp() });
      } catch (err) { }
    }
    syncSocialContactFromBackend();
    alert("✓ Social links & contact info updated live!");
  });
});

