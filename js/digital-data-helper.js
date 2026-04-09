/**
 * Digital Data Helper - Dynamically populate digitalData object
 * This script should be loaded before Adobe Target
 * 
 * Tracks: User, Session, Page, Product, Cart, Performance, Device, Traffic, Behavior, Geo, Business Events
 */

/**
 * Global Form Context Object
 * Tracks form-related information across the application
 */
window.formContext = {
  form: {
    formId: "",
    formName: "",
    formType: "",                    // optional (lead, signup, enquiry, etc.)
    step: "load",                    // load | start | submit
    stepName: "initial",             // readable step
    pageUrl: window.location.href
  },

  interaction: {
    fieldName: "",                   // last interacted field
    fieldValue: "",                  // optional (avoid PII)
    interactionType: ""              // focus | change | submit
  },

  fields: {
    totalFields: 0,
    filledFields: 0                  // update dynamically
  },

  errors: {
    errorType: "",                   // validation / system
    errorMessage: "",
    errorCode: ""
  },

  meta: {
    timestamp: new Date().toISOString()
  },

  // Internal tracking
  formsDetected: [],
  allFormFields: {},
  submittedFormData: {}
};

// Try to restore form context from localStorage (only new structure)
function restoreFormContextFromStorage() {
  try {
    const saved = localStorage.getItem('formContext');
    if (saved) {
      const restoredContext = JSON.parse(saved);
      
      // Only restore if it has the new structure (form object)
      if (restoredContext && restoredContext.form && typeof restoredContext.form === 'object') {
        // Only copy the new structure properties
        window.formContext.form = restoredContext.form || window.formContext.form;
        window.formContext.interaction = restoredContext.interaction || window.formContext.interaction;
        window.formContext.fields = restoredContext.fields || window.formContext.fields;
        window.formContext.errors = restoredContext.errors || window.formContext.errors;
        window.formContext.meta = restoredContext.meta || window.formContext.meta;
        window.formContext.formsDetected = restoredContext.formsDetected || [];
        window.formContext.allFormFields = restoredContext.allFormFields || {};
        window.formContext.submittedFormData = restoredContext.submittedFormData || {};
        
        console.log('✓ Restored form context from storage (new structure)');
      } else {
        // Old structure - clear it
        console.warn('⚠️ Detected old formContext structure in localStorage, clearing...');
        localStorage.removeItem('formContext');
      }
    }
  } catch (e) {
    console.warn('Could not restore form context from storage:', e);
    localStorage.removeItem('formContext');
  }
}

// Restore context immediately
restoreFormContextFromStorage();

/**
 * Data Layer Helper - Push events to window.dataLayer
 */
const DataLayerHelper = {
  /**
   * Sensitive field patterns that require masking
   */
  sensitivePatterns: {
    email: /email|mail/i,
    phone: /phone|mobile|tel|contact|whatsapp/i,
    dob: /dob|birth|dateofbirth|date.of.birth|age/i,
    ssn: /ssn|social.security|tax.id/i,
    creditCard: /card|credit|debit|payment/i,
    password: /password|pwd|pass/i,
    address: /address|street|city|state|zip|postal|country|state/i,
    name: /realname|full.name|firstname|lastname|surname/i
  },

  /**
   * Check if a field is sensitive
   */
  isSensitiveField: function(fieldName) {
    if (!fieldName) return false;
    const nameLower = fieldName.toLowerCase();
    
    for (let type in this.sensitivePatterns) {
      if (this.sensitivePatterns[type].test(nameLower)) {
        return type;
      }
    }
    return false;
  },

  /**
   * Mask sensitive data
   */
  maskValue: function(value, fieldType) {
    if (!value) return '';
    const valueStr = String(value).trim();
    
    switch (fieldType) {
      case 'email':
        // Show first 3 chars + ****
        return valueStr.length > 3 
          ? valueStr.substring(0, 3) + '****' + valueStr.substring(valueStr.lastIndexOf('@'))
          : '****' + valueStr.substring(valueStr.lastIndexOf('@'));
      
      case 'phone':
        // Show last 4 digits only
        return valueStr.length > 4 
          ? '***' + valueStr.substring(valueStr.length - 4)
          : '****';
      
      case 'dob':
        // Show year only or mask completely
        return valueStr.length > 4 
          ? valueStr.substring(0, 4) + '-**-**'
          : '****-**-**';
      
      case 'ssn':
      case 'creditCard':
        // Show last 4 digits only
        return valueStr.length > 4 
          ? '*'.repeat(valueStr.length - 4) + valueStr.substring(valueStr.length - 4)
          : '****';
      
      case 'password':
        // Completely mask
        return '***';
      
      case 'address':
        // Show first word only
        const words = valueStr.split(' ');
        return words[0] + ' ***';
      
      case 'name':
        // Show first letter + asterisks
        return valueStr.charAt(0) + '*'.repeat(Math.max(3, valueStr.length - 1));
      
      default:
        return valueStr;
    }
  },

  /**
   * Push event to dataLayer
   */
  pushEvent: function(eventName, context) {
    if (!window.dataLayer) {
      window.dataLayer = [];
      console.log('✓ Created window.dataLayer');
    }
    
    const eventData = {
      event: eventName,
      formContext: JSON.parse(JSON.stringify(context))  // Deep copy to prevent mutations
    };
    
    window.dataLayer.push(eventData);
    console.log('📤 DataLayer Event:', eventName, eventData);
    console.table(eventData);
  },

  pushFormLoad: function(context) {
    this.pushEvent('formLoad', context);
  },

  pushFormStart: function(context) {
    this.pushEvent('formStart', context);
  },

  pushFormFieldInteraction: function(context) {
    this.pushEvent('formFieldInteraction', context);
  },

  pushFormError: function(context) {
    this.pushEvent('formError', context);
  },

  pushFormSubmit: function(context) {
    this.pushEvent('formSubmit', context);
  }
};

/**
 * Form Context Manager
 * Dynamically updates form context based on user interactions
 */
const FormContextManager = {
  
  // Map form IDs to form names and types
  formNameMap: {
    'health-interests-form': { name: 'Health Interests Survey', type: 'survey' },
    'support-enquiry-form': { name: 'Support Enquiry', type: 'enquiry' },
    'health-feedback-form': { name: 'Health Feedback', type: 'feedback' },
    'review-form': { name: 'Product Review', type: 'review' },
    'symptoms-enquiry-form': { name: 'Symptoms Enquiry', type: 'enquiry' },
    'order-search-form': { name: 'Order Search', type: 'search' },
    'filter-form': { name: 'Product Filter', type: 'filter' },
    'checkout-form': { name: 'Checkout', type: 'transaction' },
    'contact-form': { name: 'Contact Us', type: 'enquiry' },
    'register-form': { name: 'User Registration', type: 'signup' },
    'login-form': { name: 'User Login', type: 'login' }
  },

  // Track which forms have had formLoad event fired
  formLoadFired: {},
  formStartFired: {},

  /**
   * Initialize form tracking for all forms on the page
   */
  initializeFormTracking: function() {
    const self = this;
    const forms = document.querySelectorAll('form');
    
    console.log('📋 Found', forms.length, 'forms on the page');
    
    if (forms.length === 0) {
      console.warn('⚠️ No forms found on this page!');
      return;
    }
    
    // Store detected forms
    const detectedForms = [];
    
    forms.forEach((form, index) => {
      const formId = form.id || 'form-' + index;
      const formConfig = self.getFormConfig(form);
      const formName = formConfig.name;
      const formType = formConfig.type;
      
      detectedForms.push({
        index: index + 1,
        id: formId,
        name: formName,
        type: formType
      });
      
      console.log(`📝 Form ${index + 1}: ID="${formId}", Name="${formName}", Type="${formType}"`);
      
      // Get all input, textarea, and select elements in the form
      const formElements = form.querySelectorAll('input, textarea, select');
      console.log(`   - Found ${formElements.length} form elements`);
      
      // ✅ FORM LOAD EVENT - Fire on page load for each form
      self.setFormContext({
        formId: formId,
        formName: formName,
        formType: formType,
        step: 'load',
        stepName: 'page_loaded',
        totalFields: formElements.length,
        filledFields: 0,
        fieldName: '',  // Clear field tracking on page load
        fieldValue: ''
      });
      
      // Push formLoad event to dataLayer
      DataLayerHelper.pushFormLoad(window.formContext);
      self.formLoadFired[formId] = true;
      
      formElements.forEach((element, elemIndex) => {
        const fieldName = element.name || element.id || 'field-' + elemIndex;
        
        // ✅ FORM START EVENT - Fire on first focus/change
        element.addEventListener('focus', function() {
          if (!self.formStartFired[formId]) {
            self.setFormContext({
              formId: formId,
              formName: formName,
              formType: formType,
              step: 'start',
              stepName: 'form_started'
            });
            DataLayerHelper.pushFormStart(window.formContext);
            self.formStartFired[formId] = true;
          }
          
          // ✅ FIELD INTERACTION EVENT - On Focus
          self.setFormContext({
            formId: formId,
            formName: formName,
            formType: formType,
            step: 'start',
            stepName: 'field_focus',
            fieldName: fieldName,
            fieldValue: this.type === 'password' ? '***' : (this.value || ''),
            interactionType: 'focus'
          });
          
          DataLayerHelper.pushFormFieldInteraction(window.formContext);
          self.updateFilledFieldsCount(form);
        });

        // ✅ FIELD INTERACTION EVENT - On Change
        element.addEventListener('change', function() {
          let fieldValue = this.value || '';
          
          // Handle multiple checkboxes with same name
          if (this.type === 'checkbox') {
            const checkboxes = form.querySelectorAll(`input[name="${this.name}"]:checked`);
            fieldValue = Array.from(checkboxes).map(cb => cb.value).join(', ');
          }
          
          self.setFormContext({
            formId: formId,
            formName: formName,
            formType: formType,
            step: 'start',
            stepName: 'field_change',
            fieldName: fieldName,
            fieldValue: this.type === 'password' ? '***' : fieldValue,
            interactionType: 'change'
          });
          
          DataLayerHelper.pushFormFieldInteraction(window.formContext);
          self.updateFilledFieldsCount(form);
        });

        // Input event for text inputs and textareas
        element.addEventListener('input', function() {
          self.setFormContext({
            formId: formId,
            formName: formName,
            formType: formType,
            step: 'start',
            stepName: 'field_input',
            fieldName: fieldName,
            fieldValue: this.type === 'password' ? '***' : (this.value || ''),
            interactionType: 'change'
          });
          
          self.updateFilledFieldsCount(form);
        });

        // ✅ FORM ERROR EVENT - On invalid input
        element.addEventListener('invalid', function(e) {
          e.preventDefault();
          const errorMessage = this.validationMessage || 'Invalid input';
          
          self.setFormContext({
            formId: formId,
            formName: formName,
            formType: formType,
            step: 'start',
            stepName: 'field_error',
            fieldName: fieldName,
            errorType: 'validation',
            errorMessage: errorMessage,
            errorCode: 'VALIDATION_ERROR'
          });
          
          DataLayerHelper.pushFormError(window.formContext);
          console.warn(`⚠️ Validation Error on field "${fieldName}": ${errorMessage}`);
        });
      });
      
      // ✅ FORM SUBMIT EVENT - Track form submission
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const allFormValues = {};
        const maskedFormValues = {};
        
        // Collect all form values
        for (let [key, value] of formData.entries()) {
          if (allFormValues[key]) {
            allFormValues[key] += ', ' + value;
          } else {
            allFormValues[key] = value;
          }
        }
        
        // Apply masking to submittedFormData for PII protection
        for (let [fieldName, fieldValue] of Object.entries(allFormValues)) {
          const fieldType = DataLayerHelper.isSensitiveField(fieldName);
          maskedFormValues[fieldName] = fieldType 
            ? DataLayerHelper.maskValue(fieldValue, fieldType)
            : fieldValue;
        }
        
        // Update form context with submit step
        self.setFormContext({
          formId: formId,
          formName: formName,
          formType: formType,
          step: 'submit',
          stepName: 'form_submitted',
          interactionType: 'submit'
        });
        
        // Store masked form data
        window.formContext.submittedFormData = {...maskedFormValues};
        
        // Push formSubmit event to dataLayer
        DataLayerHelper.pushFormSubmit(window.formContext);
        
        console.log('✅ Form submitted:', {formName, formId});
        console.log('📋 Original form data (not sent):', allFormValues);
        console.log('🔒 Masked form data (sent):', maskedFormValues);
        console.log('📊 Complete form context:', window.formContext);
      });
    });
    
    // Update form context with detected forms
    window.formContext.formsDetected = detectedForms;
    self.saveFormContextToStorage();
    
    console.log('✓ Form tracking initialized successfully');
  },

  /**
   * Get form config from form ID mapping or detect from form
   */
  getFormConfig: function(form) {
    const formId = form.id;
    const mapped = this.formNameMap[formId];
    
    if (mapped) {
      return mapped;
    }
    
    // Try to get from form's data attributes
    const name = form.dataset.formName || this.getFormNameFromDOM(form);
    const type = form.dataset.formType || 'enquiry';
    
    return { name: name, type: type };
  },

  /**
   * Get form name from DOM elements
   */
  getFormNameFromDOM: function(form) {
    // Try to get from first heading in form
    const heading = form.querySelector('h1, h2, h3, h4');
    if (heading) {
      return heading.textContent.trim();
    }
    
    return form.className || 'Unknown Form';
  },

  /**
   * Set form context with the new structure
   */
  setFormContext: function(updates) {
    // Update form section
    if (updates.formId) window.formContext.form.formId = updates.formId;
    if (updates.formName) window.formContext.form.formName = updates.formName;
    if (updates.formType) window.formContext.form.formType = updates.formType;
    if (updates.step) window.formContext.form.step = updates.step;
    if (updates.stepName) window.formContext.form.stepName = updates.stepName;
    window.formContext.form.pageUrl = window.location.href;
    
    // Update interaction section with PII masking
    if (updates.fieldName) window.formContext.interaction.fieldName = updates.fieldName;
    if (updates.fieldValue !== undefined) {
      const fieldType = DataLayerHelper.isSensitiveField(updates.fieldName);
      const maskedValue = fieldType 
        ? DataLayerHelper.maskValue(updates.fieldValue, fieldType)
        : updates.fieldValue;
      window.formContext.interaction.fieldValue = maskedValue;
    }
    if (updates.interactionType) window.formContext.interaction.interactionType = updates.interactionType;
    
    // Update allFormFields ONLY when fieldName is a real form field (not metadata) - WITH MASKING
    if (updates.fieldName && updates.fieldValue !== undefined && 
        updates.fieldName !== '' && !updates.fieldName.includes('_')) {
      const fieldType = DataLayerHelper.isSensitiveField(updates.fieldName);
      const maskedValue = fieldType 
        ? DataLayerHelper.maskValue(updates.fieldValue, fieldType)
        : updates.fieldValue;
      window.formContext.allFormFields[updates.fieldName] = maskedValue;
    }
    
    // Update fields section
    if (updates.totalFields !== undefined) window.formContext.fields.totalFields = updates.totalFields;
    if (updates.filledFields !== undefined) window.formContext.fields.filledFields = updates.filledFields;
    
    // Update errors section
    if (updates.errorType) window.formContext.errors.errorType = updates.errorType;
    if (updates.errorMessage) window.formContext.errors.errorMessage = updates.errorMessage;
    if (updates.errorCode) window.formContext.errors.errorCode = updates.errorCode;
    
    // Update meta
    window.formContext.meta.timestamp = new Date().toISOString();
    
    // Save to localStorage
    this.saveFormContextToStorage();
  },

  /**
   * Update filled fields count and track actual field values with PII masking
   */
  updateFilledFieldsCount: function(form) {
    const formId = form.id || 'form-0';
    const formElements = form.querySelectorAll('input, textarea, select');
    let filledCount = 0;
    
    // Clear and rebuild allFormFields with actual values
    window.formContext.allFormFields = {};
    
    formElements.forEach(element => {
      const fieldName = element.name || element.id || element.className;
      let fieldValue = '';
      
      if (element.type === 'checkbox' || element.type === 'radio') {
        if (element.checked) {
          filledCount++;
          fieldValue = element.value;
        }
      } else if (element.value.trim() !== '') {
        filledCount++;
        fieldValue = element.type === 'password' ? '***' : element.value;
      }
      
      // Only store in allFormFields if field has a value - WITH MASKING
      if (fieldValue) {
        const fieldType = DataLayerHelper.isSensitiveField(fieldName);
        const maskedValue = fieldType 
          ? DataLayerHelper.maskValue(fieldValue, fieldType)
          : fieldValue;
        window.formContext.allFormFields[fieldName] = maskedValue;
      }
    });
    
    window.formContext.fields.filledFields = filledCount;
    window.formContext.fields.totalFields = formElements.length;
  },

  /**
   * Save form context to localStorage
   */
  saveFormContextToStorage: function() {
    try {
      localStorage.setItem('formContext', JSON.stringify(window.formContext));
    } catch (e) {
      console.warn('Could not save form context to storage:', e);
    }
  },

  /**
   * Reset form context
   */
  resetFormContext: function() {
    window.formContext = {
      form: {
        formId: "",
        formName: "",
        formType: "",
        step: "load",
        stepName: "initial",
        pageUrl: window.location.href
      },
      interaction: {
        fieldName: "",
        fieldValue: "",
        interactionType: ""
      },
      fields: {
        totalFields: 0,
        filledFields: 0
      },
      errors: {
        errorType: "",
        errorMessage: "",
        errorCode: ""
      },
      meta: {
        timestamp: new Date().toISOString()
      },
      formsDetected: [],
      allFormFields: {},
      submittedFormData: {}
    };
    // Clear localStorage
    try {
      localStorage.removeItem('formContext');
    } catch (e) {
      console.warn('Could not clear form context from storage:', e);
    }
  },

  /**
   * Get current form context
   */
  getFormContext: function() {
    return {
      ...window.formContext,
      capturedAt: new Date().toISOString()
    };
  }
};

// Initialize form tracking when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing form tracking...');
    setTimeout(() => {
      FormContextManager.initializeFormTracking();
    }, 100);
  });
} else {
  console.log('DOM already loaded, initializing form tracking immediately...');
  setTimeout(() => {
    FormContextManager.initializeFormTracking();
  }, 100);
}

// Also expose global functions for manual initialization and debugging
window.initializeFormTracking = function() {
  console.log('Manual form tracking initialization called');
  FormContextManager.initializeFormTracking();
};

window.getFormContext = function() {
  return FormContextManager.getFormContext();
};

window.resetFormContext = function() {
  FormContextManager.resetFormContext();
  console.log('Form context reset');
};

// ✅ DataLayer Helper Functions
window.getDataLayer = function() {
  if (!window.dataLayer) {
    window.dataLayer = [];
  }
  return window.dataLayer;
};

window.showDataLayer = function() {
  console.group('📊 DataLayer Events');
  const dataLayer = window.getDataLayer();
  if (dataLayer.length === 0) {
    console.log('No events in dataLayer yet');
  } else {
    console.table(dataLayer);
  }
  console.groupEnd();
};

window.getDataLayerEvents = function(eventName = null) {
  const dataLayer = window.getDataLayer();
  if (!eventName) {
    return dataLayer;
  }
  return dataLayer.filter(item => item.event === eventName);
};

window.clearDataLayer = function() {
  window.dataLayer = [];
  console.log('✓ DataLayer cleared');
};

// Debug helper to show all data
window.showFormContext = function() {
  console.group('📋 Form Context Summary');
  console.table(window.formContext);
  if (window.formContext.formsDetected && window.formContext.formsDetected.length > 0) {
    console.group('📋 Forms Detected');
    console.table(window.formContext.formsDetected);
    console.groupEnd();
  }
  console.groupEnd();
};

// Auto-show forms found on page
window.listFormsOnPage = function() {
  const forms = document.querySelectorAll('form');
  console.group('📝 Forms on Page');
  forms.forEach((form, i) => {
    const formId = form.id || 'No ID';
    const formElements = form.querySelectorAll('input, textarea, select');
    console.log(`Form ${i + 1}: ID="${formId}", Fields: ${formElements.length}`);
  });
  console.groupEnd();
};

// Clear storage
window.clearFormContextStorage = function() {
  try {
    localStorage.removeItem('formContext');
    console.log('✓ Form context storage cleared');
  } catch (e) {
    console.warn('Could not clear storage:', e);
  }
};

// Summary of all tracking
window.showTrackingSummary = function() {
  console.group('📋 TRACKING SUMMARY');
  console.log('Form Context:', window.formContext);
  console.table(window.getDataLayer());
  console.groupEnd();
};

// Show PII masking rules
window.showMaskingRules = function() {
  console.group('🔒 PII MASKING RULES');
  console.log(`
📧 Email: Shows first 3 chars + @domain
   Example: user@example.com → use****@example.com

📱 Phone: Shows last 4 digits only
   Example: 9010658712 → ***0658712

🗓️  Date of Birth: Shows year only
   Example: 01-15-1990 → 1990-**-**

🔐 Password: Completely masked
   Example: MyPassword123 → ***

💳 Credit Card: Shows last 4 digits only
   Example: 4532123456789012 → ****3456789012

🏠 Address: Shows first word only
   Example: 123 Main Street → 123 ***

👤 Name: Shows first letter only
   Example: John Doe → J***

SSN: Shows last 4 digits only
   Example: 123-45-6789 → ***45-6789
  `);
  console.groupEnd();
};

// Show what fields will be masked
window.checkFieldMasking = function(fieldName, fieldValue) {
  const fieldType = DataLayerHelper.isSensitiveField(fieldName);
  if (fieldType) {
    const masked = DataLayerHelper.maskValue(fieldValue, fieldType);
    console.log(`Field: ${fieldName}`);
    console.log(`Type: ${fieldType}`);
    console.log(`Original: ${fieldValue}`);
    console.log(`Masked: ${masked}`);
    return masked;
  } else {
    console.log(`Field "${fieldName}" is NOT sensitive - no masking applied`);
    return fieldValue;
  }
};

function initializeDigitalData() {
    // Get user data from localStorage
    const getLoginStatus = () => {
        const user = localStorage.getItem('user');
        return user ? 'logged-in' : 'anonymous';
    };

    const getUserType = () => {
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const userData = JSON.parse(user);
                return userData.userType || 'consumer';
            } catch (e) {
                return 'consumer';
            }
        }
        return 'consumer';
    };

    const getUserId = () => {
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const userData = JSON.parse(user);
                return userData.id || '';
            } catch (e) {
                return '';
            }
        }
        return '';
    };

    // Get user email
    const getUserEmail = () => {
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const userData = JSON.parse(user);
                return userData.email || '';
            } catch (e) {
                return '';
            }
        }
        return '';
    };

    // Get or create Session ID
    const getSessionId = () => {
        let sessionId = sessionStorage.getItem('sessionId');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('sessionId', sessionId);
        }
        return sessionId;
    };

    // Get visitor ID (create if doesn't exist)
    const getVisitorId = () => {
        let visitorId = localStorage.getItem('visitorId');
        if (!visitorId) {
            visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('visitorId', visitorId);
        }
        return visitorId;
    };

    // Get visit number
    const getVisitNumber = () => {
        let visitCount = localStorage.getItem('visitCount');
        visitCount = (parseInt(visitCount) || 0) + 1;
        localStorage.setItem('visitCount', visitCount);
        return visitCount;
    };

    // Get device info
    const getDeviceInfo = () => {
        const ua = navigator.userAgent;
        let deviceType = 'desktop';
        if (/Mobile|Android|iPhone/.test(ua)) {
            deviceType = /iPad|Tablet/.test(ua) ? 'tablet' : 'mobile';
        }

        return {
            type: deviceType,
            osName: getOS(),
            browserName: getBrowser(),
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            language: navigator.language || 'en-US'
        };
    };

    const getOS = () => {
        const ua = navigator.userAgent;
        if (ua.indexOf('Win') > -1) return 'Windows';
        if (ua.indexOf('Mac') > -1) return 'MacOS';
        if (ua.indexOf('Linux') > -1) return 'Linux';
        if (ua.indexOf('Android') > -1) return 'Android';
        if (ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) return 'iOS';
        return 'Unknown';
    };

    const getBrowser = () => {
        const ua = navigator.userAgent;
        if (ua.indexOf('Firefox') > -1) return 'Firefox';
        if (ua.indexOf('Chrome') > -1) return 'Chrome';
        if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) return 'Safari';
        if (ua.indexOf('Edge') > -1) return 'Edge';
        if (ua.indexOf('MSIE') > -1) return 'IE';
        return 'Unknown';
    };

    // Get traffic source info
    const getTrafficSource = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const referrer = document.referrer;

        return {
            source: urlParams.get('utm_source') || (referrer ? new URL(referrer).hostname : 'direct'),
            medium: urlParams.get('utm_medium') || 'organic',
            campaign: urlParams.get('utm_campaign') || '',
            content: urlParams.get('utm_content') || '',
            term: urlParams.get('utm_term') || '',
            referrer: referrer || ''
        };
    };

    // Get page performance metrics
    const getPagePerformance = () => {
        if (window.performance && window.performance.timing) {
            const timing = window.performance.timing;
            return {
                pageLoadTime: timing.loadEventEnd - timing.navigationStart,
                domReadyTime: timing.domContentLoadedEventEnd - timing.navigationStart,
                resourceLoadTime: timing.loadEventEnd - timing.responseEnd,
                firstContentfulPaint: getFirstContentfulPaint()
            };
        }
        return {};
    };

    const getFirstContentfulPaint = () => {
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.name === 'first-contentful-paint') {
                            return Math.round(entry.startTime);
                        }
                    }
                });
                observer.observe({ entryTypes: ['paint'] });
            } catch (e) {
                return null;
            }
        }
        return null;
    };

    // Track scroll depth
    const trackScrollDepth = () => {
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
            }
            sessionStorage.setItem('maxScroll', Math.round(maxScroll));
        });
        return maxScroll;
    };

    // Get geolocation (if available with permission)
    const getGeoLocation = async () => {
        if ('geolocation' in navigator) {
            return new Promise((resolve) => {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            latitude: position.coords.latitude.toFixed(4),
                            longitude: position.coords.longitude.toFixed(4),
                            accuracy: Math.round(position.coords.accuracy)
                        });
                    },
                    () => {
                        resolve(null);
                    },
                    { timeout: 5000 }
                );
            });
        }
        return null;
    };

    // Get purchase history
    const getPurchaseHistory = () => {
        const orders = localStorage.getItem('orders');
        if (orders) {
            try {
                const orderList = JSON.parse(orders);
                return {
                    totalOrders: orderList.length,
                    totalSpent: orderList.reduce((sum, order) => sum + (order.total || 0), 0),
                    lastOrderDate: orderList.length > 0 ? orderList[orderList.length - 1].date : null,
                    orderIds: orderList.map(o => o.id)
                };
            } catch (e) {
                return {};
            }
        }
        return {};
    };

    // Get search history
    const getSearchHistory = () => {
        const searches = localStorage.getItem('searchHistory');
        if (searches) {
            try {
                const searchList = JSON.parse(searches);
                return {
                    lastSearch: searchList[searchList.length - 1] || null,
                    searchCount: searchList.length,
                    topSearches: getTopSearches(searchList)
                };
            } catch (e) {
                return {};
            }
        }
        return {};
    };

    const getTopSearches = (searches) => {
        const counts = {};
        searches.forEach(s => {
            counts[s] = (counts[s] || 0) + 1;
        });
        return Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 3);
    };

    // Get most viewed products
    const getMostViewedProducts = () => {
        const views = localStorage.getItem('productViews');
        if (views) {
            try {
                const productList = JSON.parse(views);
                return productList
                    .sort((a, b) => b.views - a.views)
                    .slice(0, 5)
                    .map(p => ({
                        id: p.id,
                        name: p.name,
                        views: p.views
                    }));
            } catch (e) {
                return [];
            }
        }
        return [];
    };

    // Get product data from page or URL
    const getProductInfo = () => {
        let productName = '';
        let productId = '';
        let indication = '';

        // Try to get product ID from URL parameter (for PDP)
        const urlParams = new URLSearchParams(window.location.search);
        productId = urlParams.get('id') || '';

        // Try to get product name from page data if it exists
        const productNameElement = document.querySelector('[data-product-name]');
        if (productNameElement) {
            productName = productNameElement.textContent || productNameElement.getAttribute('data-product-name');
        }

        // Try to get indication/description from page data
        const indicationElement = document.querySelector('[data-indication]');
        if (indicationElement) {
            indication = indicationElement.textContent || indicationElement.getAttribute('data-indication');
        }

        return {
            productName: productName,
            productId: productId,
            indication: indication
        };
    };

    // Get consent preferences from localStorage
    const getConsentPreferences = () => {
        const consent = localStorage.getItem('userConsent');
        if (consent) {
            try {
                return JSON.parse(consent);
            } catch (e) {
                return {
                    analytics: true,
                    marketing: false,
                    personalization: true
                };
            }
        }
        return {
            analytics: true,
            marketing: false,
            personalization: true
        };
    };

    // Get cart count and product list for cart page
    const getCartData = () => {
        const cart = localStorage.getItem('cart');
        if (cart) {
            try {
                const cartItems = JSON.parse(cart);
                return {
                    cartCount: cartItems.length,
                    cartItems: cartItems,
                    cartTotal: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                    cartValue: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                    currency: 'INR'
                };
            } catch (e) {
                return {
                    cartCount: 0,
                    cartItems: [],
                    cartTotal: 0,
                    currency: 'INR'
                };
            }
        }
        return {
            cartCount: 0,
            cartItems: [],
            cartTotal: 0,
            currency: 'INR'
        };
    };

    // Get A/B test info
    const getTestInfo = () => {
        const testData = sessionStorage.getItem('abTestData');
        if (testData) {
            try {
                return JSON.parse(testData);
            } catch (e) {
                return {};
            }
        }
        return {};
    };

    // Update the digitalData object with dynamic values
    if (typeof digitalData !== 'undefined') {
        // Update user profile
        digitalData.user.profile.loginStatus = getLoginStatus();
        digitalData.user.profile.userType = getUserType();
        
        // Add userId if user is logged in
        const userId = getUserId();
        if (userId) {
            digitalData.user.profile.userId = userId;
        }

        // Add email if available
        const userEmail = getUserEmail();
        if (userEmail) {
            digitalData.user.profile.email = userEmail;
        }

        // Add session data
        digitalData.session = {
            sessionId: getSessionId(),
            visitorId: getVisitorId(),
            visitNumber: getVisitNumber()
        };

        // Add device info
        digitalData.device = getDeviceInfo();

        // Add traffic source
        digitalData.trafficSource = getTrafficSource();

        // Add page performance
        const pagePerf = getPagePerformance();
        if (Object.keys(pagePerf).length > 0) {
            digitalData.pagePerformance = pagePerf;
        }

        // Initialize scroll tracking
        trackScrollDepth();

        // Update product information
        const productInfo = getProductInfo();
        digitalData.product.productInfo.productName = productInfo.productName;
        digitalData.product.productInfo.productId = productInfo.productId;
        digitalData.product.productInfo.indication = productInfo.indication;

        // Update consent preferences
        const consent = getConsentPreferences();
        digitalData.consent.analytics = consent.analytics;
        digitalData.consent.marketing = consent.marketing;
        digitalData.consent.personalization = consent.personalization;

        // Add cart data if items exist
        const cartData = getCartData();
        if (cartData.cartCount > 0) {
            digitalData.cart = {
                cartInfo: {
                    cartCount: cartData.cartCount,
                    cartTotal: cartData.cartTotal,
                    cartValue: cartData.cartValue,
                    currency: cartData.currency
                },
                cartItems: cartData.cartItems
            };
        }

        // Add purchase history
        const purchaseHistory = getPurchaseHistory();
        if (Object.keys(purchaseHistory).length > 0) {
            digitalData.customer = {
                purchaseHistory: purchaseHistory
            };
        }

        // Add search history
        const searchHistory = getSearchHistory();
        if (Object.keys(searchHistory).length > 0) {
            if (!digitalData.customer) {
                digitalData.customer = {};
            }
            digitalData.customer.searchHistory = searchHistory;
        }

        // Add most viewed products
        const mostViewed = getMostViewedProducts();
        if (mostViewed.length > 0) {
            if (!digitalData.customer) {
                digitalData.customer = {};
            }
            digitalData.customer.mostViewedProducts = mostViewed;
        }

        // Add A/B test info if available
        const testInfo = getTestInfo();
        if (Object.keys(testInfo).length > 0) {
            digitalData.test = testInfo;
        }

        console.log('Digital Data initialized:', digitalData);
    } else {
        console.warn('digitalData object not found. Make sure it\'s defined before this script.');
    }
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDigitalData);
} else {
    initializeDigitalData();
}

// Export function for manual updates
window.updateDigitalData = function(updates) {
    if (typeof digitalData !== 'undefined') {
        // Deep merge updates into digitalData
        const merge = (target, source) => {
            for (const key in source) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    target[key] = target[key] || {};
                    merge(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        };
        merge(digitalData, updates);
        console.log('Digital Data updated:', digitalData);
    }
};

// Track page view event
window.trackPageView = function(customData = {}) {
    if (typeof digitalData !== 'undefined' && typeof adobe !== 'undefined' && adobe.target) {
        const params = {
            ...digitalData,
            ...customData
        };
        adobe.target.triggerView({
            view: digitalData.page.pageInfo.pageType,
            params: params
        });
    }
};

// Track custom event (add to cart, search, etc.)
window.trackEvent = function(eventName, eventData = {}) {
    if (typeof digitalData !== 'undefined') {
        const event = {
            eventName: eventName,
            eventData: eventData,
            timestamp: new Date().toISOString(),
            ...digitalData
        };
        console.log('Event tracked:', event);
        
        // Send to Adobe Target if available
        if (typeof adobe !== 'undefined' && adobe.target) {
            adobe.target.trackEvent({
                mbox: 'target-global-mbox',
                params: event
            });
        }
    }
};
