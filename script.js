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

  /* ── Flutter App Showcase (visible on-page phone carousel) ── */

  (function initFlutterShowcase() {
    var folder = "images/Upcoming_APP/";
    var label = "Upcoming App";
    var $showcase = $("#flutterShowcase");
    var showcaseTimer = null;

    // Probe images from a folder
    function probeFolder(folder, max, cb) {
      var imgs = [], idx = 1;
      function next() {
        if (idx > max) { cb(imgs); return; }
        var img = new Image();
        img.onload = function () { imgs.push(folder + idx + ".png"); idx++; next(); };
        img.onerror = function () { cb(imgs); };
        img.src = folder + idx + ".png";
      }
      next();
    }

    probeFolder(folder, 20, function (imgs) {
      if (!imgs.length) {
        $showcase.hide(); // no images in the folder
        return;
      }
      buildShowcase($showcase, imgs, label, null);
    });

    function buildShowcase($el, imgs, label, cardId) {
      var cur = 0;
      var total = imgs.length;

      // ── DOM ──────────────────────────────────────────────
      $el.empty();

      var $inner = $('<div class="showcase-inner"></div>');

      // App label + counter
      var $header = $(
        '<div class="showcase-header">' +
          '<span class="showcase-app-label"><i class="fab fa-flutter showcase-flutter-icon"></i> ' + label + '</span>' +
          '<span class="showcase-counter"><span class="sc-cur">1</span> / <span class="sc-tot">' + total + '</span></span>' +
        '</div>'
      );

      // Phone strip
      var $strip = $('<div class="showcase-strip"></div>');

      // Build N phone frames (all images)
      imgs.forEach(function (src, i) {
        var $phone = $(
          '<div class="sc-phone' + (i === 0 ? " sc-active" : "") + '">' +
            '<div class="sc-phone-notch"></div>' +
            '<div class="sc-phone-screen"><img src="' + src + '" alt="Screenshot ' + (i+1) + '" loading="lazy"/></div>' +
            '<div class="sc-phone-bar"></div>' +
          '</div>'
        );
        $phone.on("click", function () { scGoTo(i); scRestart(); });
        $strip.append($phone);
      });

      // Arrows
      var $prev = $('<button class="sc-arrow sc-arrow-prev" aria-label="Previous"><i class="fas fa-chevron-left"></i></button>');
      var $next = $('<button class="sc-arrow sc-arrow-next" aria-label="Next"><i class="fas fa-chevron-right"></i></button>');

      $prev.on("click", function () { scGoTo(cur - 1); scRestart(); });
      $next.on("click", function () { scGoTo(cur + 1); scRestart(); });

      // Dots
      var $dots = $('<div class="sc-dots"></div>');
      imgs.forEach(function (_, i) {
        var $dot = $('<button class="sc-dot' + (i === 0 ? " sc-dot-active" : "") + '"></button>');
        $dot.on("click", function () { scGoTo(i); scRestart(); });
        $dots.append($dot);
      });

      // "View all" hint
      var $hint = $('<div class="showcase-hint"><i class="fas fa-expand-arrows-alt"></i> Click any project card for fullscreen view</div>');

      $inner.append($header, $strip, $prev, $next, $dots, $hint);
      $el.append($inner);

      // ── Logic ─────────────────────────────────────────────
      function scGoTo(idx) {
        cur = ((idx % total) + total) % total;
        $strip.find(".sc-phone").removeClass("sc-active sc-prev sc-next");
        var $phones = $strip.find(".sc-phone");
        $phones.eq(cur).addClass("sc-active");
        $phones.eq(((cur - 1) + total) % total).addClass("sc-prev");
        $phones.eq((cur + 1) % total).addClass("sc-next");
        $dots.find(".sc-dot").removeClass("sc-dot-active").eq(cur).addClass("sc-dot-active");
        $header.find(".sc-cur").text(cur + 1);
      }

      function scRestart() {
        clearInterval(showcaseTimer);
        showcaseTimer = setInterval(function () { scGoTo(cur + 1); }, 3500);
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
    var $dots   = $slider.find(".fdot");
    var total   = $slides.length;

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
      var $slide = $('<div class="fslide' + (i === 0 ? " active" : "") + '"></div>');
      $slide.append(
        $('<img class="fslide-img" alt="Screenshot ' + (i + 1) + '" loading="lazy"/>').attr("src", src)
      );
      $slider.append($slide);
    });

    // Prev / Next buttons
    var $prev = $('<button class="fslider-btn fslider-prev" aria-label="Previous"><i class="fas fa-chevron-left"></i></button>');
    var $next = $('<button class="fslider-btn fslider-next" aria-label="Next"><i class="fas fa-chevron-right"></i></button>');

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
      var $dot = $('<button class="fdot' + (i === 0 ? " active" : "") + '" aria-label="Slide ' + (i + 1) + '"></button>');
      $dot.on("click", function (e) {
        e.stopPropagation();
        sliderGoTo($slider, i);
        startSlider($slider, images.length);
      });
      $dots.append($dot);
    });

    // Counter badge  e.g. "1 / 4"
    var $counter = $('<div class="fslider-counter"><span class="fslider-cur">1</span> / <span class="fslider-total">' + images.length + '</span></div>');

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

  /* Probe images from a folder (1.png, 2.png …) then open the modal */
  function probeAndOpenCarousel($card, folder, fallbackSrc) {
    var images = [];
    var index  = 1;
    var maxProbe = 20;

    function probe() {
      if (index > maxProbe) {
        showSliderModal($card, images.length ? images : (fallbackSrc ? [fallbackSrc] : []));
        return;
      }
      var src = folder + index + ".png";
      var img = new Image();
      img.onload = function () { images.push(src); index++; probe(); };
      img.onerror = function () {
        if (index === 1) {
          // try .jpg as first-image fallback
          var srcJpg = folder + "1.jpg";
          var j = new Image();
          j.onload = function () { images.push(srcJpg); index++; probe(); };
          j.onerror = function () {
            showSliderModal($card, fallbackSrc ? [fallbackSrc] : []);
          };
          j.src = srcJpg;
        } else {
          showSliderModal($card, images.length ? images : (fallbackSrc ? [fallbackSrc] : []));
        }
      };
      img.src = src;
    }
    probe();
  }

  function openFlutterCarouselModal($card) {
    var folder   = ($card.attr("data-image-folder") || "").trim();
    var fallback = $card.find(".project-img-wrapper img").attr("src") || "";
    if (folder) {
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

    var $wrap  = $('<div class="mpc-wrap"></div>');
    var $strip = $('<div class="mpc-strip"></div>');

    // Build all phone frames
    images.forEach(function (src, i) {
      var $phone = $(
        '<div class="sc-phone' + (i === 0 ? " sc-active" : "") + '">' +
          '<div class="sc-phone-notch"></div>' +
          '<div class="sc-phone-screen"><img src="' + src + '" alt="Screen ' + (i + 1) + '" loading="lazy"/></div>' +
          '<div class="sc-phone-bar"></div>' +
        '</div>'
      );
      $phone.on("click", function () { pcGoTo(i); pcRestart(); });
      $strip.append($phone);
    });

    // Arrows
    var $prev = $('<button class="sc-arrow sc-arrow-prev" aria-label="Previous"><i class="fas fa-chevron-left"></i></button>');
    var $next = $('<button class="sc-arrow sc-arrow-next" aria-label="Next"><i class="fas fa-chevron-right"></i></button>');
    $prev.on("click", function (e) { e.stopPropagation(); pcGoTo(cur - 1); pcRestart(); });
    $next.on("click", function (e) { e.stopPropagation(); pcGoTo(cur + 1); pcRestart(); });

    // Dots
    var $dots = $('<div class="sc-dots mpc-dots"></div>');
    images.forEach(function (_, i) {
      var $dot = $('<button class="sc-dot' + (i === 0 ? " sc-dot-active" : "") + '" aria-label="Slide ' + (i + 1) + '"></button>');
      $dot.on("click", function (e) { e.stopPropagation(); pcGoTo(i); pcRestart(); });
      $dots.append($dot);
    });

    // Counter  "1 / 4"
    var $counter = $('<div class="fslider-counter"><span class="pc-cur">1</span> / <span>' + total + '</span></div>');

    $wrap.append($strip, $prev, $next, $dots, $counter);

    function pcGoTo(idx) {
      cur = ((idx % total) + total) % total;
      var $phones = $strip.find(".sc-phone");
      $phones.removeClass("sc-active sc-prev sc-next");
      $phones.eq(cur).addClass("sc-active");
      $phones.eq(((cur - 1) + total) % total).addClass("sc-prev");
      $phones.eq((cur + 1) % total).addClass("sc-next");
      $dots.find(".sc-dot").removeClass("sc-dot-active").eq(cur).addClass("sc-dot-active");
      $counter.find(".pc-cur").text(cur + 1);
    }

    function pcRestart() {
      clearInterval(autoTimer);
      autoTimer = setInterval(function () { pcGoTo(cur + 1); }, 3500);
    }

    // Store destroy hook so close handler can clear the timer
    $wrap.data("destroy", function () { clearInterval(autoTimer); });

    pcGoTo(0);
    pcRestart();

    return $wrap;
  }

  function showSliderModal($card, images) {
    var title = $card.attr("data-title") || "";
    stopSlider();

    // Destroy any previous phone carousel timer
    var $prevWrap = $("#liveModalImageContainer .mpc-wrap");
    if ($prevWrap.length && $prevWrap.data("destroy")) $prevWrap.data("destroy")();

    $("#liveModalTitle").text(title + " — Feature Screens");
    $("#liveModalIframe").hide().attr("src", "");

    var $container = $("#liveModalImageContainer");
    $container.empty().css("display", "block");

    if (!images.length) {
      $container.css("display", "flex").append(
        '<p style="color:var(--text-sec);padding:40px;text-align:center;line-height:1.8;">' +
        '<i class="fas fa-images" style="font-size:42px;display:block;margin-bottom:12px;opacity:.5;"></i>' +
        'No screenshots yet.<br>' +
        '<code style="font-size:12px;">' + ($card.attr("data-image-folder") || "images/ProjectName/") + '1.png</code>, <code style="font-size:12px;">2.png</code>…</p>'
      );
      $("#liveViewModal").attr("aria-hidden", "false").fadeIn(200);
      $("body").addClass("modal-open");
      return;
    }

    if (images.length === 1) {
      // Single image: show centered with phone frame
      $container.css("display", "flex").append(
        $('<img id="liveModalImage" alt="Project Screenshot"/>').attr("src", images[0])
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
    var isFlutter = ($card.attr("data-id") || "").startsWith("flutter") ||
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
        alert("No live link set for this project yet. Add a `data-liveurl` attribute to enable it.");
      }
    }
  });

  /* Appetize live preview */
  $(".project-card .appetize-btn").on("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    var $card = $(this).closest(".project-card");
    var url = ($card.attr("data-appetizeurl") || "").trim();
    var title = $card.attr("data-title") + " - Appetize Live";
    if (url && url !== "#") {
      $("#liveModalTitle").text(title);
      $("#liveModalIframe").attr("src", url).show();
      $("#liveModalImageContainer").hide();
      $("#liveViewModal").attr("aria-hidden", "false").fadeIn(180);
      $("body").addClass("modal-open");
    } else {
      alert("Appetize link not provided yet.");
    }
  });

  /* Live button: Flutter → phone carousel; Web → iframe */
  $(".project-card .live-btn").on("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    var $card = $(this).closest(".project-card");
    var isFlutter = ($card.attr("data-id") || "").startsWith("flutter") ||
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
        message: message
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
          .text("Failed to send. Please email directly to hossainahammed627@gmail.com")
          .css("color", "#ef4444")
          .fadeIn(120);
      },
      complete: function () {
        $submitBtn.prop("disabled", false).text("Send message");
      }
    });
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

  /* ================= Admin Panel Logic ================= */
  window.currentlyEditingCard = null;

  function enableAdminMode() {
    if ($(".admin-edit-btn").length === 0) {
      $(".project-card").each(function() {
        var isHidden = $(this).attr("data-hidden") === "true";
        var eyeIcon = isHidden ? "fa-eye-slash" : "fa-eye";
        $(this).append('<button class="admin-edit-btn" title="Edit Project" style="position: absolute; top: 10px; right: 10px; z-index: 10; background: var(--primary-color); color: white; border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><i class="fas fa-edit"></i></button>');
        $(this).append('<button class="admin-hide-btn" title="Toggle Visibility" style="position: absolute; top: 10px; right: 50px; z-index: 10; background: #ef4444; color: white; border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><i class="fas ' + eyeIcon + '"></i></button>');
        
        if (isHidden) {
          $(this).css("opacity", "0.5");
        }
      });
    }
  }

  // Check login on load
  if (sessionStorage.getItem("isAdmin") === "true") {
    enableAdminMode();
  } else {
    // Hide all projects with data-hidden="true" for normal users
    $(".project-card[data-hidden='true']").hide();
  }

  $("#admin-trigger").on("dblclick", function(e) {
    e.preventDefault();
    $("#adminModal").show().attr("aria-hidden", "false");
    $("body").addClass("modal-open");
    
    // If already logged in, skip to form
    if (sessionStorage.getItem("isAdmin") === "true") {
      $("#admin-login-step").hide();
      $("#admin-form-step").show();
      window.currentlyEditingCard = null; // Adding new by default from double-click
      $(".admin-form-scroll input, .admin-form-scroll textarea").val("");
    }
  });

  $(".admin-close").on("click", function() {
    $("#adminModal").hide().attr("aria-hidden", "true");
    $("body").removeClass("modal-open");
  });

  $("#admin-login-btn").on("click", async function() {
    var email = $("#admin-email").val();
    var key = $("#admin-key").val();
    
    // Hash key using SHA-256 to prevent plain text inspection
    var hashHex = "";
    if (key) {
      var msgBuffer = new TextEncoder().encode(key);
      var hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      var hashArray = Array.from(new Uint8Array(hashBuffer));
      hashHex = hashArray.map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
    }

    if (email === "hossainahammed627@gmail.com" && hashHex === "6900c3ccdcfc05cf0538b10a21765458f4d547a066d8a04b8809efcdf0dc04dd") {
      sessionStorage.setItem("isAdmin", "true");
      enableAdminMode();
      $("#admin-login-step").hide();
      $("#admin-form-step").fadeIn();
      $("#admin-error").hide();
      window.currentlyEditingCard = null;
      $(".admin-form-scroll input, .admin-form-scroll textarea").val("");
    } else {
      $("#admin-error").text("Invalid Credentials").show();
    }
  });

  // Edit existing project
  $(document).on("click", ".admin-edit-btn", function(e) {
    e.preventDefault();
    e.stopPropagation();
    var $card = $(this).closest(".project-card");
    window.currentlyEditingCard = $card;
    
    // Populate form
    $("#ap-title").val($card.attr("data-title") || "");
    $("#ap-id").val($card.attr("data-id") || "");
    
    var imgSrc = $card.find(".project-img-wrapper img").attr("src") || "";
    $("#ap-image").val(imgSrc.replace("images/", ""));
    
    var descText = $card.find(".proj-desc").text().replace("Problem Solved:", "").trim();
    $("#ap-desc").val(descText);
    
    var techList = [];
    $card.find(".tech-pill").each(function() { techList.push($(this).text().trim()); });
    $("#ap-tech").val(techList.join(", "));
    
    var featList = [];
    $card.find(".proj-features li").each(function() { featList.push($(this).text().trim()); });
    $("#ap-features").val(featList.join(", "));
    
    $("#ap-live").val($card.attr("data-liveurl") || "");
    $("#ap-appetize").val($card.attr("data-appetizeurl") || "");
    $("#ap-video").val($card.attr("data-videourl") || "");
    $("#ap-github").val($card.find(".code-btn").attr("href") || "");
    
    $("#admin-login-step").hide();
    $("#admin-result-step").hide();
    $("#admin-form-step").show();
    $("#adminModal").show().attr("aria-hidden", "false");
    $("body").addClass("modal-open");
  });

  // Toggle hide project
  $(document).on("click", ".admin-hide-btn", function(e) {
    e.preventDefault();
    e.stopPropagation();
    var $card = $(this).closest(".project-card");
    var isHidden = $card.attr("data-hidden") === "true";
    
    if (isHidden) {
      $card.attr("data-hidden", "false");
      $card.css("opacity", "1");
      $(this).find("i").removeClass("fa-eye-slash").addClass("fa-eye");
    } else {
      $card.attr("data-hidden", "true");
      $card.css("opacity", "0.5");
      $(this).find("i").removeClass("fa-eye").addClass("fa-eye-slash");
    }
  });

  $("#admin-generate-btn").on("click", function() {
    var title = $("#ap-title").val() || "New App";
    var id = $("#ap-id").val() || "flutter-new";
    var image = $("#ap-image").val() || "placeholder.png";
    var desc = $("#ap-desc").val() || "Not specified.";
    
    var techRaw = $("#ap-tech").val() || "Flutter, Dart";
    var techPills = techRaw.split(",").map(t => `<span class="tech-pill">${t.trim()}</span>`).join("\n                                ");
    
    var featRaw = $("#ap-features").val() || "Feature 1, Feature 2";
    var featList = featRaw.split(",").map(f => `<li>${f.trim()}</li>`).join("\n                                ");
    
    var live = $("#ap-live").val() || "#";
    var appetize = $("#ap-appetize").val() || "#";
    var video = $("#ap-video").val() || "#";
    var github = $("#ap-github").val() || "#";

    var htmlTemplate = `                <div class="project-card" data-id="${id}"
                    data-liveurl="${live}" data-appetizeurl="${appetize}" data-videourl="${video}" data-title="${title}">
                    <div class="project-img-wrapper">
                        <img src="images/${image}" alt="${title}" />
                    </div>
                    <div class="project-info-body">
                        <div class="proj-title">${title}</div>
                        <div class="proj-meta">
                            <p class="proj-desc">
                                <strong>Problem Solved:</strong> ${desc}
                            </p>
                            <div class="proj-tech">
                                ${techPills}
                            </div>
                            <ul class="proj-features">
                                ${featList}
                            </ul>
                        </div>
                    </div>
                    <div class="project-links">
                        <span class="proj-link-btn live-btn"><i class="fas fa-play"></i> Live</span>
                        <span class="proj-link-btn appetize-btn"><i class="fas fa-mobile-alt"></i> Appetize</span>
                        <a href="${github}" target="_blank" rel="noopener"
                            class="proj-link-btn code-btn"><i class="fab fa-github"></i> Code</a>
                    </div>
                </div>`;

    $("#admin-output-code").val(htmlTemplate);
    $("#admin-form-step").hide();
    $("#admin-result-step").fadeIn();
    
    // Preview locally
    var $newCard = $(htmlTemplate);
    if (window.currentlyEditingCard) {
      window.currentlyEditingCard.replaceWith($newCard);
    } else {
      $(".projects-grid").first().append($newCard);
    }
    
    if ("IntersectionObserver" in window) {
      $newCard.addClass("active");
    }
    enableAdminMode(); // re-attach edit button to the new card
  });

  $("#admin-copy-btn").on("click", function() {
    var output = document.getElementById("admin-output-code");
    output.select();
    output.setSelectionRange(0, 99999); 
    document.execCommand("copy");
    $("#admin-copy-status").fadeIn();
    setTimeout(() => $("#admin-copy-status").fadeOut(), 3000);
  });

  $("#admin-reset-btn").on("click", function() {
    $("#admin-result-step").hide();
    $("#admin-form-step").fadeIn();
    window.currentlyEditingCard = null;
    $(".admin-form-scroll input, .admin-form-scroll textarea").val("");
  });
});
