// Shared validation rules for the auth forms.
// Keep these in sync with trello_backend/utils/validators.js

// name@domain.tld - no leading/trailing/double dots in the name, a real
// domain with at least one dot, and a 2+ letter extension
export const EMAIL_REGEX =
  /^(?!\.)(?!.*\.\.)[A-Za-z0-9._%+-]{1,64}(?<!\.)@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;

// Letters (any language), spaces, dots, apostrophes and hyphens
export const NAME_REGEX = /^\p{L}[\p{L}\p{M} .'-]*$/u;

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 64;

export const PASSWORD_RULES = [
  { test: (v) => /[a-z]/.test(v), message: "Password must include a lowercase letter" },
  { test: (v) => /[A-Z]/.test(v), message: "Password must include an uppercase letter" },
  { test: (v) => /\d/.test(v), message: "Password must include a number" },
  {
    test: (v) => /[^A-Za-z0-9\s]/.test(v),
    message: "Password must include a special character (e.g. @, #, $, !)",
  },
  { test: (v) => /^\S+$/.test(v), message: "Password cannot contain spaces" },
];

// Message for a failing API call: the server's message, or a friendly
// fallback when the server could not be reached at all
export const getErrorMessage = (error, fallback = "Something went wrong") => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.status >= 500) {
    return "Server error. Please try again in a moment.";
  }
  if (!error?.response) {
    return "Cannot reach the server. Check your connection and try again.";
  }
  return fallback;
};

// Red border classes for an invalid field
export const invalidClass = (error) =>
  error ? "border-red-400 focus:ring-red-300" : "";
