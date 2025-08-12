// DOM Elements
const cartBtn = document.querySelector('.cart-btn');
const cartCount = document.querySelector('.cart-count');
const wishlistBtns = document.querySelectorAll('.wishlist-btn-product');
const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
const searchInput = document.querySelector('.search-input');
const searchBtn = document.querySelector('.search-btn');
const subscribeForm = document.querySelector('.subscribe-form');
const emailInput = document.querySelector('.email-input');
const subscribeBtn = document.querySelector('.subscribe-btn');

// Cart and Wishlist State
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    updateWishlistButtons();
    initializeAnimations();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    // Cart button click
    cartBtn.addEventListener('click', showCart);
    
    // Wishlist buttons
    wishlistBtns.forEach(btn => {
        btn.addEventListener('click', toggleWishlist);
    });
    
    // Add to cart buttons
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', addToCart);
    });
    
    // Search functionality
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Subscribe form
    subscribeForm.addEventListener('submit', handleSubscribe);
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Cart Functions
function addToCart(event) {
    const productCard = event.target.closest('.product-card');
    const productName = productCard.querySelector('h3').textContent;
    const productPrice = productCard.querySelector('.current-price').textContent;
    const productImage = productCard.querySelector('.product-image img').src;
    
    const existingItem = cart.find(item => item.name === productName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: 1
        });
    }
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // Show success message
    showNotification(`${productName} added to cart!`, 'success');
    
    // Add loading state
    const btn = event.target;
    btn.textContent = 'Added!';
    btn.style.background = '#28a745';
    
    setTimeout(() => {
        btn.textContent = 'Add To Cart';
        btn.style.background = '#000';
    }, 2000);
}

function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
}

function showCart() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'info');
        return;
    }
    
    // Create cart modal
    const modal = document.createElement('div');
    modal.className = 'cart-modal';
    modal.innerHTML = `
        <div class="cart-modal-content">
            <div class="cart-modal-header">
                <h3>Shopping Cart (${cart.reduce((total, item) => total + item.quantity, 0)} items)</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="cart-items">
                ${cart.map(item => `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="cart-item-details">
                            <h4>${item.name}</h4>
                            <p>${item.price} x ${item.quantity}</p>
                        </div>
                        <button class="remove-item" data-name="${item.name}">&times;</button>
                    </div>
                `).join('')}
            </div>
            <div class="cart-total">
                <strong>Total: $${calculateTotal()}</strong>
            </div>
            <div class="cart-actions">
                <button class="clear-cart">Clear Cart</button>
                <button class="checkout-btn">Checkout</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners to modal
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.querySelector('.clear-cart').addEventListener('click', clearCart);
    
    modal.querySelector('.checkout-btn').addEventListener('click', () => {
        showNotification('Checkout functionality coming soon!', 'info');
    });
    
    // Remove item functionality
    modal.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemName = this.dataset.name;
            removeFromCart(itemName);
            modal.remove();
            showCart();
        });
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function removeFromCart(itemName) {
    cart = cart.filter(item => item.name !== itemName);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`${itemName} removed from cart!`, 'success');
}

function clearCart() {
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification('Cart cleared!', 'success');
    document.querySelector('.cart-modal').remove();
}

function calculateTotal() {
    return cart.reduce((total, item) => {
        const price = parseFloat(item.price.replace('$', ''));
        return total + (price * item.quantity);
    }, 0).toFixed(2);
}

// Wishlist Functions
function toggleWishlist(event) {
    const productCard = event.target.closest('.product-card');
    const productName = productCard.querySelector('h3').textContent;
    const productPrice = productCard.querySelector('.current-price').textContent;
    const productImage = productCard.querySelector('.product-image img').src;
    
    const existingItem = wishlist.find(item => item.name === productName);
    
    if (existingItem) {
        // Remove from wishlist
        wishlist = wishlist.filter(item => item.name !== productName);
        event.target.style.color = '#333';
        showNotification(`${productName} removed from wishlist!`, 'info');
    } else {
        // Add to wishlist
        wishlist.push({
            name: productName,
            price: productPrice,
            image: productImage
        });
        event.target.style.color = '#ff6b6b';
        showNotification(`${productName} added to wishlist!`, 'success');
    }
    
    // Save to localStorage
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

function updateWishlistButtons() {
    wishlistBtns.forEach(btn => {
        const productCard = btn.closest('.product-card');
        const productName = productCard.querySelector('h3').textContent;
        const isInWishlist = wishlist.some(item => item.name === productName);
        
        if (isInWishlist) {
            btn.style.color = '#ff6b6b';
        }
    });
}

// Search Functionality
function performSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (searchTerm === '') {
        showNotification('Please enter a search term!', 'warning');
        return;
    }
    
    const productCards = document.querySelectorAll('.product-card');
    let foundProducts = 0;
    
    productCards.forEach(card => {
        const productName = card.querySelector('h3').textContent.toLowerCase();
        const productCategory = card.querySelector('h3').textContent.toLowerCase();
        
        if (productName.includes(searchTerm) || productCategory.includes(searchTerm)) {
            card.style.display = 'block';
            card.style.animation = 'fadeInUp 0.6s ease-out';
            foundProducts++;
        } else {
            card.style.display = 'none';
        }
    });
    
    if (foundProducts === 0) {
        showNotification('No products found matching your search!', 'info');
    } else {
        showNotification(`Found ${foundProducts} product(s)!`, 'success');
    }
}

// Subscribe Functionality
function handleSubscribe(event) {
    event.preventDefault();
    
    const email = emailInput.value.trim();
    
    if (!email || !isValidEmail(email)) {
        showNotification('Please enter a valid email address!', 'warning');
        return;
    }
    
    // Simulate subscription
    subscribeBtn.textContent = 'Subscribing...';
    subscribeBtn.disabled = true;
    
    setTimeout(() => {
        showNotification('Thank you for subscribing! Check your email for the 10% off voucher.', 'success');
        emailInput.value = '';
        subscribeBtn.textContent = 'Subscribe';
        subscribeBtn.disabled = false;
    }, 2000);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    // Set background color based on type
    const colors = {
        success: '#28a745',
        warning: '#ffc107',
        error: '#dc3545',
        info: '#17a2b8'
    };
    
    notification.style.background = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
}

// Animation Functions
function initializeAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.product-card, .category-card, .feature-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Add CSS for cart modal and notifications
function addModalStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .cart-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        }
        
        .cart-modal-content {
            background: white;
            border-radius: 12px;
            padding: 30px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        }
        
        .cart-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid #eee;
        }
        
        .close-modal {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #666;
        }
        
        .cart-items {
            margin-bottom: 20px;
        }
        
        .cart-item {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px 0;
            border-bottom: 1px solid #f5f5f5;
        }
        
        .cart-item img {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 8px;
        }
        
        .cart-item-details h4 {
            margin: 0 0 5px 0;
            font-size: 16px;
        }
        
        .cart-item-details p {
            margin: 0;
            color: #666;
        }
        
        .remove-item {
            background: #ff6b6b;
            color: white;
            border: none;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
            margin-left: auto;
        }
        
        .cart-total {
            text-align: right;
            font-size: 18px;
            margin-bottom: 20px;
            padding-top: 15px;
            border-top: 1px solid #eee;
        }
        
        .cart-actions {
            display: flex;
            gap: 15px;
        }
        
        .clear-cart, .checkout-btn {
            flex: 1;
            padding: 12px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .clear-cart {
            background: #6c757d;
            color: white;
        }
        
        .checkout-btn {
            background: #28a745;
            color: white;
        }
        
        .clear-cart:hover {
            background: #5a6268;
        }
        
        .checkout-btn:hover {
            background: #218838;
        }
        
        @media (max-width: 768px) {
            .cart-modal-content {
                width: 95%;
                padding: 20px;
            }
            
            .cart-actions {
                flex-direction: column;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Initialize modal styles
addModalStyles();

// Add loading states and performance optimizations
window.addEventListener('load', function() {
    // Remove loading states
    document.body.classList.remove('loading');
    
    // Lazy load images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
});

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
    // ESC key to close modals
    if (e.key === 'Escape') {
        const modal = document.querySelector('.cart-modal');
        if (modal) {
            modal.remove();
        }
    }
    
    // Enter key on search input
    if (e.key === 'Enter' && document.activeElement === searchInput) {
        performSearch();
    }
});

// Add touch support for mobile
if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
}

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', function() {
        setTimeout(function() {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
        }, 0);
    });
}

// Product Navigation Function
function navigateToProductDetails(productName, productImage, currentPrice, originalPrice, discount, category) {
    // Store product details in localStorage for the product details page
    const productDetails = {
        name: productName,
        image: productImage,
        currentPrice: currentPrice,
        originalPrice: originalPrice,
        discount: discount,
        category: category
    };
    
    localStorage.setItem('selectedProduct', JSON.stringify(productDetails));
    
    // Navigate to product details page
    window.location.href = 'product-details.html';
}
