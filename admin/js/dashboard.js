// Admin Dashboard Interactivity & UI Handlers
document.addEventListener('DOMContentLoaded', () => {
  // --- State Variables for Products View ---
  let currentProductPage = 1;
  const productLimit = 10;
  let productSearchQuery = '';
  let searchTimeout = null;
  let loadedProducts = [];
  let editingProductId = null;
  let deletingProductId = null;

  // --- State Variables for Orders View ---
  let currentOrdersPage = 1;
  const ordersLimit = 10;
  let ordersSearchQuery = '';
  let ordersStatusFilter = '';
  let ordersSearchTimeout = null;
  let loadedOrders = [];
  let currentDetailOrderId = null;


  // --- 1. Load Admin Profile details dynamically ---
  const profileNameEl = document.getElementById('admin-profile-name');
  const profileAvatarEl = document.querySelector('.profile-avatar');

  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user && user.name) {
        profileNameEl.textContent = user.name;
        // Set avatar letter to user's first initial
        const initial = user.name.trim().charAt(0).toUpperCase();
        if (profileAvatarEl) {
          profileAvatarEl.textContent = initial;
        }
      }
    } catch (e) {
      console.error('Failed to parse user details for dashboard profile', e);
    }
  }

  // --- Fetch Dashboard Stats ---
  async function fetchDashboardStats() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      window.location.replace('login.html');
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/v1/admin/stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401 || response.status === 403) {
        console.warn('Unauthorized or Forbidden access, logging out...');
        localStorage.clear();
        window.location.replace('login.html');
        return;
      }

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Failed to fetch statistics.');
      }

      const stats = resData.data;
      const productsEl = document.getElementById('stat-total-products');
      const ordersEl = document.getElementById('stat-total-orders');
      const customersEl = document.getElementById('stat-total-customers');
      const revenueEl = document.getElementById('stat-total-revenue');
      const pendingEl = document.getElementById('stat-pending-orders');
      const lowStockEl = document.getElementById('stat-low-stock');

      if (productsEl && stats.totalProducts !== undefined) productsEl.textContent = stats.totalProducts;
      if (ordersEl && stats.totalOrders !== undefined) ordersEl.textContent = stats.totalOrders;
      if (customersEl && stats.totalCustomers !== undefined) customersEl.textContent = stats.totalCustomers;
      if (revenueEl && stats.totalRevenue !== undefined) {
        revenueEl.textContent = new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0
        }).format(stats.totalRevenue);
      }
      if (pendingEl && stats.pendingOrders !== undefined) pendingEl.textContent = stats.pendingOrders;
      if (lowStockEl && stats.lowStockProducts !== undefined) lowStockEl.textContent = stats.lowStockProducts;

    } catch (err) {
      console.error('Error fetching dashboard statistics:', err);
    }
  }

  // Run statistics fetch immediately on load
  fetchDashboardStats();
  fetchRecentOrders();

  // --- 2. Mobile Sidebar Toggle Drawer ---
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const sidebar = document.getElementById('admin-sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  const closeSidebar = () => {
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (hamburgerBtn && sidebar && overlay) {
    const openSidebar = () => {
      sidebar.classList.add('open');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden'; // Block background scroll
    };

    hamburgerBtn.addEventListener('click', openSidebar);
    overlay.addEventListener('click', closeSidebar);
  }

  // --- 3. Sidebar SPA Page Switching ---
  const menuItems = document.querySelectorAll('.sidebar-menu .menu-item');
  const dashboardView = document.getElementById('dashboard-view');
  const productsView = document.getElementById('products-view');
  const ordersView = document.getElementById('orders-view');
  const pageTitle = document.getElementById('breadcrumb-page-title');
  const breadcrumbCurrent = document.getElementById('breadcrumb-current-view');

  menuItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();

      const targetView = item.getAttribute('data-view');
      if (!targetView) return;

      // Close mobile drawer on item select
      closeSidebar();

      // Handle SPA view toggling
      if (targetView === 'dashboard') {
        // Toggle view visibility
        if (dashboardView) dashboardView.style.display = 'flex';
        if (productsView) productsView.style.display = 'none';
        if (ordersView) ordersView.style.display = 'none';

        // Update Breadcrumbs
        if (pageTitle) pageTitle.textContent = 'Overview';
        if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'Dashboard';

        // Update Sidebar Active state
        menuItems.forEach(el => el.classList.remove('active'));
        item.classList.add('active');

        // Refresh statistics when coming back to the overview dashboard
        fetchDashboardStats();
        fetchRecentOrders();
      } else if (targetView === 'products') {
        // Toggle view visibility
        if (dashboardView) dashboardView.style.display = 'none';
        if (productsView) productsView.style.display = 'flex';
        if (ordersView) ordersView.style.display = 'none';

        // Update Breadcrumbs
        if (pageTitle) pageTitle.textContent = 'Products';
        if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'Products';

        // Update Sidebar Active state
        menuItems.forEach(el => el.classList.remove('active'));
        item.classList.add('active');

        // Fetch categories and products catalog
        fetchCategories();
        fetchProducts();
      } else if (targetView === 'orders') {
        // Toggle view visibility
        if (dashboardView) dashboardView.style.display = 'none';
        if (productsView) productsView.style.display = 'none';
        if (ordersView) ordersView.style.display = 'flex';

        // Update Breadcrumbs
        if (pageTitle) pageTitle.textContent = 'Orders';
        if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'Orders';

        // Update Sidebar Active state
        menuItems.forEach(el => el.classList.remove('active'));
        item.classList.add('active');

        // Fetch orders catalog
        fetchOrders();
      } else {
        // Other views are not implemented yet: highlight button but do not switch display
        menuItems.forEach(el => el.classList.remove('active'));
        item.classList.add('active');
      }
    });
  });

  // --- 4. Admin Logout Action ---
  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();

      // Clear administrator storage keys
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');

      // Redirect back to login screen using replace to keep browsing history clean
      window.location.replace('login.html');
    });
  }

  // --- 5. Products Management Logic (Fetch, Search, Pagination) ---
  const tableBody = document.getElementById('products-table-body');
  const paginationContainer = document.getElementById('products-pagination');
  const searchInput = document.getElementById('product-search');

  async function fetchProducts() {
    if (!tableBody) return;

    // Show Loading State
    renderLoadingState();

    try {
      const token = localStorage.getItem('accessToken');
      // Format backend search request properly using text search and category parameters
      let url = `http://localhost:5001/api/v1/products?page=${currentProductPage}&limit=${productLimit}&search=${encodeURIComponent(productSearchQuery)}`;
      const categoryFilter = document.getElementById('category-filter');
      if (categoryFilter && categoryFilter.value) {
        url += `&category=${encodeURIComponent(categoryFilter.value)}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Failed to retrieve products catalog.');
      }

      const products = resData.data.products;
      loadedProducts = products;
      const total = resData.total;
      const totalPages = resData.totalPages;
      const page = resData.page;

      if (!products || products.length === 0) {
        renderEmptyState();
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
      }

      // Render Product list rows
      renderProductRows(products);

      // Render Pagination info and controls
      renderPagination(total, totalPages, page);

    } catch (err) {
      renderErrorState(err.message);
      if (paginationContainer) paginationContainer.innerHTML = '';
    }
  }

  function renderLoadingState() {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" class="text-center">
          <div class="loading-spinner-wrapper">
            <svg class="spinner" width="32" height="32" viewBox="0 0 50 50" style="animation: rotate 2s linear infinite; margin-bottom: 8px;">
              <circle class="path" cx="25" cy="25" r="20" fill="none" stroke="var(--primary)" stroke-width="5" style="stroke-dasharray: 1, 150; stroke-dashoffset: 0; animation: dash 1.5s ease-in-out infinite;"></circle>
            </svg>
            <p style="font-weight: 600; color: var(--primary);">Loading products...</p>
          </div>
        </td>
      </tr>
    `;
  }

  function renderEmptyState() {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" class="text-center">
          <div class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gray)" stroke-width="1.5" style="margin-bottom: 8px;"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            <p style="color: var(--gray); font-weight: 500;">No products found matching your criteria.</p>
          </div>
        </td>
      </tr>
    `;
  }

  function renderErrorState(errorMsg) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" class="text-center">
          <div class="error-state" style="color: var(--danger);">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 8px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path></svg>
            <p style="font-weight: 600;">Failed to load products: ${errorMsg}</p>
            <button id="product-retry-btn" class="btn-retry">Retry Fetch</button>
          </div>
        </td>
      </tr>
    `;

    const retryBtn = document.getElementById('product-retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        fetchProducts();
      });
    }
  }

  function renderProductRows(products) {
    tableBody.innerHTML = '';

    products.forEach((product) => {
      // Resolve status based on stock volume
      let statusText = 'In Stock';
      let statusClass = 'status-delivered'; // Green badge
      if (product.stock === 0) {
        statusText = 'Out of Stock';
        statusClass = 'status-cancelled'; // Red badge
      } else if (product.stock <= 10) {
        statusText = 'Low Stock';
        statusClass = 'status-pending'; // Orange badge
      }

      // Format Price
      const priceFormatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(product.price);

      // Resolve category name safely
      const categoryName = product.category ? product.category.name : 'Uncategorized';

      // Featured Badge
      const featuredBadge = product.featured
        ? '<span class="badge status-delivered">Featured</span>'
        : '<span class="badge" style="background-color: var(--gray-light); color: var(--gray);">No</span>';

      // Handle Image fallback
      const imageUrl = product.images && product.images.length > 0 ? `../${product.images[0]}` : '../assets/images/placeholder.png';

      const row = document.createElement('tr');
      row.innerHTML = `
        <td><img src="${imageUrl}" alt="${product.name}" class="product-table-img" onerror="this.src='../assets/images/placeholder.png'"></td>
        <td class="font-bold">${product.name}</td>
        <td class="font-mono">${product.sku}</td>
        <td>${categoryName}</td>
        <td class="font-bold">${priceFormatted}</td>
        <td>${product.stock}</td>
        <td><span class="badge ${statusClass}">${statusText}</span></td>
        <td>${featuredBadge}</td>
        <td class="text-right">
          <button class="action-btn" aria-label="Edit Product" data-id="${product._id}" style="margin-right: 4px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"></path></svg>
          </button>
          <button class="action-btn" aria-label="Delete Product" data-id="${product._id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }

  function renderPagination(total, totalPages, page) {
    if (!paginationContainer) return;

    const startItem = (page - 1) * productLimit + 1;
    const endItem = Math.min(page * productLimit, total);

    let pageButtonsHTML = '';

    // Previous Page Button
    const prevDisabled = page === 1 ? 'disabled' : '';
    pageButtonsHTML += `
      <button class="pagination-btn" id="pagination-prev" ${prevDisabled}>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
        <span>Prev</span>
      </button>
    `;

    // Numeric Page Buttons
    for (let i = 1; i <= totalPages; i++) {
      const activeClass = i === page ? 'active' : '';
      pageButtonsHTML += `<button class="pagination-btn page-num ${activeClass}" data-page="${i}">${i}</button>`;
    }

    // Next Page Button
    const nextDisabled = page === totalPages ? 'disabled' : '';
    pageButtonsHTML += `
      <button class="pagination-btn" id="pagination-next" ${nextDisabled}>
        <span>Next</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </button>
    `;

    paginationContainer.innerHTML = `
      <span class="pagination-info">Showing <strong>${startItem}-${endItem}</strong> of <strong>${total}</strong> products</span>
      <div class="pagination-buttons">
        ${pageButtonsHTML}
      </div>
    `;

    // Attach Event Listeners
    const prevBtn = document.getElementById('pagination-prev');
    if (prevBtn && page > 1) {
      prevBtn.addEventListener('click', () => {
        currentProductPage--;
        fetchProducts();
      });
    }

    const nextBtn = document.getElementById('pagination-next');
    if (nextBtn && page < totalPages) {
      nextBtn.addEventListener('click', () => {
        currentProductPage++;
        fetchProducts();
      });
    }

    const numBtns = paginationContainer.querySelectorAll('.page-num');
    numBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const pageNum = parseInt(btn.getAttribute('data-page'), 10);
        if (pageNum !== currentProductPage) {
          currentProductPage = pageNum;
          fetchProducts();
        }
      });
    });
  }

  // --- 6. Search Filter Input Handlers with Debouncing (300ms) ---
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value;

      searchTimeout = setTimeout(() => {
        productSearchQuery = query;
        currentProductPage = 1; // Reset to page 1 for search
        fetchProducts();
      }, 300); // 300ms debounce delay
    });
  }

  // --- 7. Add Product Modal UI Logic (Frontend Only) ---
  const addProductModal = document.getElementById('add-product-modal');
  const addProductForm = document.getElementById('add-product-form');
  if (addProductForm) {
    addProductForm.setAttribute('novalidate', 'true');
  }
  const openAddModalBtn = document.getElementById('btn-open-add-modal');
  const closeAddModalBtn = document.getElementById('btn-close-modal');
  const cancelAddModalBtn = document.getElementById('btn-cancel-modal');

  // Reusable helper functions
  window.openAddProductModal = function() {
    editingProductId = null;
    const titleEl = addProductModal ? addProductModal.querySelector('.modal-title') : null;
    if (titleEl) {
      titleEl.textContent = 'Add Product';
    }
    window.resetAddProductForm();
    if (addProductModal) {
      addProductModal.classList.add('open');
    }
    document.body.classList.add('no-scroll');
  };

  window.closeAddProductModal = function() {
    if (addProductModal) {
      addProductModal.classList.remove('open');
    }
    document.body.classList.remove('no-scroll');
  };

  // --- Delete Product Modal UI Logic (Frontend Only) ---
  const deleteProductModal = document.getElementById('delete-product-modal');
  const closeDeleteModalBtn = document.getElementById('btn-close-delete-modal');
  const cancelDeleteModalBtn = document.getElementById('btn-cancel-delete-modal');
  const confirmDeleteModalBtn = document.getElementById('btn-confirm-delete-modal');

  window.openDeleteConfirmationModal = function(productId) {
    deletingProductId = productId;
    if (deleteProductModal) {
      deleteProductModal.classList.add('open');
    }
    document.body.classList.add('no-scroll');
  };

  window.closeDeleteConfirmationModal = function() {
    deletingProductId = null;
    if (deleteProductModal) {
      deleteProductModal.classList.remove('open');
    }
    document.body.classList.remove('no-scroll');
  };

  if (closeDeleteModalBtn) {
    closeDeleteModalBtn.addEventListener('click', () => {
      window.closeDeleteConfirmationModal();
    });
  }

  if (cancelDeleteModalBtn) {
    cancelDeleteModalBtn.addEventListener('click', () => {
      window.closeDeleteConfirmationModal();
    });
  }

  if (deleteProductModal) {
    deleteProductModal.addEventListener('click', (e) => {
      if (e.target === deleteProductModal) {
        window.closeDeleteConfirmationModal();
      }
    });
  }

  if (confirmDeleteModalBtn) {
    confirmDeleteModalBtn.addEventListener('click', async () => {
      if (!deletingProductId) return;

      const originalBtnText = confirmDeleteModalBtn.textContent;
      confirmDeleteModalBtn.disabled = true;
      confirmDeleteModalBtn.textContent = 'Deleting...';
      if (cancelDeleteModalBtn) cancelDeleteModalBtn.disabled = true;

      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`http://localhost:5001/api/v1/products/${deletingProductId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const resData = await response.json();

        if (!response.ok) {
          throw new Error(resData.message || 'Failed to delete product.');
        }

        // Show success toast
        window.showToast(resData.message || 'Product deleted successfully!', 'success');

        // Fetch products to update table and pagination correctly
        await fetchProducts();

        // Close the modal
        window.closeDeleteConfirmationModal();

      } catch (err) {
        console.error('Product deletion failed:', err);
        window.showToast(err.message || 'Failed to delete product.', 'error');
      } finally {
        // Restore buttons
        confirmDeleteModalBtn.disabled = false;
        confirmDeleteModalBtn.textContent = originalBtnText;
        if (cancelDeleteModalBtn) cancelDeleteModalBtn.disabled = false;
      }
    });
  }

  window.resetAddProductForm = function() {
    if (addProductForm) {
      addProductForm.reset();
      window.clearAllValidationErrors();
      
      // Ensure defaults (Featured = OFF, Active = ON)
      const featuredToggle = document.getElementById('prod-featured');
      const activeToggle = document.getElementById('prod-active');
      if (featuredToggle) featuredToggle.checked = false;
      if (activeToggle) activeToggle.checked = true;
    }
  };

  // Show error below field, reuse existing element if already present
  window.showErrorForField = function(inputEl, message) {
    if (!inputEl) return;
    inputEl.classList.add('error-border');
    
    // Find if sibling .error-text already exists
    let errorTextEl = inputEl.parentNode.querySelector('.error-text');
    if (!errorTextEl) {
      errorTextEl = document.createElement('span');
      errorTextEl.className = 'error-text';
      // Insert after input field (or sibling help/instructions)
      inputEl.parentNode.appendChild(errorTextEl);
    }
    errorTextEl.textContent = message;
  };

  // Clear error below field
  window.clearErrorForField = function(inputEl) {
    if (!inputEl) return;
    inputEl.classList.remove('error-border');
    inputEl.style.backgroundColor = '';
    const errorTextEl = inputEl.parentNode.querySelector('.error-text');
    if (errorTextEl) {
      errorTextEl.remove();
    }
  };

  // Clear validation styling/elements across all inputs in the form
  window.clearAllValidationErrors = function() {
    if (!addProductForm) return;
    const errorInputs = addProductForm.querySelectorAll('.error-border');
    errorInputs.forEach(input => {
      input.classList.remove('error-border');
      input.style.backgroundColor = '';
    });
    const errorTexts = addProductForm.querySelectorAll('.error-text');
    errorTexts.forEach(txt => txt.remove());
  };

  // Real-time validation mapping
  const validationRules = [
    {
      id: 'prod-name',
      validator: val => val.trim().length > 0,
      msg: 'Product Name is required.'
    },
    {
      id: 'prod-sku',
      validator: val => val.trim().length > 0,
      msg: 'Product SKU is required.'
    },
    {
      id: 'prod-price',
      validator: val => val !== '' && !isNaN(val) && parseFloat(val) > 0,
      msg: 'Price must be a valid number greater than zero.'
    },
    {
      id: 'prod-category',
      validator: val => val.trim().length > 0,
      msg: 'Please select a product category.'
    },
    {
      id: 'prod-stock',
      validator: val => val !== '' && !isNaN(val) && parseInt(val, 10) >= 0,
      msg: 'Stock must be a non-negative integer (0 or greater).'
    }
  ];

  // Set up listeners for real-time validation clearing when inputs are corrected
  validationRules.forEach(rule => {
    const inputEl = document.getElementById(rule.id);
    if (inputEl) {
      const checkAndClear = () => {
        if (rule.validator(inputEl.value)) {
          window.clearErrorForField(inputEl);
        }
      };
      inputEl.addEventListener('input', checkAndClear);
      inputEl.addEventListener('change', checkAndClear);
    }
  });

  // Click handler to open
  if (openAddModalBtn) {
    openAddModalBtn.addEventListener('click', () => {
      window.openAddProductModal();
    });
  }

  // Click handlers to close
  if (closeAddModalBtn) {
    closeAddModalBtn.addEventListener('click', () => {
      window.closeAddProductModal();
    });
  }

  if (cancelAddModalBtn) {
    cancelAddModalBtn.addEventListener('click', () => {
      window.closeAddProductModal();
    });
  }

  // Click outside to close
  if (addProductModal) {
    addProductModal.addEventListener('click', (e) => {
      if (e.target === addProductModal) {
        window.closeAddProductModal();
      }
    });
  }

  // ESC key listener to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (addProductModal && addProductModal.classList.contains('open')) {
        window.closeAddProductModal();
      }
      if (deleteProductModal && deleteProductModal.classList.contains('open')) {
        window.closeDeleteConfirmationModal();
      }
    }
  });

  // Fetch all categories and populate dropdown selects with failure handling
  async function fetchCategories() {
    const filterSelect = document.getElementById('category-filter');
    const formSelect = document.getElementById('prod-category');
    const saveBtn = document.getElementById('btn-save-modal');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5001/api/v1/categories', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Failed to retrieve categories.');
      }

      const categories = resData.data.categories;
      if (!categories || categories.length === 0) {
        throw new Error('No categories found.');
      }

      // Populate selects
      if (filterSelect) {
        filterSelect.removeAttribute('disabled');
        filterSelect.innerHTML = '<option value="">All Categories</option>';
        categories.forEach(cat => {
          filterSelect.innerHTML += `<option value="${cat._id}">${cat.name}</option>`;
        });
      }

      if (formSelect) {
        formSelect.removeAttribute('disabled');
        formSelect.innerHTML = '<option value="">Select Category</option>';
        categories.forEach(cat => {
          formSelect.innerHTML += `<option value="${cat._id}">${cat.name}</option>`;
        });
      }

      if (saveBtn) {
        saveBtn.removeAttribute('disabled');
        saveBtn.style.opacity = '1';
        saveBtn.style.cursor = 'pointer';
      }

    } catch (err) {
      console.error('Category fetch failed:', err);
      
      // Fallback UI
      if (filterSelect) {
        filterSelect.innerHTML = '<option value="">Categories Unavailable</option>';
        filterSelect.setAttribute('disabled', 'true');
      }
      if (formSelect) {
        formSelect.innerHTML = '<option value="">Unable to load categories. Please try again.</option>';
        formSelect.setAttribute('disabled', 'true');
      }
      if (saveBtn) {
        saveBtn.setAttribute('disabled', 'true');
        saveBtn.style.opacity = '0.5';
        saveBtn.style.cursor = 'not-allowed';
      }
    }
  }

  // Toast notification creator utility
  window.showToast = function(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = document.createElement('div');
    icon.className = 'toast-icon';
    icon.innerHTML = type === 'success' ? '✓' : '✗';
    
    const content = document.createElement('div');
    content.className = 'toast-content';
    content.textContent = message;
    
    toast.appendChild(icon);
    toast.appendChild(content);
    container.appendChild(toast);
    
    // Trigger slide-in animation
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    // Auto dismiss after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      toast.classList.add('hide');
      setTimeout(() => {
        toast.remove();
        if (container.children.length === 0) {
          container.remove();
        }
      }, 300);
    }, 3000);
  };

  // Category filter select change trigger
  const categoryFilter = document.getElementById('category-filter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', () => {
      currentProductPage = 1;
      fetchProducts();
    });
  }

  // openEditProductModal to populate values in Edit Mode
  window.openEditProductModal = function(productId) {
    const product = loadedProducts.find(p => p._id === productId);
    if (!product) {
      console.error('Product not found in cache:', productId);
      return;
    }

    editingProductId = productId;
    const titleEl = addProductModal ? addProductModal.querySelector('.modal-title') : null;
    if (titleEl) {
      titleEl.textContent = 'Edit Product';
    }

    window.resetAddProductForm(); // Clears inputs and old errors

    // Populate inputs
    const nameEl = document.getElementById('prod-name');
    const skuEl = document.getElementById('prod-sku');
    const descriptionEl = document.getElementById('prod-description');
    const priceEl = document.getElementById('prod-price');
    const categoryEl = document.getElementById('prod-category');
    const stockEl = document.getElementById('prod-stock');
    const weightEl = document.getElementById('prod-weight');
    const featuredEl = document.getElementById('prod-featured');
    const activeEl = document.getElementById('prod-active');
    const imagesEl = document.getElementById('prod-images');

    if (nameEl) nameEl.value = product.name || '';
    if (skuEl) skuEl.value = product.sku || '';
    if (descriptionEl) descriptionEl.value = product.description || '';
    if (priceEl) priceEl.value = product.price || '';
    
    if (categoryEl) {
      const catId = product.category ? (product.category._id || product.category) : '';
      categoryEl.value = catId;
    }

    if (stockEl) stockEl.value = product.stock !== undefined ? product.stock : '';
    if (weightEl) weightEl.value = product.weight !== undefined ? product.weight : '';
    if (featuredEl) featuredEl.checked = !!product.featured;
    if (activeEl) activeEl.checked = product.isActive !== undefined ? !!product.isActive : true;
    if (imagesEl) imagesEl.value = product.images ? product.images.join(', ') : '';

    if (addProductModal) {
      addProductModal.classList.add('open');
    }
    document.body.classList.add('no-scroll');
  };

  // Event delegation on table body for Edit and Delete button clicks
  if (tableBody) {
    tableBody.addEventListener('click', (e) => {
      const editBtn = e.target.closest('[aria-label="Edit Product"]');
      if (editBtn) {
        const productId = editBtn.getAttribute('data-id');
        window.openEditProductModal(productId);
        return;
      }

      const deleteBtn = e.target.closest('[aria-label="Delete Product"]');
      if (deleteBtn) {
        const productId = deleteBtn.getAttribute('data-id');
        window.openDeleteConfirmationModal(productId);
        return;
      }
    });
  }

  // Intercept submit event (with validation and backend integration)
  if (addProductForm) {
    addProductForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      let firstInvalidEl = null;
      let isFormValid = true;

      validationRules.forEach(rule => {
        const inputEl = document.getElementById(rule.id);
        if (inputEl) {
          const val = inputEl.value;
          if (!rule.validator(val)) {
            window.showErrorForField(inputEl, rule.msg);
            isFormValid = false;
            if (!firstInvalidEl) {
              firstInvalidEl = inputEl;
            }
          } else {
            window.clearErrorForField(inputEl);
          }
        }
      });

      if (!isFormValid) {
        if (firstInvalidEl) {
          firstInvalidEl.focus();
        }
        console.log('Product form validation failed.');
        return;
      }

      // Collect field values
      const name = document.getElementById('prod-name').value.trim();
      const sku = document.getElementById('prod-sku').value.trim();
      const description = document.getElementById('prod-description').value.trim();
      const price = parseFloat(document.getElementById('prod-price').value);
      const category = document.getElementById('prod-category').value;
      const stock = parseInt(document.getElementById('prod-stock').value, 10);
      const weightInput = document.getElementById('prod-weight').value.trim();
      const featured = document.getElementById('prod-featured').checked;
      const active = document.getElementById('prod-active').checked;
      const imagesText = document.getElementById('prod-images').value.trim();

      // Convert weight safely (Number)
      let weightVal = 0;
      if (weightInput) {
        const parsedWeight = parseFloat(weightInput.replace(/[^0-9.]/g, ''));
        if (!isNaN(parsedWeight)) {
          weightVal = parsedWeight;
        }
      }

      // Convert images safely (Array of Strings)
      const images = imagesText ? imagesText.split(',').map(img => img.trim()).filter(Boolean) : [];

      const payload = {
        name,
        sku,
        description,
        price,
        category,
        stock,
        weight: weightVal,
        featured,
        isActive: active,
        images
      };

      // Set dynamic URL, Method, success messages, and error defaults
      const method = editingProductId ? 'PUT' : 'POST';
      const url = editingProductId 
        ? `http://localhost:5001/api/v1/products/${editingProductId}` 
        : 'http://localhost:5001/api/v1/products';
      const successMsg = editingProductId ? 'Product updated successfully!' : 'Product created successfully!';
      const errorMsgDefault = editingProductId ? 'Failed to update product.' : 'Failed to create product.';

      // Set Loading States
      const saveBtn = document.getElementById('btn-save-modal');
      const cancelBtn = document.getElementById('btn-cancel-modal');
      const originalBtnText = saveBtn.textContent;

      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';
      cancelBtn.disabled = true;

      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        const resData = await response.json();

        if (!response.ok) {
          throw new Error(resData.message || errorMsgDefault);
        }

        // Recommended Success Flow:
        // 1. Refresh the product list using fetchProducts()
        await fetchProducts();

        // 2. Reset the Add Product form
        window.resetAddProductForm();

        // 3. Close the modal
        window.closeAddProductModal();

        // 4. Show the success toast
        window.showToast(successMsg, 'success');

      } catch (err) {
        console.error('Product save failed:', err);

        // Check if duplicate SKU error or other validation error
        if (err.message.toLowerCase().includes('sku')) {
          const skuEl = document.getElementById('prod-sku');
          window.showErrorForField(skuEl, 'Product with this SKU already exists');
          skuEl.focus();
        }

        window.showToast(err.message || errorMsgDefault, 'error');

      } finally {
        // Restore buttons
        saveBtn.disabled = false;
        saveBtn.textContent = originalBtnText;
        cancelBtn.disabled = false;
      }
    });
  }

  // =========================================================================
  // --- 8. Orders Management Logic (Fetch, Search, Filter, Pagination, Details Modal) ---
  // =========================================================================
  const ordersTableBody = document.getElementById('orders-table-body');
  const ordersPaginationContainer = document.getElementById('orders-pagination');
  const orderSearchInput = document.getElementById('order-search');
  const orderStatusFilterSelect = document.getElementById('order-status-filter');
  const orderDetailsModal = document.getElementById('order-details-modal');

  // Fetch all orders
  async function fetchOrders() {
    if (!ordersTableBody) return;

    // Show Loading State
    renderOrdersLoadingState();

    try {
      const token = localStorage.getItem('accessToken');
      let url = `http://localhost:5001/api/v1/admin/orders?page=${currentOrdersPage}&limit=${ordersLimit}`;
      if (ordersSearchQuery) {
        url += `&search=${encodeURIComponent(ordersSearchQuery)}`;
      }
      if (ordersStatusFilter) {
        url += `&status=${encodeURIComponent(ordersStatusFilter)}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Failed to retrieve orders listing.');
      }

      const orders = resData.data.orders;
      loadedOrders = orders;
      const total = resData.totalResults;
      const totalPages = resData.totalPages;
      const page = resData.currentPage;

      if (!orders || orders.length === 0) {
        renderOrdersEmptyState();
        if (ordersPaginationContainer) ordersPaginationContainer.innerHTML = '';
        return;
      }

      // Render rows
      renderOrderRows(orders);

      // Render pagination
      renderOrdersPagination(total, totalPages, page);

    } catch (err) {
      renderOrdersErrorState(err.message);
      if (ordersPaginationContainer) ordersPaginationContainer.innerHTML = '';
    }
  }

  function renderOrdersLoadingState() {
    ordersTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center">
          <div class="loading-spinner-wrapper">
            <svg class="spinner" width="32" height="32" viewBox="0 0 50 50" style="animation: rotate 2s linear infinite; margin-bottom: 8px;">
              <circle class="path" cx="25" cy="25" r="20" fill="none" stroke="var(--primary)" stroke-width="5" style="stroke-dasharray: 1, 150; stroke-dashoffset: 0; animation: dash 1.5s ease-in-out infinite;"></circle>
            </svg>
            <p style="font-weight: 600; color: var(--primary);">Loading orders...</p>
          </div>
        </td>
      </tr>
    `;
  }

  function renderOrdersEmptyState() {
    ordersTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center">
          <div class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gray)" stroke-width="1.5" style="margin-bottom: 8px;"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            <p style="color: var(--gray); font-weight: 500;">No orders found matching your criteria.</p>
          </div>
        </td>
      </tr>
    `;
  }

  function renderOrdersErrorState(errorMsg) {
    ordersTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center">
          <div class="error-state" style="color: var(--danger);">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 8px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path></svg>
            <p style="font-weight: 600;">Failed to load orders: ${errorMsg}</p>
            <button id="orders-retry-btn" class="btn-retry">Retry Fetch</button>
          </div>
        </td>
      </tr>
    `;
    const retryBtn = document.getElementById('orders-retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', fetchOrders);
    }
  }

  function renderOrderRows(orders) {
    ordersTableBody.innerHTML = '';
    orders.forEach(order => {
      // Order Status Badge
      let orderStatusClass = 'badge';
      if (order.orderStatus === 'placed') orderStatusClass += ' status-pending';
      else if (order.orderStatus === 'confirmed' || order.orderStatus === 'processing') orderStatusClass += ' status-pending';
      else if (order.orderStatus === 'shipped' || order.orderStatus === 'delivered') orderStatusClass += ' status-delivered';
      else if (order.orderStatus === 'cancelled') orderStatusClass += ' status-cancelled';

      // Payment Status Badge
      let paymentStatusClass = 'badge';
      if (order.paymentStatus === 'pending') paymentStatusClass += ' status-pending';
      else if (order.paymentStatus === 'paid') paymentStatusClass += ' status-delivered';
      else if (order.paymentStatus === 'failed' || order.paymentStatus === 'refunded') paymentStatusClass += ' status-cancelled';

      const customerName = order.user ? order.user.name : 'Guest';
      const customerEmail = order.user ? order.user.email : '';
      
      const dateFormatted = new Date(order.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      const priceFormatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2
      }).format(order.totalAmount);

      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="font-mono font-bold">${order.orderId}</td>
        <td>
          <div class="customer-cell">
            <div class="customer-avatar">${customerName.substring(0, 2).toUpperCase()}</div>
            <div>
              <span class="customer-name">${customerName}</span>
              <span class="customer-email">${customerEmail}</span>
            </div>
          </div>
        </td>
        <td style="text-transform: uppercase;">${order.paymentMethod}</td>
        <td class="font-bold">${priceFormatted}</td>
        <td><span class="${paymentStatusClass}">${order.paymentStatus}</span></td>
        <td><span class="${orderStatusClass}">${order.orderStatus}</span></td>
        <td>${dateFormatted}</td>
        <td class="text-right">
          <button class="action-btn view-order-btn" aria-label="View Details" data-id="${order._id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </button>
        </td>
      `;
      ordersTableBody.appendChild(row);
    });
  }

  function renderOrdersPagination(total, totalPages, page) {
    if (!ordersPaginationContainer) return;

    const startItem = (page - 1) * ordersLimit + 1;
    const endItem = Math.min(page * ordersLimit, total);

    let pageButtonsHTML = '';
    const prevDisabled = page === 1 ? 'disabled' : '';
    pageButtonsHTML += `
      <button class="pagination-btn" id="orders-prev" ${prevDisabled}>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
        <span>Prev</span>
      </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
      const activeClass = i === page ? 'active' : '';
      pageButtonsHTML += `<button class="pagination-btn orders-page-num ${activeClass}" data-page="${i}">${i}</button>`;
    }

    const nextDisabled = page === totalPages ? 'disabled' : '';
    pageButtonsHTML += `
      <button class="pagination-btn" id="orders-next" ${nextDisabled}>
        <span>Next</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </button>
    `;

    ordersPaginationContainer.innerHTML = `
      <span class="pagination-info">Showing <strong>${startItem}-${endItem}</strong> of <strong>${total}</strong> orders</span>
      <div class="pagination-buttons">
        ${pageButtonsHTML}
      </div>
    `;

    const prevBtn = document.getElementById('orders-prev');
    if (prevBtn && page > 1) {
      prevBtn.addEventListener('click', () => {
        currentOrdersPage--;
        fetchOrders();
      });
    }

    const nextBtn = document.getElementById('orders-next');
    if (nextBtn && page < totalPages) {
      nextBtn.addEventListener('click', () => {
        currentOrdersPage++;
        fetchOrders();
      });
    }

    const numBtns = ordersPaginationContainer.querySelectorAll('.orders-page-num');
    numBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const pageNum = parseInt(btn.getAttribute('data-page'), 10);
        if (pageNum !== currentOrdersPage) {
          currentOrdersPage = pageNum;
          fetchOrders();
        }
      });
    });
  }

  // Debounced Search Input for Orders
  if (orderSearchInput) {
    orderSearchInput.addEventListener('input', (e) => {
      clearTimeout(ordersSearchTimeout);
      const query = e.target.value.trim();
      ordersSearchTimeout = setTimeout(() => {
        ordersSearchQuery = query;
        currentOrdersPage = 1;
        fetchOrders();
      }, 300);
    });
  }

  // Status Filter Select for Orders
  if (orderStatusFilterSelect) {
    orderStatusFilterSelect.addEventListener('change', (e) => {
      ordersStatusFilter = e.target.value;
      currentOrdersPage = 1;
      fetchOrders();
    });
  }

  // --- Order Details Modal Handlers ---
  window.openOrderDetailsModal = function(orderId) {
    const order = loadedOrders.find(o => o._id === orderId);
    if (!order) return;

    currentDetailOrderId = orderId;

    // Populate Customer info
    document.getElementById('detail-customer-name').textContent = order.user ? order.user.name : 'Guest';
    document.getElementById('detail-customer-email').textContent = order.user ? order.user.email : '-';
    document.getElementById('detail-customer-phone').textContent = order.phone || '-';
    document.getElementById('detail-customer-notes').textContent = order.notes || 'None';

    // Populate Shipping snapshot
    const addr = order.shippingAddress;
    document.getElementById('detail-shipping-name').textContent = addr.fullName || '-';
    document.getElementById('detail-shipping-line1').textContent = addr.addressLine1 || '-';
    document.getElementById('detail-shipping-line2').textContent = addr.addressLine2 || '';
    document.getElementById('detail-shipping-city').textContent = addr.city || '-';
    document.getElementById('detail-shipping-state').textContent = addr.state || '-';
    document.getElementById('detail-shipping-pincode').textContent = addr.pincode || '-';
    document.getElementById('detail-shipping-country').textContent = addr.country || 'India';

    // Populate Payment details
    document.getElementById('detail-payment-method').textContent = order.paymentMethod;
    const priceFormatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(order.totalAmount);
    document.getElementById('detail-total-amount').textContent = priceFormatted;
    document.getElementById('detail-payment-status').value = order.paymentStatus;

    // Populate Status Select
    document.getElementById('detail-order-status').value = order.orderStatus;

    // Populate Item summary rows
    const itemsBody = document.getElementById('detail-items-body');
    itemsBody.innerHTML = '';
    order.items.forEach(item => {
      const itemImg = item.image ? `../${item.image}` : '../assets/images/placeholder.png';
      const itemTotal = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(item.price * item.quantity);

      const itemRow = document.createElement('tr');
      itemRow.innerHTML = `
        <td><img src="${itemImg}" alt="${item.name}" class="product-table-img" onerror="this.src='../assets/images/placeholder.png'"></td>
        <td>${item.name}</td>
        <td>${item.sku || '-'}</td>
        <td>₹${item.price}</td>
        <td>${item.quantity}</td>
        <td class="text-right font-bold">${itemTotal}</td>
      `;
      itemsBody.appendChild(itemRow);
    });

    if (orderDetailsModal) orderDetailsModal.classList.add('open');
    document.body.classList.add('no-scroll');
  };

  window.closeOrderDetailsModal = function() {
    currentDetailOrderId = null;
    if (orderDetailsModal) orderDetailsModal.classList.remove('open');
    document.body.classList.remove('no-scroll');
  };

  // Bind Actions on Table row click (View details buttons)
  if (ordersTableBody) {
    ordersTableBody.addEventListener('click', (e) => {
      const detailBtn = e.target.closest('.view-order-btn');
      if (detailBtn) {
        const orderId = detailBtn.getAttribute('data-id');
        window.openOrderDetailsModal(orderId);
      }
    });
  }

  // Bind details modal close actions
  const closeOrderModalBtn = document.getElementById('btn-close-order-modal');
  const cancelOrderModalBtn = document.getElementById('btn-cancel-order-modal');
  if (closeOrderModalBtn) {
    closeOrderModalBtn.addEventListener('click', window.closeOrderDetailsModal);
  }
  if (cancelOrderModalBtn) {
    cancelOrderModalBtn.addEventListener('click', window.closeOrderDetailsModal);
  }
  if (orderDetailsModal) {
    orderDetailsModal.addEventListener('click', (e) => {
      if (e.target === orderDetailsModal) {
        window.closeOrderDetailsModal();
      }
    });
  }

  // ESC key listener to close details modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (orderDetailsModal && orderDetailsModal.classList.contains('open')) {
        window.closeOrderDetailsModal();
      }
    }
  });

  // Handle Save Status Updates click
  const saveOrderStatusBtn = document.getElementById('btn-save-order-status');
  if (saveOrderStatusBtn) {
    saveOrderStatusBtn.addEventListener('click', async () => {
      if (!currentDetailOrderId) return;

      const orderStatus = document.getElementById('detail-order-status').value;
      const paymentStatus = document.getElementById('detail-payment-status').value;

      const originalText = saveOrderStatusBtn.textContent;
      saveOrderStatusBtn.disabled = true;
      saveOrderStatusBtn.textContent = 'Saving...';

      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`http://localhost:5001/api/v1/admin/orders/${currentDetailOrderId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ orderStatus, paymentStatus })
        });

        const resData = await response.json();
        if (!response.ok) {
          throw new Error(resData.message || 'Failed to update order status.');
        }

        window.showToast('Order status updated successfully!', 'success');
        window.closeOrderDetailsModal();
        
        // Refresh appropriate view list
        await fetchOrders();
        
        // Refresh dashboard overview counters if they exist
        fetchDashboardStats();
      } catch (err) {
        console.error('Order status update failed:', err);
        window.showToast(err.message || 'Failed to update status.', 'error');
      } finally {
        saveOrderStatusBtn.disabled = false;
        saveOrderStatusBtn.textContent = originalText;
      }
    });
  }

  // --- Dynamic Recent Orders overview loader ---
  async function fetchRecentOrders() {
    const tbody = document.getElementById('recent-orders-table-body');
    if (!tbody) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5001/api/v1/admin/orders?page=1&limit=5', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Failed to fetch recent orders.');
      }

      const orders = resData.data.orders;
      
      // Update loadedOrders cache so modal details load correctly
      orders.forEach(o => {
        if (!loadedOrders.some(lo => lo._id === o._id)) {
          loadedOrders.push(o);
        }
      });

      tbody.innerHTML = '';
      orders.forEach(order => {
        let orderStatusClass = 'badge';
        if (order.orderStatus === 'placed') orderStatusClass += ' status-pending';
        else if (order.orderStatus === 'confirmed' || order.orderStatus === 'processing') orderStatusClass += ' status-pending';
        else if (order.orderStatus === 'shipped' || order.orderStatus === 'delivered') orderStatusClass += ' status-delivered';
        else if (order.orderStatus === 'cancelled') orderStatusClass += ' status-cancelled';

        const customerName = order.user ? order.user.name : 'Guest';
        const customerEmail = order.user ? order.user.email : '';
        
        const dateFormatted = new Date(order.createdAt).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });

        const priceFormatted = new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 2
        }).format(order.totalAmount);

        const row = document.createElement('tr');
        row.innerHTML = `
          <td class="font-mono font-bold">${order.orderId}</td>
          <td>
            <div class="customer-cell">
              <div class="customer-avatar">${customerName.substring(0, 2).toUpperCase()}</div>
              <div>
                <span class="customer-name">${customerName}</span>
                <span class="customer-email">${customerEmail}</span>
              </div>
            </div>
          </td>
          <td class="font-bold">${priceFormatted}</td>
          <td><span class="${orderStatusClass}">${order.orderStatus}</span></td>
          <td>${dateFormatted}</td>
          <td class="text-right">
            <button class="action-btn view-order-btn" aria-label="View Details" data-id="${order._id}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
          </td>
        `;
        tbody.appendChild(row);
      });
    } catch (err) {
      console.error('Error loading recent orders:', err);
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center" style="color: var(--danger); font-weight: 500; padding: 24px;">
            Failed to load recent orders.
          </td>
        </tr>
      `;
    }
  }

  // Bind Actions on Recent Orders Table click
  const recentOrdersTbody = document.getElementById('recent-orders-table-body');
  if (recentOrdersTbody) {
    recentOrdersTbody.addEventListener('click', (e) => {
      const detailBtn = e.target.closest('.view-order-btn');
      if (detailBtn) {
        const orderId = detailBtn.getAttribute('data-id');
        window.openOrderDetailsModal(orderId);
      }
    });
  }

  // Bind "View All Orders" Overview button
  const viewAllOrdersBtn = document.getElementById('view-all-orders-btn');
  if (viewAllOrdersBtn) {
    viewAllOrdersBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const ordersMenuEl = document.querySelector('.sidebar-menu .menu-item[data-view="orders"]');
      if (ordersMenuEl) {
        ordersMenuEl.click();
      }
    });
  }

});

