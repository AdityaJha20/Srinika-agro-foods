// Mamafarm Frontend Authentication System Logic
// Connected to Backend APIs:
// Register: POST http://localhost:5000/api/v1/auth/register
// Login: POST http://localhost:5000/api/v1/auth/login

const API_BASE_URL = 'http://localhost:5001/api/v1';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Dynamic Navbar & Mobile Menu state integration
  updateNavbarState();

  // 2. Form Event Listeners (if present on the current page)
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    // If user is already logged in, redirect to index.html
    if (isLoggedIn()) {
      window.location.href = 'index.html';
      return;
    }
    loginForm.addEventListener('submit', handleLogin);
  }

  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    // If user is already logged in, redirect to index.html
    if (isLoggedIn()) {
      window.location.href = 'index.html';
      return;
    }
    registerForm.addEventListener('submit', handleRegister);
  }
});

// Helper: Check if user is logged in
function isLoggedIn() {
  return localStorage.getItem('accessToken') !== null && localStorage.getItem('user') !== null;
}

// Helper: Get logged in user details
function getLoggedInUser() {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    return null;
  }
}

// Update the Navbar user welcome/logout or login button dynamically
function updateNavbarState() {
  const loggedIn = isLoggedIn();
  const user = getLoggedInUser();

  // A. Desktop Header Integration
  const accountButtons = document.querySelectorAll('a[aria-label="Account"]');
  accountButtons.forEach(btn => {
    if (loggedIn && user) {
      // Create logged in user wrapper
      const userContainer = document.createElement('div');
      userContainer.className = 'nav-user-container';
      userContainer.innerHTML = `
        <span class="nav-user-welcome">Hi, <strong>${user.name.split(' ')[0]}</strong></span>
        <button id="nav-logout-btn" class="utility-btn logout-btn" title="Logout" aria-label="Logout">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        </button>
      `;
      // Replace button with user container
      btn.parentNode.replaceChild(userContainer, btn);

      // Attach click event for logout
      const logoutBtn = userContainer.querySelector('#nav-logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
      }
    } else {
      // Point Account icon to login page
      btn.setAttribute('href', 'login.html');
      btn.setAttribute('title', 'Login / Register');
    }
  });

  // B. Mobile Drawer Integration
  const mobileNavList = document.querySelector('.mobile-nav-list');
  if (mobileNavList) {
    // Remove any existing auth elements to prevent duplicates
    const existingMobileAuth = mobileNavList.querySelectorAll('.mobile-auth-item, .mobile-auth-divider');
    existingMobileAuth.forEach(el => el.remove());

    const divider = document.createElement('div');
    divider.className = 'mobile-auth-divider';
    divider.style.borderTop = '1px solid var(--gray-light)';
    divider.style.margin = '15px 0';

    mobileNavList.appendChild(divider);

    if (loggedIn && user) {
      const userWelcome = document.createElement('div');
      userWelcome.className = 'mobile-auth-item mobile-nav-welcome';
      userWelcome.style.padding = '10px 0';
      userWelcome.style.fontSize = '16px';
      userWelcome.style.fontWeight = '600';
      userWelcome.style.color = 'var(--primary)';
      userWelcome.innerHTML = `Hi, ${user.name}`;
      mobileNavList.appendChild(userWelcome);

      const logoutLink = document.createElement('a');
      logoutLink.className = 'mobile-auth-item mobile-nav-link';
      logoutLink.setAttribute('href', '#');
      logoutLink.style.color = 'var(--danger)';
      logoutLink.style.fontWeight = '600';
      logoutLink.textContent = 'Logout';
      logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        handleLogout();
      });
      mobileNavList.appendChild(logoutLink);
    } else {
      const loginLink = document.createElement('a');
      loginLink.className = 'mobile-auth-item mobile-nav-link';
      loginLink.setAttribute('href', 'login.html');
      loginLink.style.color = 'var(--secondary)';
      loginLink.style.fontWeight = '600';
      loginLink.textContent = 'Login / Register';
      mobileNavList.appendChild(loginLink);
    }
  }
}

// Action: Logout
function handleLogout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// Action: Handle Login Form Submit
async function handleLogin(e) {
  e.preventDefault();

  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const errorContainer = document.getElementById('login-error-msg');
  const submitBtn = e.target.querySelector('button[type="submit"]');

  if (!emailInput || !passwordInput || !errorContainer || !submitBtn) return;

  // Clear previous errors
  errorContainer.style.display = 'none';
  errorContainer.textContent = '';

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  // Client-side validations
  if (!email || !password) {
    showError(errorContainer, 'Please fill in all required fields.');
    return;
  }

  if (!validateEmail(email)) {
    showError(errorContainer, 'Please enter a valid email address.');
    return;
  }

  // Set loading state
  setLoadingState(submitBtn, true, 'Logging In...');

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const resData = await response.json();

    if (!response.ok) {
      throw new Error(resData.message || 'Login failed. Please check your credentials.');
    }

    // Success: Store access token and user info
    localStorage.setItem('accessToken', resData.data.accessToken);
    localStorage.setItem('user', JSON.stringify(resData.data.user));

    // Redirect to index.html
    window.location.href = 'index.html';

  } catch (err) {
    showError(errorContainer, err.message);
  } finally {
    setLoadingState(submitBtn, false, 'Login');
  }
}

// Action: Handle Registration Form Submit
async function handleRegister(e) {
  e.preventDefault();

  const nameInput = document.getElementById('register-name');
  const emailInput = document.getElementById('register-email');
  const passwordInput = document.getElementById('register-password');
  const confirmPasswordInput = document.getElementById('register-confirm-password');
  const errorContainer = document.getElementById('register-error-msg');
  const submitBtn = e.target.querySelector('button[type="submit"]');

  if (!nameInput || !emailInput || !passwordInput || !confirmPasswordInput || !errorContainer || !submitBtn) return;

  // Clear previous errors
  errorContainer.style.display = 'none';
  errorContainer.textContent = '';

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  // Client-side validations
  if (!name || !email || !password || !confirmPassword) {
    showError(errorContainer, 'Please fill in all required fields.');
    return;
  }

  if (!validateEmail(email)) {
    showError(errorContainer, 'Please enter a valid email address.');
    return;
  }

  if (password.length < 6) {
    showError(errorContainer, 'Password must be at least 6 characters long.');
    return;
  }

  if (password !== confirmPassword) {
    showError(errorContainer, 'Passwords do not match.');
    return;
  }

  // Set loading state
  setLoadingState(submitBtn, true, 'Creating Account...');

  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        email,
        password,
        role: 'customer'
      })
    });

    const resData = await response.json();

    if (!response.ok) {
      throw new Error(resData.message || 'Registration failed. Please try again.');
    }

    // Success: Show popup alert modal, then redirect to login.html
    showRegistrationSuccessModal(name);

  } catch (err) {
    showError(errorContainer, err.message);
  } finally {
    setLoadingState(submitBtn, false, 'Register');
  }
}

// Helper: Show Error Messages
function showError(container, message) {
  container.textContent = message;
  container.style.display = 'block';
  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Helper: Validate Email Format
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Helper: Button Loading States
function setLoadingState(button, isLoading, text) {
  if (isLoading) {
    button.disabled = true;
    button.dataset.originalText = button.innerHTML;
    button.innerHTML = `
      <svg class="spinner" width="20" height="20" viewBox="0 0 50 50" style="animation: rotate 2s linear infinite; margin-right: 8px;">
        <circle class="path" cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" style="stroke-dasharray: 1, 150; stroke-dashoffset: 0; animation: dash 1.5s ease-in-out infinite;"></circle>
      </svg>
      <span>${text}</span>
    `;
  } else {
    button.disabled = false;
    button.innerHTML = button.dataset.originalText || text;
  }
}

// Helper: Create & Show Success Modal
function showRegistrationSuccessModal(name) {
  const successOverlay = document.createElement('div');
  successOverlay.className = 'modal-overlay active';
  successOverlay.id = 'reg-success-overlay';

  successOverlay.innerHTML = `
    <div class="checkout-modal success-modal text-center" style="max-width: 450px;">
      <div class="success-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#38A25D" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
      </div>
      <h2 style="font-family: var(--font-headings); color: var(--primary); margin-bottom: 12px; font-size: 24px;">Welcome, ${name.split(' ')[0]}!</h2>
      <p style="color: var(--gray); margin-bottom: 24px; font-size: 14px;">Your Mamafarm account has been successfully created. You can now login to start ordering organic pickles, honey, and ready-to-eat products.</p>
      
      <button class="btn btn-primary btn-block" onclick="window.location.href='login.html'">Proceed to Login</button>
    </div>
  `;

  document.body.appendChild(successOverlay);
  document.body.style.overflow = 'hidden';

  // Automatically redirect after 3 seconds if user doesn't click
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 3000);
}

// Add simple CSS animations for loading spinner
const style = document.createElement('style');
style.textContent = `
  @keyframes rotate {
    100% { transform: rotate(360deg); }
  }
  @keyframes dash {
    0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
    50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
    100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
  }
  .spinner {
    display: inline-block;
    vertical-align: middle;
  }
`;
document.head.appendChild(style);
