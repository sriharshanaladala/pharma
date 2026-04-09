# Nomad Pharma - Enhanced Data Layer Guide

## Overview
The enhanced data layer captures comprehensive user, session, device, and behavioral data for Adobe Target personalization, analytics, and optimization.

---

## Data Layer Structure

### 1. **Page Information** (`digitalData.page`)
Automatically captured for each page load:
- `pageName`: Human-readable page name (e.g., "Nomad Pharma | Home")
- `pageType`: Page category (home, plp, pdp, cart, checkout, form, etc.)
- `siteSection`: Primary site area (consumer, hcp)
- `subSection`: Secondary categorization
- `language`: Page language (en)
- `country`: Page country (US)
- `templateName`: Template used for the page

**Use for:** Page-level segmentation and reporting, content targeting

---

### 2. **User Profile** (`digitalData.user.profile`)
Dynamic user identification and behavior:
- `loginStatus`: "logged-in" or "anonymous"
- `userType`: "consumer" or "hcp" (Healthcare Provider)
- `userId`: Unique user identifier (if logged in)
- `email`: User email address (if available)

**Use for:** User segmentation, personalized recommendations, loyalty programs

---

### 3. **Session Data** (`digitalData.session`)
Tracks user's current visit:
- `sessionId`: Unique session identifier
- `visitorId`: Persistent visitor identifier (cross-session)
- `visitNumber`: How many times user has visited

**Example:**
```javascript
digitalData.session = {
  sessionId: "session_1708345600000_abc123",
  visitorId: "visitor_1234567890_xyz789",
  visitNumber: 5
}
```

**Use for:** Session-based analysis, returning visitor identification, frequency capping

---

### 4. **Device & Browser Info** (`digitalData.device`)
Client environment details:
- `type`: "mobile" | "tablet" | "desktop"
- `osName`: Operating system (Windows, MacOS, Linux, Android, iOS)
- `browserName`: Browser type (Chrome, Firefox, Safari, Edge)
- `screenWidth`: Device screen width in pixels
- `screenHeight`: Device screen height in pixels
- `language`: Browser language preference

**Example:**
```javascript
digitalData.device = {
  type: "mobile",
  osName: "iOS",
  browserName: "Safari",
  screenWidth: 390,
  screenHeight: 844,
  language: "en-US"
}
```

**Use for:** Device-based personalization, responsive design optimization, mobile/desktop targeting

---

### 5. **Traffic Source** (`digitalData.trafficSource`)
How users arrived at the site:
- `source`: Traffic source (utm_source or referrer domain)
- `medium`: Traffic medium (utm_medium)
- `campaign`: Campaign name (utm_campaign)
- `content`: Campaign content variant (utm_content)
- `term`: Search term if applicable (utm_term)
- `referrer`: HTTP referer URL

**Example:**
```javascript
digitalData.trafficSource = {
  source: "google",
  medium: "cpc",
  campaign: "summer_sale_2024",
  content: "banner_ad_01",
  term: "best antibiotics",
  referrer: "https://google.com/search?q=..."
}
```

**Use for:** Attribution modeling, channel performance analysis, campaign ROI

---

### 6. **Page Performance** (`digitalData.pagePerformance`)
Load time metrics for optimization:
- `pageLoadTime`: Total page load time (ms)
- `domReadyTime`: DOM ready time (ms)
- `resourceLoadTime`: Time to load resources (ms)
- `firstContentfulPaint`: Time to first paint (ms)

**Example:**
```javascript
digitalData.pagePerformance = {
  pageLoadTime: 2340,
  domReadyTime: 1200,
  resourceLoadTime: 1140,
  firstContentfulPaint: 850
}
```

**Use for:** Performance optimization, CDN analysis, server-side improvements

---

### 7. **Product Information** (`digitalData.product.productInfo`)
Dynamic product data (auto-extracted from page or URL):
- `productName`: Product name/title
- `productId`: Product SKU/ID (extracted from ?id=parameter)
- `indication`: Product indication/description

**How to populate on PDP:**
```html
<h1 data-product-name="Aspirin 500mg" data-indication="Pain relief and fever reduction">
  Aspirin 500mg
</h1>
```

Or add product ID via URL: `product.html?id=ASP-500-100`

**Use for:** Product-based targeting, recommendation engines, A/B testing products

---

### 8. **Cart Data** (`digitalData.cart`)
Shopping cart status (only added if cart has items):
- `cartInfo.cartCount`: Number of items in cart
- `cartInfo.cartTotal`: Total cart value
- `cartInfo.cartValue`: Cart value (INR)
- `cartInfo.currency`: Currency code
- `cartItems`: Array of product objects in cart

**Example:**
```javascript
digitalData.cart = {
  cartInfo: {
    cartCount: 3,
    cartTotal: 1500,
    cartValue: 1500,
    currency: "INR"
  },
  cartItems: [
    { id: "ASP-500", name: "Aspirin", price: 300, quantity: 2 },
    { id: "VIT-C-1000", name: "Vitamin C", price: 900, quantity: 1 }
  ]
}
```

**Use for:** Cart abandonment campaigns, revenue prediction, product affinity

---

### 9. **Customer History** (`digitalData.customer`)
Historical user behavior data:

#### Purchase History
```javascript
digitalData.customer.purchaseHistory = {
  totalOrders: 5,
  totalSpent: 5000,
  lastOrderDate: "2024-02-15",
  orderIds: ["ORD-001", "ORD-002", "ORD-003"]
}
```

#### Search History
```javascript
digitalData.customer.searchHistory = {
  lastSearch: "antibiotics",
  searchCount: 23,
  topSearches: ["antibiotics", "vitamins", "pain relief"]
}
```

#### Most Viewed Products
```javascript
digitalData.customer.mostViewedProducts = [
  { id: "ASP-500", name: "Aspirin", views: 12 },
  { id: "VIT-C-1000", name: "Vitamin C", views: 8 },
  { id: "BANDAGE", name: "Bandages", views: 6 }
]
```

**Use for:** Personalized recommendations, lookalike modeling, behavioral targeting

---

### 10. **User Consent** (`digitalData.consent`)
Privacy and tracking preferences:
- `analytics`: Allow analytics tracking (true/false)
- `marketing`: Allow marketing communications (true/false)
- `personalization`: Allow personalization (true/false)

**Use for:** GDPR/privacy compliance, consent-based personalization

---

### 11. **A/B Test Info** (`digitalData.test`)
Currently active experiments:
```javascript
digitalData.test = {
  testId: "test_hero_banner_v2",
  testName: "Hero Banner Variation",
  variant: "variant_b",
  startDate: "2024-02-01"
}
```

**Use for:** A/B test analysis, variant attribution, experiment reporting

---

### 12. **Behavior Tracking** (Via Session Storage)
Real-time behavioral metrics:
- `maxScroll`: Maximum scroll depth percentage (0-100)
- `timeOnPage`: Time spent on current page
- `clickCount`: Number of interactions

Accessed via: `sessionStorage.getItem('maxScroll')`

**Use for:** Engagement metrics, content effectiveness, UX optimization

---

### 13. **Form Attributes** (`digitalData.form`)
Tracks form-related information and user interactions with forms on the page:

#### Form Context Object
```
javascript
window.formContext = {
  formName: "",          // Human-readable form name
  stepName: "",         // Current interaction step
  fieldName: "",        // Current field being interacted with
  fieldValue: "",       // Value of the field
  formId: "",           // HTML ID of the form
  pageUrl: "",          // Page URL where form is located
  timestamp: "",        // ISO timestamp of interaction
  formsDetected: []     // Array of all forms found on page
}
```

#### Form Name Map
Automatically maps form IDs to readable names:
| Form ID | Form Name |
|---------|-----------|
| `health-interests-form` | Health Interests Survey |
| `support-enquiry-form` | Support Enquiry |
| `health-feedback-form` | Health Feedback |
| `review-form` | Product Review |
| `symptoms-enquiry-form` | Symptoms Enquiry |
| `order-search-form` | Order Search |
| `filter-form` | Product Filter |
| `checkout-form` | Checkout |
| `contact-form` | Contact Us |
| `register-form` | User Registration |
| `login-form` | User Login |

#### Interaction Steps (`stepName`)
Tracks the type of user interaction:
- `page_loaded`: Form detected on page load
- `focus`: User focused on a field
- `input`: User typing in text field
- `change`: User changed select/checkbox/radio
- `blur`: User left a field
- `submit`: Form submitted

#### Forms Detected Array
```
javascript
digitalData.form.formsDetected = [
  { index: 1, id: "login-form", name: "User Login" },
  { index: 2, id: "search-form", name: "Product Search" }
]
```

**Example - Form Field Focus:**
```
javascript
// When user focuses on email field
window.formContext = {
  formName: "User Login",
  formId: "login-form",
  stepName: "focus",
  fieldName: "email",
  fieldValue: "",
  pageUrl: "/login.html",
  timestamp: "2024-02-15T10:30:00.000Z"
}
```

**Example - Form Submission:**
```
javascript
// When user submits the form
window.formContext = {
  formName: "User Login",
  formId: "login-form",
  stepName: "submit",
  fieldName: "form_submission",
  fieldValue: "{\"email\":\"user@example.com\",\"password\":\"***\"}",
  pageUrl: "/login.html",
  timestamp: "2024-02-15T10:32:00.000Z"
}
```

**Use for:** Form abandonment analysis, field-level validation tracking, form optimization, UX improvements

---

## Implementation Examples

### Log In User
When a user logs in, update the data layer:
```javascript
// After successful login
const userData = {
  id: "USER-12345",
  email: "user@example.com",
  userType: "consumer"
};
localStorage.setItem('user', JSON.stringify(userData));

// Manually refresh data layer
window.updateDigitalData({
  user: {
    profile: {
      loginStatus: 'logged-in',
      userId: userData.id,
      email: userData.email
    }
  }
});
```

### Track Add to Cart Event
```javascript
// When product is added to cart
window.trackEvent('add_to_cart', {
  productId: 'ASP-500',
  productName: 'Aspirin 500mg',
  price: 300,
  quantity: 2
});
```

### Track Search
```javascript
// When user searches
const searchTerm = document.getElementById('searchInput').value;

// Save to search history
let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
searchHistory.push(searchTerm);
localStorage.setItem('searchHistory', JSON.stringify(searchHistory));

// Track event
window.trackEvent('search', {
  searchTerm: searchTerm,
  resultsCount: 23
});
```

### Track Purchase
```javascript
// After successful order
const orderData = {
  id: 'ORD-' + Date.now(),
  total: 1500,
  items: [
    { id: 'ASP-500', quantity: 2, price: 300 },
    { id: 'VIT-C-1000', quantity: 1, price: 900 }
  ],
  date: new Date().toISOString()
};

let orders = JSON.parse(localStorage.getItem('orders')) || [];
orders.push(orderData);
localStorage.setItem('orders', JSON.stringify(orders));

window.trackEvent('purchase', orderData);
```

---

## Functions Available

### `window.updateDigitalData(updates)`
Manually update any part of the data layer:
```javascript
window.updateDigitalData({
  user: { profile: { loginStatus: 'logged-in' } },
  consent: { marketing: true }
});
```

### `window.trackPageView(customData)`
Trigger page view event:
```javascript
window.trackPageView({
  customParam: 'value'
});
```

### `window.trackEvent(eventName, eventData)`
Track custom events:
```javascript
window.trackEvent('wishlist_add', {
  productId: 'VIT-C-1000',
  productName: 'Vitamin C'
});
```

---

## Data Storage (localStorage Keys)

| Key | Purpose | Format |
|-----|---------|--------|
| `user` | User profile | JSON object |
| `cart` | Shopping cart | JSON array |
| `orders` | Purchase history | JSON array |
| `searchHistory` | Search history | JSON array |
| `userConsent` | Privacy preferences | JSON object |
| `productViews` | Product view counts | JSON array |
| `visitCount` | Total visits | Number |
| `visitorId` | Persistent visitor ID | String |

---

## Adobe Target Integration

The data layer automatically integrates with Adobe Target for:

1. **Audience Segmentation**: Target audiences based on user profile, device, traffic source
2. **Personalization**: Show different experiences based on purchase history, behavior
3. **Activity Reporting**: Use data layer variables for activity reporting
4. **Automated Personalization**: ML models trained on behavioral data

### Example Target Audience

```javascript
// Target: "Mobile Users from Google Ads"
// Conditions:
// - device.type == "mobile"
// - trafficSource.source == "google"
// - trafficSource.medium == "cpc"
```

---

## Best Practices

1. **Keep Sensitive Data Minimal**: Don't store passwords or full credit cards
2. **Update on Events**: Call `window.updateDigitalData()` after important actions
3. **Monitor Console**: Check browser console for "Digital Data initialized" message
4. **Test in Dev Tools**: Use `console.log(digitalData)` to verify data structure
5. **Regular Audits**: Review collected data quarterly for accuracy
6. **Consent First**: Respect user consent preferences before tracking

---

## Troubleshooting

### Data Layer Empty
```javascript
// Check if digital-data-helper.js is loaded after digitalData definition
console.log(digitalData);
```

### Performance Metrics Missing
```javascript
// Only available after page fully loads
setTimeout(() => console.log(digitalData.pagePerformance), 2000);
```

### Session Not Persisting
```javascript
// Sessions are stored in sessionStorage, so clear browser session resets them
sessionStorage.getItem('sessionId')
```

---

## Contact & Support
For questions about data layer implementation, consult your Adobe Target or analytics team.
