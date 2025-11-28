$(document).ready(function(){
    $(window).scroll(function(){
        // sticky navbar on scroll script
        if(this.scrollY > 20){
            $('.navbar').addClass("sticky");
        }else{
            $('.navbar').removeClass("sticky");
        }
        
        // scroll-up button show/hide script
        if(this.scrollY > 500){
            $('.scroll-up-btn').addClass("show");
        }else{
            $('.scroll-up-btn').removeClass("show");
        }
    });

    // slide-up script
    $('.scroll-up-btn').click(function(){
        $('html').animate({scrollTop: 0});
        // removing smooth scroll on slide-up button click
        $('html').css("scrollBehavior", "auto");
    });

    $('.navbar .menu li a').click(function(){
        // applying again smooth scroll on menu items click
        $('html').css("scrollBehavior", "smooth");
    });

    // toggle menu/navbar script
    $('.menu-btn').click(function(){
        $('.navbar .menu').toggleClass("active");
        $('.menu-btn i').toggleClass("active");
    });

    // Hire me button: smooth scroll to contact and focus name field
    $('.hire-btn').on('click', function(e){
        e.preventDefault();
        // ensure smooth scroll
        $('html').css('scrollBehavior', 'smooth');
        var target = $('#contact');
        if(target.length){
            var top = target.offset().top - 60; // account for fixed navbar
            $('html, body').animate({ scrollTop: top }, 500, function(){
                // focus name input if present
                var $name = $('#contact-name');
                if($name.length){
                    $name.focus();
                }
            });
        }
        // close mobile menu if open
        $('.navbar .menu').removeClass('active');
        $('.menu-btn i').removeClass('active');
    });

    // Download CV button: try HEAD fetch, otherwise attempt open and show helpful message
    $('.download-cv').on('click', function(e){
        e.preventDefault();
        var href = $(this).attr('href');
        if(!href) return;

        // Try a HEAD request to see if the file exists (may fail on file:// or some servers)
        fetch(href, { method: 'HEAD', cache: 'no-store' }).then(function(resp){
            if(resp.ok){
                // file exists, trigger download/open
                window.location.href = href;
            } else {
                alert('CV file not found at "' + href + '".\nPlease place your CV at that path or update the link in index.html.');
            }
        }).catch(function(){
            // fetch failed (local file or CORS). Attempt to open anyway — browser will handle or show error.
            window.location.href = href;
            setTimeout(function(){
                // show non-blocking notice in contact status area
                var msg = 'If the CV did not download, add your CV to "' + href + '" or update the link.';
                if($('#contact-status').length){
                    $('#contact-status').text(msg).css('color','crimson').fadeIn(120);
                    setTimeout(function(){ $('#contact-status').fadeOut(3000); }, 4000);
                } else {
                    alert(msg);
                }
            }, 600);
        });
    });

    // typing text animation script
    var typed = new Typed(".typing", {
        strings: [ " Flutter Developer",  "Competitive Programmer","Web Developer"],
        typeSpeed: 100,
        backSpeed: 60,
        loop: true
    });

    var typed = new Typed(".typing-2", {
        strings: [" Flutter Developer",  "Competitive Programmer","Web Developer"],
        typeSpeed: 100,
        backSpeed: 60,
        loop: true
    });

    // owl carousel script
    $('.carousel').owlCarousel({
        margin: 20,
        loop: true,
        autoplay: true,
        autoplayTimeOut: 2000,
        autoplayHoverPause: true,
        responsive: {
            0:{
                items: 1,
                nav: false
            },
            600:{
                items: 2,
                nav: false
            },
            1000:{
                items: 3,
                nav: false
            }
        }
    });

    /* Projects: open live preview in modal when a project's image is clicked */
    $('.project-card').on('click', function (){
        var $card = $(this);
        var url = ($card.attr('data-liveurl') || '').trim();
        var title = $card.attr('data-title') || '';
        if(url){
            // ensure url has protocol
            if(!/^https?:\/\//i.test(url)) url = 'https://' + url;
            $('#liveModalTitle').text(title);
            $('#liveModalIframe').attr('src', url);
            $('#liveViewModal').attr('aria-hidden','false').fadeIn(180);
            $('body').addClass('modal-open');
        } else {
            alert('No live link set for this project yet. You can add a live link later by setting the project element\'s `data-liveurl` attribute.');
        }
    });

    // Close modal: overlay click or close button
    $('.live-modal__close, .live-modal__overlay').on('click', function(){
        $('#liveModalIframe').attr('src','');
        $('#liveViewModal').attr('aria-hidden','true').fadeOut(150);
        $('body').removeClass('modal-open');
    });

    // Helper: allow setting a project's live URL from other scripts
    window.setProjectLiveUrl = function(projectId, url){
        var $el = $('.project-card[data-id="' + projectId + '"]');
        if(!$el.length) return false;
        $el.attr('data-liveurl', url);
        return true;
    };

    /* Team card rating widgets */
    // Update stars visuals for a rating element
    window._updateTeamStars = function($ratingEl, rating){
        $ratingEl.find('i').each(function(){
            var v = parseInt($(this).attr('data-value')) || 0;
            $(this).toggleClass('filled', v <= rating);
        });
    };

    // Initialize ratings from data-rating or localStorage
    $('.teams .carousel .card').each(function(){
        var $card = $(this);
        var id = $card.attr('data-id') || ('team-' + $card.index());
        var $rating = $card.find('.rating');
        if(!$rating.length) return;
        var saved = localStorage.getItem('team-rating-' + id);
        var r = saved !== null ? parseInt(saved) : parseInt($rating.attr('data-rating') || 0);
        $rating.attr('data-rating', r);
        window._updateTeamStars($rating, r);
    });

    // Hover and click behavior for interactive star rating
    $('.teams').on('mouseenter', '.rating i', function(){
        var $star = $(this);
        var $rating = $star.closest('.rating');
        var v = parseInt($star.attr('data-value')) || 0;
        $rating.find('i').each(function(){
            $(this).toggleClass('filled', ($(this).attr('data-value') || 0) <= v);
        });
    });
    $('.teams').on('mouseleave', '.rating', function(){
        var $rating = $(this);
        var r = parseInt($rating.attr('data-rating') || 0);
        window._updateTeamStars($rating, r);
    });
    $('.teams').on('click', '.rating i', function(){
        var $star = $(this);
        var $card = $star.closest('.card');
        var id = $card.attr('data-id') || ('team-' + $card.index());
        var $rating = $star.closest('.rating');
        var v = parseInt($star.attr('data-value')) || 0;
        $rating.attr('data-rating', v);
        localStorage.setItem('team-rating-' + id, v);
        window._updateTeamStars($rating, v);
    });

    // Helpers to set/get team rating programmatically
    window.setTeamRating = function(teamId, rating){
        var $card = $('.teams .carousel .card[data-id="' + teamId + '"]');
        if(!$card.length) return false;
        var $rating = $card.find('.rating');
        $rating.attr('data-rating', rating);
        localStorage.setItem('team-rating-' + teamId, rating);
        window._updateTeamStars($rating, parseInt(rating));
        return true;
    };

    window.getTeamRating = function(teamId){
        var v = localStorage.getItem('team-rating-' + teamId);
        return v ? parseInt(v) : null;
    };

    /* Contact form: validate and open mail client (mailto:) as default action */
    $('#contactForm').on('submit', function(e){
        e.preventDefault();
        var name = $('#contact-name').val().trim();
        var email = $('#contact-email').val().trim();
        var subject = $('#contact-subject').val().trim();
        var message = $('#contact-message').val().trim();

        // basic validation
        if(!name || !email || !message){
            $('#contact-status').text('Please fill your name, email and message.').css('color','crimson').fadeIn(120);
            setTimeout(function(){ $('#contact-status').fadeOut(800); }, 3000);
            return;
        }
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            $('#contact-status').text('Please enter a valid email address.').css('color','crimson').fadeIn(120);
            setTimeout(function(){ $('#contact-status').fadeOut(800); }, 3000);
            return;
        }

        // build mailto
        var to = 'hossainahammed627@gmail.com';
        var body = 'Name: ' + name + '%0D%0AEmail: ' + email + '%0D%0A%0D%0A' + encodeURIComponent(message);
        var mailto = 'mailto:' + encodeURIComponent(to) + '?subject=' + encodeURIComponent(subject || 'Contact from portfolio') + '&body=' + body;

        // show status
        $('#contact-status').text('Opening your mail app...').css('color','#0a0').fadeIn(120);

        // open mail client
        window.location.href = mailto;

        // clear form after a short delay
        setTimeout(function(){
            $('#contactForm')[0].reset();
            $('#contact-status').text('If your mail app did not open, copy the message and send to hossainahammed627@gmail.com').css('color','#333');
            setTimeout(function(){ $('#contact-status').fadeOut(1600); }, 4000);
        }, 600);
    });
});