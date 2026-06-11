$(document).ready(function () {
  // Initialize Lenis smooth scroll
  // NOTE: scroll-behavior:smooth is set to 'auto' in CSS to avoid double-easing conflict.
  const lenis = new Lenis({
    duration: 0.9,           // snappier feel (was 1.2)
    lerp: 0.1,               // linear interpolation factor — lower = silkier glide
    easing: (t) => t < 0.5  // easeInOutQuart — feels natural and premium
      ? 8 * t * t * t * t
      : 1 - Math.pow(-2 * t + 2, 4) / 2,
    smoothWheel: true,
    smoothTouch: false,      // keep native touch on mobile (better UX)
    wheelMultiplier: 1.0,    // 1:1 wheel ratio — no over-scroll
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
    strings: [" Flutter Developer", "Competitive Programmer", "Web Developer"],
    typeSpeed: 100,
    backSpeed: 60,
    loop: true,
  });

  var typed = new Typed(".typing-2", {
    strings: [" Flutter Developer", "Competitive Programmer", "Web Developer"],
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

  // Preloaded structural configurations for all projects
  const PROJECT_TREES = {
    "flutter-task": {
      name: "task_manager",
      type: "folder",
      expanded: true,
      children: [
        {
          name: "lib",
          type: "folder",
          expanded: true,
          children: [
            {
              name: "controllers",
              type: "folder",
              expanded: true,
              children: [
                {
                  name: "task_controller.dart",
                  type: "file",
                  fileKey: "task_controller",
                  lang: "dart",
                },
              ],
            },
            {
              name: "models",
              type: "folder",
              expanded: true,
              children: [
                {
                  name: "task_model.dart",
                  type: "file",
                  fileKey: "task_model",
                  lang: "dart",
                },
              ],
            },
            {
              name: "views",
              type: "folder",
              expanded: true,
              children: [
                {
                  name: "home_view.dart",
                  type: "file",
                  fileKey: "home_view",
                  lang: "dart",
                },
              ],
            },
            { name: "main.dart", type: "file", fileKey: "main", lang: "dart" },
          ],
        },
        {
          name: "pubspec.yaml",
          type: "file",
          fileKey: "pubspec",
          lang: "yaml",
        },
      ],
    },
    "flutter-ecom": {
      name: "ecommerce_app",
      type: "folder",
      expanded: true,
      children: [
        {
          name: "lib",
          type: "folder",
          expanded: true,
          children: [
            {
              name: "controllers",
              type: "folder",
              expanded: true,
              children: [
                {
                  name: "cart_controller.dart",
                  type: "file",
                  fileKey: "cart_controller",
                  lang: "dart",
                },
              ],
            },
            {
              name: "services",
              type: "folder",
              expanded: true,
              children: [
                {
                  name: "api_service.dart",
                  type: "file",
                  fileKey: "api_service",
                  lang: "dart",
                },
              ],
            },
            {
              name: "views",
              type: "folder",
              expanded: true,
              children: [
                {
                  name: "cart_view.dart",
                  type: "file",
                  fileKey: "cart_view",
                  lang: "dart",
                },
              ],
            },
            { name: "main.dart", type: "file", fileKey: "main", lang: "dart" },
          ],
        },
        {
          name: "pubspec.yaml",
          type: "file",
          fileKey: "pubspec",
          lang: "yaml",
        },
      ],
    },
    "flutter-exp": {
      name: "expense_tracker",
      type: "folder",
      expanded: true,
      children: [
        {
          name: "lib",
          type: "folder",
          expanded: true,
          children: [
            {
              name: "models",
              type: "folder",
              expanded: true,
              children: [
                {
                  name: "expense_model.dart",
                  type: "file",
                  fileKey: "expense_model",
                  lang: "dart",
                },
              ],
            },
            {
              name: "views",
              type: "folder",
              expanded: true,
              children: [
                {
                  name: "add_expense.dart",
                  type: "file",
                  fileKey: "add_expense",
                  lang: "dart",
                },
              ],
            },
            { name: "main.dart", type: "file", fileKey: "main", lang: "dart" },
          ],
        },
        {
          name: "pubspec.yaml",
          type: "file",
          fileKey: "pubspec",
          lang: "yaml",
        },
      ],
    },
    "flutter-unit": {
      name: "unit_converter",
      type: "folder",
      expanded: true,
      children: [
        {
          name: "lib",
          type: "folder",
          expanded: true,
          children: [
            {
              name: "helpers",
              type: "folder",
              expanded: true,
              children: [
                {
                  name: "geolocator_helper.dart",
                  type: "file",
                  fileKey: "geolocator_helper",
                  lang: "dart",
                },
              ],
            },
            {
              name: "services",
              type: "folder",
              expanded: true,
              children: [
                {
                  name: "converter_service.dart",
                  type: "file",
                  fileKey: "converter_service",
                  lang: "dart",
                },
              ],
            },
            { name: "main.dart", type: "file", fileKey: "main", lang: "dart" },
          ],
        },
        {
          name: "pubspec.yaml",
          type: "file",
          fileKey: "pubspec",
          lang: "yaml",
        },
      ],
    },
    "web-honda": {
      name: "honda_website",
      type: "folder",
      expanded: true,
      children: [
        {
          name: "js",
          type: "folder",
          expanded: true,
          children: [
            {
              name: "slider.js",
              type: "file",
              fileKey: "slider",
              lang: "javascript",
            },
          ],
        },
        { name: "index.html", type: "file", fileKey: "index", lang: "html" },
        { name: "style.css", type: "file", fileKey: "style", lang: "css" },
      ],
    },
    "web-travel": {
      name: "travel_website",
      type: "folder",
      expanded: true,
      children: [
        {
          name: "js",
          type: "folder",
          expanded: true,
          children: [
            {
              name: "parallax.js",
              type: "file",
              fileKey: "parallax",
              lang: "javascript",
            },
          ],
        },
        { name: "index.html", type: "file", fileKey: "index", lang: "html" },
      ],
    },
    "web-shop": {
      name: "shop_product",
      type: "folder",
      expanded: true,
      children: [
        {
          name: "js",
          type: "folder",
          expanded: true,
          children: [
            {
              name: "store.js",
              type: "file",
              fileKey: "store",
              lang: "javascript",
            },
          ],
        },
        { name: "index.html", type: "file", fileKey: "index", lang: "html" },
      ],
    },
    "web-lib": {
      name: "library_management",
      type: "folder",
      expanded: true,
      children: [
        {
          name: "js",
          type: "folder",
          expanded: true,
          children: [
            {
              name: "dashboard.js",
              type: "file",
              fileKey: "dashboard",
              lang: "javascript",
            },
          ],
        },
        { name: "index.html", type: "file", fileKey: "index", lang: "html" },
      ],
    },
    "php-gym": {
      name: "gym_website",
      type: "folder",
      expanded: true,
      children: [
        {
          name: "db_config.php",
          type: "file",
          fileKey: "db_config",
          lang: "php",
        },
        { name: "index.php", type: "file", fileKey: "index_php", lang: "php" },
      ],
    },
    "php-gymsocial": {
      name: "gym_social",
      type: "folder",
      expanded: true,
      children: [
        {
          name: "db_config.php",
          type: "file",
          fileKey: "db_config",
          lang: "php",
        },
        {
          name: "submit_feed.php",
          type: "file",
          fileKey: "submit_feed",
          lang: "php",
        },
      ],
    },
    "php-gymcomplete": {
      name: "gym_complete",
      type: "folder",
      expanded: true,
      children: [
        {
          name: "db_connect.php",
          type: "file",
          fileKey: "db_connect",
          lang: "php",
        },
      ],
    },
    "php-crud": {
      name: "crud_operations",
      type: "folder",
      expanded: true,
      children: [
        {
          name: "db_connect.php",
          type: "file",
          fileKey: "db_connect",
          lang: "php",
        },
        { name: "edit.php", type: "file", fileKey: "edit", lang: "php" },
      ],
    },
  };

  const PROJECT_FILES_CODE = {
    "flutter-task": {
      task_controller: {
        code: `import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class TaskController extends GetxController {
  var tasks = <TaskModel>[].obs;
  var isLoading = true.obs;

  @override
  void onInit() {
    fetchTasks();
    super.onInit();
  }

  Future<void> fetchTasks() async {
    try {
      isLoading(true);
      final response = await http.get(Uri.parse('https://api.portfolio.demo/tasks'));
      if (response.statusCode == 200) {
        List<dynamic> data = json.decode(response.body);
        tasks.assignAll(data.map((json) => TaskModel.fromJson(json)).toList());
      }
    } finally {
      isLoading(false);
    }
  }
}`,
      },
      task_model: {
        code: `class TaskModel {
  final int id;
  final String title;
  final String status;

  TaskModel({required this.id, required this.title, required this.status});

  factory TaskModel.fromJson(Map<String, dynamic> json) {
    return TaskModel(
      id: json['id'],
      title: json['title'],
      status: json['status'],
    );
  }
}`,
      },
      home_view: {
        code: `import 'package:flutter/material.dart';
import 'package:get/get.dart';

class HomeView extends StatelessWidget {
  final TaskController controller = Get.put(TaskController());

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Task Manager')),
      body: Obx(() => controller.isLoading.value
          ? Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: controller.tasks.length,
              itemBuilder: (context, index) => ListTile(
                title: Text(controller.tasks[index].title),
              ),
            )),
    );
  }
}`,
      },
      main: {
        code: `import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'views/home_view.dart';

void main() => runApp(GetMaterialApp(home: HomeView()));`,
      },
      pubspec: {
        code: `name: task_manager
dependencies:
  flutter:
    sdk: flutter
  get: ^4.6.6
  http: ^1.1.0`,
      },
    },
    "flutter-ecom": {
      cart_controller: {
        code: `import 'package:get/get.dart';

class CartController extends GetxController {
  var cartItems = <Product, int>{}.obs;

  void addProduct(Product product) {
    cartItems[product] = (cartItems[product] ?? 0) + 1;
    Get.snackbar("Added", "\${product.name} added to cart");
  }

  double get totalAmount => cartItems.entries
      .map((e) => e.key.price * e.value)
      .fold(0.0, (sum, el) => sum + el);
}`,
      },
      api_service: {
        code: `import 'package:http/http.dart' as http;

class ApiService {
  static Future<http.Response> fetchProducts() async {
    return await http.get(Uri.parse('https://api.portfolio.demo/products'));
  }
}`,
      },
      cart_view: {
        code: `import 'package:flutter/material.dart';
import 'package:get/get.dart';

class CartView extends StatelessWidget {
  final CartController controller = Get.find();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Your Cart")),
      body: Obx(() => ListView(
        children: controller.cartItems.entries.map((e) => ListTile(
          title: Text(e.key.name),
          trailing: Text("Qty: \${e.value}"),
        )).toList(),
      )),
    );
  }
}`,
      },
      main: {
        code: `import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'controllers/cart_controller.dart';

void main() {
  Get.put(CartController());
  runApp(GetMaterialApp(home: CatalogView()));
}`,
      },
      pubspec: {
        code: `name: ecommerce_app
dependencies:
  flutter:
    sdk: flutter
  get: ^4.6.6
  http: ^1.1.0`,
      },
    },
    "flutter-exp": {
      expense_model: {
        code: `import 'package:hive/hive.dart';
part 'expense_model.g.dart';

@HiveType(typeId: 0)
class ExpenseModel extends HiveObject {
  @HiveField(0) late String title;
  @HiveField(1) late double amount;
  @HiveField(2) late DateTime date;
}`,
      },
      add_expense: {
        code: `import 'package:flutter/material.dart';
import 'package:hive/hive.dart';

class AddExpense extends StatelessWidget {
  void saveExpense(String title, double amount) {
    final box = Hive.box<ExpenseModel>('expenses');
    box.add(ExpenseModel()..title = title..amount = amount..date = DateTime.now());
  }

  @override
  Widget build(BuildContext context) => Scaffold(body: Center(child: Text("Add Expense UI")));
}`,
      },
      main: {
        code: `import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'models/expense_model.dart';

void main() async {
  await Hive.initFlutter();
  Hive.registerAdapter(ExpenseModelAdapter());
  await Hive.openBox<ExpenseModel>('expenses');
  runApp(MaterialApp(home: HomeScreen()));
}`,
      },
      pubspec: {
        code: `name: expense_tracker
dependencies:
  flutter:
    sdk: flutter
  hive_flutter: ^1.1.0`,
      },
    },
    "flutter-unit": {
      geolocator_helper: {
        code: `import 'package:geolocator/geolocator.dart';

class LocatorHelper {
  static Future<Position> getPosition() async {
    return await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high
    );
  }
}`,
      },
      converter_service: {
        code: `class ConverterService {
  static double convertCelsiusToFahrenheit(double c) => (c * 9/5) + 32;
  static double convertFahrenheitToCelsius(double f) => (f - 32) * 5/9;
}`,
      },
      main: {
        code: `import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() => runApp(MaterialApp(home: ConverterScreen()));`,
      },
      pubspec: {
        code: `name: unit_converter
dependencies:
  flutter:
    sdk: flutter
  geolocator: ^10.1.0
  shared_preferences: ^2.2.2`,
      },
    },
    "web-honda": {
      slider: {
        code: `const slides = document.querySelectorAll('.honda-slide');
let index = 0;

function showSlide() {
  slides.forEach((s, i) => s.classList.toggle('active', i === index));
  index = (index + 1) % slides.length;
}
setInterval(showSlide, 3000);`,
      },
      index: {
        code: `<!html>
<div class="honda-slider">
  <div class="honda-slide active">Slide 1</div>
  <div class="honda-slide">Slide 2</div>
</div>`,
      },
      style: {
        code: `.honda-slider { position: relative; }
.honda-slide { display: none; }
.honda-slide.active { display: block; }`,
      },
    },
    "web-travel": {
      parallax: {
        code: `window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  document.querySelector('.hero').style.transform = \`translateY(\${scrolled * 0.4}px)\`;
});`,
      },
      index: {
        code: `<!html>
<section class="hero">
  <h1>Explore The World</h1>
</section>`,
      },
    },
    "web-shop": {
      store: {
        code: `function addToCart(productId) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.push(productId);
  localStorage.setItem('cart', JSON.stringify(cart));
}`,
      },
      index: {
        code: `<!html>
<button onclick="addToCart(101)">Add Product</button>`,
      },
    },
    "web-lib": {
      dashboard: {
        code: `const filterInput = document.getElementById('search');
filterInput.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  document.querySelectorAll('tr').forEach(r => {
    r.style.display = r.innerText.includes(query) ? '' : 'none';
  });
});`,
      },
      index: {
        code: `<!html>
<input id="search" placeholder="Search Books..."/>`,
      },
    },
    "php-gym": {
      db_config: {
        code: `<?php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'gym_db');`,
      },
      index_php: {
        code: `<?php
require_once 'db_config.php';
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
$res = $conn->query("SELECT * FROM slots");
while($row = $res->fetch_assoc()) {
  echo "Class: " . $row['title'] . "<br/>";
}`,
      },
    },
    "php-gymsocial": {
      db_config: {
        code: `<?php
$conn = new PDO("mysql:host=localhost;dbname=gym_social", "root", "");`,
      },
      submit_feed: {
        code: `<?php
require_once 'db_config.php';
if($_SERVER['REQUEST_METHOD'] === 'POST') {
  $text = htmlspecialchars($_POST['text']);
  $stmt = $conn->prepare("INSERT INTO posts (content) VALUES (?)");
  $stmt->execute([$text]);
  header("Location: feed.php");
}`,
      },
    },
    "php-gymcomplete": {
      db_connect: {
        code: `<?php
try {
  $db = new PDO("mysql:host=localhost;dbname=gym_main", "user", "pass");
} catch(PDOException $e) {
  die("Connection failure: " . $e->getMessage());
}`,
      },
    },
    "php-crud": {
      db_connect: {
        code: `<?php
$pdo = new PDO("mysql:host=localhost;dbname=crud_db", "root", "");`,
      },
      edit: {
        code: `<?php
require_once 'db_connect.php';
if(isset($_POST['update'])) {
  $stmt = $pdo->prepare("UPDATE items SET val = ? WHERE id = ?");
  $stmt->execute([$_POST['val'], $_POST['id']]);
}`,
      },
    },
  };

  // Render file tree recursively
  function renderFileTree(node, $container, projectKey) {
    const $ul = $("<ul></ul>");

    const nodes = node.children || [];
    nodes.sort((a, b) => {
      if (a.type === "folder" && b.type === "file") return -1;
      if (a.type === "file" && b.type === "folder") return 1;
      return a.name.localeCompare(b.name);
    });

    nodes.forEach((child) => {
      const $li = $("<li></li>");

      if (child.type === "folder") {
        const isExpanded = child.expanded !== false;
        const iconClass = isExpanded ? "fa-folder-open" : "fa-folder";

        const $folderNode = $(`
          <div class="tree-node folder-node">
            <i class="fas ${iconClass}"></i>
            <span>${child.name}</span>
          </div>
        `);

        $li.append($folderNode);

        const $childContainer = $("<div class='tree-children'></div>");
        if (!isExpanded) {
          $childContainer.hide();
        }

        renderFileTree(child, $childContainer, projectKey);
        $li.append($childContainer);

        $folderNode.on("click", function (e) {
          e.stopPropagation();
          const $icon = $(this).find("i");
          $childContainer.slideToggle(120);

          if ($icon.hasClass("fa-folder")) {
            $icon.removeClass("fa-folder").addClass("fa-folder-open");
          } else {
            $icon.removeClass("fa-folder-open").addClass("fa-folder");
          }
        });
      } else {
        const $fileNode = $(`
          <div class="tree-node file-node" data-filekey="${child.fileKey}" data-lang="${child.lang || "dart"}">
            <i class="fas fa-file-code"></i>
            <span>${child.name}</span>
          </div>
        `);

        $li.append($fileNode);

        $fileNode.on("click", function (e) {
          e.stopPropagation();
          $(".tree-node.file-node").removeClass("active-file");
          $(this).addClass("active-file");

          const fKey = $(this).attr("data-filekey");
          const lang = $(this).attr("data-lang");
          const codeData =
            PROJECT_FILES_CODE[projectKey] &&
            PROJECT_FILES_CODE[projectKey][fKey];

          if (codeData) {
            renderModalCode(codeData.code, lang);
          } else {
            renderModalCode(
              `// File omitted for brevity.\n// Focus on models, controllers, and database services in this explorer directory.`,
              lang,
            );
          }

          if (window.innerWidth <= 768) {
            $("body").removeClass("code-sidebar-open");
          }
        });
      }
      $ul.append($li);
    });

    $container.append($ul);
  }

  function renderModalCode(codeText, lang) {
    const $codeBlock = $("#codeModalBlock");
    $codeBlock.text(codeText);
    $codeBlock.attr("class", `language-${lang || "dart"}`);
    if (window.Prism) {
      Prism.highlightElement($codeBlock[0]);
    }
  }

  // Intercept "Code" button clicks on project cards
  $(".project-card .code-btn").on("click", function (e) {
    e.preventDefault();
    e.stopPropagation();

    const $card = $(this).closest(".project-card");
    const projId = $card.attr("data-id") || "";
    const title = $card.attr("data-title") || "Source Code";

    if (!PROJECT_TREES[projId]) {
      alert(
        "No code files or tree structure mapped for this demo project card.",
      );
      return;
    }

    $("#codeModalTitle").text(title + " Structure");

    const $treeContainer = $("#fileTreeContainer");
    $treeContainer.empty();

    const rootTree = PROJECT_TREES[projId];
    renderFileTree(rootTree, $treeContainer, projId);

    setTimeout(() => {
      const $firstFile = $treeContainer.find(".file-node").first();
      if ($firstFile.length) {
        $firstFile.click();
      } else {
        renderModalCode("// Empty project directory", "dart");
      }
    }, 50);

    $("#codeViewModal").attr("aria-hidden", "false").fadeIn(180);
    $("body").addClass("modal-open").removeClass("code-sidebar-open");
  });

  // Mobile Explorer Sidebar Drawer Toggle
  $("#sidebarToggleBtn").on("click", function (e) {
    e.stopPropagation();
    $("body").toggleClass("code-sidebar-open");
  });

  // Close modals
  $(".code-modal__close, .code-modal__overlay").on("click", function () {
    $("#codeViewModal").attr("aria-hidden", "true").fadeOut(150);
    $("body").removeClass("modal-open").removeClass("code-sidebar-open");
  });

  // Security restrictions for Code Modal (Right click blocker + Copy blocker)
  $("#codeViewModal").on("contextmenu", function (e) {
    e.preventDefault();
    return false;
  });

  $(document).on("keydown", function (e) {
    const $modal = $("#codeViewModal");
    if ($modal.is(":visible")) {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();

      if (
        (isCmdOrCtrl &&
          (key === "c" || key === "a" || key === "u" || key === "s")) ||
        e.keyCode === 123
      ) {
        e.preventDefault();
        return false;
      }
    }
  });
});
