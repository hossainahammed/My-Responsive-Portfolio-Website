(function(){const l=document.createElement("link").relList;if(l&&l.supports&&l.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))d(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const u of s.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&d(u)}).observe(document,{childList:!0,subtree:!0});function p(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function d(r){if(r.ep)return;r.ep=!0;const s=p(r);fetch(r.href,s)}})();$(document).ready(function(){const i=new Lenis({duration:1.2,easing:e=>Math.min(1,1.001-Math.pow(2,-10*e)),smoothWheel:!0,smoothTouch:!1});function l(e){i.raf(e),requestAnimationFrame(l)}requestAnimationFrame(l),i.on("scroll",function(){$(window).trigger("scroll")});const p=$("#themeToggle"),d=p.find("i");function r(e){e==="dark"?d.removeClass("fa-moon").addClass("fa-sun"):d.removeClass("fa-sun").addClass("fa-moon")}const s=document.documentElement.getAttribute("data-theme")||"dark";r(s),p.on("click",function(e){const a=document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark";if(!document.startViewTransition){$("html").addClass("theme-in-transition"),document.documentElement.setAttribute("data-theme",a),localStorage.setItem("theme",a),r(a),setTimeout(function(){$("html").removeClass("theme-in-transition")},500);return}document.startViewTransition(()=>{document.documentElement.setAttribute("data-theme",a),localStorage.setItem("theme",a),r(a)})}),window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",function(e){if(!localStorage.getItem("theme")){const t=e.matches?"dark":"light";document.startViewTransition?document.startViewTransition(()=>{document.documentElement.setAttribute("data-theme",t),r(t)}):($("html").addClass("theme-in-transition"),document.documentElement.setAttribute("data-theme",t),r(t),setTimeout(function(){$("html").removeClass("theme-in-transition")},500))}}),$(window).scroll(function(){this.scrollY>20?$(".navbar").addClass("sticky"):$(".navbar").removeClass("sticky"),this.scrollY>500?$(".scroll-up-btn").addClass("show"):$(".scroll-up-btn").removeClass("show")}),$(".scroll-up-btn").click(function(){i.scrollTo(0)}),$(".navbar .menu li a").click(function(e){e.preventDefault();const t=$(this).attr("href"),a=$(t);a.length&&i.scrollTo(a[0],{offset:-70})}),$(".navbar .logo a").click(function(e){e.preventDefault(),i.scrollTo(0)}),$(".menu-btn").click(function(){$(".navbar .menu").toggleClass("active"),$(".menu-btn i").toggleClass("active")}),$(".hire-btn").on("click",function(e){e.preventDefault();var t=$("#contact");t.length&&i.scrollTo(t[0],{offset:-60,onComplete:function(){var a=$("#contact-name");a.length&&a.focus()}}),$(".navbar .menu").removeClass("active"),$(".menu-btn i").removeClass("active")}),$(".download-cv").on("click",function(e){e.preventDefault();var t=$(this).attr("href");t&&fetch(t,{method:"HEAD",cache:"no-store"}).then(function(a){a.ok?window.location.href=t:alert('CV file not found at "'+t+`".
Please place your CV at that path or update the link in index.html.`)}).catch(function(){window.location.href=t,setTimeout(function(){var a='If the CV did not download, add your CV to "'+t+'" or update the link.';$("#contact-status").length?($("#contact-status").text(a).css("color","var(--primary-color)").fadeIn(120),setTimeout(function(){$("#contact-status").fadeOut(3e3)},4e3)):alert(a)},600)})}),new Typed(".typing",{strings:[" Flutter Developer","Competitive Programmer","Web Developer"],typeSpeed:100,backSpeed:60,loop:!0}),new Typed(".typing-2",{strings:[" Flutter Developer","Competitive Programmer","Web Developer"],typeSpeed:100,backSpeed:60,loop:!0}),$(".carousel").owlCarousel({margin:20,loop:!0,autoplay:!0,autoplayTimeOut:2e3,autoplayHoverPause:!0,responsive:{0:{items:1,nav:!1},600:{items:2,nav:!1},1e3:{items:3,nav:!1}}}),$(".project-card").on("click",function(){var e=$(this),t=(e.attr("data-liveurl")||"").trim(),a=e.attr("data-title")||"";t?(/^https?:\/\//i.test(t)||(t="https://"+t),$("#liveModalTitle").text(a),$("#liveModalIframe").attr("src",t),$("#liveViewModal").attr("aria-hidden","false").fadeIn(180),$("body").addClass("modal-open")):alert("No live link set for this project yet. You can add a live link later by setting the project element's `data-liveurl` attribute.")}),$(".project-card .code-btn").on("click",function(e){e.stopPropagation()}),$(".live-modal__close, .live-modal__overlay").on("click",function(){$("#liveModalIframe").attr("src",""),$("#liveViewModal").attr("aria-hidden","true").fadeOut(150),$("body").removeClass("modal-open")}),window.setProjectLiveUrl=function(e,t){var a=$('.project-card[data-id="'+e+'"]');return a.length?(a.attr("data-liveurl",t),!0):!1},window._updateTeamStars=function(e,t){e.find("i").each(function(){var a=parseInt($(this).attr("data-value"))||0;$(this).toggleClass("filled",a<=t)})},$(".teams .carousel .card").each(function(){var e=$(this),t=e.attr("data-id")||"team-"+e.index(),a=e.find(".rating");if(a.length){var o=localStorage.getItem("team-rating-"+t),n=parseInt(o!==null?o:a.attr("data-rating")||0);a.attr("data-rating",n),window._updateTeamStars(a,n)}}),$(".teams").on("mouseenter",".rating i",function(){var e=$(this),t=e.closest(".rating"),a=parseInt(e.attr("data-value"))||0;t.find("i").each(function(){$(this).toggleClass("filled",($(this).attr("data-value")||0)<=a)})}),$(".teams").on("mouseleave",".rating",function(){var e=$(this),t=parseInt(e.attr("data-rating")||0);window._updateTeamStars(e,t)}),$(".teams").on("click",".rating i",function(){var e=$(this),t=e.closest(".card"),a=t.attr("data-id")||"team-"+t.index(),o=e.closest(".rating"),n=parseInt(e.attr("data-value"))||0;o.attr("data-rating",n),localStorage.setItem("team-rating-"+a,n),window._updateTeamStars(o,n)}),window.setTeamRating=function(e,t){var a=$('.teams .carousel .card[data-id="'+e+'"]');if(!a.length)return!1;var o=a.find(".rating");return o.attr("data-rating",t),localStorage.setItem("team-rating-"+e,t),window._updateTeamStars(o,parseInt(t)),!0},window.getTeamRating=function(e){var t=localStorage.getItem("team-rating-"+e);return t?parseInt(t):null},$("#contactForm").on("submit",function(e){e.preventDefault();var t=$("#contact-name").val().trim(),a=$("#contact-email").val().trim(),o=$("#contact-subject").val().trim(),n=$("#contact-message").val().trim();if(!t||!a||!n){$("#contact-status").text("Please fill your name, email and message.").css("color","var(--primary-color)").fadeIn(120),setTimeout(function(){$("#contact-status").fadeOut(800)},3e3);return}var c=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;if(!c.test(a)){$("#contact-status").text("Please enter a valid email address.").css("color","var(--primary-color)").fadeIn(120),setTimeout(function(){$("#contact-status").fadeOut(800)},3e3);return}var m="hossainahammed627@gmail.com",f="Name: "+t+"%0D%0AEmail: "+a+"%0D%0A%0D%0A"+encodeURIComponent(n),y="mailto:"+encodeURIComponent(m)+"?subject="+encodeURIComponent(o||"Contact from portfolio")+"&body="+f;$("#contact-status").text("Opening your mail app...").css("color","#0a0").fadeIn(120),window.location.href=y,setTimeout(function(){$("#contactForm")[0].reset(),$("#contact-status").text("If your mail app did not open, copy the message and send to hossainahammed627@gmail.com").css("color","#333"),setTimeout(function(){$("#contact-status").fadeOut(1600)},4e3)},600)});const u=$("section"),b=$(".navbar .menu li a");function h(){let e="";const t=$(document).scrollTop()+150,a=$(window).scrollTop()+$(window).height(),o=$(document).height();a>=o-50?e="contact":u.each(function(){const n=$(this).offset().top,c=n+$(this).outerHeight();t>=n&&t<=c&&(e=$(this).attr("id"))}),e&&(b.removeClass("active"),$(`.navbar .menu li a[href="#${e}"]`).addClass("active"))}if($(window).on("scroll",h),h(),"IntersectionObserver"in window){const e=new IntersectionObserver((t,a)=>{t.forEach(o=>{o.isIntersecting&&($(o.target).addClass("active"),a.unobserve(o.target))})},{threshold:.15,rootMargin:"0px 0px -50px 0px"});$(".reveal, .reveal-grid").each(function(){e.observe(this)})}else $(".reveal, .reveal-grid").addClass("active");$(document).on("mousemove",".project-card, .services .card, .teams .card",function(e){const t=this.getBoundingClientRect(),a=e.clientX-t.left,o=e.clientY-t.top;this.style.setProperty("--mouse-x",a+"px"),this.style.setProperty("--mouse-y",o+"px")});const g={"flutter-task":[{name:"task_controller.dart",lang:"dart",code:`import 'package:get/get.dart';
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
}`},{name:"task_model.dart",lang:"dart",code:`class TaskModel {
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
}`}],"flutter-ecom":[{name:"cart_controller.dart",lang:"dart",code:`import 'package:get/get.dart';

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
}`}],"flutter-exp":[{name:"expense_model.dart",lang:"dart",code:`import 'package:hive/hive.dart';

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
}`}],"flutter-unit":[{name:"geolocator_helper.dart",lang:"dart",code:`import 'package:geolocator/geolocator.dart';
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
}`}],"web-honda":[{name:"slider.js",lang:"javascript",code:`// Custom image slider configuration for Honda showcase
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
});`}],"web-travel":[{name:"parallax.js",lang:"javascript",code:`// Traveler landing page parallax scroll interaction
window.addEventListener('scroll', () => {
  const scrollValue = window.scrollY;
  const heroText = document.querySelector('.hero-title');
  const bgImage = document.querySelector('.parallax-bg');

  if (heroText && bgImage) {
    heroText.style.transform = \`translateY(\${scrollValue * 0.4}px)\`;
    bgImage.style.transform = \`translateY(\${scrollValue * 0.15}px)\`;
  }
});`}],"web-shop":[{name:"store.js",lang:"javascript",code:`// Shop and Product cart helper
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
}`}],"web-lib":[{name:"dashboard.js",lang:"javascript",code:`// Library management dashboard search filtering
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
});`}],"php-gym":[{name:"index.php",lang:"php",code:`<?php
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
</div>`}],"php-gymsocial":[{name:"submit_feed.php",lang:"php",code:`<?php
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
}`}],"php-gymcomplete":[{name:"db_connect.php",lang:"php",code:`<?php
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
}`}],"php-crud":[{name:"edit.php",lang:"php",code:`<?php
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
}`}]};$(".project-card .code-btn").on("click",function(e){e.preventDefault(),e.stopPropagation();const t=$(this).closest(".project-card"),a=t.attr("data-id")||"",o=t.attr("data-title")||"Source Code";if(!g[a]){alert("No read-only code files available for this demo card yet.");return}const n=g[a],c=$("#codeFileSelect");c.empty(),n.forEach((m,f)=>{c.append(`<option value="${f}">${m.name}</option>`)}),$("#codeModalTitle").text(o+" Code"),v(n[0]),c.off("change").on("change",function(){const m=parseInt($(this).val());v(n[m])}),$("#codeViewModal").attr("aria-hidden","false").fadeIn(180),$("body").addClass("modal-open")});function v(e){const t=$("#codeModalBlock");t.text(e.code),t.attr("class",`language-${e.lang||"dart"}`),window.Prism&&Prism.highlightElement(t[0])}$(".code-modal__close, .code-modal__overlay").on("click",function(){$("#codeViewModal").attr("aria-hidden","true").fadeOut(150),$("body").removeClass("modal-open")}),$("#codeViewModal").on("contextmenu",function(e){return e.preventDefault(),!1}),$(document).on("keydown",function(e){if($("#codeViewModal").is(":visible")){const a=e.metaKey||e.ctrlKey,o=e.key.toLowerCase();if(a&&(o==="c"||o==="a"||o==="u"||o==="s")||e.keyCode===123)return e.preventDefault(),!1}})});
