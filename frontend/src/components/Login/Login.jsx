// src/components/Login/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import styles from '../Forms/Form.module.css';

// Get API URL from environment variables or fallback
const API_URL = "/api/auth";

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // To display errors from backend
  const [loading, setLoading] = useState(false); // To disable button during request
  const navigate = useNavigate(); // Hook for navigation

  const handleLogin = async (event) => {
    event.preventDefault(); // Prevent default form submission
    setError(''); // Clear previous errors
    setLoading(true); // Set loading state

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), // Send email and password
      });

      const data = await response.json(); // Parse the JSON response body

      if (!response.ok) {
        // If response status is not 2xx, throw an error
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      // --- Login Successful ---
      console.log('Login successful:', data);
      // Store the token (e.g., in localStorage)
      localStorage.setItem('authToken', data.token);


      // TODO: Redirect user to a protected dashboard or home page
      // navigate('/dashboard'); // Example redirection
      alert('Login Successful! Token received.'); // Placeholder success feedback

      console.log('Attempting to navigate to /home'); // Лог перед навигацией
      navigate('/home');

    } catch (err) {
      // --- Handle Errors ---
      console.error('Login failed:', err);
      // Set error message from backend response or a generic one
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false); // Reset loading state regardless of outcome
    }
  };

  return (
    // Use onSubmit on the form element for better accessibility
    <form className={styles.formContainer} onSubmit={handleLogin}>
      <h1 className={styles.title}>ברוכים הבאים</h1>
      <p className={styles.subtitle}>הזן את האימייל והסיסמה שלך להתחברות</p>

      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}

      <input
        type="email"
        placeholder="אימייל"
        className={styles.inputField}
        aria-label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)} // Update email state
        required // Basic HTML5 validation
        disabled={loading} // Disable input when loading
      />
      <input
        type="password"
        placeholder="סיסמה"
        className={styles.inputField}
        aria-label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)} // Update password state
        required
        disabled={loading} // Disable input when loading
      />

      {/* Disable button when loading */}
      <button type="submit" className={styles.submitButton} disabled={loading}>
        {loading ? 'מתחבר...' : 'התחבר'} {/* Show loading text */}
      </button>

      <Link to="/signup" className={styles.switchLink}>
        אין לך חשבון? הרשם כאן
      </Link>
    </form>
  );
}

export default Login;