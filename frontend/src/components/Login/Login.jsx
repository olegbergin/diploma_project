// src/components/Login/Login.jsx

// --- Imports ---
// Import React hooks for managing state and side effects.
import React, { useState } from 'react';
// Import components and hooks from react-router-dom for navigation.
import { Link, useNavigate } from 'react-router-dom';
// Import common form styles from our CSS module.
// We name it 'styles' for conventional use within this component.
import styles from '../Forms/Form.module.css';

// --- Constants ---
// Define the API URL for authentication. Using environment variables is a best practice.
// This allows different URLs for development, staging, and production.
const API_AUTH_URL = import.meta.env.VITE_API_AUTH_URL || 'http://localhost:3000/api/auth';

/**
 * Login component for user authentication.
 * Renders a form for users to enter their email and password.
 */
function Login() {
  // --- State Hooks ---
  // State for the email input field.
  const [email, setEmail] = useState('');
  // State for the password input field.
  const [password, setPassword] = useState('');
  // State to store and display any login error messages to the user.
  const [error, setError] = useState('');
  // State to indicate if a login request is in progress (for disabling UI elements).
  const [isLoading, setIsLoading] = useState(false);

  // --- React Router Hook ---
  // useNavigate hook allows us to programmatically navigate to other routes.
  const navigate = useNavigate();

  // --- Event Handler for Form Submission ---
  const handleLoginSubmit = async (event) => {
    // Prevent the default browser form submission, which causes a page reload.
    event.preventDefault();
    // Clear any previous error messages before a new attempt.
    setError('');
    // Set loading state to true to indicate the request is in progress.
    setIsLoading(true);

    try {
      // Make the API call to the login endpoint using fetch.
      const response = await fetch(`${API_AUTH_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Specify that we're sending JSON data.
        },
        body: JSON.stringify({ email, password }), // Send email and password in the request body.
      });

      // Parse the JSON response from the server.
      const responseData = await response.json();

      // Check if the HTTP response status is not 'ok' (e.g., status codes 400, 401, 500).
      if (!response.ok) {
        // If not OK, throw an error. Use the error message from the server if available.
        throw new Error(responseData.error || `HTTP error! Status: ${response.status}`);
      }

      // --- Login Successful ---
      console.log('Login successful. API Response:', responseData);

      // Store the authentication token in localStorage for session persistence.
      localStorage.setItem('authToken', responseData.token);
      // Store user info as a JSON string. We use JSON.stringify because localStorage only stores strings.
      localStorage.setItem('userInfo', JSON.stringify(responseData.user));

      console.log('Login successful, user role:', responseData.user.role);
      console.log('Attempting to navigate to /home');
      // Navigate the user to the home page upon successful login.
      navigate('/home');

    } catch (err) {
      // --- Handle Errors ---
      console.error('Login process failed:', err);
      // Set a user-friendly error message to be displayed in the UI.
      setError(err.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      // This block will always execute, regardless of success or failure.
      setIsLoading(false); // Reset loading state.
    }
  };

  // --- Event Handler for Quick Fill Buttons ---
  // This function sets the form fields with predefined credentials for easy testing.
  // It does NOT submit the form.
  const handleQuickFill = (userType) => {
    if (userType === 'customer') {
      setEmail('user@mail.com');
      setPassword('userpass');
    } else if (userType === 'business_owner') {
      setEmail('business@mail.com');
      setPassword('businesspass');
    } else if (userType === 'admin') {
      setEmail('admin@mail.com');
      setPassword('adminpass');
    }
  };

  // --- JSX for Rendering ---
  return (
    // Attach the submit handler to the form's onSubmit event.
    <form className={styles.formContainer} onSubmit={handleLoginSubmit}>
      <h1 className={styles.title}>ברוכים הבאים</h1> {/* Welcome */}
      <p className={styles.subtitle}>הזן את האימייל והסיסמה שלך להתחברות</p> {/* Enter your email and password to log in */}

      {/* Display error message if the 'error' state is not empty */}
      {error && <p className={styles.errorMessage}>{error}</p>}

      {/* Email Input Field */}
      <input
        type="email"
        placeholder="אימייל" // Email
        className={styles.inputField}
        aria-label="Email" // Accessibility: for screen readers
        value={email} // This is a controlled component: its value is tied to the state.
        onChange={(e) => setEmail(e.target.value)} // Update state on every change.
        required // HTML5 built-in validation: field must be filled.
        disabled={isLoading} // Disable the input while loading.
        autoComplete="email" // Helps with browser autofill.
      />

      {/* Password Input Field */}
      <input
        type="password"
        placeholder="סיסמה" // Password
        className={styles.inputField}
        aria-label="Password"
        value={password} // Controlled component.
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={isLoading}
        autoComplete="current-password" // Helps with browser autofill for login forms.
      />

      {/* Quick Fill Buttons for Development/Testing */}
      <div className={styles.quickLoginContainer}>
        <button
          type="button" // IMPORTANT: type="button" prevents form submission.
          className={styles.quickLoginButton}
          onClick={() => handleQuickFill('customer')}
        >
          User
        </button>
        <button
          type="button"
          className={styles.quickLoginButton}
          onClick={() => handleQuickFill('business_owner')}
        >
          Owner
        </button>
        <button
          type="button"
          className={styles.quickLoginButton}
          onClick={() => handleQuickFill('admin')}
        >
          Admin
        </button>
      </div>

      {/* Main Submit Button */}
      <button
        type="submit"
        className={styles.submitButton}
        disabled={isLoading} // Disable the button while loading.
      >
        {/* Change button text based on the loading state */}
        {isLoading ? 'מתחבר...' : 'התחבר'} {/* Logging in... / Login */}
      </button>

      {/* Link to the Registration Page */}
      <Link to="/signup" className={styles.switchLink}>
        אין לך חשבון? הרשם כאן {/* Don't have an account? Sign up here */}
      </Link>
    </form>
  );
}

export default Login;