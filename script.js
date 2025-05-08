// Utility Functions
function $(selector) {
    return document.querySelector(selector);
}

function $$ (selector) {
    return document.querySelectorAll(selector);
}

function addEvent(element, event, callback) {
    element.addEventListener(event, callback);
}

function toggleClass(element, className) {
    element.classList.toggle(className);
}

function show(element) {
    element.style.display = 'block';
}

function hide(element) {
    element.style.display = 'none';
}

function ajax(url, method = 'GET', data = null, successCallback, errorCallback) {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    xhr.onload = function () {
        if (xhr.status === 200) {
            successCallback(JSON.parse(xhr.responseText));
        } else {
            errorCallback(xhr.status);
        }
    };

    xhr.onerror = function () {
        errorCallback(xhr.status);
    };

    if (data) {
        xhr.send(JSON.stringify(data));
    } else {
        xhr.send();
    }
}

// Form Validation
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validateForm(form) {
    const formData = new FormData(form);
    let isValid = true;
    formData.forEach((value, key) => {
        const field = $(`#${key}`);
        if (value.trim() === "") {
            field.classList.add('error');
            isValid = false;
        } else {
            field.classList.remove('error');
        }
    });
    return isValid;
}

// Input Handler for Forms
addEvent($('#myForm'), 'submit', function (event) {
    event.preventDefault();
    const form = this;
    if (validateForm(form)) {
        ajax('/submit', 'POST', new FormData(form), function (response) {
            alert('Form submitted successfully!');
        }, function (error) {
            alert('Submission failed!');
        });
    }
});

// Event Listeners
addEvent($('#myButton'), 'click', function () {
    alert('Button Clicked!');
});

addEvent(window, 'resize', function () {
    if (window.innerWidth < 600) {
        $('#menu').classList.add('mobile');
    } else {
        $('#menu').classList.remove('mobile');
    }
});

// Modal Functionality
function openModal(modalId) {
    const modal = $(`#${modalId}`);
    show(modal);
}

function closeModal(modalId) {
    const modal = $(`#${modalId}`);
    hide(modal);
}

addEvent($('#openModalBtn'), 'click', function () {
    openModal('myModal');
});

addEvent($('#closeModalBtn'), 'click', function () {
    closeModal('myModal');
});

// Smooth Scroll
function smoothScroll(target) {
    document.querySelector(target).scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

addEvent($('#scrollToTopBtn'), 'click', function () {
    smoothScroll('#top');
});

// Fetch Example
function fetchUserData(userId) {
    ajax(`/api/users/${userId}`, 'GET', null, function (data) {
        $('#userProfile').innerHTML = `
            <h1>${data.name}</h1>
            <p>Email: ${data.email}</p>
            <p>Location: ${data.location}</p>
        `;
    }, function (error) {
        alert('Error fetching user data!');
    });
}

addEvent($('#loadUserDataBtn'), 'click', function () {
    const userId = $('#userIdInput').value;
    fetchUserData(userId);
});

// Animation Helper
function fadeIn(element, duration = 500) {
    element.style.opacity = 0;
    element.style.display = 'block';

    let last = +new Date();
    const tick = function () {
        element.style.opacity = +element.style.opacity + (new Date() - last) / duration;
        last = +new Date();

        if (+element.style.opacity < 1) {
            (window.requestAnimationFrame || window.setTimeout)(tick, 16);
        }
    };
    tick();
}

function fadeOut(element, duration = 500) {
    element.style.opacity = 1;

    let last = +new Date();
    const tick = function () {
        element.style.opacity = +element.style.opacity - (new Date() - last) / duration;
        last = +new Date();

        if (+element.style.opacity > 0) {
            (window.requestAnimationFrame || window.setTimeout)(tick, 16);
        } else {
            element.style.display = 'none';
        }
    };
    tick();
}

// Scroll to Top Button
window.addEventListener('scroll', function () {
    const scrollTopBtn = $('#scrollToTopBtn');
    if (window.scrollY > 300) {
        show(scrollTopBtn);
    } else {
        hide(scrollTopBtn);
    }
});

// Accessibility
function toggleAccessibilityMode() {
    document.body.classList.toggle('high-contrast');
}

addEvent($('#toggleAccessibilityBtn'), 'click', function () {
    toggleAccessibilityMode();
});

// Lazy Loading Images
function lazyLoadImages() {
    const images = $$('img[data-src]');
    images.forEach(image => {
        if (isInViewport(image)) {
            image.src = image.getAttribute('data-src');
            image.removeAttribute('data-src');
        }
    });
}

function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth);
}

window.addEventListener('scroll', lazyLoadImages);
window.addEventListener('resize', lazyLoadImages);

// Slider/Carousel
let currentSlide = 0;
const slides = $$(' .slide');
const totalSlides = slides.length;

function showSlide(index) {
    if (index >= totalSlides) currentSlide = 0;
    else if (index < 0) currentSlide = totalSlides - 1;
    else currentSlide = index;

    slides.forEach((slide, i) => {
        slide.style.display = (i === currentSlide) ? 'block' : 'none';
    });
}

addEvent($('#nextSlideBtn'), 'click', function () {
    showSlide(currentSlide + 1);
});

addEvent($('#prevSlideBtn'), 'click', function () {
    showSlide(currentSlide - 1);
});

// Notification System
function createNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.classList.add('notification', type);
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

createNotification('Welcome to our website!', 'success');

// Keyboard Shortcuts
document.addEventListener('keydown', function (event) {
    if (event.ctrlKey && event.key === 'n') {
        createNotification('New notification created via shortcut!', 'info');
    }
});

// Theme Switcher
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
}

addEvent($('#themeSwitcherBtn'), 'click', function () {
    toggleTheme();
});

// Input Masking
function applyInputMask(input, mask) {
    const formattedValue = mask.replace(/#/g, '_');
    input.addEventListener('input', function () {
        let value = this.value.replace(/[^0-9]/g, '');
        let maskedValue = '';
        let j = 0;
        for (let i = 0; i < mask.length && j < value.length; i++) {
            if (mask[i] === '#') {
                maskedValue += value[j];
                j++;
            } else {
                maskedValue += mask[i];
            }
        }
        this.value = maskedValue;
    });
}

applyInputMask($('#phoneNumber'), '(###) ###-####');
// Show or hide scroll-to-top button
function toggleScrollToTopButton() {
    const scrollTopBtn = document.getElementById('scrollToTopBtn');
    if (window.scrollY > 200) {
        scrollTopBtn.style.display = 'block';
    } else {
        scrollTopBtn.style.display = 'none';
    }
}

window.addEventListener('scroll', toggleScrollToTopButton);

document.getElementById('scrollToTopBtn').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
// Validate email input
function validateEmailInput() {
    const emailField = document.getElementById('email');
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(emailField.value)) {
        emailField.setCustomValidity('Please enter a valid email address.');
    } else {
        emailField.setCustomValidity('');
    }
}

document.getElementById('email').addEventListener('input', validateEmailInput);

// Validate password input
function validatePasswordInput() {
    const passwordField = document.getElementById('password');
    if (passwordField.value.length < 6) {
        passwordField.setCustomValidity('Password must be at least 6 characters long.');
    } else {
        passwordField.setCustomValidity('');
    }
}

document.getElementById('password').addEventListener('input', validatePasswordInput);
// Handle form submission with AJAX
document.getElementById('myForm').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent default form submission

    const formData = new FormData(this);

    fetch('/submitForm', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        alert('Form submitted successfully');
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Form submission failed');
    });
});
// Debounce function to limit the number of times a function is called
function debounce(func, delay) {
    let timeout;
    return function() {
        clearTimeout(timeout);
        timeout = setTimeout(func, delay);
    };
}

// Live search with debounce
document.getElementById('searchInput').addEventListener('input', debounce(function() {
    const query = this.value;
    console.log('Searching for:', query);
}, 500));
// Lazy load images
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(image => {
        if (isInViewport(image)) {
            image.src = image.getAttribute('data-src');
            image.removeAttribute('data-src');
        }
    });
}

function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth);
}

window.addEventListener('scroll', lazyLoadImages);
window.addEventListener('resize', lazyLoadImages);
// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});
// Toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
// Cookie consent notification
function showCookieConsent() {
    const consentBox = document.createElement('div');
    consentBox.innerHTML = `
        <div class="cookie-consent">
            <p>This website uses cookies to ensure you get the best experience.</p>
            <button id="acceptCookies">Accept</button>
        </div>
    `;
    document.body.appendChild(consentBox);

    document.getElementById('acceptCookies').addEventListener('click', () => {
        consentBox.style.display = 'none';
        localStorage.setItem('cookiesAccepted', 'true');
    });

    if (localStorage.getItem('cookiesAccepted') === 'true') {
        consentBox.style.display = 'none';
    }
}

window.addEventListener('load', showCookieConsent);
// Toggle password visibility
function togglePasswordVisibility() {
    const passwordField = document.getElementById('password');
    const toggleBtn = document.getElementById('togglePasswordBtn');

    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        toggleBtn.textContent = 'Hide Password';
    } else {
        passwordField.type = 'password';
        toggleBtn.textContent = 'Show Password';
    }
}

document.getElementById('togglePasswordBtn').addEventListener('click', togglePasswordVisibility);
// Countdown timer (example: countdown to new year)
function startCountdown(targetDate) {
    const countdownElement = document.getElementById('countdown');
    
    setInterval(() => {
        const now = new Date();
        const timeRemaining = targetDate - now;
        
        if (timeRemaining <= 0) {
            countdownElement.innerHTML = 'Countdown Over';
            return;
        }

        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

        countdownElement.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }, 1000);
}

startCountdown(new Date('Jan 1, 2026 00:00:00').getTime());
// Prevent form resubmission on refresh
if (window.performance) {
    if (performance.navigation.type == 1) {
        alert("Form resubmission prevented");
    }
}
// Scroll reveal animation
function revealOnScroll() {
    const elements = document.querySelectorAll('.reveal');
    elements.forEach(element => {
        if (isInViewport(element)) {
            element.classList.add('visible');
        }
    });
}

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('resize', revealOnScroll);
// Intersection Observer for performance optimization
const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.observer-element').forEach(element => {
    observer.observe(element);
});
