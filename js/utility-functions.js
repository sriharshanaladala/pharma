/**
 * Utility Functions for Form Handling, Security & Storage
 * Uses localStorage and sessionStorage instead of backend
 */

// ============================================
// CSRF TOKEN MANAGEMENT
// ============================================

/**
 * Generate CSRF Token
 * @returns {string} CSRF token
 */
function generateCSRFToken() {
   let csrfToken = localStorage.getItem('csrfToken');
   if (!csrfToken) {
      csrfToken = 'token_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      localStorage.setItem('csrfToken', csrfToken);
   }
   return csrfToken;
}

/**
 * Verify CSRF Token
 * @param {string} token - Token to verify
 * @returns {boolean} Token validity
 */
function verifyCSRFToken(token) {
   return token === localStorage.getItem('csrfToken');
}

// ============================================
// SIMPLE PASSWORD HASHING (Client-side only)
// Note: This is NOT cryptographically secure for production
// Use bcrypt or similar for production environments
// ============================================

/**
 * Simple hash function using SHA-256 simulation
 * @param {string} str - String to hash
 * @returns {string} Hashed string
 */
async function simpleHash(str) {
   const encoder = new TextEncoder();
   const data = encoder.encode(str);
   const hash = await crypto.subtle.digest('SHA-256', data);
   return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash password with salt
 * @param {string} password - Password to hash
 * @returns {Promise<string>} Hashed password
 */
async function hashPassword(password) {
   const salt = 'nomadpharma_salt_2026'; // In production, use random salt per user
   return await simpleHash(salt + password + salt);
}

// ============================================
// INPUT SANITIZATION
// ============================================

/**
 * Sanitize HTML input to prevent XSS
 * @param {string} input - User input to sanitize
 * @returns {string} Sanitized input
 */
function sanitizeInput(input) {
   if (!input) return '';
   
   const div = document.createElement('div');
   div.textContent = input;
   return div.innerHTML;
}

/**
 * Sanitize email input
 * @param {string} email - Email to sanitize
 * @returns {string} Sanitized email
 */
function sanitizeEmail(email) {
   if (!email) return '';
   return email.trim().toLowerCase();
}

/**
 * Sanitize phone number (Indian format)
 * @param {string} phone - Phone number to sanitize
 * @returns {string} Sanitized phone (digits only)
 */
function sanitizePhone(phone) {
   if (!phone) return '';
   return phone.replace(/\D/g, '').slice(-10);
}

/**
 * Sanitize name input
 * @param {string} name - Name to sanitize
   * @returns {string} Sanitized name
 */
function sanitizeName(name) {
   if (!name) return '';
   return name
      .trim()
      .replace(/[^a-zA-Z\s]/g, '')
      .replace(/\s+/g, ' ')
      .slice(0, 50);
}

// ============================================
// FORM VALIDATION
// ============================================

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Email validity
 */
function validateEmail(email) {
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   return emailRegex.test(email);
}

/**
 * Validate phone number (Indian format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Phone validity
 */
function validatePhone(phone) {
   const cleanPhone = phone.replace(/\D/g, '');
   // Indian phone: 10 digits, starts with 6-9
   return /^[6-9]\d{9}$/.test(cleanPhone);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with score and issues
 */
function validatePasswordStrength(password) {
   const issues = [];
   let score = 0;

   if (!password || password.length < 8) {
      issues.push('Password must be at least 8 characters');
   } else {
      score += 1;
   }

   if (!/[a-z]/.test(password)) {
      issues.push('Must contain lowercase letters');
   } else {
      score += 1;
   }

   if (!/[A-Z]/.test(password)) {
      issues.push('Must contain uppercase letters');
   } else {
      score += 1;
   }

   if (!/[0-9]/.test(password)) {
      issues.push('Must contain numbers');
   } else {
      score += 1;
   }

   if (!/[!@#$%^&*]/.test(password)) {
      issues.push('Must contain special characters (!@#$%^&*)');
   } else {
      score += 1;
   }

   return {
      isValid: issues.length === 0,
      score: score,
      issues: issues,
      strength: score <= 1 ? 'Weak' : score <= 3 ? 'Fair' : 'Strong'
   };
}

/**
 * Validate PIN code (Indian format: 6 digits)
 * @param {string} pin - PIN code to validate
 * @returns {boolean} PIN validity
 */
function validatePIN(pin) {
   return /^\d{6}$/.test(pin.replace(/\s/g, ''));
}

/**
 * Validate age (must be 18+)
 * @param {string} dateOfBirth - Date in YYYY-MM-DD format
   * @returns {boolean} Age validity
 */
function validateAge(dateOfBirth) {
   const birthDate = new Date(dateOfBirth);
   const today = new Date();
   let age = today.getFullYear() - birthDate.getFullYear();
   const monthDiff = today.getMonth() - birthDate.getMonth();
   
   if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
   }
   
   return age >= 18;
}

// ============================================
// USER DATA MANAGEMENT
// ============================================

/**
 * Store user registration data in localStorage (never store passwords)
 * @param {object} userData - User data to store
 * @returns {boolean} Success status
 */
async function storeUserData(userData) {
   try {
      const { name, email, phone, password } = userData;

      // Validate all fields
      if (!name || !email || !phone || !password) {
         throw new Error('All fields are required');
      }

      // Validate formats
      if (!validateEmail(email)) {
         throw new Error('Invalid email format');
      }
      if (!validatePhone(phone)) {
         throw new Error('Invalid phone number (10 digits, starts with 6-9)');
      }

      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
         throw new Error(passwordValidation.issues[0]);
      }

      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      if (existingUsers.some(u => u.email === email)) {
         throw new Error('Email already registered');
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Prepare user object (don't store plain password)
      const user = {
         id: 'user_' + Date.now(),
         name: sanitizeName(name),
         email: sanitizeEmail(email),
         phone: sanitizePhone(phone),
         passwordHash: hashedPassword,
         createdAt: new Date().toISOString(),
         isVerified: false
      };

      // Store user
      existingUsers.push(user);
      localStorage.setItem('users', JSON.stringify(existingUsers));

      // Set session for current user
      sessionStorage.setItem('currentUser', JSON.stringify({
         id: user.id,
         name: user.name,
         email: user.email,
         phone: user.phone
      }));

      return { success: true, userId: user.id };
   } catch (error) {
      console.error('Registration error:', error.message);
      return { success: false, error: error.message };
   }
}

/**
 * Verify user login credentials
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} Login result
 */
async function verifyUserLogin(email, password) {
   try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.email === email);

      if (!user) {
         throw new Error('User not found');
      }

      const hashedPassword = await hashPassword(password);
      if (hashedPassword !== user.passwordHash) {
         throw new Error('Invalid password');
      }

      // Set session for current user
      sessionStorage.setItem('currentUser', JSON.stringify({
         id: user.id,
         name: user.name,
         email: user.email,
         phone: user.phone
      }));

      // Set login timestamp
      sessionStorage.setItem('loginTime', new Date().toISOString());

      return { success: true, userId: user.id, userName: user.name };
   } catch (error) {
      console.error('Login error:', error.message);
      return { success: false, error: error.message };
   }
}

/**
 * Get current logged-in user
 * @returns {object|null} Current user or null
 */
function getCurrentUser() {
   const user = sessionStorage.getItem('currentUser');
   return user ? JSON.parse(user) : null;
}

/**
 * Logout user
 */
function logoutUser() {
   // Clear all user data from both storages (unified with script.js)
   localStorage.removeItem('loggedInUser');
   localStorage.removeItem('userToken');
   localStorage.removeItem('currentUser');
   sessionStorage.removeItem('loggedInUser');
   sessionStorage.removeItem('currentUser');
   sessionStorage.removeItem('loginTime');
   console.log('✅ Utility logout complete');
}

// ============================================
// FORM SUBMISSION WITH STORAGE
// ============================================

/**
 * Store form submission data
 * @param {string} formType - Type of form (registration, contact, order, etc.)
 * @param {object} formData - Form data to store
 * @returns {string} Reference ID for submission
 */
function storeFormSubmission(formType, formData) {
   const referenceId = 'NP-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9).toUpperCase();
   
   const submission = {
      referenceId,
      type: formType,
      data: formData,
      timestamp: new Date().toISOString(),
      status: 'submitted'
   };

   // Store in sessionStorage for immediate use
   sessionStorage.setItem('submissionData', JSON.stringify(submission));

   // Store in localStorage for history
   const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
   submissions.push(submission);
   localStorage.setItem('submissions', JSON.stringify(submissions));

   return referenceId;
}

/**
 * Get all form submissions from localStorage
 * @returns {array} Array of submissions
 */
function getAllSubmissions() {
   return JSON.parse(localStorage.getItem('submissions') || '[]');
}

/**
 * Get submissions by type
 * @param {string} type - Type of submission to filter
 * @returns {array} Filtered submissions
 */
function getSubmissionsByType(type) {
   const submissions = getAllSubmissions();
   return submissions.filter(sub => sub.type === type);
}

// ============================================
// COOKIE MANAGEMENT (if needed)
// ============================================

/**
 * Set cookie
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} days - Days until expiration
 */
function setCookie(name, value, days = 7) {
   const date = new Date();
   date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
   const expires = 'expires=' + date.toUTCString();
   document.cookie = name + '=' + value + ';' + expires + ';path=/';
}

/**
 * Get cookie value
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null
 */
function getCookie(name) {
   const nameEQ = name + '=';
   const cookies = document.cookie.split(';');
   for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
         return cookie.substring(nameEQ.length);
      }
   }
   return null;
}

/**
 * Delete cookie
 * @param {string} name - Cookie name
 */
function deleteCookie(name) {
   setCookie(name, '', -1);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Show flash/toast message
 * @param {string} message - Message to display
 * @param {string} type - Message type (success, error, warning, info)
 * @param {number} duration - Duration in milliseconds
 */
function showMessage(message, type = 'info', duration = 3000) {
   const messageDiv = document.createElement('div');
   messageDiv.className = `message message-${type}`;
   messageDiv.textContent = message;
   messageDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 5px;
      background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2196f3'};
      color: white;
      z-index: 10000;
      font-weight: 600;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
   `;

   document.body.appendChild(messageDiv);

   setTimeout(() => {
      messageDiv.remove();
   }, duration);
}

/**
 * Format date to readable string
 * @param {string} dateStr - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateStr) {
   const date = new Date(dateStr);
   return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
   });
}

/**
 * Check if user is logged in
 * @returns {boolean} Login status
 */
function isUserLoggedIn() {
   return sessionStorage.getItem('currentUser') !== null;
}

/**
 * Clear old data from localStorage (optional cleanup)
 * @param {number} daysOld - Delete data older than this many days
 */
function cleanupOldData(daysOld = 30) {
   const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
   
   const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
   const filtered = submissions.filter(sub => new Date(sub.timestamp) > cutoffDate);
   
   if (filtered.length < submissions.length) {
      localStorage.setItem('submissions', JSON.stringify(filtered));
      console.log(`Cleaned up ${submissions.length - filtered.length} old submissions`);
   }
}

// Initialize CSRF token on page load
document.addEventListener('DOMContentLoaded', generateCSRFToken);
