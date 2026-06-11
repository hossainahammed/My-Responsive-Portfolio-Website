$(document).ready(function () {
  // Initialize Lenis smooth scroll
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
    smoothWheel: true,
    smoothTouch: false,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Sync scroll reveals with Lenis scrolls
  lenis.on("scroll", function () {
    $(window).trigger("scroll");
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

  $(window).scroll(function () {
    // sticky navbar on scroll script
    if (this.scrollY > 20) {
      $(".navbar").addClass("sticky");
    } else {
      $(".navbar").removeClass("sticky");
    }

    // scroll-up button show/hide script
    if (this.scrollY > 500) {
      $(".scroll-up-btn").addClass("show");
    } else {
      $(".scroll-up-btn").removeClass("show");
    }
  });

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

  // Preloaded snippets for the Code Shield modal
  const PROJECT_CODE = {
    "flutter-task": [
      {
        name: "task_controller.dart",
        lang: "dart",
        code: `import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class TaskController extends GetxController {
  var tasks = <TaskModel>[].obs;
  var isLoading = true.obs;
  final String apiUrl = 'https://api.portfolio.demo/tasks';

  @override
  void onInit() {
    fetchTasks();
    super.onInit();
  }

  Future<void> fetchTasks() async {
    try {
      isLoading(true);
      final response = await http.get(
        Uri.parse(apiUrl),
        headers: {'Accept': 'application/json'},
      );

      if (response.statusCode == 200) {
        List<dynamic> data = json.decode(response.body);
        tasks.assignAll(data.map((json) => TaskModel.fromJson(json)).toList());
      } else {
        Get.snackbar('Error', 'Failed to retrieve tasks');
      }
    } catch (e) {
      Get.snackbar('Exception', e.toString());
    } finally {
      isLoading(false);
    }
  }
}`,
      },
      {
        name: "task_model.dart",
        lang: "dart",
        code: `class TaskModel {
  final int id;
  final String title;
  final String status;

  TaskModel({required this.id, required this.title, required this.status});

  factory TaskModel.fromJson(Map<String, dynamic> json) {
    return TaskModel(
      id: json['id'] as int,
      title: json['title'] as String,
      status: json['status'] as String,
    );
  }
}`,
      },
    ],
    "flutter-ecom": [
      {
        name: "cart_controller.dart",
        lang: "dart",
        code: `import 'package:get/get.dart';

class CartController extends GetxController {
  var cartItems = <Product, int>{}.obs;

  void addProduct(Product product) {
    if (cartItems.containsKey(product)) {
      cartItems[product] = cartItems[product]! + 1;
    } else {
      cartItems[product] = 1;
    }
    Get.snackbar("Added", "\${product.name} added to cart");
  }

  void removeProduct(Product product) {
    if (cartItems.containsKey(product) && cartItems[product] == 1) {
      cartItems.remove(product);
    } else if (cartItems.containsKey(product)) {
      cartItems[product] = cartItems[product]! - 1;
    }
  }

  double get totalAmount => cartItems.entries
      .map((e) => e.key.price * e.value)
      .fold(0.0, (sum, element) => sum + element);
}`,
      },
    ],
    "flutter-exp": [
      {
        name: "expense_model.dart",
        lang: "dart",
        code: `import 'package:hive/hive.dart';

part 'expense_model.g.dart';

@HiveType(typeId: 0)
class ExpenseModel extends HiveObject {
  @HiveField(0)
  late String title;

  @HiveField(1)
  late double amount;

  @HiveField(2)
  late DateTime date;

  @HiveField(3)
  late String category;
}`,
      },
    ],
    "flutter-unit": [
      {
        name: "geolocator_helper.dart",
        lang: "dart",
        code: `import 'package:geolocator/geolocator.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LocatorHelper {
  static Future<Position> determinePosition() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return Future.error('Location services are disabled.');
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return Future.error('Location permissions are denied');
      }
    }
    
    return await Geolocator.getCurrentPosition();
  }
}`,
      },
    ],
    "web-honda": [
      {
        name: "slider.js",
        lang: "javascript",
        code: `// Custom image slider configuration for Honda showcase
const slides = document.querySelectorAll('.honda-slide');
const nextBtn = document.querySelector('.slider-next');
let activeIndex = 0;

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === index);
  });
}

nextBtn.addEventListener('click', () => {
  activeIndex = (activeIndex + 1) % slides.length;
  showSlide(activeIndex);
});`,
      },
    ],
    "web-travel": [
      {
        name: "parallax.js",
        lang: "javascript",
        code: `// Traveler landing page parallax scroll interaction
window.addEventListener('scroll', () => {
  const scrollValue = window.scrollY;
  const heroText = document.querySelector('.hero-title');
  const bgImage = document.querySelector('.parallax-bg');

  if (heroText && bgImage) {
    heroText.style.transform = \`translateY(\${scrollValue * 0.4}px)\`;
    bgImage.style.transform = \`translateY(\${scrollValue * 0.15}px)\`;
  }
});`,
      },
    ],
    "web-shop": [
      {
        name: "store.js",
        lang: "javascript",
        code: `// Shop and Product cart helper
function initLocalStorageCart() {
  let cart = JSON.parse(localStorage.getItem('user_cart')) || [];
  
  window.addToCart = function(product) {
    cart.push(product);
    localStorage.setItem('user_cart', JSON.stringify(cart));
    updateCartIconCount();
  };
}

function updateCartIconCount() {
  const badge = document.querySelector('.cart-badge');
  const cart = JSON.parse(localStorage.getItem('user_cart')) || [];
  if (badge) badge.innerText = cart.length;
}`,
      },
    ],
    "web-lib": [
      {
        name: "dashboard.js",
        lang: "javascript",
        code: `// Library management dashboard search filtering
const searchInput = document.getElementById('libSearch');
const tableRows = document.querySelectorAll('.book-table tbody tr');

searchInput.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  
  tableRows.forEach(row => {
    const title = row.querySelector('.book-title').innerText.toLowerCase();
    const author = row.querySelector('.book-author').innerText.toLowerCase();
    
    if (title.includes(query) || author.includes(query)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
});`,
      },
    ],
    "php-gym": [
      {
        name: "index.php",
        lang: "php",
        code: `<?php
require_once 'db_config.php';

// Fetch current active training slots
$stmt = $pdo->prepare("SELECT * FROM classes WHERE active = 1 ORDER BY start_time ASC");
$stmt->execute();
$classes = $stmt->fetchAll();
?>
<div class="class-grid">
  <?php foreach ($classes as $class): ?>
    <div class="class-card">
      <h4><?= htmlspecialchars($class['name']) ?></h4>
      <p>Trainer: <?= htmlspecialchars($class['instructor']) ?></p>
      <span><?= htmlspecialchars($class['start_time']) ?></span>
    </div>
  <?php endforeach; ?>
</div>`,
      },
    ],
    "php-gymsocial": [
      {
        name: "submit_feed.php",
        lang: "php",
        code: `<?php
session_start();
require_once 'db_config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_SESSION['user_id'])) {
    $userId = $_SESSION['user_id'];
    $postText = trim($_POST['post_text']);
    
    if (!empty($postText)) {
        $stmt = $pdo->prepare("INSERT INTO posts (user_id, body, created_at) VALUES (?, ?, NOW())");
        $stmt->execute([$userId, $postText]);
        header("Location: dashboard.php");
        exit();
    }
}`,
      },
    ],
    "php-gymcomplete": [
      {
        name: "db_connect.php",
        lang: "php",
        code: `<?php
// Secure database connector utilizing PDO settings
$host = '127.0.0.1';
$db   = 'gymnasium_db';
$user = 'db_gym_user';
$pass = 'SECURE_PASSWORD_ENV';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
     throw new PDOException($e->getMessage(), (int)$e->getCode());
}`,
      },
    ],
    "php-crud": [
      {
        name: "edit.php",
        lang: "php",
        code: `<?php
require_once 'db_connect.php';

if (isset($_GET['id'])) {
    $id = (int)$_GET['id'];
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $name = trim($_POST['name']);
        $email = trim($_POST['email']);
        
        $stmt = $pdo->prepare("UPDATE members SET name = ?, email = ? WHERE id = ?");
        $stmt->execute([$name, $email, $id]);
        
        header("Location: index.php?msg=updated");
        exit();
    }
    
    $stmt = $pdo->prepare("SELECT * FROM members WHERE id = ?");
    $stmt->execute([$id]);
    $member = $stmt->fetch();
}`,
      },
    ],
  };

  // Handle click on Code button to open Code Shield Modal
  $(".project-card .code-btn").on("click", function (e) {
    e.preventDefault();
    e.stopPropagation();

    const $card = $(this).closest(".project-card");
    const projId = $card.attr("data-id") || "";
    const title = $card.attr("data-title") || "Source Code";

    if (!PROJECT_CODE[projId]) {
      alert("No read-only code files available for this demo card yet.");
      return;
    }

    const files = PROJECT_CODE[projId];
    const $select = $("#codeFileSelect");
    $select.empty();

    // Populate file dropdown
    files.forEach((f, idx) => {
      $select.append(`<option value="${idx}">${f.name}</option>`);
    });

    $("#codeModalTitle").text(title + " Code");

    // Display the first file
    renderModalFile(files[0]);

    // Track selection changes
    $select.off("change").on("change", function () {
      const idx = parseInt($(this).val());
      renderModalFile(files[idx]);
    });

    // Open Modal
    $("#codeViewModal").attr("aria-hidden", "false").fadeIn(180);
    $("body").addClass("modal-open");
  });

  // Render highlighted file in the code block
  function renderModalFile(fileObj) {
    const $codeBlock = $("#codeModalBlock");
    $codeBlock.text(fileObj.code);

    // Set appropriate prism class
    $codeBlock.attr("class", `language-${fileObj.lang || "dart"}`);

    // Re-run prism highlighting
    if (window.Prism) {
      Prism.highlightElement($codeBlock[0]);
    }
  }

  // Close Code Modal
  $(".code-modal__close, .code-modal__overlay").on("click", function () {
    $("#codeViewModal").attr("aria-hidden", "true").fadeOut(150);
    $("body").removeClass("modal-open");
  });

  // Security restrictions for Code Modal (Right click blocker + Copy blocker)
  $("#codeViewModal").on("contextmenu", function (e) {
    e.preventDefault();
    return false;
  });

  $(document).on("keydown", function (e) {
    const $modal = $("#codeViewModal");
    if ($modal.is(":visible")) {
      // Intercept key combinations: Ctrl+C, Cmd+C, Ctrl+A, Cmd+A, Ctrl+U, Cmd+U, F12
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();

      if (
        (isCmdOrCtrl &&
          (key === "c" || key === "a" || key === "u" || key === "s")) ||
        e.keyCode === 123 // F12
      ) {
        e.preventDefault();
        return false;
      }
    }
  });
});
