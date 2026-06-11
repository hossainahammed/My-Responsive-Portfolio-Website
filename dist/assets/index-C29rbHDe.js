(function(){const m=document.createElement("link").relList;if(m&&m.supports&&m.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))h(i);new MutationObserver(i=>{for(const d of i)if(d.type==="childList")for(const f of d.addedNodes)f.tagName==="LINK"&&f.rel==="modulepreload"&&h(f)}).observe(document,{childList:!0,subtree:!0});function c(i){const d={};return i.integrity&&(d.integrity=i.integrity),i.referrerPolicy&&(d.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?d.credentials="include":i.crossOrigin==="anonymous"?d.credentials="omit":d.credentials="same-origin",d}function h(i){if(i.ep)return;i.ep=!0;const d=c(i);fetch(i.href,d)}})();$(document).ready(function(){if(typeof Lenis<"u"){let r=function(a){t.raf(a),requestAnimationFrame(r)};var w=r;const t=new Lenis({duration:1.2,easing:a=>Math.min(1,1.001-Math.pow(2,-10*a)),smoothWheel:!0,smoothTouch:!1});requestAnimationFrame(r),t.on("scroll",function(){$(window).trigger("scroll")})}const x=$("#themeToggle"),m=x.find("i");function c(t){t==="dark"?m.removeClass("fa-moon").addClass("fa-sun"):m.removeClass("fa-sun").addClass("fa-moon")}const h=document.documentElement.getAttribute("data-theme")||"dark";c(h),x.on("click",function(t){const a=document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark";if(!document.startViewTransition){$("html").addClass("theme-in-transition"),document.documentElement.setAttribute("data-theme",a),localStorage.setItem("theme",a),c(a),setTimeout(function(){$("html").removeClass("theme-in-transition")},500);return}document.startViewTransition(()=>{document.documentElement.setAttribute("data-theme",a),localStorage.setItem("theme",a),c(a)})}),window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",function(t){if(!localStorage.getItem("theme")){const r=t.matches?"dark":"light";document.startViewTransition?document.startViewTransition(()=>{document.documentElement.setAttribute("data-theme",r),c(r)}):($("html").addClass("theme-in-transition"),document.documentElement.setAttribute("data-theme",r),c(r),setTimeout(function(){$("html").removeClass("theme-in-transition")},500))}}),$(window).scroll(function(){this.scrollY>20?$(".navbar").addClass("sticky"):$(".navbar").removeClass("sticky"),this.scrollY>500?$(".scroll-up-btn").addClass("show"):$(".scroll-up-btn").removeClass("show")}),$(".scroll-up-btn").click(function(){lenis.scrollTo(0)}),$(".navbar .menu li a").click(function(t){t.preventDefault();const r=$(this).attr("href"),a=$(r);a.length&&lenis.scrollTo(a[0],{offset:-70})}),$(".navbar .logo a").click(function(t){t.preventDefault(),lenis.scrollTo(0)}),$(".menu-btn").click(function(){$(".navbar .menu").toggleClass("active"),$(".menu-btn i").toggleClass("active")}),$(".hire-btn").on("click",function(t){t.preventDefault();var r=$("#contact");r.length&&lenis.scrollTo(r[0],{offset:-60,onComplete:function(){var a=$("#contact-name");a.length&&a.focus()}}),$(".navbar .menu").removeClass("active"),$(".menu-btn i").removeClass("active")}),$(".download-cv").on("click",function(t){t.preventDefault();var r=$(this).attr("href");r&&fetch(r,{method:"HEAD",cache:"no-store"}).then(function(a){a.ok?window.location.href=r:alert('CV file not found at "'+r+`".
Please place your CV at that path or update the link in index.html.`)}).catch(function(){window.location.href=r,setTimeout(function(){var a='If the CV did not download, add your CV to "'+r+'" or update the link.';$("#contact-status").length?($("#contact-status").text(a).css("color","var(--primary-color)").fadeIn(120),setTimeout(function(){$("#contact-status").fadeOut(3e3)},4e3)):alert(a)},600)})}),typeof Typed<"u"&&(new Typed(".typing",{strings:[" Flutter Developer","Competitive Programmer","Web Developer"],typeSpeed:100,backSpeed:60,loop:!0}),new Typed(".typing-2",{strings:[" Flutter Developer","Competitive Programmer","Web Developer"],typeSpeed:100,backSpeed:60,loop:!0})),$.fn.owlCarousel&&$(".carousel").owlCarousel({margin:20,loop:!0,autoplay:!0,autoplayTimeOut:2e3,autoplayHoverPause:!0,responsive:{0:{items:1,nav:!1},600:{items:2,nav:!1},1e3:{items:3,nav:!1}}}),$(".project-card").on("click",function(){var t=$(this),r=(t.attr("data-liveurl")||"").trim(),a=t.attr("data-title")||"";r?(/^https?:\/\//i.test(r)||(r="https://"+r),$("#liveModalTitle").text(a),$("#liveModalIframe").attr("src",r),$("#liveViewModal").attr("aria-hidden","false").fadeIn(180),$("body").addClass("modal-open")):alert("No live link set for this project yet. You can add a live link later by setting the project element's `data-liveurl` attribute.")}),$(".live-modal__close, .live-modal__overlay").on("click",function(){$("#liveModalIframe").attr("src",""),$("#liveViewModal").attr("aria-hidden","true").fadeOut(150),$("body").removeClass("modal-open")}),window.setProjectLiveUrl=function(t,r){var a=$('.project-card[data-id="'+t+'"]');return a.length?(a.attr("data-liveurl",r),!0):!1},window._updateTeamStars=function(t,r){t.find("i").each(function(){var a=parseInt($(this).attr("data-value"))||0;$(this).toggleClass("filled",a<=r)})},$(".teams .carousel .card").each(function(){var t=$(this),r=t.attr("data-id")||"team-"+t.index(),a=t.find(".rating");if(a.length){var o=localStorage.getItem("team-rating-"+r),n=parseInt(o!==null?o:a.attr("data-rating")||0);a.attr("data-rating",n),window._updateTeamStars(a,n)}}),$(".teams").on("mouseenter",".rating i",function(){var t=$(this),r=t.closest(".rating"),a=parseInt(t.attr("data-value"))||0;r.find("i").each(function(){$(this).toggleClass("filled",($(this).attr("data-value")||0)<=a)})}),$(".teams").on("mouseleave",".rating",function(){var t=$(this),r=parseInt(t.attr("data-rating")||0);window._updateTeamStars(t,r)}),$(".teams").on("click",".rating i",function(){var t=$(this),r=t.closest(".card"),a=r.attr("data-id")||"team-"+r.index(),o=t.closest(".rating"),n=parseInt(t.attr("data-value"))||0;o.attr("data-rating",n),localStorage.setItem("team-rating-"+a,n),window._updateTeamStars(o,n)}),window.setTeamRating=function(t,r){var a=$('.teams .carousel .card[data-id="'+t+'"]');if(!a.length)return!1;var o=a.find(".rating");return o.attr("data-rating",r),localStorage.setItem("team-rating-"+t,r),window._updateTeamStars(o,parseInt(r)),!0},window.getTeamRating=function(t){var r=localStorage.getItem("team-rating-"+t);return r?parseInt(r):null},$("#contactForm").on("submit",function(t){t.preventDefault();var r=$("#contact-name").val().trim(),a=$("#contact-email").val().trim(),o=$("#contact-subject").val().trim(),n=$("#contact-message").val().trim();if(!r||!a||!n){$("#contact-status").text("Please fill your name, email and message.").css("color","var(--primary-color)").fadeIn(120),setTimeout(function(){$("#contact-status").fadeOut(800)},3e3);return}var l=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;if(!l.test(a)){$("#contact-status").text("Please enter a valid email address.").css("color","var(--primary-color)").fadeIn(120),setTimeout(function(){$("#contact-status").fadeOut(800)},3e3);return}var s="hossainahammed627@gmail.com",p="Name: "+r+"%0D%0AEmail: "+a+"%0D%0A%0D%0A"+encodeURIComponent(n),g="mailto:"+encodeURIComponent(s)+"?subject="+encodeURIComponent(o||"Contact from portfolio")+"&body="+p;$("#contact-status").text("Opening your mail app...").css("color","#0a0").fadeIn(120),window.location.href=g,setTimeout(function(){$("#contactForm")[0].reset(),$("#contact-status").text("If your mail app did not open, copy the message and send to hossainahammed627@gmail.com").css("color","#333"),setTimeout(function(){$("#contact-status").fadeOut(1600)},4e3)},600)});const i=$("section"),d=$(".navbar .menu li a");function f(){let t="";const r=$(document).scrollTop()+150,a=$(window).scrollTop()+$(window).height(),o=$(document).height();a>=o-50?t="contact":i.each(function(){const n=$(this).offset().top,l=n+$(this).outerHeight();r>=n&&r<=l&&(t=$(this).attr("id"))}),t&&(d.removeClass("active"),$(`.navbar .menu li a[href="#${t}"]`).addClass("active"))}if($(window).on("scroll",f),f(),"IntersectionObserver"in window){const t=new IntersectionObserver((r,a)=>{r.forEach(o=>{o.isIntersecting&&($(o.target).addClass("active"),a.unobserve(o.target))})},{threshold:.15,rootMargin:"0px 0px -50px 0px"});$(".reveal, .reveal-grid").each(function(){t.observe(this)})}else $(".reveal, .reveal-grid").addClass("active");$(document).on("mousemove",".project-card, .services .card, .teams .card",function(t){const r=this.getBoundingClientRect(),a=t.clientX-r.left,o=t.clientY-r.top;this.style.setProperty("--mouse-x",a+"px"),this.style.setProperty("--mouse-y",o+"px")});const k={"flutter-task":{name:"task_manager",type:"folder",expanded:!0,children:[{name:"lib",type:"folder",expanded:!0,children:[{name:"bindings",type:"folder",expanded:!1,children:[{name:"task_binding.dart",type:"file",fileKey:"task_binding",lang:"dart"}]},{name:"controllers",type:"folder",expanded:!0,children:[{name:"task_controller.dart",type:"file",fileKey:"task_controller",lang:"dart"}]},{name:"models",type:"folder",expanded:!0,children:[{name:"task_model.dart",type:"file",fileKey:"task_model",lang:"dart"}]},{name:"routes",type:"folder",expanded:!1,children:[{name:"app_pages.dart",type:"file",fileKey:"app_pages",lang:"dart"}]},{name:"services",type:"folder",expanded:!0,children:[{name:"api_service.dart",type:"file",fileKey:"api_service",lang:"dart"}]},{name:"views",type:"folder",expanded:!0,children:[{name:"widgets",type:"folder",expanded:!0,children:[{name:"task_card.dart",type:"file",fileKey:"task_card",lang:"dart"}]},{name:"home_view.dart",type:"file",fileKey:"home_view",lang:"dart"}]},{name:"main.dart",type:"file",fileKey:"main",lang:"dart"}]},{name:"pubspec.yaml",type:"file",fileKey:"pubspec",lang:"yaml"}]},"flutter-ecom":{name:"ecommerce_app",type:"folder",expanded:!0,children:[{name:"lib",type:"folder",expanded:!0,children:[{name:"controllers",type:"folder",expanded:!0,children:[{name:"cart_controller.dart",type:"file",fileKey:"cart_controller",lang:"dart"},{name:"product_controller.dart",type:"file",fileKey:"product_controller",lang:"dart"}]},{name:"models",type:"folder",expanded:!1,children:[{name:"product_model.dart",type:"file",fileKey:"product_model",lang:"dart"}]},{name:"services",type:"folder",expanded:!0,children:[{name:"api_service.dart",type:"file",fileKey:"api_service",lang:"dart"}]},{name:"views",type:"folder",expanded:!0,children:[{name:"widgets",type:"folder",expanded:!0,children:[{name:"product_card.dart",type:"file",fileKey:"product_card",lang:"dart"}]},{name:"cart_screen.dart",type:"file",fileKey:"cart_screen",lang:"dart"},{name:"catalog_screen.dart",type:"file",fileKey:"catalog_screen",lang:"dart"}]},{name:"main.dart",type:"file",fileKey:"main",lang:"dart"}]},{name:"pubspec.yaml",type:"file",fileKey:"pubspec",lang:"yaml"}]},"flutter-exp":{name:"expense_tracker",type:"folder",expanded:!0,children:[{name:"lib",type:"folder",expanded:!0,children:[{name:"controllers",type:"folder",expanded:!0,children:[{name:"expense_controller.dart",type:"file",fileKey:"expense_controller",lang:"dart"}]},{name:"models",type:"folder",expanded:!0,children:[{name:"expense_model.dart",type:"file",fileKey:"expense_model",lang:"dart"}]},{name:"views",type:"folder",expanded:!0,children:[{name:"widgets",type:"folder",expanded:!0,children:[{name:"chart_summary.dart",type:"file",fileKey:"chart_summary",lang:"dart"}]},{name:"add_expense.dart",type:"file",fileKey:"add_expense",lang:"dart"}]},{name:"main.dart",type:"file",fileKey:"main",lang:"dart"}]},{name:"pubspec.yaml",type:"file",fileKey:"pubspec",lang:"yaml"}]},"flutter-unit":{name:"unit_converter",type:"folder",expanded:!0,children:[{name:"lib",type:"folder",expanded:!0,children:[{name:"helpers",type:"folder",expanded:!0,children:[{name:"geolocator_helper.dart",type:"file",fileKey:"geolocator_helper",lang:"dart"}]},{name:"services",type:"folder",expanded:!0,children:[{name:"converter_service.dart",type:"file",fileKey:"converter_service",lang:"dart"}]},{name:"views",type:"folder",expanded:!0,children:[{name:"converter_screen.dart",type:"file",fileKey:"converter_screen",lang:"dart"}]},{name:"main.dart",type:"file",fileKey:"main",lang:"dart"}]},{name:"pubspec.yaml",type:"file",fileKey:"pubspec",lang:"yaml"}]},"web-honda":{name:"honda_website",type:"folder",expanded:!0,children:[{name:"js",type:"folder",expanded:!0,children:[{name:"slider.js",type:"file",fileKey:"slider",lang:"javascript"}]},{name:"index.html",type:"file",fileKey:"index",lang:"html"},{name:"style.css",type:"file",fileKey:"style",lang:"css"}]},"web-travel":{name:"travel_website",type:"folder",expanded:!0,children:[{name:"js",type:"folder",expanded:!0,children:[{name:"parallax.js",type:"file",fileKey:"parallax",lang:"javascript"}]},{name:"index.html",type:"file",fileKey:"index",lang:"html"},{name:"style.css",type:"file",fileKey:"style",lang:"css"}]},"web-shop":{name:"shop_product",type:"folder",expanded:!0,children:[{name:"js",type:"folder",expanded:!0,children:[{name:"store.js",type:"file",fileKey:"store",lang:"javascript"}]},{name:"index.html",type:"file",fileKey:"index",lang:"html"},{name:"style.css",type:"file",fileKey:"style",lang:"css"}]},"web-lib":{name:"library_management",type:"folder",expanded:!0,children:[{name:"js",type:"folder",expanded:!0,children:[{name:"dashboard.js",type:"file",fileKey:"dashboard",lang:"javascript"}]},{name:"index.html",type:"file",fileKey:"index",lang:"html"},{name:"style.css",type:"file",fileKey:"style",lang:"css"}]},"php-gym":{name:"gym_website",type:"folder",expanded:!0,children:[{name:"db_config.php",type:"file",fileKey:"db_config",lang:"php"},{name:"index.php",type:"file",fileKey:"index_php",lang:"php"}]},"php-gymsocial":{name:"gym_social",type:"folder",expanded:!0,children:[{name:"db_config.php",type:"file",fileKey:"db_config",lang:"php"},{name:"submit_feed.php",type:"file",fileKey:"submit_feed",lang:"php"}]},"php-gymcomplete":{name:"gym_complete",type:"folder",expanded:!0,children:[{name:"db_connect.php",type:"file",fileKey:"db_connect",lang:"php"},{name:"index.php",type:"file",fileKey:"index_php",lang:"php"}]},"php-crud":{name:"crud_operations",type:"folder",expanded:!0,children:[{name:"db_connect.php",type:"file",fileKey:"db_connect",lang:"php"},{name:"edit.php",type:"file",fileKey:"edit",lang:"php"}]}},C={"flutter-task":{task_binding:{code:`import 'package:get/get.dart';
import '../controllers/task_controller.dart';
import '../services/api_service.dart';

class TaskBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<ApiService>(() => ApiService());
    Get.lazyPut<TaskController>(() => TaskController(apiService: Get.find()));
  }
}`},task_controller:{code:`import 'package:get/get.dart';
import '../models/task_model.dart';
import '../services/api_service.dart';

class TaskController extends GetxController {
  final ApiService apiService;
  TaskController({required this.apiService});

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
      final response = await apiService.getTasks();
      if (response != null) {
        tasks.assignAll(response);
      }
    } catch (e) {
      Get.snackbar('Error', 'Failed to retrieve tasks: \${e.toString()}');
    } finally {
      isLoading(false);
    }
  }

  Future<void> addTask(String title) async {
    try {
      final newTask = await apiService.createTask(title);
      if (newTask != null) {
        tasks.add(newTask);
        Get.snackbar('Success', 'Task added successfully');
      }
    } catch (e) {
      Get.snackbar('Error', 'Failed to add task');
    }
  }
}`},task_model:{code:`import 'dart:convert';

List<TaskModel> taskListFromJson(String str) =>
    List<TaskModel>.from(json.decode(str).map((x) => TaskModel.fromJson(x)));

String taskListToJson(List<TaskModel> data) =>
    json.encode(List<dynamic>.from(data.map((x) => x.toJson())));

class TaskModel {
  final int id;
  final String title;
  final String status;

  TaskModel({required this.id, required this.title, required this.status});

  factory TaskModel.fromJson(Map<String, dynamic> json) => TaskModel(
        id: json["id"] as int,
        title: json["title"] as String,
        status: json["status"] as String,
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "title": title,
        "status": status,
      };
}`},app_pages:{code:`import 'package:get/get.dart';
import '../bindings/task_binding.dart';
import '../views/home_view.dart';

class AppPages {
  static const initial = '/';

  static final routes = [
    GetPage(
      name: '/',
      page: () => HomeView(),
      binding: TaskBinding(),
    ),
  ];
}`},api_service:{code:`import 'package:http/http.dart' as http;
import '../models/task_model.dart';

class ApiService {
  final http.Client client = http.Client();
  static const String baseUrl = 'https://api.portfolio.demo/tasks';

  Future<List<TaskModel>?> getTasks() async {
    final response = await client.get(Uri.parse(baseUrl));
    if (response.statusCode == 200) {
      return taskListFromJson(response.body);
    }
    return null;
  }

  Future<TaskModel?> createTask(String title) async {
    final response = await client.post(
      Uri.parse(baseUrl),
      body: {"title": title, "status": "pending"},
    );
    if (response.statusCode == 201) {
      return TaskModel.fromJson(taskListFromJson(response.body).first.toJson());
    }
    return null;
  }
}`},task_card:{code:`import 'package:flutter/material.dart';
import '../../models/task_model.dart';

class TaskCard extends StatelessWidget {
  final TaskModel task;
  final VoidCallback onTap;

  const TaskCard({required this.task, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 3,
      margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: ListTile(
        title: Text(task.title),
        trailing: Icon(
          task.status == "done" ? Icons.check_circle : Icons.circle_outlined,
          color: task.status == "done" ? Colors.green : Colors.grey,
        ),
        onTap: onTap,
      ),
    );
  }
}`},home_view:{code:`import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/task_controller.dart';
import 'widgets/task_card.dart';

class HomeView extends GetView<TaskController> {
  final TextEditingController inputController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Task Manager')),
      body: Obx(() => controller.isLoading.value
          ? Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: controller.tasks.length,
              itemBuilder: (context, index) {
                final task = controller.tasks[index];
                return TaskCard(task: task, onTap: () {});
              },
            )),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddTaskDialog(context),
        child: Icon(Icons.add),
      ),
    );
  }

  void _showAddTaskDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('New Task'),
        content: TextField(controller: inputController),
        actions: [
          TextButton(
            onPressed: () {
              controller.addTask(inputController.text);
              inputController.clear();
              Navigator.pop(context);
            },
            child: Text('Add'),
          )
        ],
      ),
    );
  }
}`},main:{code:`import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'routes/app_pages.dart';

void main() {
  runApp(GetMaterialApp(
    title: "Task Manager App",
    initialRoute: AppPages.initial,
    getPages: AppPages.routes,
    debugShowCheckedModeBanner: false,
  ));
}`},pubspec:{code:`name: task_manager
description: A clean Flutter Task Management application.
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  get: ^4.6.6
  http: ^1.1.0

dev_dependencies:
  flutter_test:
    sdk: flutter`}},"flutter-ecom":{cart_controller:{code:`import 'package:get/get.dart';
import '../models/product_model.dart';

class CartController extends GetxController {
  var cartItems = <ProductModel, int>{}.obs;

  void addProduct(ProductModel product) {
    cartItems[product] = (cartItems[product] ?? 0) + 1;
    Get.snackbar("Cart Updated", "\${product.name} added to cart");
  }

  void removeProduct(ProductModel product) {
    if (cartItems.containsKey(product)) {
      if (cartItems[product] == 1) {
        cartItems.remove(product);
      } else {
        cartItems[product] = cartItems[product]! - 1;
      }
    }
  }

  double get totalAmount => cartItems.entries
      .map((e) => e.key.price * e.value)
      .fold(0.0, (sum, el) => sum + el);
}`},product_controller:{code:`import 'package:get/get.dart';
import '../models/product_model.dart';
import '../services/api_service.dart';

class ProductController extends GetxController {
  var products = <ProductModel>[].obs;
  var isLoading = true.obs;

  @override
  void onInit() {
    loadProducts();
    super.onInit();
  }

  void loadProducts() async {
    try {
      isLoading(true);
      var fetched = await ApiService.fetchProducts();
      if (fetched != null) {
        products.assignAll(fetched);
      }
    } finally {
      isLoading(false);
    }
  }
}`},product_model:{code:`class ProductModel {
  final int id;
  final String name;
  final double price;
  final String imageUrl;

  ProductModel({required this.id, required this.name, required this.price, required this.imageUrl});

  factory ProductModel.fromJson(Map<String, dynamic> json) => ProductModel(
        id: json['id'] as int,
        name: json['name'] as String,
        price: (json['price'] as num).toDouble(),
        imageUrl: json['imageUrl'] as String,
      );
}`},api_service:{code:`import 'package:http/http.dart' as http;
import 'dart:convert';
import '../models/product_model.dart';

class ApiService {
  static const String url = 'https://api.portfolio.demo/products';

  static Future<List<ProductModel>?> fetchProducts() async {
    final response = await http.get(Uri.parse(url));
    if (response.statusCode == 200) {
      List<dynamic> list = json.decode(response.body);
      return list.map((json) => ProductModel.fromJson(json)).toList();
    }
    return null;
  }
}`},product_card:{code:`import 'package:flutter/material.dart';
import '../../../models/product_model.dart';

class ProductCard extends StatelessWidget {
  final ProductModel product;
  final VoidCallback onAddToCart;

  const ProductCard({required this.product, required this.onAddToCart});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Column(
        children: [
          Image.network(product.imageUrl, height: 120, fit: BoxFit.cover),
          Text(product.name, style: TextStyle(fontWeight: FontWeight.bold)),
          Text("\\$\\${product.price}"),
          ElevatedButton(onPressed: onAddToCart, child: Text("Add to Cart"))
        ],
      ),
    );
  }
}`},cart_screen:{code:`import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/cart_controller.dart';

class CartScreen extends StatelessWidget {
  final CartController controller = Get.find();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Cart")),
      body: Obx(() => ListView(
        children: controller.cartItems.entries.map((e) => ListTile(
          title: Text(e.key.name),
          subtitle: Text("\\$\\${e.key.price} x \${e.value}"),
          trailing: IconButton(
            icon: Icon(Icons.remove_circle),
            onPressed: () => controller.removeProduct(e.key),
          ),
        )).toList(),
      )),
      bottomNavigationBar: Obx(() => Container(
        padding: EdgeInsets.all(16),
        child: Text("Total: \\$\\${controller.totalAmount}", style: TextStyle(fontSize: 20)),
      )),
    );
  }
}`},catalog_screen:{code:`import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/product_controller.dart';
import '../controllers/cart_controller.dart';
import 'widgets/product_card.dart';
import 'cart_screen.dart';

class CatalogScreen extends StatelessWidget {
  final ProductController productController = Get.put(ProductController());
  final CartController cartController = Get.put(CartController());

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Product Catalog"),
        actions: [
          IconButton(
            icon: Icon(Icons.shopping_cart),
            onPressed: () => Get.to(() => CartScreen()),
          )
        ],
      ),
      body: Obx(() => productController.isLoading.value
          ? Center(child: CircularProgressIndicator())
          : GridView.builder(
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2),
              itemCount: productController.products.length,
              itemBuilder: (context, i) => ProductCard(
                product: productController.products[i],
                onAddToCart: () => cartController.addProduct(productController.products[i]),
              ),
            )),
    );
  }
}`},main:{code:`import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'views/catalog_screen.dart';

void main() => runApp(GetMaterialApp(
  home: CatalogScreen(),
  theme: ThemeData.dark(),
));`},pubspec:{code:`name: ecommerce_app
dependencies:
  flutter:
    sdk: flutter
  get: ^4.6.6
  http: ^1.1.0`}},"flutter-exp":{expense_controller:{code:`import 'package:get/get.dart';
import 'package:hive/hive.dart';
import '../models/expense_model.dart';

class ExpenseController extends GetxController {
  var expenses = <ExpenseModel>[].obs;
  late Box<ExpenseModel> box;

  @override
  void onInit() {
    box = Hive.box<ExpenseModel>('expenses');
    expenses.assignAll(box.values.toList());
    super.onInit();
  }

  void addExpense(String title, double amount, String category) {
    final exp = ExpenseModel()
      ..title = title
      ..amount = amount
      ..category = category
      ..date = DateTime.now();
    box.add(exp);
    expenses.add(exp);
  }

  void deleteExpense(int index) {
    box.deleteAt(index);
    expenses.removeAt(index);
  }
}`},expense_model:{code:`import 'package:hive/hive.dart';
part 'expense_model.g.dart';

@HiveType(typeId: 0)
class ExpenseModel extends HiveObject {
  @HiveField(0) late String title;
  @HiveField(1) late double amount;
  @HiveField(2) late DateTime date;
  @HiveField(3) late String category;
}`},chart_summary:{code:`import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../controllers/expense_controller.dart';

class ChartSummary extends StatelessWidget {
  final ExpenseController controller = Get.find();

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      double total = controller.expenses.fold(0.0, (sum, el) => sum + el.amount);
      return Container(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            Text("Total Expenses", style: TextStyle(fontSize: 18)),
            SizedBox(height: 10),
            Text("\\$\\${total.toStringAsFixed(2)}", style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold))
          ],
        ),
      );
    });
  }
}`},add_expense:{code:`import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/expense_controller.dart';

class AddExpense extends StatelessWidget {
  final controller = Get.find<ExpenseController>();
  final titleController = TextEditingController();
  final amountController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Add Expense")),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(controller: titleController, decoration: InputDecoration(labelText: "Title")),
            TextField(controller: amountController, decoration: InputDecoration(labelText: "Amount")),
            ElevatedButton(
              onPressed: () {
                controller.addExpense(
                  titleController.text,
                  double.parse(amountController.text),
                  "General"
                );
                Get.back();
              },
              child: Text("Save")
            )
          ],
        ),
      ),
    );
  }
}`},main:{code:`import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:get/get.dart';
import 'models/expense_model.dart';
import 'controllers/expense_controller.dart';

void main() async {
  await Hive.initFlutter();
  Hive.registerAdapter(ExpenseModelAdapter());
  await Hive.openBox<ExpenseModel>('expenses');
  
  Get.put(ExpenseController());
  runApp(GetMaterialApp(home: ExpenseHome()));
}`},pubspec:{code:`name: expense_tracker
dependencies:
  flutter:
    sdk: flutter
  get: ^4.6.6
  hive_flutter: ^1.1.0`}},"flutter-unit":{geolocator_helper:{code:`import 'package:geolocator/geolocator.dart';

class LocatorHelper {
  static Future<Position> getPosition() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) return Future.error("Location services disabled");

    LocationPermission perm = await Geolocator.checkPermission();
    if (perm == LocationPermission.denied) {
      perm = await Geolocator.requestPermission();
      if (perm == LocationPermission.denied) {
        return Future.error("Permissions denied");
      }
    }
    return await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
  }
}`},converter_service:{code:`class ConverterService {
  static double celsiusToFahrenheit(double c) => (c * 9/5) + 32;
  static double fahrenheitToCelsius(double f) => (f - 32) * 5/9;
  
  static double metersToFeet(double m) => m * 3.28084;
  static double feetToMeters(double f) => f / 3.28084;
}`},converter_screen:{code:`import 'package:flutter/material.dart';
import '../services/converter_service.dart';

class ConverterScreen extends StatefulWidget {
  @override
  _ConverterScreenState createState() => _ConverterScreenState();
}

class _ConverterScreenState extends State<ConverterScreen> {
  double input = 0.0;
  double output = 0.0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Unit Converter")),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              keyboardType: TextInputType.number,
              onChanged: (val) {
                setState(() {
                  input = double.tryParse(val) ?? 0.0;
                  output = ConverterService.celsiusToFahrenheit(input);
                });
              },
            ),
            SizedBox(height: 20),
            Text("Fahrenheit: \${output.toStringAsFixed(2)}")
          ],
        ),
      ),
    );
  }
}`},main:{code:`import 'package:flutter/material.dart';
import 'views/converter_screen.dart';

void main() => runApp(MaterialApp(home: ConverterScreen()));`},pubspec:{code:`name: unit_converter
dependencies:
  flutter:
    sdk: flutter
  geolocator: ^10.1.0
  shared_preferences: ^2.2.2`}},"web-honda":{slider:{code:`const slides = document.querySelectorAll('.honda-slide');
const prevBtn = document.querySelector('.slider-prev');
const nextBtn = document.querySelector('.slider-next');
let index = 0;

function showSlide(n) {
  slides.forEach((s, i) => s.classList.toggle('active', i === n));
}

prevBtn.addEventListener('click', () => {
  index = (index - 1 + slides.length) % slides.length;
  showSlide(index);
});

nextBtn.addEventListener('click', () => {
  index = (index + 1) % slides.length;
  showSlide(index);
});`},index:{code:`<!DOCTYPE html>
<html lang="en">
<head>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="honda-slider">
    <div class="honda-slide active">Slide 1</div>
    <div class="honda-slide">Slide 2</div>
    <button class="slider-prev">Prev</button>
    <button class="slider-next">Next</button>
  </div>
  <script src="js/slider.js"><\/script>
</body>
</html>`},style:{code:`.honda-slider {
  position: relative;
  width: 100%;
  max-width: 800px;
  overflow: hidden;
}
.honda-slide {
  display: none;
  transition: opacity 0.5s ease-in-out;
}
.honda-slide.active {
  display: block;
}`}},"web-travel":{parallax:{code:`window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const hero = document.querySelector('.hero');
  hero.style.backgroundPositionY = \`\${scrolled * 0.5}px\`;
});`},index:{code:`<!DOCTYPE html>
<html>
<head><link rel="stylesheet" href="style.css"></head>
<body>
  <div class="hero"><h1>Explore the World</h1></div>
  <script src="js/parallax.js"><\/script>
</body>
</html>`},style:{code:`.hero {
  height: 100vh;
  background-image: url('travel-bg.jpeg');
  background-attachment: fixed;
  background-position: center;
  background-size: cover;
}`}},"web-shop":{store:{code:`let cart = JSON.parse(localStorage.getItem('cart')) || [];

function addToCart(id, name, price) {
  cart.push({ id, name, price });
  localStorage.setItem('cart', JSON.stringify(cart));
  alert(name + " added to cart");
}`},index:{code:`<!html>
<button onclick="addToCart(1, 'Item 1', 19.99)">Buy Product</button>
<script src="js/store.js"><\/script>`},style:{code:`button {
  padding: 10px 20px;
  background-color: orange;
  border: none;
  color: white;
  cursor: pointer;
}`}},"web-lib":{dashboard:{code:`const search = document.getElementById('search');
search.addEventListener('keyup', (e) => {
  const q = e.target.value.toLowerCase();
  document.querySelectorAll('.book-row').forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(q) ? '' : 'none';
  });
});`},index:{code:`<!html>
<input id="search" placeholder="Search Books..."/>
<table>
  <tr class="book-row"><td>Flutter Guide</td></tr>
</table>
<script src="js/dashboard.js"><\/script>`},style:{code:`table { width: 100%; border-collapse: collapse; }
tr { border-bottom: 1px solid #ccc; }`}},"php-gym":{db_config:{code:`<?php
define('DB_HOST', '127.0.0.1');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'gym_management');`},index_php:{code:`<?php
require_once 'db_config.php';
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
$res = $conn->query("SELECT * FROM members");
while($row = $res->fetch_assoc()) {
    echo "Member: " . $row['fullname'] . " - " . $row['status'] . "<br/>";
}`}},"php-gymsocial":{db_config:{code:`<?php
try {
  $pdo = new PDO("mysql:host=localhost;dbname=gym_social", "root", "");
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
  die("Error: " . $e->getMessage());
}`},submit_feed:{code:`<?php
session_start();
require_once 'db_config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $text = trim($_POST['post_text']);
  if (!empty($text)) {
    $stmt = $pdo->prepare("INSERT INTO feed (user_id, content, date_posted) VALUES (?, ?, NOW())");
    $stmt->execute([$_SESSION['user_id'], $text]);
    header("Location: feed.php");
  }
}`}},"php-gymcomplete":{db_connect:{code:`<?php
try {
  $pdo = new PDO("mysql:host=localhost;dbname=gym_complete", "root", "");
  $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
  die("Database error");
}`},index_php:{code:`<?php
require_once 'db_connect.php';
$stmt = $pdo->query("SELECT * FROM class_schedule");
$slots = $stmt->fetchAll();
foreach ($slots as $slot) {
    echo "Class: " . $slot['name'] . " - Time: " . $slot['time'] . "<br/>";
}`}},"php-crud":{db_connect:{code:`<?php
$conn = new PDO("mysql:host=localhost;dbname=crud_system", "root", "");`},edit:{code:`<?php
require_once 'db_connect.php';

if (isset($_POST['update'])) {
  $stmt = $conn->prepare("UPDATE records SET data = ? WHERE id = ?");
  $stmt->execute([$_POST['data'], $_POST['id']]);
  header("Location: index.php");
}`}}};function T(t,r,a){const o=$("<ul></ul>"),n=t.children||[];n.sort((l,s)=>l.type==="folder"&&s.type==="file"?-1:l.type==="file"&&s.type==="folder"?1:l.name.localeCompare(s.name)),n.forEach(l=>{const s=$("<li></li>");if(l.type==="folder"){const p=l.expanded!==!1,g=p?"fa-folder-open":"fa-folder",y=$(`
          <div class="tree-node folder-node">
            <i class="fas ${g}"></i>
            <span>${l.name}</span>
          </div>
        `);s.append(y);const u=$("<div class='tree-children'></div>");p||u.hide(),T(l,u,a),s.append(u),y.on("click",function(v){v.stopPropagation();const _=$(this).find("i");u.slideToggle(120),_.hasClass("fa-folder")?_.removeClass("fa-folder").addClass("fa-folder-open"):_.removeClass("fa-folder-open").addClass("fa-folder")})}else{const p=$(`
          <div class="tree-node file-node" data-filekey="${l.fileKey}" data-lang="${l.lang||"dart"}">
            <i class="fas fa-file-code"></i>
            <span>${l.name}</span>
          </div>
        `);s.append(p),p.on("click",function(g){g.stopPropagation(),$(".tree-node.file-node").removeClass("active-file"),$(this).addClass("active-file");const y=$(this).attr("data-filekey"),u=$(this).attr("data-lang"),v=C[a]&&C[a][y];b(v?v.code:"// File content omitted for brevity in this read-only viewer.",u),window.innerWidth<=768&&$("body").removeClass("code-sidebar-open")})}o.append(s)}),r.append(o)}function b(t,r){const a=$("#codeModalBlock");a.text(t),a.attr("class",`language-${r||"dart"}`),window.Prism&&Prism.highlightElement(a[0])}$(".project-card .code-btn").on("click",function(t){t.preventDefault(),t.stopPropagation();const r=$(this).closest(".project-card"),a=r.attr("data-id")||"",o=r.attr("data-title")||"Source Code";if(!k[a]){alert("No code files or tree structure mapped for this demo project card.");return}$("#codeModalTitle").text(o+" Structure");const n=$("#fileTreeContainer");n.empty();const l=k[a];T(l,n,a),setTimeout(()=>{const s=n.find(".file-node").first();s.length?s.click():b("// Empty project directory","dart")},50),$("#codeViewModal").attr("aria-hidden","false").fadeIn(180),$("body").addClass("modal-open").removeClass("code-sidebar-open")}),$("#sidebarToggleBtn").on("click",function(t){t.stopPropagation(),$("body").toggleClass("code-sidebar-open")}),$(".code-modal__close, .code-modal__overlay").on("click",function(){$("#codeViewModal").attr("aria-hidden","true").fadeOut(150),$("body").removeClass("modal-open").removeClass("code-sidebar-open")}),$("#codeViewModal").on("contextmenu",function(t){return t.preventDefault(),!1}),$(document).on("keydown",function(t){if($("#codeViewModal").is(":visible")){const a=t.metaKey||t.ctrlKey,o=t.key.toLowerCase();if(a&&(o==="c"||o==="a"||o==="u"||o==="s")||t.keyCode===123)return t.preventDefault(),!1}})});
