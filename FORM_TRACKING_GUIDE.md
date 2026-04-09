# Form Tracking & Data Layer Implementation Guide

## Overview

This guide explains how the new form tracking system works with the formContext structure and automated dataLayer event pushing.

---

## 📋 FormContext Structure

The `window.formContext` object tracks all form-related information:

```javascript
window.formContext = {
  // Form information
  form: {
    formId: "symptoms-enquiry-form",        // unique identifier
    formName: "Symptoms Enquiry",           // readable name
    formType: "enquiry",                    // optional: lead, signup, enquiry, survey, etc.
    step: "load",                           // load | start | submit
    stepName: "page_loaded",                // readable step name
    pageUrl: "http://example.com/symptoms" // current page URL
  },

  // Last user interaction
  interaction: {
    fieldName: "email",                     // last interacted field
    fieldValue: "user@example.com",         // optional (avoid PII in production)
    interactionType: "focus"                // focus | change | submit
  },

  // Form completion tracking
  fields: {
    totalFields: 10,                        // total input fields
    filledFields: 3                         // currently filled fields
  },

  // Form errors
  errors: {
    errorType: "validation",                // validation | system
    errorMessage: "Email is required",      // error description
    errorCode: "VALIDATION_ERROR"           // error code
  },

  // Metadata
  meta: {
    timestamp: "2026-04-09T12:34:56.789Z"   // ISO timestamp
  }
};
```

---

## 🟢 Automatic Events

### 1. **formLoad** - Triggered on Page Load

When the page loads and forms are detected:

```javascript
// Automatically triggers
DataLayerHelper.pushFormLoad(window.formContext);

// DataLayer event:
{
  event: "formLoad",
  formContext: {
    form: {
      formId: "symptoms-enquiry-form",
      formName: "Symptoms Enquiry",
      step: "load",
      stepName: "page_loaded",
      ...
    },
    fields: {
      totalFields: 10,
      filledFields: 0
    },
    ...
  }
}
```

**When:** Immediately when DOM is ready and forms are detected

---

### 2. **formStart** - Triggered on First Interaction

When user first interacts with any form field:

```javascript
// Automatically triggers on first field focus
DataLayerHelper.pushFormStart(window.formContext);

// DataLayer event:
{
  event: "formStart",
  formContext: {
    form: {
      formId: "symptoms-enquiry-form",
      step: "start",
      stepName: "form_started"
    },
    ...
  }
}
```

**When:** On first user interaction (focus on any form field)

---

### 3. **formFieldInteraction** - Triggered on Field Events

Fires for focus, change, and input events:

```javascript
// Focus event
{
  event: "formFieldInteraction",
  formContext: {
    form: { step: "start", stepName: "field_focus" },
    interaction: {
      fieldName: "email",
      fieldValue: "user@",
      interactionType: "focus"
    },
    fields: { filledFields: 2 }
  }
}

// Change event
{
  event: "formFieldInteraction",
  formContext: {
    form: { step: "start", stepName: "field_change" },
    interaction: {
      fieldName: "country",
      fieldValue: "United States",
      interactionType: "change"
    }
  }
}

// Input event (text typing)
{
  event: "formFieldInteraction",
  formContext: {
    interaction: {
      fieldName: "firstName",
      fieldValue: "John",
      interactionType: "change"
    }
  }
}
```

**When:** Continuously as user interacts with form fields

---

### 4. **formError** - Triggered on Validation Errors

Fires when HTML5 validation fails or custom validation error occurs:

```javascript
// HTML5 validation error
{
  event: "formError",
  formContext: {
    form: { stepName: "field_error" },
    interaction: { fieldName: "email" },
    errors: {
      errorType: "validation",
      errorMessage: "Please enter a valid email",
      errorCode: "VALIDATION_ERROR"
    }
  }
}

// System error
{
  event: "formError",
  formContext: {
    errors: {
      errorType: "system",
      errorMessage: "Failed to submit form",
      errorCode: "SUBMIT_ERROR_500"
    }
  }
}
```

**When:** When validation fails or system errors occur

---

### 5. **formSubmit** - Triggered on Form Submission

Fires when form is submitted:

```javascript
{
  event: "formSubmit",
  formContext: {
    form: {
      step: "submit",
      stepName: "form_submitted"
    },
    interaction: {
      interactionType: "submit"
    },
    fields: {
      totalFields: 10,
      filledFields: 8
    },
    submittedFormData: {
      firstName: "John",
      email: "john@example.com",
      // ... all form fields
    }
  }
}
```

**When:** When user submits the form

---

## 📊 Accessing DataLayer

### View All Events

```javascript
// Show all dataLayer events in console
window.showDataLayer();

// Or directly access
console.log(window.dataLayer);
```

### Get Specific Events

```javascript
// Get all "formSubmit" events
const submitEvents = window.getDataLayerEvents('formSubmit');

// Get all formLoad events
const loadEvents = window.getDataLayerEvents('formLoad');

// Get all events
const allEvents = window.getDataLayer();
```

### Count Events by Type

```javascript
const dataLayer = window.getDataLayer();
const eventCounts = {};

dataLayer.forEach(item => {
  if (item.event) {
    eventCounts[item.event] = (eventCounts[item.event] || 0) + 1;
  }
});

console.table(eventCounts);
```

---

## 🔍 Debugging & Monitoring

### Show Form Context

```javascript
window.showFormContext();
```

Shows current form context structure:
- Form information
- Current interaction
- Field counts
- Errors
- Detected forms on page

### List All Forms on Page

```javascript
window.listFormsOnPage();

// Output:
// Form 1: ID="login-form", Fields: 2
// Form 2: ID="checkout-form", Fields: 8
```

### Show Complete Tracking Summary

```javascript
window.showTrackingSummary();
```

Shows both form context and all dataLayer events.

### Manual Form Tracking Initialization

```javascript
// If forms are added dynamically after page load
window.initializeFormTracking();
```

### Reset Form Context

```javascript
window.resetFormContext();
```

Clears all form tracking data.

### Clear DataLayer Events

```javascript
window.clearDataLayer();
```

---

## 🔧 Setting Up Forms

### 1. Add Form ID & Name

```html
<form id="symptoms-enquiry-form" data-form-name="Symptoms Enquiry" data-form-type="enquiry">
  <!-- form fields -->
</form>
```

**Supported Form IDs:**
- `health-interests-form`
- `support-enquiry-form`
- `health-feedback-form`
- `review-form`
- `symptoms-enquiry-form`
- `order-search-form`
- `filter-form`
- `checkout-form`
- `contact-form`
- `register-form`
- `login-form`

### 2. Name Your Form Fields

```html
<input type="text" name="firstName" id="firstName" required />
<input type="email" name="email" id="email" required />
<textarea name="symptoms" id="symptoms"></textarea>
<select name="country" id="country"></select>
```

### 3. Include Digital Data Helper

```html
<script src="js/digital-data-helper.js"></script>
```

Must be loaded **before** other form scripts.

---

## 📝 Form Field Validation

### Set Up HTML5 Validation

```html
<input 
  type="email" 
  name="email" 
  id="email"
  required
  aria-required="true"
/>

<input 
  type="tel" 
  name="phone"
  pattern="[0-9\-\+\(\)\s]+"
  title="Please enter a valid phone number"
/>
```

### Custom Validation Errors

```javascript
// Listen for validation errors
document.getElementById('email').addEventListener('invalid', function(e) {
  // This is automatically tracked with formError event
  // The error will be captured in window.formContext.errors
});
```

---

## 🚀 Integration with Analytics

### Send to Google Analytics

```javascript
// After dataLayer pushes events
gtag('event', 'form_event', {
  event_category: 'form',
  event_label: window.formContext.form.formName,
  value: window.formContext.fields.filledFields
});
```

### Send to Adobe Target

DataLayer events contain `formContext` which can be used by Adobe Target for personalization.

### Send to Your Server

```javascript
// Send all dataLayer events to your backend
window.getDataLayer().forEach(event => {
  fetch('/api/track-form-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event)
  });
});
```

---

## 📱 Example: Symptoms Enquiry Form

```html
<form id="symptoms-enquiry-form">
  <h2>Symptoms Enquiry</h2>
  
  <label for="name">Name:</label>
  <input type="text" id="name" name="name" required />

  <label for="email">Email:</label>
  <input type="email" id="email" name="email" required />

  <label for="symptoms">Your Symptoms:</label>
  <textarea id="symptoms" name="symptoms" required></textarea>

  <label for="duration">Duration:</label>
  <select id="duration" name="duration" required>
    <option value="">-- Select --</option>
    <option value="1week">Less than 1 week</option>
    <option value="1month">1 week to 1 month</option>
    <option value="3months">1 to 3 months</option>
  </select>

  <button type="submit">Submit Enquiry</button>
</form>

<script src="js/digital-data-helper.js"></script>
```

**Events fired:**
1. **formLoad** → On page load (0 fields filled)
2. **formStart** → When user clicks first field
3. **formFieldInteraction** → As user types name
4. **formFieldInteraction** → As user enters email
5. **formFieldInteraction** → When selecting duration
6. **formSubmit** → When clicking submit button

---

## ✅ Tracking Checklist

- [x] FormContext structure matches spec
- [x] formLoad fires on page load
- [x] formStart fires on first interaction
- [x] formFieldInteraction fires on focus/change
- [x] formError fires on validation errors
- [x] formSubmit fires on form submission
- [x] DataLayer events push correctly
- [x] Filled fields count updates dynamically
- [x] Form context persists in localStorage
- [x] Debug functions available in console

---

## 🔗 Helper Functions Reference

| Function | Purpose |
|----------|---------|
| `window.showFormContext()` | Display current form context |
| `window.showDataLayer()` | Display all dataLayer events |
| `window.getDataLayer()` | Get dataLayer array |
| `window.getDataLayerEvents(eventName)` | Filter events by name |
| `window.listFormsOnPage()` | List all forms detected |
| `window.showTrackingSummary()` | Show form context + dataLayer |
| `window.initializeFormTracking()` | Manually initialize tracking |
| `window.resetFormContext()` | Clear form context |
| `window.clearDataLayer()` | Clear dataLayer events |
| `window.clearFormContextStorage()` | Clear localStorage |

---

## 📞 Support

For issues or questions, check:
1. Console logs for errors
2. Use `window.showFormContext()` to verify structure
3. Use `window.showDataLayer()` to verify events
4. Ensure forms have proper IDs and field names
5. Verify `digital-data-helper.js` is loaded first
