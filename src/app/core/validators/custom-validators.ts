import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  /**
   * Validates that a field is not empty (whitespace-only is considered empty)
   */
  static notEmpty(control: AbstractControl): ValidationErrors | null {
    if (!control.value || control.value.trim().length === 0) {
      return { notEmpty: { value: control.value } };
    }
    return null;
  }

  /**
   * Validates that a field contains only alphanumeric characters and spaces
   */
  static alphanumericWithSpaces(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const pattern = /^[a-zA-Z0-9\s]+$/;
    if (!pattern.test(control.value)) {
      return { alphanumericWithSpaces: { value: control.value } };
    }
    return null;
  }

  /**
   * Validates that a field contains only letters and spaces
   */
  static lettersWithSpaces(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const pattern = /^[a-zA-Z\s]+$/;
    if (!pattern.test(control.value)) {
      return { lettersWithSpaces: { value: control.value } };
    }
    return null;
  }

  /**
   * Validates that a field contains only letters, numbers, spaces, and common punctuation
   */
  static textWithPunctuation(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const pattern = /^[a-zA-Z0-9\s.,!?;:'"()-]+$/;
    if (!pattern.test(control.value)) {
      return { textWithPunctuation: { value: control.value } };
    }
    return null;
  }

  /**
   * Validates that a field is a valid phone number
   */
  static phoneNumber(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    // Remove all non-digit characters for validation
    const digitsOnly = control.value.replace(/\D/g, '');
    
    // Check if it's a valid length (7-15 digits)
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      return { phoneNumber: { value: control.value } };
    }
    return null;
  }

  /**
   * Validates that a field is a valid postal code
   */
  static postalCode(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    // Basic postal code pattern (5 digits or 5+4 format)
    const pattern = /^\d{5}(-\d{4})?$/;
    if (!pattern.test(control.value)) {
      return { postalCode: { value: control.value } };
    }
    return null;
  }

  /**
   * Validates that a field is a valid currency amount
   */
  static currency(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    // Currency pattern: optional $, digits, optional decimal with 2 places
    const pattern = /^\$?\d+(\.\d{2})?$/;
    if (!pattern.test(control.value)) {
      return { currency: { value: control.value } };
    }
    
    // Check if amount is positive
    const amount = parseFloat(control.value.replace('$', ''));
    if (amount <= 0) {
      return { currencyPositive: { value: control.value } };
    }
    
    return null;
  }

  /**
   * Validates that a field is a valid percentage (0-100)
   */
  static percentage(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const pattern = /^\d+(\.\d+)?%?$/;
    if (!pattern.test(control.value)) {
      return { percentage: { value: control.value } };
    }
    
    // Remove % and convert to number
    const value = parseFloat(control.value.replace('%', ''));
    if (value < 0 || value > 100) {
      return { percentageRange: { value: control.value } };
    }
    
    return null;
  }

  /**
   * Validates that a field is a valid SKU (alphanumeric with optional hyphens)
   */
  static sku(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const pattern = /^[A-Z0-9]+(-[A-Z0-9]+)*$/;
    if (!pattern.test(control.value.toUpperCase())) {
      return { sku: { value: control.value } };
    }
    return null;
  }

  /**
   * Validates that a field is a valid weight (positive number)
   */
  static weight(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const pattern = /^\d+(\.\d+)?$/;
    if (!pattern.test(control.value)) {
      return { weight: { value: control.value } };
    }
    
    const weight = parseFloat(control.value);
    if (weight <= 0) {
      return { weightPositive: { value: control.value } };
    }
    
    return null;
  }

  /**
   * Validates that a field is a valid dimension (positive number)
   */
  static dimension(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const pattern = /^\d+(\.\d+)?$/;
    if (!pattern.test(control.value)) {
      return { dimension: { value: control.value } };
    }
    
    const dimension = parseFloat(control.value);
    if (dimension <= 0) {
      return { dimensionPositive: { value: control.value } };
    }
    
    return null;
  }

  /**
   * Validates that a field is a valid quantity (positive integer)
   */
  static quantity(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const pattern = /^\d+$/;
    if (!pattern.test(control.value)) {
      return { quantity: { value: control.value } };
    }
    
    const quantity = parseInt(control.value, 10);
    if (quantity < 0) {
      return { quantityPositive: { value: control.value } };
    }
    
    return null;
  }

  /**
   * Validates that a field is a valid email address
   */
  static email(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!pattern.test(control.value)) {
      return { email: { value: control.value } };
    }
    return null;
  }

  /**
   * Validates that a field is a valid URL
   */
  static url(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    try {
      new URL(control.value);
      return null;
    } catch {
      return { url: { value: control.value } };
    }
  }

  /**
   * Validates that a field matches a specific pattern
   */
  static pattern(pattern: RegExp, errorKey: string = 'pattern'): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      if (!pattern.test(control.value)) {
        return { [errorKey]: { value: control.value } };
      }
      return null;
    };
  }

  /**
   * Validates that a field is within a specific range
   */
  static range(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const value = parseFloat(control.value);
      if (isNaN(value)) {
        return { range: { value: control.value } };
      }
      
      if (value < min || value > max) {
        return { range: { value: control.value, min, max } };
      }
      
      return null;
    };
  }

  /**
   * Validates that a field has a minimum length
   */
  static minLength(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      if (control.value.length < min) {
        return { minLength: { value: control.value, min } };
      }
      
      return null;
    };
  }

  /**
   * Validates that a field has a maximum length
   */
  static maxLength(max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      if (control.value.length > max) {
        return { maxLength: { value: control.value, max } };
      }
      
      return null;
    };
  }

  /**
   * Validates that a field is required if another field has a specific value
   */
  static requiredIf(condition: (control: AbstractControl) => boolean): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!condition(control)) return null;
      
      if (!control.value || control.value.trim().length === 0) {
        return { requiredIf: { value: control.value } };
      }
      
      return null;
    };
  }

  /**
   * Validates that a field is not equal to another field
   */
  static notEqual(otherControl: AbstractControl, errorKey: string = 'notEqual'): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || !otherControl.value) return null;
      
      if (control.value === otherControl.value) {
        return { [errorKey]: { value: control.value } };
      }
      
      return null;
    };
  }

  /**
   * Validates that a field is greater than another field
   */
  static greaterThan(otherControl: AbstractControl, errorKey: string = 'greaterThan'): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || !otherControl.value) return null;
      
      const value = parseFloat(control.value);
      const otherValue = parseFloat(otherControl.value);
      
      if (isNaN(value) || isNaN(otherValue)) {
        return { [errorKey]: { value: control.value } };
      }
      
      if (value <= otherValue) {
        return { [errorKey]: { value: control.value, otherValue } };
      }
      
      return null;
    };
  }

  /**
   * Validates that a field is less than another field
   */
  static lessThan(otherControl: AbstractControl, errorKey: string = 'lessThan'): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || !otherControl.value) return null;
      
      const value = parseFloat(control.value);
      const otherValue = parseFloat(otherControl.value);
      
      if (isNaN(value) || isNaN(otherValue)) {
        return { [errorKey]: { value: control.value } };
      }
      
      if (value >= otherValue) {
        return { [errorKey]: { value: control.value, otherValue } };
      }
      
      return null;
    };
  }

  /**
   * Validates that a field contains at least one uppercase letter
   */
  static hasUppercase(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    if (!/[A-Z]/.test(control.value)) {
      return { hasUppercase: { value: control.value } };
    }
    
    return null;
  }

  /**
   * Validates that a field contains at least one lowercase letter
   */
  static hasLowercase(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    if (!/[a-z]/.test(control.value)) {
      return { hasLowercase: { value: control.value } };
    }
    
    return null;
  }

  /**
   * Validates that a field contains at least one number
   */
  static hasNumber(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    if (!/\d/.test(control.value)) {
      return { hasNumber: { value: control.value } };
    }
    
    return null;
  }

  /**
   * Validates that a field contains at least one special character
   */
  static hasSpecialChar(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(control.value)) {
      return { hasSpecialChar: { value: control.value } };
    }
    
    return null;
  }

  /**
   * Validates password strength (minimum 8 characters with complexity requirements)
   */
  static passwordStrength(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const errors: string[] = [];
    
    if (control.value.length < 8) {
      errors.push('at least 8 characters');
    }
    
    if (!/[A-Z]/.test(control.value)) {
      errors.push('one uppercase letter');
    }
    
    if (!/[a-z]/.test(control.value)) {
      errors.push('one lowercase letter');
    }
    
    if (!/\d/.test(control.value)) {
      errors.push('one number');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(control.value)) {
      errors.push('one special character');
    }
    
    if (errors.length > 0) {
      return { passwordStrength: { requirements: errors } };
    }
    
    return null;
  }

  /**
   * Validates that a field is a valid date (not in the past)
   */
  static futureDate(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const inputDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (inputDate < today) {
      return { futureDate: { value: control.value } };
    }
    
    return null;
  }

  /**
   * Validates that a field is a valid date (not in the future)
   */
  static pastDate(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const inputDate = new Date(control.value);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (inputDate > today) {
      return { pastDate: { value: control.value } };
    }
    
    return null;
  }

  /**
   * Validates that a field is a valid date range (start date before end date)
   */
  static dateRange(startControl: AbstractControl, endControl: AbstractControl): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!startControl.value || !endControl.value) return null;
      
      const startDate = new Date(startControl.value);
      const endDate = new Date(endControl.value);
      
      if (startDate >= endDate) {
        return { dateRange: { startDate: startControl.value, endDate: endControl.value } };
      }
      
      return null;
    };
  }
}
