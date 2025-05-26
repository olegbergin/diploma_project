// src/components/Login/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext'; // Step 1: Import useUser hook
import commonFormStyles from '../Forms/Form.module.css'; // Assuming your common form styles are here
// It's good to be specific with style imports if you have multiple style files.

// Define the API URL for authentication.
// It's good practice to use environment variables for this.
// VITE_API_AUTH_URL would be more specific than VITE_API_BASE_URL if you have multiple base URLs.
const API_AUTH_URL = import.meta.env.VITE_API_AUTH_URL || 'http://localhost:3000/api/auth'; // Adjusted port from your example

function Login() {
  // --- State Hooks ---
  // State for the email input field
  const [email, setEmail] = useState('');
  // State for the password input field
  const [password, setPassword] = useState('');
  // State to store and display any login errors
  const [error, setError] = useState('');
  // State to indicate if a login request is in progress (for disabling UI elements)
  const [isLoading, setIsLoading] = useState(false);

  // --- Hooks from Libraries ---
  // useNavigate hook from react-router-dom for programmatic navigation
  const navigate = useNavigate();
  // useUser hook from our custom UserContext to access loginUser function
  const { loginUser } = useUser(); // Step 2: Get loginUser from context

  // --- Event Handler for Form Submission ---
  const handleLoginSubmit = async (event) => {
    event.preventDefault(); // Prevent the default browser form submission (which causes a page reload)
    setError('');           // Clear any previous error messages
    setIsLoading(true);     // Set loading state to true to indicate request is in progress

    try {
      // Make the API call to the login endpoint
      const response = await fetch(`${API_AUTH_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Specify that we're sending JSON data
        },
        body: JSON.stringify({ email, password }), // Send email and password in the request body
      });

      // Parse the JSON response from the server
      const responseData = await response.json();

      // Check if the HTTP response status is not OK (e.g., 400, 401, 500)
      if (!response.ok) {
        // If not OK, throw an error. Use the error message from the server if available.
        throw new Error(responseData.error || `HTTP error! Status: ${response.status}`);
      }

      // --- Login Successful ---
      console.log('Login successful. API Response:', responseData);

      // TODO for JWT implementation:
      // localStorage.setItem('authToken', responseData.token);

      // Step 3: Prepare user data for the context
      // Ideally, your backend's /login endpoint should return user details (id, name, role, email)
      // along with the token.
      // Example: responseData = { token: "...", user: { user_id: 1, first_name: "Test", role: "customer" } }

      let userDataForContext;

      if (responseData.user && responseData.user.user_id && responseData.user.role) {
        // If backend provides user details
        userDataForContext = {
          id: responseData.user.user_id,
          name: responseData.user.first_name || email.split('@')[0], // Fallback for name
          email: responseData.user.email || email, // Fallback for email
          role: responseData.user.role,
        };
      } else {
        // --- TEMPORARY SIMULATION if backend ONLY returns a token ---
        // This part should be removed or adjusted once your backend /login returns full user info.
        console.warn("Backend /login did not return full user details. Simulating role based on email for now.");
        userDataForContext = {
          id: Date.now(), // Temporary ID
          name: email.split('@')[0],
          email: email,
          role: 'customer', // Default role
        };
        if (email.toLowerCase() === 'gleb@example.com') {
          userDataForContext.role = 'business_owner';
        } else if (email.toLowerCase() === 'admin@example.com') {
          userDataForContext.role = 'admin';
        }
        // --- END OF TEMPORARY SIMULATION ---
      }

      loginUser(userDataForContext); // Update the global user state via context

      console.log('User context updated. Navigating to /home...');
      navigate('/home'); // Redirect to the home page

    } catch (err) {
      // --- Handle Errors ---
      console.error('Login process failed:', err);
      // Set a user-friendly error message.
      setError(err.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      // This block will always execute, regardless of success or failure
      setIsLoading(false); // Reset loading state
    }
  };

  // --- JSX for Rendering ---
  return (
    // Use the common form container style
    // Attach the submit handler to the form's onSubmit event
    <form className={commonFormStyles.formContainer} onSubmit={handleLoginSubmit}>
      <h1 className={commonFormStyles.title}>ברוכים הבאים</h1> {/* Welcome */}
      <p className={commonFormStyles.subtitle}>הזן את האימייל והסיסמה שלך להתחברות</p> {/* Enter email/password */}

      {/* Display error message if 'error' state is not empty */}
      {error && <p className={commonFormStyles.errorMessage}>{error}</p>}

      {/* Email Input Field */}
      <input
        type="email"
        placeholder="אימייל" // Email
        className={commonFormStyles.inputField}
        aria-label="Email" // Accessibility: for screen readers
        value={email} // Controlled component: value is tied to state
        onChange={(e) => setEmail(e.target.value)} // Update state on change
        required // HTML5 built-in validation: field must be filled
        disabled={isLoading} // Disable input during loading
        autoComplete="email" // Helps with browser autofill
      />

      {/* Password Input Field */}
      <input
        type="password"
        placeholder="סיסמה" // Password
        className={commonFormStyles.inputField}
        aria-label="Password" // Accessibility
        value={password} // Controlled component
        onChange={(e) => setPassword(e.target.value)} // Update state
        required // HTML5 validation
        disabled={isLoading} // Disable input during loading
        autoComplete="current-password" // Helps with browser autofill for login forms
      />

      {/* Submit Button */}
      <button
        type="submit"
        className={commonFormStyles.submitButton}
        disabled={isLoading} // Disable button during loading
      >
        {/* Change button text based on loading state */}
        {isLoading ? 'מתחבר...' : 'התחבר'} {/* Logging in... / Login */}
      </button>

      {/* Link to Registration Page */}
      <Link to="/signup" className={commonFormStyles.switchLink}>
        אין לך חשבון? הרשם כאן {/* Don't have an account? Sign up here */}
      </Link>
    </form>
  );
}

export default Login;