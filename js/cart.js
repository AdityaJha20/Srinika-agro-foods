// Persistent LocalStorage Shopping Cart Logic for Mamafarm

let cart = [];

// Initialize Cart from LocalStorage
function initCart() {
  const storedCart = localStorage.getItem('mamafarm_cart');
  if (storedCart) {
    try {
      cart = JSON.parse(storedCart);
      
      // Legacy cart migration
      let migrated = false;
      cart = cart.map(item => {
        if (!item._id || !item.sku) {
          const legacyId = item.id || item.sku || item._id;
          const product = typeof getProductById === 'function' ? getProductById(legacyId) : null;
          migrated = true;
          return {
            _id: item._id || (product ? (product._id || product.id) : legacyId),
            sku: item.sku || (product ? (product.sku || product.id) : legacyId),
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            weight: item.weight
          };
        }
        return item;
      });
      if (migrated) {
        localStorage.setItem('mamafarm_cart', JSON.stringify(cart));
      }
    } catch (e) {
      cart = [];
    }
  }
  updateCartUI();
}

// Migrate local fallback IDs to real MongoDB ObjectIds once loaded from API
function migrateCartWithLoadedProducts() {
  if (typeof window !== 'undefined' && window.products && cart && cart.length > 0) {
    let changed = false;
    cart = cart.map(item => {
      const loadedProduct = window.products.find(p => p.sku === item.sku || p.sku === item._id || p._id === item._id);
      if (loadedProduct) {
        if (item._id !== loadedProduct._id || item.sku !== loadedProduct.sku) {
          changed = true;
          return {
            ...item,
            _id: loadedProduct._id,
            sku: loadedProduct.sku
          };
        }
      }
      return item;
    });
    if (changed) {
      saveCart();
    }
  }
}
window.migrateCartWithLoadedProducts = migrateCartWithLoadedProducts;

// Save Cart to LocalStorage
function saveCart() {
  localStorage.setItem('mamafarm_cart', JSON.stringify(cart));
  updateCartUI();
}

// Get Cart Items
function getCart() {
  return cart;
}

// Add Item to Cart
function addToCart(productId, quantity = 1, weight = null) {
  // Try to find the product in the database
  const product = typeof getProductById === 'function' ? getProductById(productId) : null;
  if (!product) return;

  const existingItemIndex = cart.findIndex(item => item._id === productId);

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += quantity;
  } else {
    cart.push({
      _id: product._id || product.id,
      sku: product.sku || product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.image,
      weight: weight || product.weight
    });
  }

  saveCart();
  showCartDrawer(); // Automatically open cart drawer to show updated state
}

// Remove Item from Cart
function removeFromCart(productId) {
  cart = cart.filter(item => item._id !== productId);
  saveCart();
}

// Update Item Quantity
function updateQuantity(productId, quantity) {
  const itemIndex = cart.findIndex(item => item._id === productId);
  if (itemIndex > -1) {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      cart[itemIndex].quantity = quantity;
      saveCart();
    }
  }
}

// Clear Cart
function clearCart() {
  cart = [];
  saveCart();
}

// Get Total Price
function getCartTotal() {
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Get Total Items Count
function getCartCount() {
  return cart.reduce((count, item) => count + item.quantity, 0);
}

// Show/Hide Cart Drawer
function showCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (drawer && overlay) {
    drawer.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent body scroll
  }
}

function hideCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (drawer && overlay) {
    drawer.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = ''; // Re-enable body scroll
  }
}

// Update all UI components linked to Cart
function updateCartUI() {
  // 1. Update Cart Badge Count
  const badges = document.querySelectorAll('.cart-count-badge');
  const count = getCartCount();
  badges.forEach(badge => {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  });

  // 2. Update Header Cart Total Price
  const totalElements = document.querySelectorAll('.header-cart-total');
  const total = getCartTotal();
  totalElements.forEach(el => {
    el.textContent = `₹${total}`;
  });

  // 3. Render Cart Drawer Items
  const cartItemsList = document.getElementById('cart-drawer-items');
  if (cartItemsList) {
    if (cart.length === 0) {
      cartItemsList.innerHTML = `
        <div class="empty-cart-message">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          <p>Your cart is empty</p>
          <a href="shop.html" class="btn btn-primary" onclick="hideCartDrawer()">Shop Our Products</a>
        </div>
      `;
    } else {
      cartItemsList.innerHTML = cart.map(item => `
        <div class="cart-drawer-item" data-id="${item._id}">
          <img src="${item.image}" alt="${item.name}" class="cart-item-image">
          <div class="cart-item-details">
            <h4 class="cart-item-name"><a href="product.html?id=${item._id}">${item.name}</a></h4>
            <span class="cart-item-weight">${item.weight}</span>
            <div class="cart-item-price-qty">
              <span class="cart-item-price">₹${item.price}</span>
              <div class="qty-selector">
                <button class="qty-btn minus" onclick="updateQuantity('${item._id}', ${item.quantity - 1})">-</button>
                <span class="qty-val">${item.quantity}</span>
                <button class="qty-btn plus" onclick="updateQuantity('${item._id}', ${item.quantity + 1})">+</button>
              </div>
            </div>
          </div>
          <button class="cart-item-remove" onclick="removeFromCart('${item._id}')">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      `).join('');
    }
  }

  // 4. Update Free Shipping Progress Bar (Target: ₹499)
  const shippingProgress = document.getElementById('shipping-progress');
  const shippingText = document.getElementById('shipping-progress-text');
  const target = 499;
  if (shippingProgress && shippingText) {
    if (total === 0) {
      shippingProgress.style.width = '0%';
      shippingText.textContent = `Add items to get Free Shipping above ₹${target}!`;
    } else if (total >= target) {
      shippingProgress.style.width = '100%';
      shippingText.innerHTML = `🎉 Congratulations! You unlocked <strong>Free Shipping</strong>!`;
    } else {
      const percentage = (total / target) * 100;
      shippingProgress.style.width = `${percentage}%`;
      shippingText.innerHTML = `Add <strong>₹${target - total}</strong> more for <strong>Free Shipping</strong>`;
    }
  }

  // 5. Update Checkout Button & Summary
  const checkoutSubtotal = document.getElementById('cart-checkout-subtotal');
  if (checkoutSubtotal) {
    checkoutSubtotal.textContent = `₹${total}`;
  }

  const checkoutBtn = document.getElementById('cart-checkout-btn');
  if (checkoutBtn) {
    if (total === 0) {
      checkoutBtn.disabled = true;
    } else {
      checkoutBtn.disabled = false;
    }
  }
}

// Checkout Process Simulation
function checkout() {
  if (cart.length === 0) return;
  
  // Show standard billing and payment modal (or direct order simulation)
  const paymentOverlay = document.createElement('div');
  paymentOverlay.className = 'modal-overlay active';
  paymentOverlay.id = 'checkout-modal-overlay';
  
  paymentOverlay.innerHTML = `
    <div class="checkout-modal">
      <div class="modal-header">
        <h3>Secure Checkout</h3>
        <button class="modal-close" onclick="closeCheckoutModal()">&times;</button>
      </div>
      <div class="modal-body">
        <form id="checkout-form" onsubmit="submitOrder(event)">
          <div class="form-group">
            <label for="checkout-name">Full Name *</label>
            <input type="text" id="checkout-name" required placeholder="e.g. Rahul Sharma">
          </div>
          <div class="form-group">
            <label for="checkout-phone">Phone Number *</label>
            <input type="tel" id="checkout-phone" pattern="[0-9]{10}" required placeholder="10-digit mobile number">
          </div>
          <div class="form-group">
            <label for="checkout-address">Delivery Address *</label>
            <textarea id="checkout-address" rows="3" required placeholder="House No, Street, Landmark, Area"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="checkout-city">City *</label>
              <input type="text" id="checkout-city" required placeholder="e.g. Kolkata">
            </div>
            <div class="form-group">
              <label for="checkout-pincode">Pincode *</label>
              <input type="text" id="checkout-pincode" pattern="[0-9]{6}" required placeholder="6-digit ZIP code">
            </div>
          </div>
          <div class="payment-methods">
            <h4>Select Payment Method</h4>
            <label class="payment-method-option">
              <input type="radio" name="payment-method" value="prepaid" checked>
              <span class="payment-design"></span>
              <span class="payment-label">Prepaid Card / UPI / Netbanking (Free Shipping)</span>
            </label>
            <label class="payment-method-option">
              <input type="radio" name="payment-method" value="cod">
              <span class="payment-design"></span>
              <span class="payment-label">Cash on Delivery (+₹30 COD Fee)</span>
            </label>
          </div>
          
          <div class="order-summary-box">
            <div class="summary-row">
              <span>Items Total:</span>
              <span>₹${getCartTotal()}</span>
            </div>
            <div class="summary-row" id="checkout-shipping-row">
              <span>Shipping:</span>
              <span>${getCartTotal() >= 499 ? 'FREE' : '₹50'}</span>
            </div>
            <div class="summary-row" id="checkout-cod-row" style="display:none;">
              <span>COD Handling Fee:</span>
              <span>₹30</span>
            </div>
            <hr>
            <div class="summary-row grand-total">
              <span>Total Payable:</span>
              <span id="checkout-grand-total">₹${getCartTotal() >= 499 ? getCartTotal() : getCartTotal() + 50}</span>
            </div>
          </div>
          
          <button type="submit" class="btn btn-primary btn-block">Place Order</button>
        </form>
      </div>
    </div>
  `;
  
  document.body.appendChild(paymentOverlay);
  document.body.style.overflow = 'hidden';

  // Add event listener to update shipping/COD fees on payment choice change
  const paymentRadios = paymentOverlay.querySelectorAll('input[name="payment-method"]');
  paymentRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const itemsTotal = getCartTotal();
      const isCod = e.target.value === 'cod';
      const isFreeShipping = itemsTotal >= 499;
      
      let shippingFee = isFreeShipping ? 0 : 50;
      let codFee = isCod ? 30 : 0;
      let grandTotal = itemsTotal + shippingFee + codFee;

      const shippingRow = document.getElementById('checkout-shipping-row');
      const codRow = document.getElementById('checkout-cod-row');
      const grandTotalEl = document.getElementById('checkout-grand-total');

      if (shippingRow) shippingRow.children[1].textContent = shippingFee === 0 ? 'FREE' : `₹${shippingFee}`;
      if (codRow) {
        codRow.style.display = isCod ? 'flex' : 'none';
        codRow.children[1].textContent = `₹${codFee}`;
      }
      if (grandTotalEl) grandTotalEl.textContent = `₹${grandTotal}`;
    });
  });
}

function closeCheckoutModal() {
  const overlay = document.getElementById('checkout-modal-overlay');
  if (overlay) {
    overlay.remove();
  }
  if (!document.getElementById('cart-drawer').classList.contains('active')) {
    document.body.style.overflow = '';
  }
}

async function submitOrder(event) {
  event.preventDefault();
  const name = document.getElementById('checkout-name').value;
  const phone = document.getElementById('checkout-phone').value;
  const address = document.getElementById('checkout-address').value;
  const city = document.getElementById('checkout-city').value;
  const pincode = document.getElementById('checkout-pincode').value;
  const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
  
  const itemsTotal = getCartTotal();
  const shippingFee = (itemsTotal >= 499) ? 0 : 50;
  const codFee = (paymentMethod === 'cod') ? 30 : 0;
  const grandTotal = itemsTotal + shippingFee + codFee;

  // Update checkout payload generation to send:
  // { product: item._id, name, sku, price, quantity }
  const payload = {
    items: cart.map(item => ({
      product: item._id,
      name: item.name,
      sku: item.sku,
      price: item.price,
      quantity: item.quantity
    })),
    shippingAddress: {
      fullName: name,
      addressLine1: address,
      addressLine2: '',
      city: city,
      state: city, // fallback as state is not present in form
      pincode: pincode,
      country: 'India'
    },
    phone: phone,
    paymentMethod: paymentMethod === 'cod' ? 'cod' : 'upi',
    totalAmount: grandTotal,
    notes: ''
  };

  let orderId = `MF-${Math.floor(100000 + Math.random() * 900000)}`;
  const token = localStorage.getItem('accessToken');

  if (token) {
    try {
      const response = await fetch('http://localhost:5001/api/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        const resData = await response.json();
        if (resData.data && resData.data.order && resData.data.order.orderId) {
          orderId = resData.data.order.orderId;
        }
      } else {
        const errData = await response.json();
        console.warn('Backend order placement failed:', errData.message);
      }
    } catch (err) {
      console.error('Failed to connect to backend for order placement, simulating instead:', err);
    }
  }

  // Simulate order receipt (or display real order ID if saved)
  closeCheckoutModal();
  hideCartDrawer();
  
  const successOverlay = document.createElement('div');
  successOverlay.className = 'modal-overlay active';
  successOverlay.id = 'success-modal-overlay';
  
  successOverlay.innerHTML = `
    <div class="checkout-modal success-modal text-center">
      <div class="success-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#6BC84B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
      </div>
      <h2>Order Placed Successfully!</h2>
      <p class="order-id-label">Your Order ID is: <strong>${orderId}</strong></p>
      <p class="order-desc">Thank you, <strong>${name}</strong>, for shopping with Mamafarm. We have sent a confirmation message to your mobile number: <strong>${phone}</strong>.</p>
      
      <div class="delivery-details-summary">
        <p><strong>Deliver To:</strong> ${address}, ${city} - ${pincode}</p>
        <p><strong>Total Amount:</strong> ₹${grandTotal} (${paymentMethod === 'cod' ? 'Cash on Delivery' : 'Prepaid Online'})</p>
      </div>
      
      <button class="btn btn-primary" onclick="closeSuccessModal()">Continue Shopping</button>
    </div>
  `;
  
  document.body.appendChild(successOverlay);
  document.body.style.overflow = 'hidden';
  
  // Clear the shopping cart
  clearCart();
}

function closeSuccessModal() {
  const overlay = document.getElementById('success-modal-overlay');
  if (overlay) {
    overlay.remove();
  }
  document.body.style.overflow = '';
}

// Load cart on page load
document.addEventListener('DOMContentLoaded', () => {
  initCart();

  // Attach cart overlay close event
  const overlay = document.getElementById('cart-overlay');
  if (overlay) {
    overlay.addEventListener('click', hideCartDrawer);
  }
});
