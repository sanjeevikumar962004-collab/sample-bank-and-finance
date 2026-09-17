/**
 * te stackly - Banking and Financial Services
 * Global Form Validation & State Management Engine
 * Features:
 * 1. Real-time constraint validation (Live feedback on input & blur)
 * 2. Visual indicators (brand lime #d4ff33 success, #ef4444 danger)
 * 3. Dynamic password strength meter & constraints checker
 * 4. Password confirmation matcher
 * 5. Phone, Email, Currency, PIN constraint checkers
 * 6. 1-Click Demo Credentials Filler (User / Admin)
 * 7. Dynamic Toast Notification System
 * 8. LocalStorage profile persistence and dashboard sync
 */

(function () {
    'use strict';

    // Inject Custom Validation & Toast Styles Dynamically
    function injectStyles() {
        if (document.getElementById('stackly-validation-styles')) return;

        const style = document.createElement('style');
        style.id = 'stackly-validation-styles';
        style.textContent = `
            /* Live Input Field Styles */
            .input-valid {
                border-color: #22c55e !important;
                background-color: rgba(34, 197, 94, 0.04) !important;
                box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15) !important;
            }
            .input-invalid {
                border-color: #ef4444 !important;
                background-color: rgba(239, 68, 68, 0.04) !important;
                box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15) !important;
            }
            
            /* Error Messages */
            .field-error-msg {
                display: flex;
                align-items: center;
                gap: 5px;
                color: #ef4444;
                font-size: 0.8rem;
                font-weight: 500;
                margin-top: 5px;
                animation: slideDownFade 0.25s ease-out forwards;
            }

            @keyframes slideDownFade {
                from {
                    opacity: 0;
                    transform: translateY(-4px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* Toast Notification Container */
            #stackly-toast-container {
                position: fixed;
                bottom: 24px;
                right: 24px;
                z-index: 999999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 380px;
                width: calc(100% - 48px);
                pointer-events: none;
            }

            .stackly-toast {
                pointer-events: auto;
                background: #1a1a1a;
                color: #ffffff;
                padding: 16px 20px;
                border-radius: 14px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
                display: flex;
                align-items: center;
                gap: 14px;
                border-left: 5px solid #d4ff33;
                animation: toastIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                transition: all 0.3s ease;
            }

            .stackly-toast.toast-error {
                border-left-color: #ef4444;
            }

            .stackly-toast.toast-success {
                border-left-color: #d4ff33;
            }

            .stackly-toast.toast-info {
                border-left-color: #3b82f6;
            }

            .stackly-toast.hide {
                opacity: 0;
                transform: translateX(100%);
            }

            @keyframes toastIn {
                from {
                    opacity: 0;
                    transform: translateY(20px) scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Validation Rules & Patterns
    const Patterns = {
        email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        phone: /^(\+?1\s?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}$/,
        name: /^[a-zA-Z\s'.]{3,50}$/,
        pin: /^\d{4}$/,
        accountNumber: /^\d{8,16}$/,
        routingNumber: /^\d{9}$/
    };

    // Helper: Toast Notifications
    function showToast(message, type = 'success', duration = 4000) {
        let container = document.getElementById('stackly-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'stackly-toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `stackly-toast toast-${type}`;
        
        let icon = '<i class="fa-solid fa-circle-check text-brand text-xl"></i>';
        if (type === 'error') {
            icon = '<i class="fa-solid fa-circle-exclamation text-red-500 text-xl"></i>';
        } else if (type === 'info') {
            icon = '<i class="fa-solid fa-circle-info text-blue-400 text-xl"></i>';
        }

        toast.innerHTML = `
            <div>${icon}</div>
            <div class="flex-1 text-sm font-medium leading-snug">${message}</div>
            <button class="text-gray-400 hover:text-white text-sm" onclick="this.parentElement.remove()">&times;</button>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // Helper: Remove previous error messages
    function clearFieldError(input) {
        input.classList.remove('input-invalid');
        const parent = input.closest('.form-group, .relative, div') || input.parentElement;
        const existingError = parent.querySelector('.field-error-msg');
        if (existingError) {
            existingError.remove();
        }
    }

    // Helper: Show field error
    function showFieldError(input, message) {
        clearFieldError(input);
        input.classList.remove('input-valid');
        input.classList.add('input-invalid');

        const error = document.createElement('div');
        error.className = 'field-error-msg';
        error.innerHTML = `<i class="fa-solid fa-circle-exclamation text-xs"></i> <span>${message}</span>`;
        
        const parent = input.closest('.form-group, .relative, div') || input.parentElement;
        parent.appendChild(error);
    }

    // Helper: Mark field as valid
    function markFieldValid(input) {
        clearFieldError(input);
        input.classList.add('input-valid');
    }

    // Password Strength Evaluator
    function evaluatePasswordStrength(password) {
        let score = 0;
        if (!password) return { score: 0, text: 'Too Short', color: 'bg-gray-200' };

        if (password.length >= 8) score += 1;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
        if (/\d/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;

        switch (score) {
            case 1:
                return { score: 1, text: 'Weak', color: 'bg-red-500', width: '25%' };
            case 2:
                return { score: 2, text: 'Fair', color: 'bg-amber-500', width: '50%' };
            case 3:
                return { score: 3, text: 'Good', color: 'bg-blue-500', width: '75%' };
            case 4:
                return { score: 4, text: 'Strong & Secure', color: 'bg-brand', width: '100%' };
            default:
                return { score: 0, text: 'Too Short (Min 8 chars)', color: 'bg-gray-300', width: '10%' };
        }
    }

    // Live validation setup
    function setupFormValidation() {
        // Suppress browser default popup tooltips globally on all forms
        document.querySelectorAll('form').forEach(form => {
            form.setAttribute('novalidate', 'true');
        });

        const forms = document.querySelectorAll('form[data-validate], #loginForm, #signupForm, #transferForm, #profileSettingsForm, #loanAppForm, form');

        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, select, textarea');

            inputs.forEach(input => {
                if (input.type === 'hidden' || input.type === 'submit' || input.type === 'button') return;

                input.addEventListener('blur', () => {
                    validateSingleInput(input);
                });

                input.addEventListener('input', () => {
                    if (input.classList.contains('input-invalid')) {
                        validateSingleInput(input);
                    }
                    if (input.type === 'password' && input.id === 'signupPassword') {
                        updatePasswordMeter(input.value);
                    }
                });
            });

            form.addEventListener('submit', (e) => {
                e.preventDefault();
                let isValid = true;
                let firstInvalid = null;

                inputs.forEach(input => {
                    if (input.type === 'hidden' || input.type === 'submit' || input.type === 'button') return;
                    if (!validateSingleInput(input)) {
                        isValid = false;
                        if (!firstInvalid) firstInvalid = input;
                    }
                });

                if (!isValid) {
                    if (firstInvalid) firstInvalid.focus();
                    showToast('Please resolve the highlighted validation errors.', 'error');
                    return;
                }

                handleFormSuccess(form);
            });
        });
    }

    // Single Input Validation Logic
    function validateSingleInput(input) {
        const val = input.value.trim();
        const type = input.type;
        const isRequired = input.hasAttribute('required');

        if (isRequired && (!val || (type === 'checkbox' && !input.checked))) {
            showFieldError(input, 'This field is required');
            return false;
        }

        if (!val && !isRequired) {
            clearFieldError(input);
            return true;
        }

        // Email Validation
        if (type === 'email' || input.name === 'email') {
            if (!Patterns.email.test(val)) {
                showFieldError(input, 'Please enter a valid email address (e.g. name@domain.com)');
                return false;
            }
        }

        // Name Validation
        if (input.name === 'fullname' || input.id === 'fullname' || input.id === 'signupName') {
            if (val.length < 3) {
                showFieldError(input, 'Full name must be at least 3 characters');
                return false;
            }
            if (!Patterns.name.test(val)) {
                showFieldError(input, 'Please enter a valid full name (letters only)');
                return false;
            }
        }

        // Phone Validation
        if (type === 'tel' || input.name === 'phone' || input.id === 'phone') {
            const cleanDigits = val.replace(/\D/g, '');
            if (cleanDigits.length < 10) {
                showFieldError(input, 'Please enter a valid 10-digit phone number');
                return false;
            }
        }

        // Password Validation on Signup
        if (input.id === 'signupPassword') {
            if (val.length < 8) {
                showFieldError(input, 'Password must be at least 8 characters');
                return false;
            }
            const strength = evaluatePasswordStrength(val);
            if (strength.score < 2) {
                showFieldError(input, 'Password is too weak. Include upper, lower & numbers');
                return false;
            }
        }

        // Confirm Password Match
        if (input.id === 'confirmPassword') {
            const passInput = document.getElementById('signupPassword') || document.querySelector('input[name="password"]');
            if (passInput && val !== passInput.value.trim()) {
                showFieldError(input, 'Passwords do not match');
                return false;
            }
        }

        // Money Transfer Amount Validation
        if (input.id === 'transferAmount') {
            const amount = parseFloat(val);
            if (isNaN(amount) || amount <= 0) {
                showFieldError(input, 'Please enter a valid transfer amount greater than $0.00');
                return false;
            }
            if (amount > 50000) {
                showFieldError(input, 'Single transfer limit is $50,000.00');
                return false;
            }
        }

        // Security PIN Validation
        if (input.id === 'securityPin') {
            if (!Patterns.pin.test(val)) {
                showFieldError(input, 'Security PIN must be exactly 4 digits');
                return false;
            }
        }

        // Account Number Validation
        if (input.id === 'recipientAccount') {
            if (!Patterns.accountNumber.test(val)) {
                showFieldError(input, 'Account number must be between 8 and 16 digits');
                return false;
            }
        }

        markFieldValid(input);
        return true;
    }

    // Update dynamic password strength bar
    function updatePasswordMeter(password) {
        const bar = document.getElementById('password-strength-bar');
        const text = document.getElementById('password-strength-text');
        if (!bar || !text) return;

        const res = evaluatePasswordStrength(password);
        bar.style.width = res.width;
        bar.className = `h-1.5 rounded-full transition-all duration-300 ${res.color}`;
        text.textContent = `Strength: ${res.text}`;
    }

    // Success Submissions Handler
    function handleFormSuccess(form) {
        const formId = form.id;

        // 1. LOGIN FORM
        if (formId === 'loginForm') {
            const email = form.querySelector('input[type="email"], #loginEmail').value.trim();
            const role = form.querySelector('#loginRole') ? form.querySelector('#loginRole').value : 'user';

            showToast('Authenticating with te stackly Security Shield...', 'info');
            
            localStorage.setItem('stackly_user', JSON.stringify({
                email: email,
                name: email.split('@')[0].toUpperCase(),
                role: email.includes('admin') || role === 'admin' ? 'admin' : 'user',
                lastLogin: new Date().toLocaleTimeString()
            }));

            setTimeout(() => {
                if (email.includes('admin') || role === 'admin') {
                    showToast('Admin access authorized. Redirecting...', 'success');
                    window.location.href = 'admin-dashboard.html';
                } else {
                    showToast('Welcome back! Redirecting to your portal...', 'success');
                    window.location.href = 'user-dashboard.html';
                }
            }, 800);
            return;
        }

        // 2. SIGNUP FORM
        if (formId === 'signupForm') {
            const name = form.querySelector('#signupName') ? form.querySelector('#signupName').value.trim() : 'Valued Client';
            const email = form.querySelector('#signupEmail').value.trim();
            const accountType = form.querySelector('#accountTier') ? form.querySelector('#accountTier').value : 'Personal Wealth';

            localStorage.setItem('stackly_user', JSON.stringify({
                name: name,
                email: email,
                tier: accountType,
                role: 'user',
                balance: 25000.00,
                joinedDate: new Date().toLocaleDateString()
            }));

            const modal = document.getElementById('signupSuccessModal');
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            } else {
                showToast(`Account successfully opened for ${name}! Redirecting...`, 'success');
                setTimeout(() => {
                    window.location.href = 'user-dashboard.html';
                }, 1200);
            }
            return;
        }

        // 3. TRANSFER FORM (User Dashboard)
        if (formId === 'transferForm') {
            const amount = parseFloat(form.querySelector('#transferAmount').value);
            const recipient = form.querySelector('#recipientName') ? form.querySelector('#recipientName').value : 'Recipient';
            
            showToast(`Transfer of $${amount.toLocaleString(undefined, {minimumFractionDigits: 2})} to ${recipient} completed securely!`, 'success');
            
            const transferModal = document.getElementById('transferModal');
            if (transferModal) {
                transferModal.classList.add('hidden');
            }
            form.reset();
            form.querySelectorAll('.input-valid').forEach(el => el.classList.remove('input-valid'));
            return;
        }

        // 4. PROFILE SETTINGS FORM
        if (formId === 'profileSettingsForm') {
            const newName = form.querySelector('#profileName') ? form.querySelector('#profileName').value : null;
            const newEmail = form.querySelector('#profileEmail') ? form.querySelector('#profileEmail').value : null;
            
            let currentUser = JSON.parse(localStorage.getItem('stackly_user') || '{}');
            if (newName) currentUser.name = newName;
            if (newEmail) currentUser.email = newEmail;
            localStorage.setItem('stackly_user', JSON.stringify(currentUser));

            document.querySelectorAll('.user-display-name').forEach(el => el.textContent = newName || 'User');
            
            showToast('Banking profile & contact preferences updated successfully!', 'success');
            return;
        }

        // Default Generic Form
        showToast('Request submitted successfully. Our financial advisors will contact you shortly.', 'success');
        form.reset();
    }

    // Quick 1-Click Demo Login Fillers
    window.fillDemoCredentials = function (role) {
        const emailInput = document.getElementById('loginEmail') || document.querySelector('input[type="email"]');
        const passInput = document.getElementById('loginPassword') || document.querySelector('input[type="password"]');
        const roleSelect = document.getElementById('loginRole');

        if (!emailInput || !passInput) return;

        if (role === 'admin') {
            emailInput.value = 'admin@testackly.com';
            passInput.value = 'StacklyAdmin#2026';
            if (roleSelect) roleSelect.value = 'admin';
            showToast('Admin demo credentials populated. Click "Sign In" to proceed.', 'info');
        } else {
            emailInput.value = 'alex.morgan@testackly.com';
            passInput.value = 'WealthStack2026!';
            if (roleSelect) roleSelect.value = 'user';
            showToast('Personal Client demo credentials populated. Click "Sign In" to proceed.', 'info');
        }

        validateSingleInput(emailInput);
        validateSingleInput(passInput);
    };

    // Password Visibility Toggle helper
    window.togglePasswordVisibility = function (inputId, iconId) {
        const input = document.getElementById(inputId);
        const icon = document.getElementById(iconId);
        if (!input || !icon) return;

        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    };

    // Initialize on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        injectStyles();
        setupFormValidation();

        try {
            const savedUser = JSON.parse(localStorage.getItem('stackly_user') || '{}');
            if (savedUser.name) {
                document.querySelectorAll('.user-display-name').forEach(el => el.textContent = savedUser.name);
            }
            if (savedUser.email) {
                document.querySelectorAll('.user-display-email').forEach(el => el.textContent = savedUser.email);
            }
        } catch (e) {
            console.warn('Storage sync skipped', e);
        }
    });

    // Expose website popups / toast notifications globally & replace native browser alerts
    window.showToast = showToast;
    window.stacklyToast = showToast;
    window.alert = function (message) {
        showToast(message, 'info');
    };

})();
