# Form Tracking Quick Reference

## 🎯 Quick Setup

1. **Ensure form has an ID:**
```html
<form id="symptoms-enquiry-form">
  <!-- fields -->
</form>
```

2. **Ensure fields have name attributes:**
```html
<input name="email" type="email" required />
<textarea name="symptoms"></textarea>
```

3. **Load the tracking script:**
```html
<script src="js/digital-data-helper.js"></script>
```

**That's it! Tracking auto-starts.**

---

## 🟢 Events Fired Automatically

| Event | When | Data |
|-------|------|------|
| **formLoad** | Page load, forms detected | formId, totalFields, filledFields=0 |
| **formStart** | First field focus | formId, stepName="form_started" |
| **formFieldInteraction** | Field focus/change/input | fieldName, fieldValue, interactionType |
| **formError** | Validation fails | errorType, errorMessage, errorCode |
| **formSubmit** | Form submitted | step="submit", submittedFormData |

---

## 📊 Access DataLayer

```javascript
// View all events
window.showDataLayer();

// Get specific events
const submits = window.getDataLayerEvents('formSubmit');

// Count by event type
const events = window.getDataLayer();
```

---

## 🔍 Debug Commands

```javascript
// What forms are on this page?
window.listFormsOnPage();

// Show current form context
window.showFormContext();

// Show everything
window.showTrackingSummary();
```

---

## 📝 FormContext Structure

```javascript
window.formContext = {
  form: {
    formId: "symptoms-enquiry-form",
    formName: "Symptoms Enquiry",
    formType: "enquiry",
    step: "load|start|submit",
    stepName: "page_loaded|form_started|form_submitted",
    pageUrl: window.location.href
  },
  interaction: {
    fieldName: "email",
    fieldValue: "user@example.com",
    interactionType: "focus|change|submit"
  },
  fields: {
    totalFields: 10,
    filledFields: 3
  },
  errors: {
    errorType: "validation|system",
    errorMessage: "Email is required",
    errorCode: "VALIDATION_ERROR"
  },
  meta: {
    timestamp: "2026-04-09T12:34:56.789Z"
  }
}
```

---

## 🎬 Event Flow Example

```
User visits page with form
         ↓
   🟢 formLoad event pushed
         ↓
User focuses on email field
         ↓
   🟢 formStart event pushed (first time only)
   🟢 formFieldInteraction event pushed (focus)
         ↓
User types email
         ↓
   🟢 formFieldInteraction events pushed (input/change)
   ✓ filledFields count updates
         ↓
User selects from dropdown
         ↓
   🟢 formFieldInteraction event pushed
         ↓
User clicks submit
         ↓
   ✓ Validation fails
   🟢 formError event pushed
         ↓
User corrects field and resubmits
         ↓
   🟢 formSubmit event pushed (with all form data)
```

---

## 🔧 For Dynamic Forms

If forms are added after page load:

```javascript
// Re-initialize tracking
window.initializeFormTracking();
```

---

## 🚫 Resetting Data

```javascript
// Clear everything and start fresh
window.resetFormContext();
window.clearDataLayer();
window.clearFormContextStorage();

// Then reinitialize (if needed)
window.initializeFormTracking();
```

---

## 📱 Real-World Example

```html
<form id="symptoms-enquiry-form">
  <input type="text" name="firstName" required />
  <input type="email" name="email" required />
  <textarea name="description"></textarea>
  <select name="severity" required></select>
  <button type="submit">Send</button>
</form>

<script src="js/digital-data-helper.js"></script>

<script>
  // Check tracking is working
  setTimeout(() => {
    console.log('Form loaded:', window.getFormContext());
    console.log('Events so far:', window.getDataLayer());
  }, 1000);
</script>
```

---

## 💡 Tips

1. **Password fields are masked** - Shows as `***` in formContext
2. **Multiple checkboxes combine** - Values joined with ", "
3. **Data persists** - formContext saved in localStorage
4. **Auto-fires** - No coding needed, just include the script
5. **All fields tracked** - Even hidden fields and advanced inputs

---

## 📞 Troubleshooting

| Issue | Solution |
|-------|----------|
| No formLoad event | Check form exists before page load completes |
| formFieldInteraction not firing | Ensure field has proper name/id attribute |
| Form data not in context | Check field elements are inside `<form>` tag |
| Events not in dataLayer | Verify digital-data-helper.js loaded first |
| Data lost on reload | Restore from localStorage automatically |
