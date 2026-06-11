$(document).ready(function () {
  // Initialize Lenis smooth scroll
  // NOTE: scroll-behavior:smooth is set to 'auto' in CSS to avoid double-easing conflict.
  const lenis = new Lenis({
    duration: 0.9, // snappier feel (was 1.2)
    lerp: 0.1, // linear interpolation factor — lower = silkier glide
    easing: (t) =>
      t < 0.5 // easeInOutQuart — feels natural and premium
        ? 8 * t * t * t * t
        : 1 - Math.pow(-2 * t + 2, 4) / 2,
    smoothWheel: true,
    smoothTouch: false, // keep native touch on mobile (better UX)
    wheelMultiplier: 1.0, // 1:1 wheel ratio — no over-scroll
    touchMultiplier: 1.5,
    infinite: false,
  });

  // Drive Lenis via rAF loop (must NOT use setTimeout)
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Relay Lenis scroll events so jQuery scroll handlers (sticky nav, reveal) keep working
  lenis.on("scroll", ({ scroll }) => {
    // Use the raw scroll position to drive scroll-based UI without re-triggering jQuery overhead
    const y = scroll;
    // sticky navbar
    if (y > 20) {
      document.querySelector(".navbar")?.classList.add("sticky");
    } else {
      document.querySelector(".navbar")?.classList.remove("sticky");
    }
    // scroll-up button
    if (y > 500) {
      document.querySelector(".scroll-up-btn")?.classList.add("show");
    } else {
      document.querySelector(".scroll-up-btn")?.classList.remove("show");
    }
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
      "#github-calendar rect[data-date], #github-calendar td[data-date]"
    );
    if (cells.length === 0) return;

    let total = 0;
    let longestStreak = 0;
    let currentStreak = 0;
    let tempStreak = 0;

    // Sort cells by date ascending
    const sortedCells = Array.from(cells).sort((a, b) => {
      return new Date(a.getAttribute("data-date")) - new Date(b.getAttribute("data-date"));
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
    const utcTodayStr = new Date().toISOString().split("T")[0];  // YYYY-MM-DD UTC format

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
      $numbers.eq(0).html(`${total.toLocaleString()} <span style="font-size: 14px; font-weight: 500; color: var(--text-sec);">total</span>`);
      $numbers.eq(1).html(`${longestStreak} <span style="font-size: 14px; font-weight: 500; color: var(--text-sec);">days</span>`);
      $numbers.eq(2).html(`${currentStreak} <span style="font-size: 14px; font-weight: 500; color: var(--text-sec);">days</span>`);
    }
  }

  function handleCalendarError(error) {
    console.error("Error loading GitHub Calendar:", error);
    $("#github-calendar").html(
      `<div class="calendar-loading" style="color: #ef4444;">
        <i class="fas fa-exclamation-triangle"></i> Failed to load GitHub activity stats. Please try reloading.
      </div>`
    );
  }

  // Poll to ensure stats are updated even if rendering delays
  function pollCalendarLoaded() {
    let attempts = 0;
    const interval = setInterval(() => {
      const cells = document.querySelectorAll(
        "#github-calendar rect[data-date], #github-calendar td[data-date]"
      );
      if (cells.length > 0) {
        clearInterval(interval);
        recalculateGitHubStreaks();
      } else {
        attempts++;
        if (attempts > 50) { // Timeout after 10s
          clearInterval(interval);
        }
      }
    }, 200);
  }

  // Initialize GitHub Calendar Widget
  try {
    const calendarPromise = GitHubCalendar("#github-calendar", "hossainahammed", {
      responsive: true,
      tooltips: true
    });

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

  // slide-up script
  $(".scroll-up-btn").click(function () {
    lenis.scrollTo(0);
  });

  $(".navbar .menu li a").click(function (e) {
    e.preventDefault();
    const targetId = $(this).attr("href");
    const targetElement = $(targetId);
    if (targetElement.length) {
      lenis.scrollTo(targetElement[0], { offset: -70 });
    }
  });

  // Logo smooth scroll to top
  $(".navbar .logo a").click(function (e) {
    e.preventDefault();
    lenis.scrollTo(0);
  });

  // toggle menu/navbar script
  $(".menu-btn").click(function () {
    $(".navbar .menu").toggleClass("active");
    $(".menu-btn i").toggleClass("active");
  });

  // Hire me button: smooth scroll to contact and focus name field
  $(".hire-btn").on("click", function (e) {
    e.preventDefault();
    var target = $("#contact");
    if (target.length) {
      lenis.scrollTo(target[0], {
        offset: -60,
        onComplete: function () {
          var $name = $("#contact-name");
          if ($name.length) {
            $name.focus();
          }
        },
      });
    }
    // close mobile menu if open
    $(".navbar .menu").removeClass("active");
    $(".menu-btn i").removeClass("active");
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

  /* Projects: open live preview in modal when a project's image is clicked */
  $(".project-card").on("click", function () {
    var $card = $(this);
    var url = ($card.attr("data-liveurl") || "").trim();
    var title = $card.attr("data-title") || "";
    if (url) {
      // ensure url has protocol
      if (!/^https?:\/\//i.test(url)) url = "https://" + url;
      $("#liveModalTitle").text(title);
      $("#liveModalIframe").attr("src", url);
      $("#liveViewModal").attr("aria-hidden", "false").fadeIn(180);
      $("body").addClass("modal-open");
    } else {
      alert(
        "No live link set for this project yet. You can add a live link later by setting the project element's `data-liveurl` attribute.",
      );
    }
  });

  // Prevent modal opening when clicking the "Code" button inside project cards
  $(".project-card .code-btn").on("click", function (e) {
    e.stopPropagation();
  });

  // Close modal: overlay click or close button
  $(".live-modal__close, .live-modal__overlay").on("click", function () {
    $("#liveModalIframe").attr("src", "");
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

  /* Contact form: validate and open mail client (mailto:) as default action */
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

    // build mailto
    var to = "hossainahammed627@gmail.com";
    var body =
      "Name: " +
      name +
      "%0D%0AEmail: " +
      email +
      "%0D%0A%0D%0A" +
      encodeURIComponent(message);
    var mailto =
      "mailto:" +
      encodeURIComponent(to) +
      "?subject=" +
      encodeURIComponent(subject || "Contact from portfolio") +
      "&body=" +
      body;

    // show status
    $("#contact-status")
      .text("Opening your mail app...")
      .css("color", "#0a0")
      .fadeIn(120);

    // open mail client
    window.location.href = mailto;

    // clear form after a short delay
    setTimeout(function () {
      $("#contactForm")[0].reset();
      $("#contact-status")
        .text(
          "If your mail app did not open, copy the message and send to hossainahammed627@gmail.com",
        )
        .css("color", "#333");
      setTimeout(function () {
        $("#contact-status").fadeOut(1600);
      }, 4000);
    }, 600);
  });

  // Active navbar link highlighter on scroll
  const sections = $("section");
  const navLinks = $(".navbar .menu li a");

  function highlightNavbar() {
    let currentSectionId = "";
    const scrollPos = $(document).scrollTop() + 150; // offset for navbar height
    const scrollBottom = $(window).scrollTop() + $(window).height();
    const pageHeight = $(document).height();

    // Check if scrolled near the bottom
    if (scrollBottom >= pageHeight - 50) {
      currentSectionId = "contact";
    } else {
      sections.each(function () {
        const top = $(this).offset().top;
        const bottom = top + $(this).outerHeight();

        if (scrollPos >= top && scrollPos <= bottom) {
          currentSectionId = $(this).attr("id");
        }
      });
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
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px",
      },
    );

    $(".reveal, .reveal-grid").each(function () {
      revealObserver.observe(this);
    });
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    $(".reveal, .reveal-grid").addClass("active");
  }

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
});
