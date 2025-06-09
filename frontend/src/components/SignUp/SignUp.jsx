// src/components/SignUp/SignUp.jsx

// --- Imports ---
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// --- ИЗМЕНЕНИЕ 1: Импортируем наш инстанс axios ---
import axiosInstance from '../../api/axiosInstance'; // Adjust path if needed
import styles from '../Forms/Form.module.css'; // Use common styles

/**
 * SignUp component for user registration.
 */
function SignUp() {
  // --- State Hooks (без изменений) ---
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- Event Handler for Form Submission (РЕФАКТОРИНГ ЗДЕСЬ) ---
  const handleRegister = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    // --- Client-side Validation ---
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return; // Stop submission
    }
    // You can add more client-side validation here (e.g., password strength)

    setIsLoading(true);

    // Prepare data payload for the API request
    const userData = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone,
      password: password,
      role: "customer", // Default role for new sign-ups
    };

    try {
      // --- ИЗМЕНЕНИЕ 2: Используем axios.post ---
      // The endpoint is relative to our baseURL in axiosInstance.
      // axios will automatically handle JSON stringification and headers.
      await axiosInstance.post('/auth/register', userData);

      // --- Registration Successful ---
      setSuccess('Registration successful! Redirecting to login...');

      // Redirect to the login page after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      // --- ИЗМЕНЕНИЕ 3: Улучшенная обработка ошибок ---
      console.error('Registration failed:', err);

      // Extract a user-friendly error message from the axios error object.
      let errorMessage = 'Registration failed. Please try again.';
      if (err.response && err.response.data && err.response.data.error) {
        // Use the specific error message from the server (e.g., "Email already exists")
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setSuccess(''); // Clear any previous success message

    } finally {
      setIsLoading(false);
    }
  };

  // --- JSX for Rendering (без изменений) ---
  return (
    <form className={styles.formContainer} onSubmit={handleRegister}>
      <h1 className={styles.title}>הרשמה</h1>
      <p className={styles.subtitle}>מלא את הפרטים ליצירת חשבון חדש</p>

      {error && <p className={styles.errorMessage}>{error}</p>}
      {success && <p className={styles.successMessage}>{success}</p>}

      <div className={styles.inputGrid}>
        <input
          type="text"
          placeholder="שם פרטי"
          className={styles.inputField}
          aria-label="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          disabled={loading}
        />
        <input
          type="text"
          placeholder="שם משפחה"
          className={styles.inputField}
          aria-label="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          disabled={loading}
        />
        <input
          type="tel"
          placeholder="מספר טלפון"
          className={styles.inputField}
          aria-label="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          disabled={loading}
        />
        <input
          type="email"
          placeholder="אימייל"
          className={styles.inputField}
          aria-label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="סיסמה"
          className={styles.inputField}
          aria-label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          disabled={loading}
        />
        <input
          type="password"
          placeholder="אימות סיסמה"
          className={styles.inputField}
          aria-label="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <button type="submit" className={styles.submitButton} disabled={loading}>
        {loading ? 'רושם...' : 'הרשם'}
      </button>

      <Link to="/login" className={styles.switchLink}>
        יש לך כבר חשבון? התחבר כאן
      </Link>
    </form>
  );
}

export default SignUp;