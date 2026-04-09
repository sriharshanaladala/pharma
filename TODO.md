# NomadPharma Codebase Improvement TODO List

## **📋 CODE QUALITY & ORGANIZATION**

### Missing Files & Broken Links
- [x] ✅ Create missing `search.html` page with search functionality
- [x] ✅ Create missing `thanks.html` thank-you confirmation page
- [x] ✅ Fix all dead links (search.html referenced 9 times but doesn't exist)

### Typos & Errors
- [x] ✅ Fix typo in register.html: `input type="numner"` → `type="tel"`
- [x] ✅ Fix button text: "regisetr now" → "register now"
- [x] ✅ Fix inconsistent branding (pages reference "Nomad Pharma", "SRI Pharmacy", "OkPharma", "Saikia Pharmacy")
- [x] ✅ Standardize contact info across all footer elements

---

## **🔐 SECURITY & VALIDATION**

### Form Validation
- [x] ✅ Add password confirmation validation (register form - must match `pass` and `cpass`)
- [x] ✅ Add password strength validation (minimum 8 chars, uppercase, numbers, special chars)
- [x] ✅ Add email format validation beyond HTML5 (check domain validity)
- [x] ✅ Add phone number format validation (Indian format: 10 digits, starting with 6-9)
- [ ] Add terms & conditions checkbox requirement to registration
- [ ] Add age verification for pharmacy products
- [x] ✅ Add name validation (prevent special characters, numbers)
- [ ] Validate ZIP/PIN code format (6 digits for India)

### Form Security
- [x] ✅ Add CSRF token protection to all forms
- [x] ✅ Implement input sanitization to prevent XSS attacks
- [ ] Remove action="" from forms (currently empty) and implement proper endpoints
- [ ] Add rate limiting for form submissions
- [x] ✅ Hash passwords before any storage
- [ ] Add form submission timeout handling
- [ ] Implement honeypot fields for bot detection

### Data Protection
- [x] ✅ Don't store sensitive data (passwords, full phone numbers) in localStorage
- [ ] Add HTTPS requirement in .htaccess
- [ ] Add Content Security Policy headers
- [ ] Remove or mask phone numbers in contact section in HTML
- [ ] Add data privacy notice/consent on forms

---

## **🎯 FORM FUNCTIONALITY & ERROR HANDLING**

### Missing Form Handlers
- [ ] Create backend endpoint for registration form
- [ ] Create backend endpoint for login form
- [ ] Create backend endpoint for contact form
- [ ] Create backend endpoint for checkout form
- [ ] Create backend endpoint for product review form
- [ ] Create backend endpoint for support enquiry form
- [ ] Create backend endpoint for health feedback form
- [ ] Add form submission handlers (currently all forms have `action=""`)

### Error Handling
- [ ] Add try-catch blocks for all API calls
- [ ] Add user-friendly error messages for failed submissions
- [ ] Add loading states for form submissions (disable button, show spinner)
- [ ] Add success toast/alert notifications after form submission
- [ ] Implement form reset after successful submission
- [ ] Add server-side validation error display
- [ ] Add empty state messages for empty results
- [ ] Add fallback messages when products fail to load

### Cart & Checkout
- [ ] Add event listener to "Add to Cart" button (currently no handler)
- [ ] Validate cart items before checkout
- [ ] Add quantity validation (1-99 range)
- [ ] Add inventory check before allowing purchase
- [ ] Implement proper checkout form submission
- [ ] Add order confirmation page
- [ ] Show error if cart is empty before checkout
- [ ] Add payment gateway integration

---

## **♿ ACCESSIBILITY**

### ARIA & Semantic HTML
- [ ] Add `aria-label` to icon-only buttons (search, cart, user, menu icons)
- [ ] Add `role` attributes where needed
- [ ] Add `aria-live` regions for dynamic content updates
- [ ] Ensure all form inputs have associated `<label>` elements
- [ ] Add `aria-describedby` for error messages
- [ ] Add fieldset/legend for form groups

### Keyboard Navigation
- [ ] Test all pages with keyboard-only navigation
- [ ] Add visible focus indicators to all interactive elements
- [ ] Ensure tab order is logical
- [ ] Add skip-to-content link

### Images & Content
- [ ] Add meaningful alt text to all images (especially product images)
- [ ] Add alt text to GIF animations
- [ ] Ensure color contrast meets WCAG AA standards
- [ ] Add captions/transcripts for any video content

---

## **🎨 UI/UX & RESPONSIVE DESIGN**

### Responsive Design
- [ ] Improve mobile view (only basic media query in quick.css)
- [ ] Add tablet-specific breakpoints
- [ ] Test on various screen sizes
- [ ] Fix header responsiveness on mobile
- [ ] Improve form input sizes for mobile (touch targets)
- [ ] Test cart layout on mobile

### Visual Consistency
- [ ] Consolidate CSS files (multiple overlapping style files)
- [ ] Standardize button styles across all pages
- [ ] Standardize form input styles
- [ ] Create consistent color scheme
- [ ] Add consistent spacing/padding standards
- [ ] Remove duplicate CSS rules

### User Experience
- [ ] Add confirmation dialog before removing cart items
- [ ] Add confirmation before placing order
- [ ] Add loading indicator for product fetch
- [ ] Add "back to products" button on product detail page
- [ ] Add product quantity selector feedback
- [ ] Improve form validation messaging (clear which field failed and why)

---

## **⚡ PERFORMANCE**

### JavaScript Optimization
- [ ] Remove jQuery dependency from form-values.js (jQuery not loaded on any page)
- [ ] Eliminate duplicate script loads
- [ ] Lazy load Swiper library (only load on pages that use it)
- [ ] Minimize digital-data-helper.js (very large file)
- [ ] Combine multiple cart.js calls into single file
- [ ] Add script defer/async attributes where appropriate

### Asset Optimization
- [ ] Optimize and compress images (especially product thumbnails)
- [ ] Add image lazy loading
- [ ] Minimize CSS files
- [ ] Minimize JavaScript files
- [ ] Consider using CSS variables for colors/spacing

### Caching & HTTP
- [ ] Add proper cache headers in .htaccess
- [ ] Implement browser caching for static assets
- [ ] Add compression (gzip) settings

---

## **📱 PRODUCT & SHOPPING FEATURES**

### Product Browsing
- [ ] Implement product search functionality (search.html)
- [ ] Add product filtering by category
- [ ] Add product sorting (price, rating, popularity)
- [ ] Add product pagination on products listing page
- [ ] Add "similar products" recommendations
- [ ] Fix "add to cart" button handler on product detail page
- [ ] Add product image gallery/zoom on product detail page
- [ ] Make product images clickable to view details

### Review & Rating System
- [ ] Create backend for storing product reviews
- [ ] Display average rating on product listing
- [ ] Display user reviews on product detail page
- [ ] Add helpful/unhelpful voting on reviews
- [ ] Moderate reviews before publishing
- [ ] Show verified buyer badge on reviews

### Cart & Checkout
- [ ] Add edit quantity functionality in cart
- [ ] Add "continue shopping" button
- [ ] Implement proper total calculation
- [ ] Add discount/coupon code field
- [ ] Add tax calculation
- [ ] Implement payment gateway
- [ ] Add multiple payment methods
- [ ] Add order tracking page
- [ ] Send order confirmation email

---

## **👤 USER AUTHENTICATION & ACCOUNTS**

### Authentication
- [ ] Implement user registration authentication
- [ ] Implement login authentication
- [ ] Implement logout functionality
- [ ] Add "remember me" option
- [ ] Implement "forgot password" functionality
- [ ] Add email verification for registration
- [ ] Add session management
- [ ] Implement user dashboard/profile page

### User Profile
- [ ] Create user profile page
- [ ] Add ability to update profile information
- [ ] Add saved addresses feature
- [ ] Add order history page
- [ ] Add wishlist functionality
- [ ] Add preferences/settings page

---

## **📧 EMAIL & NOTIFICATIONS**

### Email System
- [ ] Setup email service for form submissions
- [ ] Send confirmation emails after registration
- [ ] Send order confirmation emails
- [ ] Send shipping notification emails
- [ ] Send delivery confirmation emails
- [ ] Add email verification links
- [ ] Add password reset emails
- [ ] Implement contact form email notifications

### Notifications
- [ ] Add toast notifications for user actions
- [ ] Add success messages after form submissions
- [ ] Add error alerts for failed operations
- [ ] Add email opt-in/opt-out options

---

## **📊 ANALYTICS & TRACKING**

### Adobe Target/Analytics
- [ ] Complete Adobe Target integration setup
- [ ] Verify all form tracking is working
- [ ] Add page view tracking for thank-you page
- [ ] Add conversion tracking for orders
- [ ] Track cart abandonment
- [ ] Track product view to purchase journey
- [ ] Add debug mode for development
- [ ] Test VEC (Visual Experience Composer) functionality

### Error Tracking
- [ ] Implement error logging/monitoring
- [ ] Add stack trace capture for JavaScript errors
- [ ] Monitor failed form submissions
- [ ] Alert on critical errors

---

## **📝 COMPLIANCE & LEGAL**

### Legal Pages
- [ ] Create Privacy Policy page
- [ ] Create Terms & Conditions page
- [ ] Create Return/Refund Policy page
- [ ] Create Disclaimer page (important for pharmacy)
- [ ] Create Medical Disclaimer
- [ ] Add GDPR consent banner
- [ ] Add cookies consent banner

### Content & Branding
- [ ] Standardize pharmacy name across all pages
- [ ] Update all contact information consistently
- [ ] Update Copyright year to 2025/2026
- [ ] Review all product information for accuracy
- [ ] Add dosage disclaimers
- [ ] Add "consult doctor" warnings where needed

---

## **🧪 TESTING & QUALITY**

### Testing Checklist
- [ ] Add unit tests for JavaScript functions
- [ ] Add integration tests for form submissions
- [ ] Test all forms with various inputs (edge cases)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile device testing
- [ ] Test on slow network (throttle in DevTools)
- [ ] Performance audit with Lighthouse
- [ ] Accessibility audit (axe, WAVE tools)
- [ ] Security scan for vulnerabilities

### Documentation
- [ ] Add JSDoc comments to JavaScript functions
- [ ] Create API documentation for endpoints
- [ ] Create setup/deployment guide
- [ ] Document database schema
- [ ] Add troubleshooting guide

---

## **🔧 DEVELOPMENT SETUP**

### Environment & Dependencies
- [ ] Remove unused form-values.js or add jQuery where needed
- [ ] Document all external CDN dependencies
- [ ] Create package.json with proper dependencies
- [ ] Add .gitignore file
- [ ] Create environment configuration files
- [ ] Add build process for minification
- [ ] Setup development server

---

## **Priority Recommendations:**

### **HIGH PRIORITY** (Critical for functionality and security)
1. Fix broken links (search.html), implement form submission backends, add form validation
2. Fix security issues (CSRF, input sanitization, password handling)
3. Create missing pages (search.html, thanks.html)

### **MEDIUM PRIORITY** (Important for user experience)
4. Implement missing features (search, thank-you page, auth)
5. Fix accessibility issues, add error handling
6. Improve responsive design and mobile experience

### **LOW PRIORITY** (Nice-to-have improvements)
7. Performance optimizations, analytics refinement, UI polish
8. Testing and documentation
9. Legal compliance pages

---

*Generated on: March 20, 2026*
*Total items: 150+ improvements identified*