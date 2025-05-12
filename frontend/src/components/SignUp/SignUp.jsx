// src/components/SignUp/SignUp.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../Forms/Form.module.css'; // Use common styles

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/auth';

function SignUp() {
  // ... (keep existing useState hooks for fields, error, success, loading)
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

  const handleRegister = async (event) => {
    // ... (keep existing handleRegister logic)
    event.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }
    setLoading(true); // Set loading true here before try block

    const userData = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone,
      password: password,
      role: "user", // Default role
    };

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.message || 'Registration failed. Please try again.');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };


  return (
    // The main container still uses formContainer styles
    <form className={styles.formContainer} onSubmit={handleRegister}>
      <h1 className={styles.title}>הרשמה</h1>
      <p className={styles.subtitle}>מלא את הפרטים ליצירת חשבון חדש</p>

      {/* Display messages above the grid */}
      {error && <p className={styles.errorMessage}>{error}</p>}
      {success && <p className={styles.successMessage}>{success}</p>}

      {/* Wrap input fields in the grid container */}
      <div className={styles.inputGrid}>
        <input
          type="text"
          placeholder="שם פרטי" // First Name
          className={styles.inputField} // Keep inputField for individual styling
          aria-label="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          disabled={loading}
        />
        <input
          type="text"
          placeholder="שם משפחה" // Last Name
          className={styles.inputField}
          aria-label="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          disabled={loading}
        />
        <input
          type="tel"
          placeholder="מספר טלפון" // Phone Number
          className={styles.inputField}
          aria-label="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          disabled={loading}
        />
        <input
          type="email"
          placeholder="אימייל" // Email
          className={styles.inputField}
          aria-label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="סיסמה" // Password
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
          placeholder="אימות סיסמה" // Confirm Password
          className={styles.inputField}
          aria-label="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={loading}
        />
      </div> {/* End of inputGrid */}

      {/* Button and link remain below the grid */}
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