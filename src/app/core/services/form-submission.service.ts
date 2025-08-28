import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay, finalize, map, switchMap, tap } from 'rxjs/operators';
import { FormValidationService } from './form-validation.service';

export interface FormSubmissionOptions {
  showLoading?: boolean;
  showSuccessMessage?: boolean;
  showErrorMessage?: boolean;
  successMessage?: string;
  errorMessage?: string;
  redirectUrl?: string;
  resetForm?: boolean;
  preserveData?: boolean;
  customValidation?: (form: FormGroup) => ValidationErrors | null;
  beforeSubmit?: (form: FormGroup) => Observable<boolean> | boolean;
  afterSubmit?: (result: any, form: FormGroup) => void;
  onError?: (error: any, form: FormGroup) => void;
}

export interface FormSubmissionResult<T = any> {
  success: boolean;
  data?: T;
  error?: any;
  message?: string;
  validationErrors?: ValidationErrors;
}

@Injectable({
  providedIn: 'root'
})
export class FormSubmissionService {
  constructor(private validationService: FormValidationService) {}

  /**
   * Submit a form with comprehensive validation and error handling
   */
  submitForm<T = any>(
    form: FormGroup,
    submissionFn: (formData: any) => Observable<T>,
    options: FormSubmissionOptions = {}
  ): Observable<FormSubmissionResult<T>> {
    const {
      showLoading = true,
      showSuccessMessage = true,
      showErrorMessage = true,
      successMessage = 'Form submitted successfully',
      errorMessage = 'An error occurred while submitting the form',
      redirectUrl,
      resetForm = false,
      preserveData = false,
      customValidation,
      beforeSubmit,
      afterSubmit,
      onError
    } = options;

    // Validate form before submission
    if (!this.validateForm(form, customValidation)) {
      return of({
        success: false,
        message: 'Please fix the validation errors before submitting',
        validationErrors: form.errors
      });
    }

    // Execute before submit hook
    if (beforeSubmit) {
      const beforeResult = beforeSubmit(form);
      if (beforeResult instanceof Observable) {
        return beforeResult.pipe(
          switchMap(canProceed => {
            if (!canProceed) {
              return of({
                success: false,
                message: 'Form submission was cancelled'
              });
            }
            return this.executeSubmission(form, submissionFn, options);
          })
        );
      } else if (!beforeResult) {
        return of({
          success: false,
          message: 'Form submission was cancelled'
        });
      }
    }

    return this.executeSubmission(form, submissionFn, options);
  }

  /**
   * Execute the actual form submission
   */
  private executeSubmission<T = any>(
    form: FormGroup,
    submissionFn: (formData: any) => Observable<T>,
    options: FormSubmissionOptions
  ): Observable<FormSubmissionResult<T>> {
    const {
      showLoading = true,
      showSuccessMessage = true,
      showErrorMessage = true,
      successMessage = 'Form submitted successfully',
      errorMessage = 'An error occurred while submitting the form',
      redirectUrl,
      resetForm = false,
      preserveData = false,
      afterSubmit,
      onError
    } = options;

    // Mark form as touched to show validation errors
    this.validationService.markFormGroupTouched(form);

    // Check if form is valid
    if (!form.valid) {
      return of({
        success: false,
        message: 'Please fix the validation errors before submitting',
        validationErrors: form.errors
      });
    }

    // Get form data
    const formData = form.value;

    // Show loading state if requested
    if (showLoading) {
      // You can integrate this with your loading service
      console.log('Form submission started...');
    }

    return submissionFn(formData).pipe(
      // Simulate network delay for better UX (remove in production)
      delay(500),
      
      // Handle successful submission
      map(result => {
        const submissionResult: FormSubmissionResult<T> = {
          success: true,
          data: result,
          message: successMessage
        };

        // Execute after submit hook
        if (afterSubmit) {
          afterSubmit(result, form);
        }

        // Reset form if requested
        if (resetForm) {
          this.resetForm(form, preserveData);
        }

        // Show success message if requested
        if (showSuccessMessage) {
          // You can integrate this with your notification service
          console.log('Success:', successMessage);
        }

        return submissionResult;
      }),

      // Handle errors
      catchError(error => {
        const submissionResult: FormSubmissionResult<T> = {
          success: false,
          error,
          message: errorMessage
        };

        // Execute error hook
        if (onError) {
          onError(error, form);
        }

        // Show error message if requested
        if (showErrorMessage) {
          // You can integrate this with your notification service
          console.error('Error:', errorMessage, error);
        }

        return of(submissionResult);
      }),

      // Finalize (cleanup)
      finalize(() => {
        if (showLoading) {
          console.log('Form submission completed');
        }
      })
    );
  }

  /**
   * Validate form and return validation result
   */
  validateForm(
    form: FormGroup,
    customValidation?: (form: FormGroup) => ValidationErrors | null
  ): boolean {
    // Mark all controls as touched to trigger validation display
    this.validationService.markFormGroupTouched(form);

    // Check if form is valid
    if (!form.valid) {
      return false;
    }

    // Execute custom validation if provided
    if (customValidation) {
      const customErrors = customValidation(form);
      if (customErrors) {
        form.setErrors(customErrors);
        return false;
      }
    }

    return true;
  }

  /**
   * Reset form with optional data preservation
   */
  resetForm(form: FormGroup, preserveData: boolean = false): void {
    if (preserveData) {
      // Store current data
      const currentData = form.value;
      
      // Reset form
      form.reset();
      
      // Restore data
      form.patchValue(currentData);
    } else {
      // Reset form completely
      form.reset();
    }

    // Reset validation state
    this.validationService.resetFormGroupValidation(form);
  }

  /**
   * Get form validation summary
   */
  getFormValidationSummary(form: FormGroup) {
    return this.validationService.getFormValidationSummary(form);
  }

  /**
   * Check if form is ready for submission
   */
  isFormReady(form: FormGroup): boolean {
    return this.validationService.isFormReady(form);
  }

  /**
   * Mark form as touched to show validation errors
   */
  markFormTouched(form: FormGroup): void {
    this.validationService.markFormGroupTouched(form);
  }

  /**
   * Reset form validation state
   */
  resetFormValidation(form: FormGroup): void {
    this.validationService.resetFormGroupValidation(form);
  }

  /**
   * Get error message for a specific field
   */
  getFieldErrorMessage(control: AbstractControl, fieldType?: string): string {
    return this.validationService.getFirstErrorMessage(control, fieldType);
  }

  /**
   * Get all error messages for a field
   */
  getFieldErrorMessages(control: AbstractControl, fieldType?: string): string[] {
    return this.validationService.getAllErrorMessages(control, fieldType);
  }

  /**
   * Check if a field has errors
   */
  hasFieldErrors(control: AbstractControl): boolean {
    return this.validationService.hasErrors(control);
  }

  /**
   * Create a debounced form submission
   */
  createDebouncedSubmission<T = any>(
    form: FormGroup,
    submissionFn: (formData: any) => Observable<T>,
    options: FormSubmissionOptions & { debounceTime?: number } = {}
  ): Observable<FormSubmissionResult<T>> {
    const { debounceTime = 300, ...submissionOptions } = options;

    return new Observable(observer => {
      let timeoutId: any;

      const debouncedSubmit = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
          this.submitForm(form, submissionFn, submissionOptions).subscribe(observer);
        }, debounceTime);
      };

      // Listen to form value changes
      const subscription = form.valueChanges.subscribe(() => {
        debouncedSubmit();
      });

      // Return cleanup function
      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        subscription.unsubscribe();
      };
    });
  }

  /**
   * Create a form submission with retry logic
   */
  createRetrySubmission<T = any>(
    form: FormGroup,
    submissionFn: (formData: any) => Observable<T>,
    options: FormSubmissionOptions & { 
      maxRetries?: number; 
      retryDelay?: number;
      retryCondition?: (error: any, attempt: number) => boolean;
    } = {}
  ): Observable<FormSubmissionResult<T>> {
    const { 
      maxRetries = 3, 
      retryDelay = 1000,
      retryCondition = (error: any) => error.status >= 500,
      ...submissionOptions 
    } = options;

    let attempt = 0;

    const attemptSubmission = (): Observable<FormSubmissionResult<T>> => {
      return this.submitForm(form, submissionFn, submissionOptions).pipe(
        catchError(error => {
          attempt++;
          
          // Check if we should retry
          if (attempt <= maxRetries && retryCondition(error, attempt)) {
            console.log(`Retry attempt ${attempt} of ${maxRetries}`);
            return of(null).pipe(
              delay(retryDelay),
              switchMap(() => attemptSubmission())
            );
          }
          
          // Max retries reached or error doesn't meet retry condition
          return throwError(error);
        })
      );
    };

    return attemptSubmission();
  }

  /**
   * Create a form submission with progress tracking
   */
  createProgressSubmission<T = any>(
    form: FormGroup,
    submissionFn: (formData: any) => Observable<T>,
    options: FormSubmissionOptions & {
      onProgress?: (progress: number) => void;
      progressSteps?: string[];
    } = {}
  ): Observable<FormSubmissionResult<T>> {
    const { onProgress, progressSteps = ['Validating', 'Submitting', 'Processing', 'Complete'], ...submissionOptions } = options;

    let currentStep = 0;

    const updateProgress = (step: number) => {
      currentStep = step;
      const progress = ((step + 1) / progressSteps.length) * 100;
      
      if (onProgress) {
        onProgress(progress);
      }
      
      console.log(`Progress: ${progressSteps[step]} (${progress.toFixed(0)}%)`);
    };

    return new Observable(observer => {
      // Step 1: Validation
      updateProgress(0);
      if (!this.validateForm(form)) {
        observer.next({
          success: false,
          message: 'Validation failed',
          validationErrors: form.errors
        });
        observer.complete();
        return;
      }

      // Step 2: Submission
      updateProgress(1);
      this.submitForm(form, submissionFn, submissionOptions).subscribe({
        next: (result) => {
          updateProgress(2);
          observer.next(result);
          updateProgress(3);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  /**
   * Create a form submission with confirmation
   */
  createConfirmationSubmission<T = any>(
    form: FormGroup,
    submissionFn: (formData: any) => Observable<T>,
    options: FormSubmissionOptions & {
      confirmationMessage?: string;
      confirmationTitle?: string;
      requireConfirmation?: boolean;
    } = {}
  ): Observable<FormSubmissionResult<T>> {
    const { 
      confirmationMessage = 'Are you sure you want to submit this form?',
      confirmationTitle = 'Confirm Submission',
      requireConfirmation = true,
      ...submissionOptions 
    } = options;

    if (!requireConfirmation) {
      return this.submitForm(form, submissionFn, submissionOptions);
    }

    // You can integrate this with your confirmation dialog service
    const confirmed = confirm(`${confirmationTitle}\n\n${confirmationMessage}`);
    
    if (!confirmed) {
      return of({
        success: false,
        message: 'Form submission was cancelled by user'
      });
    }

    return this.submitForm(form, submissionFn, submissionOptions);
  }
}
