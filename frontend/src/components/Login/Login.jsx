// src/components/Login/Login.jsx (Updated)

import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // We no longer need useNavigate here
import axiosInstance from '../../api/axiosInstance';
import styles from '../Forms/Form.module.css';

// The component now accepts an `onLoginSuccess` prop
function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // We no longer need the `navigate` hook here.

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axiosInstance.post('/auth/login', {
        email: email,
        password: password,
      });

      const responseData = response.data;

      // Save to localStorage as before
      localStorage.setItem('authToken', responseData.token);
      localStorage.setItem('userInfo', JSON.stringify(responseData.user));

      // --- THE MAIN CHANGE IS HERE ---
      // Instead of navigating, we call the function from our parent (App.jsx)
      // and pass it the user data.
      onLoginSuccess(responseData.user);

    } catch (err) {
      // Error handling is unchanged
      console.error('Login process failed:', err);
      let errorMessage = 'Login failed. Please check your credentials and try again.';
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // The rest of the component (quick fill, JSX) is exactly the same.
  // ...
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

  return (
    <form className={styles.formContainer} onSubmit={handleLoginSubmit}>
      {/* ... all your JSX is unchanged ... */}
      <h1 className={styles.title}>ברוכים הבאים</h1>
      <p className={styles.subtitle}>הזן את האימייל והסיסמה שלך להתחברות</p>
      {error && <p className={styles.errorMessage}>{error}</p>}
      <input
        type="email"
        placeholder="אימייל"
        className={styles.inputField}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={isLoading}
        autoComplete="email"
      />
      <input
        type="password"
        placeholder="סיסמה"
        className={styles.inputField}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={isLoading}
        autoComplete="current-password"
      />
      <div className={styles.quickLoginContainer}>
        <button type="button" className={styles.quickLoginButton} onClick={() => handleQuickFill('customer')}>User</button>
        <button type="button" className={styles.quickLoginButton} onClick={() => handleQuickFill('business_owner')}>Owner</button>
        <button type="button" className={styles.quickLoginButton} onClick={() => handleQuickFill('admin')}>Admin</button>
      </div>
      <button type="submit" className={styles.submitButton} disabled={isLoading}>
        {isLoading ? 'מתחבר...' : 'התחבר'}
      </button>
      <Link to="/signup" className={styles.switchLink}>
        אין לך חשבון? הרשם כאן
      </Link>
    </form>
  );
}

export default Login;