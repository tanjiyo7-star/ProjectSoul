/**
 * Edit Profile JavaScript
 * Handles profile editing functionality, avatar upload, and form validation
 */

// Global variables
let selectedAvatarFile = null;
let isPasswordChangeEnabled = false;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeEditProfile();
});

/**
 * Initialize edit profile functionality
 */
function initializeEditProfile() {
    initializeFormValidation();
    initializeBioCharacterCount();
    initializePasswordStrength();
    setupFormSubmission();
}

/**
 * Initialize form validation
 */
function initializeFormValidation() {
    const form = document.getElementById('profileForm');
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
    });
}

/**
 * Initialize bio character count
 */
function initializeBioCharacterCount() {
    const bioTextarea = document.getElementById('bio');
    const charCount = document.getElementById('bioCharCount');
    
    if (bioTextarea && charCount) {
        // Initial count
        updateCharCount();
        
        bioTextarea.addEventListener('input', updateCharCount);
        
        function updateCharCount() {
            const count = bioTextarea.value.length;
            charCount.textContent = count;
            
            if (count > 450) {
                charCount.style.color = 'var(--error-color)';
            } else if (count > 400) {
                charCount.style.color = 'var(--warning-color)';
            } else {
                charCount.style.color = 'var(--text-muted)';
            }
        }
    }
}

/**
 * Initialize password strength indicator
 */
function initializePasswordStrength() {
    const newPasswordInput = document.getElementById('newPassword');
    const strengthIndicator = document.getElementById('passwordStrength');
    
    if (newPasswordInput && strengthIndicator) {
        newPasswordInput.addEventListener('input', function() {
            const password = this.value;
            const strength = calculatePasswordStrength(password);
            updatePasswordStrength(strengthIndicator, strength);
        });
    }
}

/**
 * Calculate password strength
 */
function calculatePasswordStrength(password) {
    if (password.length === 0) return 'none';
    
    let score = 0;
    
    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // Character variety checks
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score < 3) return 'weak';
    if (score < 5) return 'medium';
    return 'strong';
}

/**
 * Update password strength indicator
 */
function updatePasswordStrength(indicator, strength) {
    indicator.className = `password-strength ${strength}`;
}

/**
 * Setup form submission
 */
function setupFormSubmission() {
    const form = document.getElementById('profileForm');
    form.addEventListener('submit', updateProfile);
}

/**
 * Preview selected avatar
 */
function previewAvatar(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showToast('error', 'Please select a valid image file');
        return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast('error', 'Image size must be less than 5MB');
        return;
    }
    
    selectedAvatarFile = file;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const previewImage = document.getElementById('previewImage');
        const avatarPreview = document.getElementById('avatarPreview');
        
        previewImage.src = e.target.result;
        avatarPreview.style.display = 'block';
        
        // Scroll to preview
        avatarPreview.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    reader.readAsDataURL(file);
}

/**
 * Cancel avatar preview
 */
function cancelAvatarPreview() {
    const avatarPreview = document.getElementById('avatarPreview');
    const avatarInput = document.getElementById('avatarInput');
    
    avatarPreview.style.display = 'none';
    avatarInput.value = '';
    selectedAvatarFile = null;
}

/**
 * Upload avatar using AJAX
 */
async function uploadAvatar() {
    if (!selectedAvatarFile) {
        showToast('error', 'No image selected');
        return;
    }
    
    const formData = new FormData();
    formData.append('avatar', selectedAvatarFile);
    formData.append('csrf_token', window.csrfToken);
    
    showLoading(true);
    
    try {
        const response = await fetch('/upload-avatar', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update current avatar
            const currentAvatar = document.getElementById('currentAvatar');
            currentAvatar.src = data.avatar_url + '?t=' + Date.now(); // Cache bust
            
            // Hide preview
            cancelAvatarPreview();
            
            showToast('success', 'Profile picture updated successfully');
        } else {
            showToast('error', data.message || 'Failed to upload image');
        }
    } catch (error) {
        console.error('Avatar upload error:', error);
        showToast('error', 'Network error occurred');
    } finally {
        showLoading(false);
    }
}

/**
 * Toggle password visibility
 */
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

/**
 * Toggle password change fields
 */
function togglePasswordChange() {
    const passwordFields = document.getElementById('passwordChangeFields');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    isPasswordChangeEnabled = !isPasswordChangeEnabled;
    
    if (isPasswordChangeEnabled) {
        passwordFields.style.display = 'block';
        newPasswordInput.required = true;
        confirmPasswordInput.required = true;
    } else {
        passwordFields.style.display = 'none';
        newPasswordInput.required = false;
        confirmPasswordInput.required = false;
        newPasswordInput.value = '';
        confirmPasswordInput.value = '';
        clearFieldError(newPasswordInput);
        clearFieldError(confirmPasswordInput);
    }
}

/**
 * Update profile
 */
async function updateProfile(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Validate form
    if (!validateForm(form)) {
        showToast('error', 'Please fix the errors below');
        return;
    }
    
    // Check if current password is provided
    const currentPassword = formData.get('currentPassword');
    if (!currentPassword) {
        showToast('error', 'Please enter your current password to save changes');
        document.getElementById('currentPassword').focus();
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch('/update-profile', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('success', 'Profile updated successfully');
            
            // Reset password fields if they were changed
            if (isPasswordChangeEnabled) {
                togglePasswordChange();
            }
            
            // Clear current password
            document.getElementById('currentPassword').value = '';
            
            // Update page title if name changed
            const firstName = formData.get('firstName');
            const lastName = formData.get('lastName');
            if (firstName && lastName) {
                document.title = `${firstName} ${lastName} - Edit Profile`;
            }
        } else {
            showToast('error', data.message || 'Failed to update profile');
            
            // Show field-specific errors
            if (data.errors) {
                Object.keys(data.errors).forEach(field => {
                    showFieldError(field, data.errors[field]);
                });
            }
        }
    } catch (error) {
        console.error('Profile update error:', error);
        showToast('error', 'Network error occurred');
    } finally {
        showLoading(false);
    }
}

/**
 * Validate entire form
 */
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    // Additional validations
    if (isPasswordChangeEnabled) {
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (newPassword !== confirmPassword) {
            showFieldError('confirmPassword', 'Passwords do not match');
            isValid = false;
        }
        
        if (newPassword.length < 8) {
            showFieldError('newPassword', 'Password must be at least 8 characters long');
            isValid = false;
        }
    }
    
    // Email validation
    const email = document.getElementById('email').value;
    if (email && !isValidEmail(email)) {
        showFieldError('email', 'Please enter a valid email address');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Validate individual field
 */
function validateField(input) {
    const value = input.value.trim();
    const fieldName = input.name;
    let isValid = true;
    
    // Required field validation
    if (input.required && !value) {
        showFieldError(fieldName, 'This field is required');
        isValid = false;
    }
    
    // Specific field validations
    switch (fieldName) {
        case 'firstName':
        case 'lastName':
            if (value && (value.length < 2 || value.length > 50)) {
                showFieldError(fieldName, 'Name must be between 2 and 50 characters');
                isValid = false;
            }
            break;
            
        case 'email':
            if (value && !isValidEmail(value)) {
                showFieldError(fieldName, 'Please enter a valid email address');
                isValid = false;
            }
            break;
            
        case 'bio':
            if (value.length > 500) {
                showFieldError(fieldName, 'Bio must be less than 500 characters');
                isValid = false;
            }
            break;
            
        case 'location':
            if (value.length > 100) {
                showFieldError(fieldName, 'Location must be less than 100 characters');
                isValid = false;
            }
            break;
    }
    
    if (isValid) {
        clearFieldError(input);
    }
    
    return isValid;
}

/**
 * Show field error
 */
function showFieldError(fieldName, message) {
    const field = document.getElementById(fieldName) || document.querySelector(`[name="${fieldName}"]`);
    const formGroup = field.closest('.form-group');
    const errorElement = document.getElementById(`${fieldName}-error`);
    
    if (formGroup) {
        formGroup.classList.add('error');
    }
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

/**
 * Clear field error
 */
function clearFieldError(input) {
    const fieldName = input.name || input.id;
    const formGroup = input.closest('.form-group');
    const errorElement = document.getElementById(`${fieldName}-error`);
    
    if (formGroup) {
        formGroup.classList.remove('error');
    }
    
    if (errorElement) {
        errorElement.classList.remove('show');
        errorElement.textContent = '';
    }
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Show/hide loading overlay
 */
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    const saveBtn = document.getElementById('saveBtn');
    
    if (show) {
        overlay.style.display = 'flex';
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    } else {
        overlay.style.display = 'none';
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
    }
}

/**
 * Show toast notification
 */
function showToast(type, message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'check-circle' : 
                 type === 'error' ? 'exclamation-circle' : 'info-circle';
    
    toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }, 4000);
}

// Add CSS for slideOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);