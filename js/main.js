// UI Interactivity and Animations for Mamafarm eCommerce

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Sticky Header ---
  const header = document.querySelector('.main-header');
  const annBar = document.querySelector('.top-announcement-bar');
  if (header && annBar) {
    const handleScroll = () => {
      const annBarHeight = annBar.offsetHeight;
      if (window.scrollY > annBarHeight) {
        header.classList.add('sticky');
        document.body.style.paddingTop = header.offsetHeight + 'px';
      } else {
        header.classList.remove('sticky');
        document.body.style.paddingTop = '0px';
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Run once initially
  }

  // --- 2. Live Announcement Bar Ticker ---
  const annTicker = document.getElementById('announcement-ticker');
  if (annTicker) {
    const items = annTicker.querySelectorAll('.ticker-item');
    let currentIndex = 0;

    const rotateAnnouncements = () => {
      items.forEach((item, idx) => {
        item.style.display = idx === currentIndex ? 'block' : 'none';
      });
      currentIndex = (currentIndex + 1) % items.length;
    };

    rotateAnnouncements();
    setInterval(rotateAnnouncements, 4000); // Change every 4 seconds
  }

  // --- 3. Hero Banner Slider ---
  const heroSlider = document.querySelector('.hero-slider');
  if (heroSlider) {
    const slides = heroSlider.querySelectorAll('.hero-slide');
    const dotsContainer = heroSlider.querySelector('.slider-dots');
    let currentSlide = 0;
    let slideInterval;

    // Create dots
    slides.forEach((_, index) => {
      const dot = document.createElement('span');
      dot.className = `slider-dot ${index === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => goToSlide(index));
      if (dotsContainer) dotsContainer.appendChild(dot);
    });

    const dots = heroSlider.querySelectorAll('.slider-dot');

    const updateSlideUI = () => {
      slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentSlide);
      });
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
      });
    };

    const nextSlide = () => {
      currentSlide = (currentSlide + 1) % slides.length;
      updateSlideUI();
    };

    const prevSlide = () => {
      currentSlide = (currentSlide - 1 + slides.length) % slides.length;
      updateSlideUI();
    };

    const goToSlide = (index) => {
      currentSlide = index;
      updateSlideUI();
      resetInterval();
    };

    const startInterval = () => {
      slideInterval = setInterval(nextSlide, 6000);
    };

    const resetInterval = () => {
      clearInterval(slideInterval);
      startInterval();
    };

    // Nav Arrows
    const nextBtn = heroSlider.querySelector('.slider-next');
    const prevBtn = heroSlider.querySelector('.slider-prev');
    if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetInterval(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetInterval(); });

    startInterval();
  }

  // --- 4. Mobile Menu Drawer ---
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileDrawerOverlay = document.getElementById('mobile-drawer-overlay');
  const mobileClose = document.getElementById('mobile-drawer-close');

  if (mobileMenuToggle && mobileDrawer && mobileDrawerOverlay) {
    const openMenu = () => {
      mobileDrawer.classList.add('active');
      mobileDrawerOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
      mobileDrawer.classList.remove('active');
      mobileDrawerOverlay.classList.remove('active');
      document.body.style.overflow = '';
    };

    mobileMenuToggle.addEventListener('click', openMenu);
    mobileDrawerOverlay.addEventListener('click', closeMenu);
    if (mobileClose) mobileClose.addEventListener('click', closeMenu);
  }

  // --- 5. Global Live Search Bar ---
  const searchInput = document.getElementById('header-search-input');
  const searchResultsDropdown = document.getElementById('search-suggestions');
  if (searchInput && searchResultsDropdown) {
    searchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      if (val.length < 2) {
        searchResultsDropdown.style.display = 'none';
        return;
      }

      const matches = typeof searchProducts === 'function' ? searchProducts(val) : [];
      if (matches.length === 0) {
        searchResultsDropdown.innerHTML = `<div class="search-suggestion-item empty">No products found</div>`;
      } else {
        searchResultsDropdown.innerHTML = matches.slice(0, 5).map(p => `
          <div class="search-suggestion-item" onclick="location.href='product.html?id=${p.id}'">
            <img src="${p.image}" alt="${p.name}">
            <div class="suggestion-info">
              <span class="suggestion-name">${p.name}</span>
              <span class="suggestion-price">₹${p.price}</span>
            </div>
          </div>
        `).join('');
      }
      searchResultsDropdown.style.display = 'block';
    });

    // Close dropdown on click outside
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchResultsDropdown.contains(e.target)) {
        searchResultsDropdown.style.display = 'none';
      }
    });
  }

  // Handle Search Submit
  const searchForm = document.getElementById('header-search-form');
  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = searchInput.value.trim();
      if (val) {
        window.location.href = `shop.html?search=${encodeURIComponent(val)}`;
      }
    });
  }

  // --- 6. Testimonial Slider (Auto Carousel) ---
  const testimonialContainer = document.querySelector('.testimonial-slider');
  if (testimonialContainer) {
    const cards = testimonialContainer.querySelectorAll('.testimonial-card');
    let currentIndex = 0;

    const showNextTestimonial = () => {
      cards.forEach((card, idx) => {
        card.classList.toggle('active', idx === currentIndex);
      });
      currentIndex = (currentIndex + 1) % cards.length;
    };

    if (cards.length > 0) {
      showNextTestimonial();
      setInterval(showNextTestimonial, 5000); // Change review every 5 seconds
    }
  }

  // --- 7. Available On Brand Auto-Scroll Carousel ---
  const brandScroll = document.querySelector('.brand-scroll-track');
  if (brandScroll) {
    // Duplicate children to create continuous loop
    const clone = brandScroll.innerHTML;
    brandScroll.innerHTML = clone + clone;
  }

  // --- 8. Framer Motion Scroll Trigger Animations ---
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target); // Trigger only once
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // --- 9. Refer & Earn Modal ---
  const referBtn = document.getElementById('refer-earn-btn');
  if (referBtn) {
    referBtn.addEventListener('click', () => {
      // Create Refer Overlay
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay active';
      overlay.id = 'referral-modal-overlay';
      overlay.innerHTML = `
        <div class="checkout-modal refer-modal text-center">
          <div class="modal-header">
            <h3>Mamafarm Referral Link</h3>
            <button class="modal-close" onclick="document.getElementById('referral-modal-overlay').remove()">&times;</button>
          </div>
          <div class="modal-body">
            <p>Share this link with your friends. They get <strong>10% off</strong>, and you earn <strong>₹100</strong> in wallet coins upon their first purchase!</p>
            <div class="referral-link-box">
              <input type="text" id="ref-link-input" readonly value="https://mamafarm.in/invite?code=MAMA${Math.floor(1000 + Math.random() * 9000)}">
              <button class="btn btn-primary" onclick="copyReferralLink()">Copy</button>
            </div>
            <div id="copy-feedback" class="copy-feedback-text"></div>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
    });
  }
});

// Helper function to copy referral link
function copyReferralLink() {
  const input = document.getElementById('ref-link-input');
  if (input) {
    input.select();
    input.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(input.value);

    const feedback = document.getElementById('copy-feedback');
    if (feedback) {
      feedback.textContent = 'Copied to clipboard! 📋';
      feedback.style.color = '#6BC84B';
      setTimeout(() => {
        feedback.textContent = '';
      }, 3000);
    }
  }
}
