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
 * 8. Dynamic Logged-in Credentials Sync & LocalStorage Profile Persistence
 * 9. Quick Transfer Modal Strict Validation & Ledger Update
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
        name: /^[a-zA-Z\s'.]{2,50}$/,
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
        const wrapper = input.closest('.form-input-wrapper');
        const parent = wrapper ? wrapper.parentElement : (input.closest('.form-group, .relative') || input.parentElement);
        if (!parent) return;
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
        
        const wrapper = input.closest('.form-input-wrapper');
        const parent = wrapper ? wrapper.parentElement : (input.closest('.form-group, .relative') || input.parentElement);
        if (parent) {
            parent.appendChild(error);
        }
    }

    // Helper: Mark field as valid
    function markFieldValid(input) {
        clearFieldError(input);
        input.classList.add('input-valid');
    }

    // Helper: Format human readable name from an email
    function formatNameFromEmail(email) {
        if (!email) return 'Valued Client';
        const lower = email.toLowerCase();
        if (lower === 'admin@testackly.com') return 'Super Admin';
        if (lower === 'alex.morgan@testackly.com') return 'Alex Morgan';

        const prefix = email.split('@')[0];
        const parts = prefix.split(/[\._\-+]/).filter(Boolean);
        if (parts.length === 0) return 'Valued Client';
        return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
    }

    // Password Strength Evaluator
    function evaluatePasswordStrength(password) {
        let score = 0;
        if (!password) return { score: 0, text: 'Too Short', color: 'bg-gray-200', width: '10%' };

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

        const forms = document.querySelectorAll(
            'form[data-validate], #loginForm, #signupForm, #transferForm, #transferFormModal, #profileSettingsForm, #adminSettingsForm, #loanAppForm, form'
        );

        forms.forEach(form => {
            // Remove any legacy inline onsubmit that bypassed validation
            if (form.id === 'transferFormModal' && form.getAttribute('onsubmit')) {
                form.removeAttribute('onsubmit');
            }
            if (form.id === 'adminSettingsForm' && form.getAttribute('onsubmit')) {
                form.removeAttribute('onsubmit');
            }

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

            // Prevent duplicate listeners
            if (form.dataset.boundValidation) return;
            form.dataset.boundValidation = 'true';

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
        const val = input.value ? input.value.trim() : '';
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
        if (type === 'email' || input.name === 'email' || input.id === 'loginEmail' || input.id === 'signupEmail' || input.id === 'profileEmail' || input.id === 'adminEmail') {
            if (!Patterns.email.test(val)) {
                showFieldError(input, 'Please enter a valid email address (e.g. name@domain.com)');
                return false;
            }
        }

        // Name Validation
        if (input.name === 'fullname' || input.id === 'fullname' || input.id === 'signupName' || input.id === 'profileName' || input.id === 'recipientName' || input.id === 'quickRecipientName' || input.id === 'adminName') {
            if (val.length < 2) {
                showFieldError(input, 'Name must be at least 2 characters');
                return false;
            }
            if (!Patterns.name.test(val)) {
                showFieldError(input, 'Please enter a valid name (letters & spaces only)');
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

        // Money Transfer Amount Validation (both Wire and Quick Transfer Modal)
        if (input.id === 'transferAmount' || input.id === 'quickTransferAmount' || input.name === 'transferAmount') {
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

        // Routing Number Validation
        if (input.id === 'routingNumber') {
            if (!Patterns.routingNumber.test(val)) {
                showFieldError(input, 'Routing number must be exactly 9 digits');
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

    // Retrieve or initialize users directory
    function getUsersDatabase() {
        let db = {};
        try {
            db = JSON.parse(localStorage.getItem('stackly_users_db') || '{}');
        } catch (e) {
            db = {};
        }

        // Seed default demo accounts if missing
        if (!db['alex.morgan@testackly.com']) {
            db['alex.morgan@testackly.com'] = {
                name: 'Alex Morgan',
                email: 'alex.morgan@testackly.com',
                role: 'user',
                tier: 'Personal Premier',
                accountNumber: '4592 8821 3491 4902',
                shortAccount: '****4902',
                balance: 128450.00,
                joinedDate: 'Jan 15, 2024'
            };
        }
        if (!db['admin@testackly.com']) {
            db['admin@testackly.com'] = {
                name: 'Super Admin',
                email: 'admin@testackly.com',
                role: 'admin',
                roleTitle: 'Chief Compliance Officer & System Administrator',
                node: 'Compliance Node #1',
                joinedDate: 'Oct 01, 2023'
            };
        }
        return db;
    }

    function saveUserToDatabase(user) {
        if (!user || !user.email) return;
        const db = getUsersDatabase();
        db[user.email.toLowerCase()] = Object.assign({}, db[user.email.toLowerCase()] || {}, user);
        localStorage.setItem('stackly_users_db', JSON.stringify(db));
    }

    // Synchronize user credentials across all UI elements on both dashboards
    function syncUserDataAcrossUI() {
        try {
            const isUserDash = window.location.pathname.includes('user-dashboard.html');
            const isAdminDash = window.location.pathname.includes('admin-dashboard.html');

            let currentUser = JSON.parse(localStorage.getItem('stackly_user') || 'null');

            // Provide sensible defaults if storage is empty
            if (!currentUser) {
                if (isAdminDash) {
                    currentUser = {
                        name: 'Super Admin',
                        email: 'admin@testackly.com',
                        role: 'admin',
                        roleTitle: 'Chief Compliance Officer & System Administrator',
                        node: 'Compliance Node #1'
                    };
                } else {
                    currentUser = {
                        name: 'Alex Morgan',
                        email: 'alex.morgan@testackly.com',
                        role: 'user',
                        tier: 'Personal Premier',
                        accountNumber: '4592 8821 3491 4902',
                        shortAccount: '****4902',
                        balance: 128450.00
                    };
                }
                localStorage.setItem('stackly_user', JSON.stringify(currentUser));
            }

            // 1. Sync User Dashboard elements
            if (currentUser.name) {
                document.querySelectorAll('.user-display-name').forEach(el => {
                    el.textContent = currentUser.name;
                });
            }
            if (currentUser.email) {
                document.querySelectorAll('.user-display-email').forEach(el => {
                    el.textContent = currentUser.email;
                });
            }
            if (currentUser.tier) {
                document.querySelectorAll('.user-display-tier').forEach(el => {
                    el.textContent = currentUser.tier;
                });
            }
            if (currentUser.shortAccount) {
                document.querySelectorAll('.user-display-account').forEach(el => {
                    el.textContent = `Account #${currentUser.shortAccount}`;
                });
            }

            // Sync User Profile Settings Inputs (.value property)
            const profileNameInput = document.getElementById('profileName');
            if (profileNameInput && currentUser.name) {
                profileNameInput.value = currentUser.name;
            }
            const profileEmailInput = document.getElementById('profileEmail');
            if (profileEmailInput && currentUser.email) {
                profileEmailInput.value = currentUser.email;
            }

            // 2. Sync Admin Dashboard elements
            if (currentUser.name) {
                document.querySelectorAll('.admin-display-name').forEach(el => {
                    el.textContent = currentUser.name;
                });
            }
            if (currentUser.email) {
                document.querySelectorAll('.admin-display-email').forEach(el => {
                    el.textContent = currentUser.email;
                });
            }
            if (currentUser.roleTitle || currentUser.role) {
                document.querySelectorAll('.admin-display-role').forEach(el => {
                    el.textContent = currentUser.roleTitle || 'Compliance & Liquidity';
                });
            }

            // Sync Admin Settings Inputs
            const adminEmailInput = document.getElementById('adminEmail');
            if (adminEmailInput && currentUser.email) {
                adminEmailInput.value = currentUser.email;
            }
            const adminNameInput = document.getElementById('adminName');
            if (adminNameInput && currentUser.name) {
                adminNameInput.value = currentUser.name;
            }

        } catch (e) {
            console.warn('User credentials UI sync skipped', e);
        }
    }

    // Success Submissions Handler
    function handleFormSuccess(form) {
        const formId = form.id;

        // 1. LOGIN FORM
        if (formId === 'loginForm') {
            const emailInput = form.querySelector('input[type="email"], #loginEmail');
            const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
            const roleSelect = form.querySelector('#loginRole');
            const selectedRole = roleSelect ? roleSelect.value : 'user';

            showToast('Authenticating with te stackly Security Shield...', 'info');

            const db = getUsersDatabase();
            let matchedUser = db[email];

            const isAdmin = email.includes('admin') || selectedRole === 'admin';
            const determinedRole = isAdmin ? 'admin' : 'user';

            if (!matchedUser) {
                // Generate a formatted profile for new email logins
                const formattedName = formatNameFromEmail(email);
                matchedUser = {
                    name: formattedName,
                    email: email,
                    role: determinedRole,
                    tier: determinedRole === 'admin' ? 'Institutional Administrator' : 'Personal Premier',
                    roleTitle: determinedRole === 'admin' ? 'Compliance & Security Director' : undefined,
                    shortAccount: '****' + Math.floor(1000 + Math.random() * 9000),
                    balance: 128450.00,
                    lastLogin: new Date().toLocaleTimeString()
                };
                saveUserToDatabase(matchedUser);
            } else {
                matchedUser.lastLogin = new Date().toLocaleTimeString();
                if (isAdmin) matchedUser.role = 'admin';
            }

            localStorage.setItem('stackly_user', JSON.stringify(matchedUser));

            setTimeout(() => {
                if (determinedRole === 'admin') {
                    showToast(`Welcome back, ${matchedUser.name}! Opening Admin Console...`, 'success');
                    window.location.href = 'admin-dashboard.html';
                } else {
                    showToast(`Welcome back, ${matchedUser.name}! Opening your Client Portal...`, 'success');
                    window.location.href = 'user-dashboard.html';
                }
            }, 800);
            return;
        }

        // 2. SIGNUP FORM
        if (formId === 'signupForm') {
            const name = form.querySelector('#signupName') ? form.querySelector('#signupName').value.trim() : 'Valued Client';
            const email = form.querySelector('#signupEmail') ? form.querySelector('#signupEmail').value.trim().toLowerCase() : '';
            const accountType = form.querySelector('#accountTier') ? form.querySelector('#accountTier').value : 'Personal Wealth';
            const shortAcc = '****' + Math.floor(1000 + Math.random() * 9000);

            const newUser = {
                name: name,
                email: email,
                tier: accountType,
                role: 'user',
                shortAccount: shortAcc,
                balance: 25000.00,
                joinedDate: new Date().toLocaleDateString()
            };

            saveUserToDatabase(newUser);
            localStorage.setItem('stackly_user', JSON.stringify(newUser));

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

        // 3. QUICK TRANSFER MODAL FORM (Fix: Strictly validates input fields, blocks blank submit, updates ledger)
        if (formId === 'transferFormModal') {
            const recipientInput = form.querySelector('#quickRecipientName') || form.querySelector('input[type="text"]');
            const amountInput = form.querySelector('#quickTransferAmount') || form.querySelector('input[type="number"]');
            const noteInput = form.querySelector('#quickTransferNote') || form.querySelectorAll('input[type="text"]')[1];

            const recipient = recipientInput ? recipientInput.value.trim() : '';
            const amount = amountInput ? parseFloat(amountInput.value) : 0;
            const note = noteInput ? noteInput.value.trim() : 'Instant Transfer';

            // Rigorous sanity validation
            if (!recipient || recipient.length < 2) {
                if (recipientInput) showFieldError(recipientInput, 'Please provide the recipient’s full name');
                showToast('Recipient name is required to execute a transfer.', 'error');
                return;
            }

            if (isNaN(amount) || amount <= 0) {
                if (amountInput) showFieldError(amountInput, 'Please enter a valid amount greater than $0.00');
                showToast('Please specify a transfer amount greater than $0.00.', 'error');
                return;
            }

            if (amount > 50000) {
                if (amountInput) showFieldError(amountInput, 'Maximum single instant transfer is $50,000.00');
                showToast('Transfer amount exceeds daily limit ($50,000.00).', 'error');
                return;
            }

            // Success: Display descriptive confirmation toast
            showToast(`Transfer of $${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} to ${recipient} completed successfully!`, 'success');

            // Dynamically prepend new transaction to recent transactions table if available
            addTransactionToRecentList(recipient, amount, note);

            // Close transfer modal if function exists
            if (typeof window.closeTransferModal === 'function') {
                window.closeTransferModal();
            } else {
                const modal = document.getElementById('transferModal');
                if (modal) modal.classList.add('hidden');
            }

            // Clean form state
            form.reset();
            form.querySelectorAll('.input-valid, .input-invalid').forEach(el => {
                el.classList.remove('input-valid', 'input-invalid');
            });
            form.querySelectorAll('.field-error-msg').forEach(el => el.remove());
            return;
        }

        // 4. WIRE & DOMESTIC TRANSFER FORM (Tab 2 on User Dashboard)
        if (formId === 'transferForm') {
            const amountInput = form.querySelector('#transferAmount');
            const amount = amountInput ? parseFloat(amountInput.value) : 0;
            const recipient = form.querySelector('#recipientName') ? form.querySelector('#recipientName').value.trim() : 'Recipient';
            
            showToast(`Wire transfer of $${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} to ${recipient} cleared successfully!`, 'success');
            
            addTransactionToRecentList(recipient, amount, 'Wire Clearance');

            form.reset();
            form.querySelectorAll('.input-valid, .input-invalid').forEach(el => {
                el.classList.remove('input-valid', 'input-invalid');
            });
            form.querySelectorAll('.field-error-msg').forEach(el => el.remove());
            return;
        }

        // 5. PROFILE SETTINGS FORM (User Dashboard)
        if (formId === 'profileSettingsForm') {
            const newName = form.querySelector('#profileName') ? form.querySelector('#profileName').value.trim() : null;
            const newEmail = form.querySelector('#profileEmail') ? form.querySelector('#profileEmail').value.trim().toLowerCase() : null;
            
            let currentUser = JSON.parse(localStorage.getItem('stackly_user') || '{}');
            if (newName) currentUser.name = newName;
            if (newEmail) currentUser.email = newEmail;
            
            localStorage.setItem('stackly_user', JSON.stringify(currentUser));
            saveUserToDatabase(currentUser);

            syncUserDataAcrossUI();
            showToast('Banking profile & contact preferences updated successfully!', 'success');
            return;
        }

        // 6. ADMIN CONSOLE SETTINGS FORM (Admin Dashboard)
        if (formId === 'adminSettingsForm') {
            const newEmail = form.querySelector('#adminEmail') ? form.querySelector('#adminEmail').value.trim().toLowerCase() : null;
            const newName = form.querySelector('#adminName') ? form.querySelector('#adminName').value.trim() : null;

            let currentUser = JSON.parse(localStorage.getItem('stackly_user') || '{}');
            if (newEmail) currentUser.email = newEmail;
            if (newName) currentUser.name = newName;
            currentUser.role = 'admin';

            localStorage.setItem('stackly_user', JSON.stringify(currentUser));
            saveUserToDatabase(currentUser);

            syncUserDataAcrossUI();
            showToast('Console security policy & compliance administrator updated successfully.', 'success');
            return;
        }

        // Default Generic Form
        showToast('Request submitted successfully. Our financial team will review it shortly.', 'success');
        form.reset();
        form.querySelectorAll('.input-valid, .input-invalid').forEach(el => {
            el.classList.remove('input-valid', 'input-invalid');
        });
    }

    // Helper: Add completed transfer to UI recent transactions list
    function addTransactionToRecentList(recipient, amount, note) {
        const txContainer = document.querySelector('#tab-overview .space-y-3');
        if (!txContainer) return;

        const newRow = document.createElement('div');
        newRow.className = 'tx-item outflow flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-surface hover:bg-gray-100 transition gap-3 border border-brand/40 animate-pulse';
        newRow.innerHTML = `
            <div class="flex items-center gap-3.5 min-w-0">
                <div class="w-10 h-10 rounded-xl bg-dark text-brand flex items-center justify-center font-bold flex-shrink-0">
                    <i class="fa-solid fa-paper-plane"></i>
                </div>
                <div class="min-w-0">
                    <div class="text-sm font-bold text-dark truncate">Transfer to ${recipient}</div>
                    <div class="text-xs text-gray-400 truncate">${note || 'Instant Money Transfer'} &bull; Just Now</div>
                </div>
            </div>
            <div class="text-right flex-shrink-0">
                <div class="text-sm font-bold text-dark">-$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <span class="text-[10px] bg-brand/30 text-dark px-2 py-0.5 rounded-full font-bold uppercase">Completed</span>
            </div>
        `;
        txContainer.insertBefore(newRow, txContainer.firstChild);

        // Remove highlight pulse after 3 seconds
        setTimeout(() => {
            newRow.classList.remove('border-brand/40', 'animate-pulse');
        }, 3000);
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
        syncUserDataAcrossUI();
    });

    // Expose helpers globally
    window.showToast = showToast;
    window.stacklyToast = showToast;
    window.syncUserDataAcrossUI = syncUserDataAcrossUI;
    window.alert = function (message) {
        showToast(message, 'info');
    };

})();
