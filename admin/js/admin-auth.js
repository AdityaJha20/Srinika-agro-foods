// Admin Authentication, Redirection, and Route Guard Logic

// 1. Immediate Execution Route Guards (Runs in <head> to prevent UI flash)
(function () {
  const path = window.location.pathname;

  // Check if we are on the dashboard page
  if (path.includes('dashboard.html') || path.endsWith('/dashboard') || path.endsWith('/dashboard/')) {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    let isValid = false;

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.role === 'admin') {
          isValid = true;
        }
      } catch (e) {
        // Safe parsing error handling
      }
    }

    if (!isValid) {
      // Clear potentially corrupted or invalid session tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.replace('login.html');
    }
  }

  // Check if we are on the login page (Redirect authenticated admin to dashboard)
  if (path.includes('login.html') || path.endsWith('/admin') || path.endsWith('/admin/')) {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.role === 'admin') {
          window.location.replace('dashboard.html');
        }
      } catch (e) {
        // Safe parsing error handling
      }
    }
  }
})();

// 2. DOMContentLoaded Event Listeners for Login Form
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('form');
  if (!loginForm) return;

  // Dynamically inject an error container if it doesn't already exist in the HTML structure
  let errorContainer = document.getElementById('error-msg');
  if (!errorContainer) {
    errorContainer = document.createElement('div');
    errorContainer.id = 'error-msg';
    errorContainer.style.color = '#D93838';
    errorContainer.style.backgroundColor = '#FDF2F2';
    errorContainer.style.border = '1px solid #F8D7DA';
    errorContainer.style.padding = '12px';
    errorContainer.style.borderRadius = '8px';
    errorContainer.style.marginBottom = '20px';
    errorContainer.style.fontSize = '14px';
    errorContainer.style.fontWeight = '600';
    errorContainer.style.display = 'none';
    loginForm.parentNode.insertBefore(errorContainer, loginForm);
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Reset error messages on new submission
    errorContainer.style.display = 'none';
    errorContainer.textContent = '';

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitBtn = loginForm.querySelector('button[type="submit"]') || loginForm.querySelector('button') || e.submitter;

    if (!emailInput || !passwordInput || !submitBtn) return;

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      showError('Please enter both email and password.');
      return;
    }

    // Set UI loading state
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';

    try {
      const response = await fetch('http://localhost:5001/api/v1/auth/login', {
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

      const { user, accessToken } = resData.data;

      // Crucial Security Step: Verify that the user role is admin
      if (user.role !== 'admin') {
        // Clear any stored authentication from local storage to prevent session contamination
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        throw new Error('Access Denied. Administrator account required.');
      }

      // Store authentications using the same keys as the client portal
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect to dashboard page
      window.location.href = 'dashboard.html';

    } catch (err) {
      showError(err.message);
    } finally {
      // Restore UI loading state
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });

  function showError(msg) {
    errorContainer.textContent = msg;
    errorContainer.style.display = 'block';
  }
});
