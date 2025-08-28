import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { CustomValidators } from '../validators/custom-validators';

export interface ValidationMessage {
  key: string;
  message: string;
  params?: any;
}

export interface FieldValidation {
  field: string;
  validators: any[];
  messages: ValidationMessage[];
}

@Injectable({
  providedIn: 'root'
})
export class FormValidationService {
  /**
   * Common validation patterns for different field types
   */
  private readonly validationPatterns: { [key: string]: FieldValidation } = {
    // Text fields
    name: {
      field: 'name',
      validators: [CustomValidators.lettersWithSpaces, CustomValidators.minLength(2), CustomValidators.maxLength(50)],
      messages: [
        { key: 'required', message: 'Name is required' },
        { key: 'lettersWithSpaces', message: 'Name can only contain letters and spaces' },
        { key: 'minLength', message: 'Name must be at least {min} characters long' },
        { key: 'maxLength', message: 'Name cannot exceed {max} characters' }
      ]
    },

    // Email fields
    email: {
      field: 'email',
      validators: [CustomValidators.email],
      messages: [
        { key: 'required', message: 'Email is required' },
        { key: 'email', message: 'Please enter a valid email address' }
      ]
    },

    // Password fields
    password: {
      field: 'password',
      validators: [CustomValidators.passwordStrength, CustomValidators.minLength(8)],
      messages: [
        { key: 'required', message: 'Password is required' },
        { key: 'passwordStrength', message: 'Password must contain {requirements}' },
        { key: 'minLength', message: 'Password must be at least {min} characters long' }
      ]
    },

    // Phone number fields
    phone: {
      field: 'phone',
      validators: [CustomValidators.phoneNumber],
      messages: [
        { key: 'required', message: 'Phone number is required' },
        { key: 'phoneNumber', message: 'Please enter a valid phone number' }
      ]
    },

    // Address fields
    address: {
      field: 'address',
      validators: [CustomValidators.textWithPunctuation, CustomValidators.minLength(5), CustomValidators.maxLength(100)],
      messages: [
        { key: 'required', message: 'Address is required' },
        { key: 'textWithPunctuation', message: 'Address contains invalid characters' },
        { key: 'minLength', message: 'Address must be at least {min} characters long' },
        { key: 'maxLength', message: 'Address cannot exceed {max} characters' }
      ]
    },

    // Postal code fields
    postalCode: {
      field: 'postalCode',
      validators: [CustomValidators.postalCode],
      messages: [
        { key: 'required', message: 'Postal code is required' },
        { key: 'postalCode', message: 'Please enter a valid postal code' }
      ]
    },

    // Currency fields
    currency: {
      field: 'currency',
      validators: [CustomValidators.currency],
      messages: [
        { key: 'required', message: 'Amount is required' },
        { key: 'currency', message: 'Please enter a valid currency amount' },
        { key: 'currencyPositive', message: 'Amount must be greater than zero' }
      ]
    },

    // Percentage fields
    percentage: {
      field: 'percentage',
      validators: [CustomValidators.percentage],
      messages: [
        { key: 'required', message: 'Percentage is required' },
        { key: 'percentage', message: 'Please enter a valid percentage' },
        { key: 'percentageRange', message: 'Percentage must be between 0 and 100' }
      ]
    },

    // SKU fields
    sku: {
      field: 'sku',
      validators: [CustomValidators.sku, CustomValidators.minLength(3), CustomValidators.maxLength(20)],
      messages: [
        { key: 'required', message: 'SKU is required' },
        { key: 'sku', message: 'SKU can only contain uppercase letters, numbers, and hyphens' },
        { key: 'minLength', message: 'SKU must be at least {min} characters long' },
        { key: 'maxLength', message: 'SKU cannot exceed {max} characters' }
      ]
    },

    // Weight fields
    weight: {
      field: 'weight',
      validators: [CustomValidators.weight],
      messages: [
        { key: 'required', message: 'Weight is required' },
        { key: 'weight', message: 'Please enter a valid weight' },
        { key: 'weightPositive', message: 'Weight must be greater than zero' }
      ]
    },

    // Dimension fields
    dimension: {
      field: 'dimension',
      validators: [CustomValidators.dimension],
      messages: [
        { key: 'required', message: 'Dimension is required' },
        { key: 'dimension', message: 'Please enter a valid dimension' },
        { key: 'dimensionPositive', message: 'Dimension must be greater than zero' }
      ]
    },

    // Quantity fields
    quantity: {
      field: 'quantity',
      validators: [CustomValidators.quantity],
      messages: [
        { key: 'required', message: 'Quantity is required' },
        { key: 'quantity', message: 'Please enter a valid quantity' },
        { key: 'quantityPositive', message: 'Quantity must be zero or greater' }
      ]
    },

    // URL fields
    url: {
      field: 'url',
      validators: [CustomValidators.url],
      messages: [
        { key: 'required', message: 'URL is required' },
        { key: 'url', message: 'Please enter a valid URL' }
      ]
    },

    // Date fields
    date: {
      field: 'date',
      validators: [],
      messages: [
        { key: 'required', message: 'Date is required' },
        { key: 'futureDate', message: 'Date cannot be in the past' },
        { key: 'pastDate', message: 'Date cannot be in the future' }
      ]
    },

    // Description fields
    description: {
      field: 'description',
      validators: [CustomValidators.textWithPunctuation, CustomValidators.maxLength(500)],
      messages: [
        { key: 'required', message: 'Description is required' },
        { key: 'textWithPunctuation', message: 'Description contains invalid characters' },
        { key: 'maxLength', message: 'Description cannot exceed {max} characters' }
      ]
    }
  };

  /**
   * Get validation pattern for a specific field type
   */
  getValidationPattern(fieldType: string): FieldValidation | null {
    return this.validationPatterns[fieldType] || null;
  }

  /**
   * Get all available validation patterns
   */
  getAllValidationPatterns(): { [key: string]: FieldValidation } {
    return { ...this.validationPatterns };
  }

  /**
   * Get error message for a specific validation error
   */
  getErrorMessage(fieldType: string, errorKey: string, params?: any): string {
    const pattern = this.validationPatterns[fieldType];
    if (!pattern) {
      return this.getDefaultErrorMessage(errorKey, params);
    }

    const message = pattern.messages.find(m => m.key === errorKey);
    if (!message) {
      return this.getDefaultErrorMessage(errorKey, params);
    }

    return this.interpolateMessage(message.message, params);
  }

  /**
   * Get all error messages for a field
   */
  getFieldErrorMessages(fieldType: string): ValidationMessage[] {
    const pattern = this.validationPatterns[fieldType];
    return pattern ? pattern.messages : [];
  }

  /**
   * Check if a field has validation errors
   */
  hasErrors(control: AbstractControl): boolean {
    return control.invalid && (control.dirty || control.touched);
  }

  /**
   * Get the first error message for a control
   */
  getFirstErrorMessage(control: AbstractControl, fieldType?: string): string {
    if (!this.hasErrors(control)) {
      return '';
    }

    const errors = control.errors;
    if (!errors) {
      return '';
    }

    const firstErrorKey = Object.keys(errors)[0];
    if (fieldType) {
      return this.getErrorMessage(fieldType, firstErrorKey, errors[firstErrorKey]);
    }

    return this.getDefaultErrorMessage(firstErrorKey, errors[firstErrorKey]);
  }

  /**
   * Get all error messages for a control
   */
  getAllErrorMessages(control: AbstractControl, fieldType?: string): string[] {
    if (!this.hasErrors(control)) {
      return [];
    }

    const errors = control.errors;
    if (!errors) {
      return [];
    }

    return Object.keys(errors).map(errorKey => {
      if (fieldType) {
        return this.getErrorMessage(fieldType, errorKey, errors[errorKey]);
      }
      return this.getDefaultErrorMessage(errorKey, errors[errorKey]);
    });
  }

  /**
   * Mark a control as touched to trigger validation display
   */
  markControlTouched(control: AbstractControl): void {
    control.markAsTouched();
    control.updateValueAndValidity();
  }

  /**
   * Mark all controls in a form group as touched
   */
  markFormGroupTouched(formGroup: AbstractControl): void {
    Object.keys(formGroup.value).forEach(key => {
      const control = formGroup.get(key);
      if (control) {
        this.markControlTouched(control);
      }
    });
  }

  /**
   * Reset validation state for a control
   */
  resetControlValidation(control: AbstractControl): void {
    control.markAsUntouched();
    control.markAsPristine();
    control.setErrors(null);
  }

  /**
   * Reset validation state for all controls in a form group
   */
  resetFormGroupValidation(formGroup: AbstractControl): void {
    Object.keys(formGroup.value).forEach(key => {
      const control = formGroup.get(key);
      if (control) {
        this.resetControlValidation(control);
      }
    });
  }

  /**
   * Check if a form is valid and ready for submission
   */
  isFormReady(formGroup: AbstractControl): boolean {
    return formGroup.valid && formGroup.dirty;
  }

  /**
   * Get form validation summary
   */
  getFormValidationSummary(formGroup: AbstractControl): {
    valid: boolean;
    invalid: boolean;
    dirty: boolean;
    pristine: boolean;
    touched: boolean;
    untouched: boolean;
    errorCount: number;
    errors: { [key: string]: string[] };
  } {
    const errors: { [key: string]: string[] } = {};
    let errorCount = 0;

    Object.keys(formGroup.value).forEach(key => {
      const control = formGroup.get(key);
      if (control && control.errors) {
        errors[key] = this.getAllErrorMessages(control);
        errorCount += errors[key].length;
      }
    });

    return {
      valid: formGroup.valid,
      invalid: formGroup.invalid,
      dirty: formGroup.dirty,
      pristine: formGroup.pristine,
      touched: formGroup.touched,
      untouched: formGroup.untouched,
      errorCount,
      errors
    };
  }

  /**
   * Create a custom validation pattern
   */
  createCustomValidation(
    field: string,
    validators: any[],
    messages: ValidationMessage[]
  ): FieldValidation {
    return { field, validators, messages };
  }

  /**
   * Add a custom validation pattern
   */
  addCustomValidation(fieldType: string, validation: FieldValidation): void {
    this.validationPatterns[fieldType] = validation;
  }

  /**
   * Remove a custom validation pattern
   */
  removeCustomValidation(fieldType: string): void {
    delete this.validationPatterns[fieldType];
  }

  /**
   * Get default error message for common validation errors
   */
  private getDefaultErrorMessage(errorKey: string, params?: any): string {
    const defaultMessages: { [key: string]: string } = {
      required: 'This field is required',
      email: 'Please enter a valid email address',
      minlength: 'This field must be at least {minlength} characters long',
      maxlength: 'This field cannot exceed {maxlength} characters',
      min: 'Value must be at least {min}',
      max: 'Value cannot exceed {max}',
      pattern: 'This field contains invalid characters',
      notEmpty: 'This field cannot be empty',
      alphanumericWithSpaces: 'This field can only contain letters, numbers, and spaces',
      lettersWithSpaces: 'This field can only contain letters and spaces',
      textWithPunctuation: 'This field contains invalid characters',
      phoneNumber: 'Please enter a valid phone number',
      postalCode: 'Please enter a valid postal code',
      currency: 'Please enter a valid currency amount',
      percentage: 'Please enter a valid percentage',
      sku: 'Please enter a valid SKU',
      weight: 'Please enter a valid weight',
      dimension: 'Please enter a valid dimension',
      quantity: 'Please enter a valid quantity',
      url: 'Please enter a valid URL',
      futureDate: 'Date cannot be in the past',
      pastDate: 'Date cannot be in the future',
      dateRange: 'Start date must be before end date',
      hasUppercase: 'Must contain at least one uppercase letter',
      hasLowercase: 'Must contain at least one lowercase letter',
      hasNumber: 'Must contain at least one number',
      hasSpecialChar: 'Must contain at least one special character',
      passwordStrength: 'Password does not meet strength requirements',
      notEqual: 'This field cannot be the same as the other field',
      greaterThan: 'This value must be greater than the other field',
      lessThan: 'This value must be less than the other field',
      range: 'Value must be between {min} and {max}',
      minLength: 'Must be at least {min} characters long',
      maxLength: 'Cannot exceed {max} characters'
    };

    const message = defaultMessages[errorKey] || 'This field has an error';
    return this.interpolateMessage(message, params);
  }

  /**
   * Interpolate message parameters
   */
  private interpolateMessage(message: string, params?: any): string {
    if (!params) {
      return message;
    }

    let interpolatedMessage = message;
    Object.keys(params).forEach(key => {
      const placeholder = `{${key}}`;
      const value = params[key];
      
      if (Array.isArray(value)) {
        // Handle array parameters (e.g., password requirements)
        interpolatedMessage = interpolatedMessage.replace(placeholder, value.join(', '));
      } else {
        interpolatedMessage = interpolatedMessage.replace(placeholder, value);
      }
    });

    return interpolatedMessage;
  }
}
