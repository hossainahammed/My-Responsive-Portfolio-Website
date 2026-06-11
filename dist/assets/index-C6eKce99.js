(function(){const m=document.createElement("link").relList;if(m&&m.supports&&m.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))u(o);new MutationObserver(o=>{for(const l of o)if(l.type==="childList")for(const f of l.addedNodes)f.tagName==="LINK"&&f.rel==="modulepreload"&&u(f)}).observe(document,{childList:!0,subtree:!0});function g(o){const l={};return o.integrity&&(l.integrity=o.integrity),o.referrerPolicy&&(l.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?l.credentials="include":o.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function u(o){if(o.ep)return;o.ep=!0;const l=g(o);fetch(o.href,l)}})();$(document).ready(function(){const s=new Lenis({duration:1.2,easing:e=>Math.min(1,1.001-Math.pow(2,-10*e)),smoothWheel:!0,smoothTouch:!1});function m(e){s.raf(e),requestAnimationFrame(m)}requestAnimationFrame(m),s.on("scroll",function(){$(window).trigger("scroll")});const g=$("#themeToggle"),u=g.find("i");function o(e){e==="dark"?u.removeClass("fa-moon").addClass("fa-sun"):u.removeClass("fa-sun").addClass("fa-moon")}const l=document.documentElement.getAttribute("data-theme")||"dark";o(l),g.on("click",function(e){const a=document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark";if(!document.startViewTransition){$("html").addClass("theme-in-transition"),document.documentElement.setAttribute("data-theme",a),localStorage.setItem("theme",a),o(a),setTimeout(function(){$("html").removeClass("theme-in-transition")},500);return}document.startViewTransition(()=>{document.documentElement.setAttribute("data-theme",a),localStorage.setItem("theme",a),o(a)})}),window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",function(e){if(!localStorage.getItem("theme")){const t=e.matches?"dark":"light";document.startViewTransition?document.startViewTransition(()=>{document.documentElement.setAttribute("data-theme",t),o(t)}):($("html").addClass("theme-in-transition"),document.documentElement.setAttribute("data-theme",t),o(t),setTimeout(function(){$("html").removeClass("theme-in-transition")},500))}}),$(window).scroll(function(){this.scrollY>20?$(".navbar").addClass("sticky"):$(".navbar").removeClass("sticky"),this.scrollY>500?$(".scroll-up-btn").addClass("show"):$(".scroll-up-btn").removeClass("show")}),$(".scroll-up-btn").click(function(){s.scrollTo(0)}),$(".navbar .menu li a").click(function(e){e.preventDefault();const t=$(this).attr("href"),a=$(t);a.length&&s.scrollTo(a[0],{offset:-70})}),$(".navbar .logo a").click(function(e){e.preventDefault(),s.scrollTo(0)}),$(".menu-btn").click(function(){$(".navbar .menu").toggleClass("active"),$(".menu-btn i").toggleClass("active")}),$(".hire-btn").on("click",function(e){e.preventDefault();var t=$("#contact");t.length&&s.scrollTo(t[0],{offset:-60,onComplete:function(){var a=$("#contact-name");a.length&&a.focus()}}),$(".navbar .menu").removeClass("active"),$(".menu-btn i").removeClass("active")}),$(".download-cv").on("click",function(e){e.preventDefault();var t=$(this).attr("href");t&&fetch(t,{method:"HEAD",cache:"no-store"}).then(function(a){a.ok?window.location.href=t:alert('CV file not found at "'+t+`".
Please place your CV at that path or update the link in index.html.`)}).catch(function(){window.location.href=t,setTimeout(function(){var a='If the CV did not download, add your CV to "'+t+'" or update the link.';$("#contact-status").length?($("#contact-status").text(a).css("color","var(--primary-color)").fadeIn(120),setTimeout(function(){$("#contact-status").fadeOut(3e3)},4e3)):alert(a)},600)})}),new Typed(".typing",{strings:[" Flutter Developer","Competitive Programmer","Web Developer"],typeSpeed:100,backSpeed:60,loop:!0}),new Typed(".typing-2",{strings:[" Flutter Developer","Competitive Programmer","Web Developer"],typeSpeed:100,backSpeed:60,loop:!0}),$(".carousel").owlCarousel({margin:20,loop:!0,autoplay:!0,autoplayTimeOut:2e3,autoplayHoverPause:!0,responsive:{0:{items:1,nav:!1},600:{items:2,nav:!1},1e3:{items:3,nav:!1}}}),$(".project-card").on("click",function(){var e=$(this),t=(e.attr("data-liveurl")||"").trim(),a=e.attr("data-title")||"";t?(/^https?:\/\//i.test(t)||(t="https://"+t),$("#liveModalTitle").text(a),$("#liveModalIframe").attr("src",t),$("#liveViewModal").attr("aria-hidden","false").fadeIn(180),$("body").addClass("modal-open")):alert("No live link set for this project yet. You can add a live link later by setting the project element's `data-liveurl` attribute.")}),$(".project-card .code-btn").on("click",function(e){e.stopPropagation()}),$(".live-modal__close, .live-modal__overlay").on("click",function(){$("#liveModalIframe").attr("src",""),$("#liveViewModal").attr("aria-hidden","true").fadeOut(150),$("body").removeClass("modal-open")}),window.setProjectLiveUrl=function(e,t){var a=$('.project-card[data-id="'+e+'"]');return a.length?(a.attr("data-liveurl",t),!0):!1},window._updateTeamStars=function(e,t){e.find("i").each(function(){var a=parseInt($(this).attr("data-value"))||0;$(this).toggleClass("filled",a<=t)})},$(".teams .carousel .card").each(function(){var e=$(this),t=e.attr("data-id")||"team-"+e.index(),a=e.find(".rating");if(a.length){var r=localStorage.getItem("team-rating-"+t),n=parseInt(r!==null?r:a.attr("data-rating")||0);a.attr("data-rating",n),window._updateTeamStars(a,n)}}),$(".teams").on("mouseenter",".rating i",function(){var e=$(this),t=e.closest(".rating"),a=parseInt(e.attr("data-value"))||0;t.find("i").each(function(){$(this).toggleClass("filled",($(this).attr("data-value")||0)<=a)})}),$(".teams").on("mouseleave",".rating",function(){var e=$(this),t=parseInt(e.attr("data-rating")||0);window._updateTeamStars(e,t)}),$(".teams").on("click",".rating i",function(){var e=$(this),t=e.closest(".card"),a=t.attr("data-id")||"team-"+t.index(),r=e.closest(".rating"),n=parseInt(e.attr("data-value"))||0;r.attr("data-rating",n),localStorage.setItem("team-rating-"+a,n),window._updateTeamStars(r,n)}),window.setTeamRating=function(e,t){var a=$('.teams .carousel .card[data-id="'+e+'"]');if(!a.length)return!1;var r=a.find(".rating");return r.attr("data-rating",t),localStorage.setItem("team-rating-"+e,t),window._updateTeamStars(r,parseInt(t)),!0},window.getTeamRating=function(e){var t=localStorage.getItem("team-rating-"+e);return t?parseInt(t):null},$("#contactForm").on("submit",function(e){e.preventDefault();var t=$("#contact-name").val().trim(),a=$("#contact-email").val().trim(),r=$("#contact-subject").val().trim(),n=$("#contact-message").val().trim();if(!t||!a||!n){$("#contact-status").text("Please fill your name, email and message.").css("color","var(--primary-color)").fadeIn(120),setTimeout(function(){$("#contact-status").fadeOut(800)},3e3);return}var i=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;if(!i.test(a)){$("#contact-status").text("Please enter a valid email address.").css("color","var(--primary-color)").fadeIn(120),setTimeout(function(){$("#contact-status").fadeOut(800)},3e3);return}var d="hossainahammed627@gmail.com",c="Name: "+t+"%0D%0AEmail: "+a+"%0D%0A%0D%0A"+encodeURIComponent(n),h="mailto:"+encodeURIComponent(d)+"?subject="+encodeURIComponent(r||"Contact from portfolio")+"&body="+c;$("#contact-status").text("Opening your mail app...").css("color","#0a0").fadeIn(120),window.location.href=h,setTimeout(function(){$("#contactForm")[0].reset(),$("#contact-status").text("If your mail app did not open, copy the message and send to hossainahammed627@gmail.com").css("color","#333"),setTimeout(function(){$("#contact-status").fadeOut(1600)},4e3)},600)});const f=$("section"),T=$(".navbar .menu li a");function _(){let e="";const t=$(document).scrollTop()+150,a=$(window).scrollTop()+$(window).height(),r=$(document).height();a>=r-50?e="contact":f.each(function(){const n=$(this).offset().top,i=n+$(this).outerHeight();t>=n&&t<=i&&(e=$(this).attr("id"))}),e&&(T.removeClass("active"),$(`.navbar .menu li a[href="#${e}"]`).addClass("active"))}if($(window).on("scroll",_),_(),"IntersectionObserver"in window){const e=new IntersectionObserver((t,a)=>{t.forEach(r=>{r.isIntersecting&&($(r.target).addClass("active"),a.unobserve(r.target))})},{threshold:.15,rootMargin:"0px 0px -50px 0px"});$(".reveal, .reveal-grid").each(function(){e.observe(this)})}else $(".reveal, .reveal-grid").addClass("active");$(document).on("mousemove",".project-card, .services .card, .teams .card",function(e){const t=this.getBoundingClientRect(),a=e.clientX-t.left,r=e.clientY-t.top;this.style.setProperty("--mouse-x",a+"px"),this.style.setProperty("--mouse-y",r+"px")});const w={"flutter-task":{name:"task_manager",type:"folder",expanded:!0,children:[{name:"lib",type:"folder",expanded:!0,children:[{name:"controllers",type:"folder",expanded:!0,children:[{name:"task_controller.dart",type:"file",fileKey:"task_controller",lang:"dart"}]},{name:"models",type:"folder",expanded:!0,children:[{name:"task_model.dart",type:"file",fileKey:"task_model",lang:"dart"}]},{name:"views",type:"folder",expanded:!0,children:[{name:"home_view.dart",type:"file",fileKey:"home_view",lang:"dart"}]},{name:"main.dart",type:"file",fileKey:"main",lang:"dart"}]},{name:"pubspec.yaml",type:"file",fileKey:"pubspec",lang:"yaml"}]},"flutter-ecom":{name:"ecommerce_app",type:"folder",expanded:!0,children:[{name:"lib",type:"folder",expanded:!0,children:[{name:"controllers",type:"folder",expanded:!0,children:[{name:"cart_controller.dart",type:"file",fileKey:"cart_controller",lang:"dart"}]},{name:"services",type:"folder",expanded:!0,children:[{name:"api_service.dart",type:"file",fileKey:"api_service",lang:"dart"}]},{name:"views",type:"folder",expanded:!0,children:[{name:"cart_view.dart",type:"file",fileKey:"cart_view",lang:"dart"}]},{name:"main.dart",type:"file",fileKey:"main",lang:"dart"}]},{name:"pubspec.yaml",type:"file",fileKey:"pubspec",lang:"yaml"}]},"flutter-exp":{name:"expense_tracker",type:"folder",expanded:!0,children:[{name:"lib",type:"folder",expanded:!0,children:[{name:"models",type:"folder",expanded:!0,children:[{name:"expense_model.dart",type:"file",fileKey:"expense_model",lang:"dart"}]},{name:"views",type:"folder",expanded:!0,children:[{name:"add_expense.dart",type:"file",fileKey:"add_expense",lang:"dart"}]},{name:"main.dart",type:"file",fileKey:"main",lang:"dart"}]},{name:"pubspec.yaml",type:"file",fileKey:"pubspec",lang:"yaml"}]},"flutter-unit":{name:"unit_converter",type:"folder",expanded:!0,children:[{name:"lib",type:"folder",expanded:!0,children:[{name:"helpers",type:"folder",expanded:!0,children:[{name:"geolocator_helper.dart",type:"file",fileKey:"geolocator_helper",lang:"dart"}]},{name:"services",type:"folder",expanded:!0,children:[{name:"converter_service.dart",type:"file",fileKey:"converter_service",lang:"dart"}]},{name:"main.dart",type:"file",fileKey:"main",lang:"dart"}]},{name:"pubspec.yaml",type:"file",fileKey:"pubspec",lang:"yaml"}]},"web-honda":{name:"honda_website",type:"folder",expanded:!0,children:[{name:"js",type:"folder",expanded:!0,children:[{name:"slider.js",type:"file",fileKey:"slider",lang:"javascript"}]},{name:"index.html",type:"file",fileKey:"index",lang:"html"},{name:"style.css",type:"file",fileKey:"style",lang:"css"}]},"web-travel":{name:"travel_website",type:"folder",expanded:!0,children:[{name:"js",type:"folder",expanded:!0,children:[{name:"parallax.js",type:"file",fileKey:"parallax",lang:"javascript"}]},{name:"index.html",type:"file",fileKey:"index",lang:"html"}]},"web-shop":{name:"shop_product",type:"folder",expanded:!0,children:[{name:"js",type:"folder",expanded:!0,children:[{name:"store.js",type:"file",fileKey:"store",lang:"javascript"}]},{name:"index.html",type:"file",fileKey:"index",lang:"html"}]},"web-lib":{name:"library_management",type:"folder",expanded:!0,children:[{name:"js",type:"folder",expanded:!0,children:[{name:"dashboard.js",type:"file",fileKey:"dashboard",lang:"javascript"}]},{name:"index.html",type:"file",fileKey:"index",lang:"html"}]},"php-gym":{name:"gym_website",type:"folder",expanded:!0,children:[{name:"db_config.php",type:"file",fileKey:"db_config",lang:"php"},{name:"index.php",type:"file",fileKey:"index_php",lang:"php"}]},"php-gymsocial":{name:"gym_social",type:"folder",expanded:!0,children:[{name:"db_config.php",type:"file",fileKey:"db_config",lang:"php"},{name:"submit_feed.php",type:"file",fileKey:"submit_feed",lang:"php"}]},"php-gymcomplete":{name:"gym_complete",type:"folder",expanded:!0,children:[{name:"db_connect.php",type:"file",fileKey:"db_connect",lang:"php"}]},"php-crud":{name:"crud_operations",type:"folder",expanded:!0,children:[{name:"db_connect.php",type:"file",fileKey:"db_connect",lang:"php"},{name:"edit.php",type:"file",fileKey:"edit",lang:"php"}]}},C={"flutter-task":{task_controller:{code:`import 'package:get/get.dart';
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
}`},task_model:{code:`class TaskModel {
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
}`},home_view:{code:`import 'package:flutter/material.dart';
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
}`},main:{code:`import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'views/home_view.dart';

void main() => runApp(GetMaterialApp(home: HomeView()));`},pubspec:{code:`name: task_manager
dependencies:
  flutter:
    sdk: flutter
  get: ^4.6.6
  http: ^1.1.0`}},"flutter-ecom":{cart_controller:{code:`import 'package:get/get.dart';

class CartController extends GetxController {
  var cartItems = <Product, int>{}.obs;

  void addProduct(Product product) {
    cartItems[product] = (cartItems[product] ?? 0) + 1;
    Get.snackbar("Added", "\${product.name} added to cart");
  }

  double get totalAmount => cartItems.entries
      .map((e) => e.key.price * e.value)
      .fold(0.0, (sum, el) => sum + el);
}`},api_service:{code:`import 'package:http/http.dart' as http;

class ApiService {
  static Future<http.Response> fetchProducts() async {
    return await http.get(Uri.parse('https://api.portfolio.demo/products'));
  }
}`},cart_view:{code:`import 'package:flutter/material.dart';
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
}`},main:{code:`import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'controllers/cart_controller.dart';

void main() {
  Get.put(CartController());
  runApp(GetMaterialApp(home: CatalogView()));
}`},pubspec:{code:`name: ecommerce_app
dependencies:
  flutter:
    sdk: flutter
  get: ^4.6.6
  http: ^1.1.0`}},"flutter-exp":{expense_model:{code:`import 'package:hive/hive.dart';
part 'expense_model.g.dart';

@HiveType(typeId: 0)
class ExpenseModel extends HiveObject {
  @HiveField(0) late String title;
  @HiveField(1) late double amount;
  @HiveField(2) late DateTime date;
}`},add_expense:{code:`import 'package:flutter/material.dart';
import 'package:hive/hive.dart';

class AddExpense extends StatelessWidget {
  void saveExpense(String title, double amount) {
    final box = Hive.box<ExpenseModel>('expenses');
    box.add(ExpenseModel()..title = title..amount = amount..date = DateTime.now());
  }

  @override
  Widget build(BuildContext context) => Scaffold(body: Center(child: Text("Add Expense UI")));
}`},main:{code:`import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'models/expense_model.dart';

void main() async {
  await Hive.initFlutter();
  Hive.registerAdapter(ExpenseModelAdapter());
  await Hive.openBox<ExpenseModel>('expenses');
  runApp(MaterialApp(home: HomeScreen()));
}`},pubspec:{code:`name: expense_tracker
dependencies:
  flutter:
    sdk: flutter
  hive_flutter: ^1.1.0`}},"flutter-unit":{geolocator_helper:{code:`import 'package:geolocator/geolocator.dart';

class LocatorHelper {
  static Future<Position> getPosition() async {
    return await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high
    );
  }
}`},converter_service:{code:`class ConverterService {
  static double convertCelsiusToFahrenheit(double c) => (c * 9/5) + 32;
  static double convertFahrenheitToCelsius(double f) => (f - 32) * 5/9;
}`},main:{code:`import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() => runApp(MaterialApp(home: ConverterScreen()));`},pubspec:{code:`name: unit_converter
dependencies:
  flutter:
    sdk: flutter
  geolocator: ^10.1.0
  shared_preferences: ^2.2.2`}},"web-honda":{slider:{code:`const slides = document.querySelectorAll('.honda-slide');
let index = 0;

function showSlide() {
  slides.forEach((s, i) => s.classList.toggle('active', i === index));
  index = (index + 1) % slides.length;
}
setInterval(showSlide, 3000);`},index:{code:`<!html>
<div class="honda-slider">
  <div class="honda-slide active">Slide 1</div>
  <div class="honda-slide">Slide 2</div>
</div>`},style:{code:`.honda-slider { position: relative; }
.honda-slide { display: none; }
.honda-slide.active { display: block; }`}},"web-travel":{parallax:{code:"window.addEventListener('scroll', () => {\n  const scrolled = window.scrollY;\n  document.querySelector('.hero').style.transform = `translateY(${scrolled * 0.4}px)`;\n});"},index:{code:`<!html>
<section class="hero">
  <h1>Explore The World</h1>
</section>`}},"web-shop":{store:{code:`function addToCart(productId) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.push(productId);
  localStorage.setItem('cart', JSON.stringify(cart));
}`},index:{code:`<!html>
<button onclick="addToCart(101)">Add Product</button>`}},"web-lib":{dashboard:{code:`const filterInput = document.getElementById('search');
filterInput.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  document.querySelectorAll('tr').forEach(r => {
    r.style.display = r.innerText.includes(query) ? '' : 'none';
  });
});`},index:{code:`<!html>
<input id="search" placeholder="Search Books..."/>`}},"php-gym":{db_config:{code:`<?php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'gym_db');`},index_php:{code:`<?php
require_once 'db_config.php';
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
$res = $conn->query("SELECT * FROM slots");
while($row = $res->fetch_assoc()) {
  echo "Class: " . $row['title'] . "<br/>";
}`}},"php-gymsocial":{db_config:{code:`<?php
$conn = new PDO("mysql:host=localhost;dbname=gym_social", "root", "");`},submit_feed:{code:`<?php
require_once 'db_config.php';
if($_SERVER['REQUEST_METHOD'] === 'POST') {
  $text = htmlspecialchars($_POST['text']);
  $stmt = $conn->prepare("INSERT INTO posts (content) VALUES (?)");
  $stmt->execute([$text]);
  header("Location: feed.php");
}`}},"php-gymcomplete":{db_connect:{code:`<?php
try {
  $db = new PDO("mysql:host=localhost;dbname=gym_main", "user", "pass");
} catch(PDOException $e) {
  die("Connection failure: " . $e->getMessage());
}`}},"php-crud":{db_connect:{code:`<?php
$pdo = new PDO("mysql:host=localhost;dbname=crud_db", "root", "");`},edit:{code:`<?php
require_once 'db_connect.php';
if(isset($_POST['update'])) {
  $stmt = $pdo->prepare("UPDATE items SET val = ? WHERE id = ?");
  $stmt->execute([$_POST['val'], $_POST['id']]);
}`}}};function k(e,t,a){const r=$("<ul></ul>"),n=e.children||[];n.sort((i,d)=>i.type==="folder"&&d.type==="file"?-1:i.type==="file"&&d.type==="folder"?1:i.name.localeCompare(d.name)),n.forEach(i=>{const d=$("<li></li>");if(i.type==="folder"){const c=i.expanded!==!1,h=c?"fa-folder-open":"fa-folder",v=$(`
          <div class="tree-node folder-node">
            <i class="fas ${h}"></i>
            <span>${i.name}</span>
          </div>
        `);d.append(v);const p=$("<div class='tree-children'></div>");c||p.hide(),k(i,p,a),d.append(p),v.on("click",function(y){y.stopPropagation();const x=$(this).find("i");p.slideToggle(120),x.hasClass("fa-folder")?x.removeClass("fa-folder").addClass("fa-folder-open"):x.removeClass("fa-folder-open").addClass("fa-folder")})}else{const c=$(`
          <div class="tree-node file-node" data-filekey="${i.fileKey}" data-lang="${i.lang||"dart"}">
            <i class="fas fa-file-code"></i>
            <span>${i.name}</span>
          </div>
        `);d.append(c),c.on("click",function(h){h.stopPropagation(),$(".tree-node.file-node").removeClass("active-file"),$(this).addClass("active-file");const v=$(this).attr("data-filekey"),p=$(this).attr("data-lang"),y=C[a]&&C[a][v];b(y?y.code:`// File omitted for brevity.
// Focus on models, controllers, and database services in this explorer directory.`,p),window.innerWidth<=768&&$("body").removeClass("code-sidebar-open")})}r.append(d)}),t.append(r)}function b(e,t){const a=$("#codeModalBlock");a.text(e),a.attr("class",`language-${t||"dart"}`),window.Prism&&Prism.highlightElement(a[0])}$(".project-card .code-btn").on("click",function(e){e.preventDefault(),e.stopPropagation();const t=$(this).closest(".project-card"),a=t.attr("data-id")||"",r=t.attr("data-title")||"Source Code";if(!w[a]){alert("No code files or tree structure mapped for this demo project card.");return}$("#codeModalTitle").text(r+" Structure");const n=$("#fileTreeContainer");n.empty();const i=w[a];k(i,n,a),setTimeout(()=>{const d=n.find(".file-node").first();d.length?d.click():b("// Empty project directory","dart")},50),$("#codeViewModal").attr("aria-hidden","false").fadeIn(180),$("body").addClass("modal-open").removeClass("code-sidebar-open")}),$("#sidebarToggleBtn").on("click",function(e){e.stopPropagation(),$("body").toggleClass("code-sidebar-open")}),$(".code-modal__close, .code-modal__overlay").on("click",function(){$("#codeViewModal").attr("aria-hidden","true").fadeOut(150),$("body").removeClass("modal-open").removeClass("code-sidebar-open")}),$("#codeViewModal").on("contextmenu",function(e){return e.preventDefault(),!1}),$(document).on("keydown",function(e){if($("#codeViewModal").is(":visible")){const a=e.metaKey||e.ctrlKey,r=e.key.toLowerCase();if(a&&(r==="c"||r==="a"||r==="u"||r==="s")||e.keyCode===123)return e.preventDefault(),!1}})});
