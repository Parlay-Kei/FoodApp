/**
 * Authentication utilities with rate limiting handling
 */

import { toast } from 'react-hot-toast';

// Constants for rate limiting
const INITIAL_RETRY_DELAY = 5000; // 5 seconds
const MAX_RETRY_DELAY = 60000; // 60 seconds
const MAX_RETRIES = 2;

// Track rate limit status globally
let isCurrentlyRateLimited = false;
let rateLimitResetTime = 0;

/**
 * Check if we're currently in a rate-limited state
 * @returns {boolean} - Whether we're rate limited
 */
export const isRateLimited = () => {
  if (!isCurrentlyRateLimited) return false;
  
  // Check if the rate limit period has expired
  if (Date.now() > rateLimitResetTime) {
    isCurrentlyRateLimited = false;
    return false;
  }
  
  return true;
};

/**
 * Get the number of seconds until rate limit resets
 * @returns {number} - Seconds until reset
 */
export const getRateLimitResetSeconds = () => {
  if (!isRateLimited()) return 0;
  return Math.ceil((rateLimitResetTime - Date.now()) / 1000);
};

/**
 * Executes an authentication operation with rate limit handling
 * @param {Function} authFunction - The Supabase auth function to execute
 * @param {Object} options - Options for the auth operation
 * @param {string} actionName - Name of the action for error messages
 * @returns {Promise<Object>} - Result of the auth operation
 */
export const executeWithRateLimitHandling = async (authFunction, options, actionName = 'authentication') => {
  // Check if we're already rate limited
  if (isRateLimited()) {
    const secondsRemaining = getRateLimitResetSeconds();
    console.warn(`Still rate limited for ${actionName}. Try again in ${secondsRemaining} seconds.`);
    return { 
      error: { 
        message: `Too many attempts. Please wait ${secondsRemaining} seconds before trying again.`,
        status: 429 
      } 
    };
  }
  
  let retryCount = 0;
  let delay = INITIAL_RETRY_DELAY;
  
  // Add a small delay to prevent rapid successive calls
  await new Promise(resolve => setTimeout(resolve, 500));
  
  while (retryCount <= MAX_RETRIES) {
    try {
      const result = await authFunction(options);
      
      if (result.error) {
        // Check for rate limit errors
        if (isRateLimitError(result.error)) {
          // Set the global rate limit flag
          isCurrentlyRateLimited = true;
          // Set reset time to 2 minutes from now (typical Supabase rate limit window)
          rateLimitResetTime = Date.now() + 120000;
          
          if (retryCount >= MAX_RETRIES) {
            // Max retries reached, return the error
            console.warn(`Rate limit reached for ${actionName} after ${retryCount} retries.`);
            return result;
          }
          
          // Wait before retrying with exponential backoff
          console.warn(`Rate limit hit for ${actionName}, retrying in ${delay/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Increase delay for next retry (exponential backoff)
          delay = Math.min(delay * 2, MAX_RETRY_DELAY);
          retryCount++;
        } else {
          // Not a rate limit error, return the result
          return result;
        }
      } else {
        // Success, clear any rate limit flags
        isCurrentlyRateLimited = false;
        return result;
      }
    } catch (error) {
      // Check if the error is rate limit related
      if (error.message?.toLowerCase().includes('rate limit') || error.status === 429) {
        isCurrentlyRateLimited = true;
        rateLimitResetTime = Date.now() + 120000;
      }
      
      // Handle unexpected errors
      console.error(`Error during ${actionName}:`, error);
      return { error };
    }
  }
};

/**
 * Checks if an error is related to rate limiting
 * @param {Object} error - The error object from Supabase
 * @returns {boolean} - True if it's a rate limit error
 */
const isRateLimitError = (error) => {
  return (
    error.message?.toLowerCase().includes('rate limit') ||
    error.status === 429 ||
    error.statusCode === 429 ||
    error.code === 'too_many_requests'
  );
};

/**
 * Formats authentication errors for display
 * @param {Object} error - The error object from Supabase
 * @param {string} defaultMessage - Default message if error is not recognized
 * @returns {string} - Formatted error message
 */
export const formatAuthError = (error, defaultMessage = 'An error occurred') => {
  if (!error) return defaultMessage;
  
  // Don't expose rate limit errors to users
  if (isRateLimitError(error)) {
    return 'Please try again in a moment.';
  }
  
  // Handle common auth errors with user-friendly messages
  const errorMap = {
    'invalid_credentials': 'Invalid email or password',
    'user_not_found': 'No account found with this email',
    'email_not_confirmed': 'Please verify your email before logging in',
    'invalid_otp': 'Invalid verification code',
    'expired_otp': 'Verification code has expired, please request a new one'
  };
  
  // Check if the error message contains any of our mapped errors
  for (const [key, message] of Object.entries(errorMap)) {
    if (error.message?.toLowerCase().includes(key) || error.code === key) {
      return message;
    }
  }
  
  // Return the original error message or our default
  return error.message || defaultMessage;
};

/**
 * Shows appropriate toast notification for auth errors
 * @param {Object} error - The error object from Supabase
 * @param {string} actionName - Name of the action for error messages
 */
export const handleAuthError = (error, actionName = 'authentication') => {
  if (!error) return;
  
  // Don't show rate limit errors to users
  if (isRateLimitError(error)) {
    // Just log it for debugging but don't show toast
    console.warn('Rate limit error:', error);
    return;
  }
  
  // For other errors, show a toast with user-friendly message
  const message = formatAuthError(error, `An error occurred during ${actionName}`);
  toast.error(message);
  console.error(`Auth error during ${actionName}:`, error);
};
