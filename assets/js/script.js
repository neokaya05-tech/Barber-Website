'use strict'

/**
 * Add event listener to one element or a NodeList of elements
 */
const addEventOnElem = function (elem, type, callback) {
    if (elem.length > 1) {
        for (let i = 0; i < elem.length; i++) {
            elem[i].addEventListener(type, callback);
        }
    } else {
        elem.addEventListener(type, callback);
    }
}

// ==========================================
// 🔼 NAVBAR TOGGLE
// ==========================================
const navbar = document.querySelector("[data-navbar]");
const navToggler = document.querySelector("[data-nav-toggler]");
const navLinks = document.querySelectorAll("[data-nav-link]");

if (navbar && navToggler) {
    const toggleNavbar = () => navbar.classList.toggle("active");
    navToggler.addEventListener("click", toggleNavbar);
}

if (navLinks.length > 0) {
    const closeNavbar = () => navbar && navbar.classList.remove("active");
    addEventOnElem(navLinks, "click", closeNavbar);
}

// ==========================================
// 🔼 HEADER & BACK-TO-TOP ON SCROLL
// ==========================================
const header = document.querySelector("[data-header]");
const backTopBtn = document.querySelector("[data-back-top-btn]");

const headerActive = function () {
    if (window.scrollY > 100) {
        header && header.classList.add("active");
        backTopBtn && backTopBtn.classList.add("active");
    } else {
        header && header.classList.remove("active");
        backTopBtn && backTopBtn.classList.remove("active");
    }
}
window.addEventListener("scroll", headerActive);

// ==========================================
// 🔽 FILTER BUTTONS
// ==========================================
const filterBtns = document.querySelectorAll("[data-filter-btn]");
const filterItems = document.querySelectorAll("[data-filter]");

let lastClickedFilterBtn = filterBtns[0];

const filter = function () {
    if (lastClickedFilterBtn) {
        lastClickedFilterBtn.classList.remove("active");
    }
    this.classList.add("active");
    lastClickedFilterBtn = this;

    for (let i = 0; i < filterItems.length; i++) {
        if (this.dataset.filterBtn === filterItems[i].dataset.filter ||
            this.dataset.filterBtn === "all") {
            filterItems[i].style.display = "block";
            filterItems[i].classList.add("active");
        } else {
            filterItems[i].style.display = "none";
            filterItems[i].classList.remove("active");
        }
    }
}

if (filterBtns.length > 0) {
    addEventOnElem(filterBtns, "click", filter);
}

// ==========================================
// 📅 APPOINTMENT FORM SUBMISSION
// ==========================================
const appointmentForm = document.getElementById('appointment-form');

if (appointmentForm) {
    appointmentForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Stop the page from refreshing

        // Collect values from the form — matches appointmentSchema in server.js
        const data = {
            customerName: document.getElementById('customerName').value,
            phoneNumber: document.getElementById('phoneNumber').value,
            service: document.getElementById('service').value,
            date: document.getElementById('date').value,
            timeSlot: document.getElementById('timeSlot').value,
            message: document.getElementById('message').value
        };

        try {
            const response = await fetch('https://kasi-cuts-backend.onrender.com/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                showToast(result.message || "Failed to book appointment.", "error");
                return;
            }

            showToast("Awesome! Your appointment is booked.", "success");
            appointmentForm.reset();
        } catch (networkError) {
            console.error("Network error:", networkError);
            showToast("Server unreachable. Please try again!", "error");
        }
    });
}

// ==========================================
// 🔄 LOAD REVIEWS FROM DATABASE
// ==========================================
async function loadHomepageReviews() {
    const reviewContainer = document.querySelector('.testi-list');
    if (!reviewContainer) return;

    try {
        // ✅ Fetches from /api/reviews (not /api/appointments)
        const response = await fetch('http://localhost:5000/api/reviews');
        const reviews = await response.json();

        if (reviews.length > 0) {
            reviewContainer.innerHTML = reviews.map(rev => `
                <li class="testi-item" style="background-color: #1a1a1e; padding: 25px; border-radius: 8px; border: 1px solid #2d2d34;">
                    <div class="testi-card">
                        <div class="rating-wrapper" style="color: #c5a880; margin-bottom: 10px;">
                            ${'⭐'.repeat(rev.rating)}
                        </div>
                        <p class="testi-text" style="color: #fff; font-style: italic; margin-bottom: 15px;">
                            "${rev.reviewText}"
                        </p>
                        <p class="client-name" style="color: #c5a880; font-weight: bold; margin: 0;">- ${rev.customerName}</p>
                    </div>
                </li>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

window.addEventListener('DOMContentLoaded', loadHomepageReviews);

// ==========================================
// 📦 SERVICE MODAL
// ==========================================
const serviceButtons = document.querySelectorAll('[data-service-trigger]');
const modalElement   = document.getElementById('service-modal');
const modalCard      = document.getElementById('modal-card');
const closeModalBtn  = document.getElementById('close-modal');
const modalTitle     = document.getElementById('modal-title');
const modalDesc      = document.getElementById('modal-description');
const modalImg       = document.getElementById('modal-image');
const modalBookBtn   = document.getElementById('modal-book-btn');

let activeSelectedService = "";

if (serviceButtons.length > 0 && modalElement) {
    serviceButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();

            const name = btn.getAttribute('data-name');
            const desc = btn.getAttribute('data-desc');
            const img  = btn.getAttribute('data-img');

            activeSelectedService = name;

            if (modalTitle) modalTitle.innerText = name;
            if (modalDesc)  modalDesc.innerText  = desc;
            if (modalImg)   modalImg.style.backgroundImage = `url('${img}')`;

            modalElement.style.display = 'flex';
            setTimeout(() => {
                modalElement.style.opacity = '1';
                if (modalCard) modalCard.style.transform = 'scale(1)';
            }, 10);
        });
    });
}

function closeModal() {
    if (!modalElement) return;
    modalElement.style.opacity = '0';
    if (modalCard) modalCard.style.transform = 'scale(0.9)';
    setTimeout(() => {
        modalElement.style.display = 'none';
    }, 300);
}

if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
if (modalElement) {
    modalElement.addEventListener('click', (e) => {
        if (e.target === modalElement) closeModal();
    });
}

if (modalBookBtn) {
    modalBookBtn.addEventListener('click', () => {
        closeModal();

        const serviceSelectDropdown = document.getElementById('service');
        if (serviceSelectDropdown) {
            for (let option of serviceSelectDropdown.options) {
                if (activeSelectedService.toLowerCase().includes(option.value.toLowerCase()) ||
                    option.value.toLowerCase().includes(activeSelectedService.toLowerCase())) {
                    serviceSelectDropdown.value = option.value;
                    break;
                }
            }
        }

        const appointmentSection = document.getElementById('appointment');
        if (appointmentSection) {
            appointmentSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// ==========================================
// 🔒 SECRET ADMIN GATEWAY (keyboard cheat code)
// ==========================================
const secretCode = 'open';
let inputSequence = '';

document.addEventListener('keydown', (e) => {
    if (e.key.length === 1) {
        inputSequence += e.key.toLowerCase();
        if (inputSequence.length > secretCode.length) {
            inputSequence = inputSequence.slice(-secretCode.length);
        }
        if (inputSequence === secretCode) {
            window.location.href = "./8f7a9c4d.html";
        }
    }
});

// ==========================================
// 🍞 TOAST NOTIFICATIONS
// ==========================================
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `custom-toast toast-${type}`;

    const icon = type === 'success' ? '🏆' : '⚠️';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => toast.classList.add('toast-show'), 50);
    setTimeout(() => {
        toast.classList.remove('toast-show');
        setTimeout(() => toast.remove(), 400);
    }, 4500);
}

// 🟢 Modern replacement for the old browser input prompt
function showCustomPrompt(title, defaultValue, onConfirm) {
    // Remove any existing toast first
    const existing = document.getElementById('active-prompt');
    if (existing) existing.remove();

    // Ensure container exists
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    // Create prompt card elements
    const promptCard = document.createElement('div');
    promptCard.id = 'active-prompt';
    promptCard.className = 'custom-toast';
    
    promptCard.innerHTML = `
        <h4 style="margin: 0 0 5px 0; color: #cca43b;">${title}</h4>
        <input type="text" id="prompt-input" value="${defaultValue}">
        <div class="toast-buttons">
            <button class="toast-btn cancel" id="prompt-cancel">Cancel</button>
            <button class="toast-btn confirm" id="prompt-confirm">OK</button>
        </div>
    `;

    container.appendChild(promptCard);
    
    // Auto-focus input field
    const inputField = promptCard.querySelector('#prompt-input');
    inputField.focus();
    inputField.select();

    // Button event listeners
    promptCard.querySelector('#prompt-confirm').onclick = () => {
        const value = inputField.value;
        promptCard.remove();
        onConfirm(value); // Pass the text value back to your handler
    };

    promptCard.querySelector('#prompt-cancel').onclick = () => {
        promptCard.remove();
    };
}