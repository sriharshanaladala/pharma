# Utility Functions Quick Reference Guide

## Overview
The `utility-functions.js` file provides comprehensive security and storage management for the NomadPharma application. All functions use localStorage, sessionStorage, and client-side security mechanisms.

---

## Table of Contents
1. [CSRF Token Functions](#csrf-token-functions)
2. [Password Hashing](#password-hashing)
3. [Input Sanitization](#input-sanitization)
4. [Form Validation](#form-validation)
5. [User Data Management](#user-data-management)
6. [Form Submission Handling](#form-submission-handling)
7. [Cookie Management](#cookie-management)
8. [Utility Functions](#utility-functions)

---

## CSRF Token Functions

### `generateCSRFToken()`
Generates and stores a unique CSRF token in localStorage.

```javascript
const token = generateCSRFToken();
// Automatically called on DOMContentLoaded
```

**Returns:** `string` - CSRF token

---

### `verifyCSRFToken(token)`
Verifies if a CSRF token is valid.

```javascript
const isValid = verifyCSRFToken(userProvidedToken);
if (isValid) {
    // Token is valid, proceed with form submission
}
```

**Parameters:**
- `token` (string) - Token to verify

**Returns:** `boolean`

---

## Password Hashing

### `async hashPassword(password)`
Hashes a password using SHA-256 with salt.

```javascript
const hashedPassword = await hashPassword('myPassword123!');
// Store hashedPassword in localStorage, never the plain password
```

**Parameters:**
- `password` (string) - Plain text password

**Returns:** `Promise<string>` - Hashed password

---

## Input Sanitization

### `sanitizeInput(input)`
Prevents XSS attacks by encoding HTML.

```javascript
const clean = sanitizeInput('<script>alert("xss")</script>');
// Returns: "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
```

**Parameters:**
- `input` (string) - User input to sanitize

**Returns:** `string` - Sanitized input

---

### `sanitizeEmail(email)`
Normalizes email to lowercase and trims whitespace.

```javascript
const clean = sanitizeEmail('  USER@EXAMPLE.COM  ');
// Returns: "user@example.com"
```

**Parameters:**
- `email` (string) - Email to sanitize

**Returns:** `string` - Sanitized email

---

### `sanitizePhone(phone)`
Extracts only digits from phone number.

```javascript
const clean = sanitizePhone('+91-9999-999-999');
// Returns: "9999999999"
```

**Parameters:**
- `phone` (string) - Phone number to sanitize

**Returns:** `string` - Digits only (last 10)

---

### `sanitizeName(name)`
Removes special characters and extra spaces from name.

```javascript
const clean = sanitizeName('John   123@#$%');
// Returns: "John"
```

**Parameters:**
- `name` (string) - Name to sanitize

**Returns:** `string` - Sanitized name (max 50 chars)

---

## Form Validation

### `validateEmail(email)`
Validates email format using regex.

```javascript
const isValid = validateEmail('user@example.com');
// Returns: true

const isInvalid = validateEmail('invalid-email');
// Returns: false
```

**Parameters:**
- `email` (string) - Email to validate

**Returns:** `boolean`

---

### `validatePhone(phone)`
Validates Indian phone format (10 digits, starts with 6-9).

```javascript
const isValid = validatePhone('9876543210');
// Returns: true

const isInvalid = validatePhone('1234567890');
// Returns: false (starts with 1)
```

**Parameters:**
- `phone` (string) - Phone number to validate

**Returns:** `boolean`

---

### `validatePasswordStrength(password)`
Checks password strength with detailed feedback.

```javascript
const result = validatePasswordStrength('Pass@123');
// Returns: {
//    isValid: true,
//    score: 5,
//    strength: "Strong",
//    issues: []
// }

const result2 = validatePasswordStrength('weak');
// Returns: {
//    isValid: false,
//    score: 1,
//    strength: "Weak",
//    issues: [
//       "Password must be at least 8 characters",
//       "Must contain uppercase letters",
//       "Must contain numbers",
//       "Must contain special characters (!@#$%^&*)"
//    ]
// }
```

**Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*)

**Parameters:**
- `password` (string) - Password to validate

**Returns:** `object` with properties:
- `isValid` (boolean)
-`score` (number 0-5)
- `strength` (string)
- `issues` (array of strings)

---

### `validatePIN(pin)`
Validates Indian PIN code (6 digits).

```javascript
const isValid = validatePIN('500018');
// Returns: true

const isInvalid = validatePIN('12345');
// Returns: false
```

**Parameters:**
- `pin` (string) - PIN code to validate

**Returns:** `boolean`

---

### `validateAge(dateOfBirth)`
Validates if user is 18+ years old.

```javascript
const isValid = validateAge('2000-01-15');
// Returns: true

const isInvalid = validateAge('2015-01-15');
// Returns: false
```

**Parameters:**
- `dateOfBirth` (string) - Date in YYYY-MM-DD format

**Returns:** `boolean`

---

## User Data Management

### `async storeUserData(userData)`
Registers and stores user data securely.

```javascript
const result = await storeUserData({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '9876543210',
    password: 'SecurePass@123'
});

if (result.success) {
    console.log('User registered:', result.userId);
} else {
    console.error('Error:', result.error);
}
```

**Features:**
- Validates all fields
- Checks for duplicate emails
- Hashes password
- Stores user without plain password
- Sets session storage

**Parameters:**
- `userData` (object) with properties:
  - `name` (string)
  - `email` (string)
  - `phone` (string)
  - `password` (string)

**Returns:** `Promise<object>` with:
- `success` (boolean)
- `userId` (string, if successful)
- `error` (string, if failed)

---

### `async verifyUserLogin(email, password)`
Verifies user credentials against stored data.

```javascript
const result = await verifyUserLogin('john@example.com', 'SecurePass@123');

if (result.success) {
    console.log('Welcome', result.userName);
} else {
    console.error('Login failed:', result.error);
}
```

**Parameters:**
- `email` (string)
- `password` (string)

**Returns:** `Promise<object>` with:
- `success` (boolean)
- `userId` (string, if successful)
- `userName` (string, if successful)
- `error` (string, if failed)

---

### `getCurrentUser()`
Retrieves currently logged-in user from session.

```javascript
const user = getCurrentUser();
if (user) {
    console.log('Logged in as:', user.name);
}
```

**Returns:** `object|null`
- Object contains: `id`, `name`, `email`, `phone`
- `null` if not logged in

---

### `logoutUser()`
Clears user session.

```javascript
logoutUser();
// Redirects to login page (handle separately)
window.location.href = 'login.html';
```

---

## Form Submission Handling

### `storeFormSubmission(formType, formData)`
Stores form submission data for history.

```javascript
const referenceId = storeFormSubmission('contact', {
    name: 'John',
    email: 'john@example.com',
    message: 'I have a question...'
});

console.log('Reference ID:', referenceId);
// Stores in both sessionStorage (for thanks page) and localStorage (for history)
```

**Parameters:**
- `formType` (string) - Type: 'registration', 'contact', 'order', 'enquiry', 'appointment'
- `formData` (object) - Form data to store

**Returns:** `string` - Reference ID

---

### `getAllSubmissions()`
Retrieves all stored submissions from localStorage.

```javascript
const submissions = getAllSubmissions();
submissions.forEach(sub => {
    console.log(`${sub.type}: ${sub.referenceId} at ${sub.timestamp}`);
});
```

**Returns:** `array` - Array of submission objects

---

### `getSubmissionsByType(type)`
Filters submissions by type.

```javascript
const contacts = getSubmissionsByType('contact');
const registrations = getSubmissionsByType('registration');
```

**Parameters:**
- `type` (string) - Submission type to filter

**Returns:** `array` - Filtered submission objects

---

## Cookie Management

### `setCookie(name, value, days)`
Sets a cookie.

```javascript
setCookie('preferences', 'dark-mode', 30);
// Sets cookie for 30 days
```

**Parameters:**
- `name` (string) - Cookie name
- `value` (string) - Cookie value
- `days` (number, optional) - Days until expiration (default: 7)

---

### `getCookie(name)`
Retrieves cookie value.

```javascript
const value = getCookie('preferences');
console.log(value); // 'dark-mode'
```

**Parameters:**
- `name` (string) - Cookie name

**Returns:** `string|null`

---

### `deleteCookie(name)`
Deletes a cookie.

```javascript
deleteCookie('preferences');
```

**Parameters:**
- `name` (string) - Cookie name

---

## Utility Functions

### `showMessage(message, type, duration)`
Displays toast notification.

```javascript
showMessage('Success!', 'success', 3000);
showMessage('Error occurred', 'error', 3000);
showMessage('Warning!', 'warning', 3000);
showMessage('Information', 'info', 3000);
```

**Parameters:**
- `message` (string) - Message to display
- `type` (string) - 'success', 'error', 'warning', 'info'
- `duration` (number, optional) - Milliseconds (default: 3000)

---

### `formatDate(dateStr)`
Formats ISO date string to readable format.

```javascript
const formatted = formatDate('2026-03-20T10:30:00Z');
// Returns: "20 March 2026, 10:30 AM"
```

**Parameters:**
- `dateStr` (string) - ISO date string

**Returns:** `string` - Formatted date

---

### `isUserLoggedIn()`
Checks if user is currently logged in.

```javascript
if (isUserLoggedIn()) {
    console.log('User is logged in');
} else {
    console.log('Please login first');
}
```

**Returns:** `boolean`

---

### `cleanupOldData(daysOld)`
Removes old submissions from localStorage.

```javascript
cleanupOldData(30); // Remove submissions older than 30 days
```

**Parameters:**
- `daysOld` (number) - Delete submissions older than this many days

---

## Usage Examples

### Complete Registration Flow:
```javascript
// HTML: Include utility-functions.js
<script src="js/utility-functions.js"></script>

// JavaScript:
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    
    // Validate
    if (!validateEmail(email)) {
        showMessage('Invalid email', 'error');
        return;
    }
    
    if (!validatePhone(phone)) {
        showMessage('Invalid phone', 'error');
        return;
    }
    
    const pwValidation = validatePasswordStrength(password);
    if (!pwValidation.isValid) {
        showMessage('Password too weak', 'error');
        return;
    }
    
    // Store user
    const result = await storeUserData({
        email, name, phone, password
    });
    
    if (result.success) {
        storeFormSubmission('registration', {name, email});
        showMessage('Registration successful!', 'success');
        window.location.href = 'thanks.html';
    } else {
        showMessage(result.error, 'error');
    }
});
```

### Complete Login Flow:
```javascript
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const result = await verifyUserLogin(email, password);
    
    if (result.success) {
        storeFormSubmission('login', {email});
        showMessage('Welcome back!', 'success');
        window.location.href = 'products.html';
    } else {
        showMessage(result.error, 'error');
    }
});
```

---

## Important Notes

⚠️ **Security Considerations:**
- This is a client-side solution suitable for frontend demo/prototype
- For production, implement proper backend security
- Always use HTTPS in production
- Never trust client-side validation alone
- Implement server-side validation and storage

📱 **Browser Compatibility:**
- localStorage and sessionStorage supported in all modern browsers
- SHA-256 (crypto.subtle) supported in most modern browsers
- Add polyfills for older browsers if needed

💾 **Storage Limits:**
- localStorage limit: typically 5-10MB per domain
- Sufficient for user registration data
- Consider backend for larger-scale applications

---

*Last Updated: March 20, 2026*
*Version: 1.0*