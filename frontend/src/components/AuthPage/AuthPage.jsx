// src/components/AuthPage/AuthPage.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import useErrorHandler from "../../hooks/useErrorHandler";
import ErrorMessage from "../shared/ErrorMessage/ErrorMessage";
import LoadingSpinner from "../shared/LoadingSpinner/LoadingSpinner";
import styles from "../Forms/Form.module.css";

// קומפוננטת התחברות/הרשמה למערכת
// מאפשרת מעבר בין Login ל-Register, ולידציות, ושליחת בקשות לשרת
function AuthPage({ onLoginSuccess }) {
  // ---------------------------------------------------
  // משתני מצב (State)
  // ---------------------------------------------------

  // האם כרגע במצב התחברות (true) או הרשמה (false)
  const [isLoginMode, setIsLoginMode] = useState(true);

  // הודעת הצלחה להצגה (בעיקר אחרי הרשמה)
  const [success, setSuccess] = useState("");

  // ניווט בין דפים (למשל מעבר להרשמת עסק או אחרי התחברות)
  const navigate = useNavigate();

  // הוק מותאם אישית לניהול שגיאות וטעינה
  // error = הודעת שגיאה
  // isLoading = האם בקשה רצה כרגע
  // handleError/clearError = ניהול שגיאות
  // executeWithErrorHandling = עטיפה להרצה בטוחה של בקשות
  const {
    error,
    isLoading,
    handleError,
    clearError,
    executeWithErrorHandling,
  } = useErrorHandler();

  // Form data state
  // ---------------------------------------------------
  // נתוני הטופס (שדות שהמשתמש ממלא)
  // ב-Login משתמשים רק באימייל וסיסמה
  // ב-Register משתמשים גם בשמות, טלפון ואימות סיסמה
  // ---------------------------------------------------
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // Validation function
  // ---------------------------------------------------
  // פונקציה לבדיקת תקינות הקלט לפני שליחה לשרת
  // מחזירה true אם הכל תקין, אחרת false ומציגה הודעת שגיאה
  // ---------------------------------------------------
  const validateInput = () => {
    clearError();

    // Email validation
    // בדיקת תקינות אימייל לפי Regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      handleError("Please enter a valid email address.");
      return false;
    }

    // Password validation (3-8 characters, alphanumeric with at least one letter and one number)
    // בדיקת תקינות סיסמה:
    // 3-8 תווים, לפחות אות אחת ולפחות מספר אחד
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{3,8}$/;
    if (!passwordRegex.test(formData.password)) {
      handleError(
        "Password must be 3-8 characters long and contain at least one letter and one number."
      );
      return false;
    }

    // Registration mode specific validation
    // בדיקות נוספות שרלוונטיות רק בהרשמה
    if (!isLoginMode) {
      // First name validation (minimum 2 letters only)
      // בדיקת שם פרטי: לפחות 2 אותיות ורק באנגלית
      if (
        formData.firstName.length < 2 ||
        !/^[A-Za-z]+$/.test(formData.firstName)
      ) {
        handleError(
          "First name must contain only letters and have a minimum length of 2."
        );
        return false;
      }

      // Last name validation (minimum 2 letters only)
      // בדיקת שם משפחה: לפחות 2 אותיות ורק באנגלית
      if (
        formData.lastName.length < 2 ||
        !/^[A-Za-z]+$/.test(formData.lastName)
      ) {
        handleError(
          "Last name must contain only letters and have a minimum length of 2."
        );
        return false;
      }

      // Confirm password validation
      // בדיקה שהסיסמה ואימות הסיסמה זהים
      if (formData.password !== formData.confirmPassword) {
        handleError("Passwords do not match.");
        return false;
      }
    }

    return true;
  };

  // ---------------------------------------------------
  // עדכון שדות הטופס בזמן הקלדה
  // וגם ניקוי שגיאה אם קיימת כשהמשתמש מתחיל לתקן
  // ---------------------------------------------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    // אם יש שגיאה ומתחילים להקליד – מנקים אותה
    if (error) {
      clearError();
    }
  };

  // ---------------------------------------------------
  // מילוי מהיר של משתמשי בדיקה (Quick Login)
  // עובד רק במצב התחברות
  // ---------------------------------------------------
  const handleQuickFill = (userType) => {
    switch (userType) {
      case "customer":
        setFormData((prev) => ({
          ...prev,
          email: "bergin.oleg@gmail.com",
          password: "pass123",
        }));
        break;
      case "business_owner":
        setFormData((prev) => ({
          ...prev,
          email: "newbiz1@example.com",
          password: "newpass1",
        }));
        break;
      case "admin":
        setFormData((prev) => ({
          ...prev,
          email: "jane.doe@example.com",
          password: "pass456",
        }));
        break;
      default:
        break;
    }
  };

  // ---------------------------------------------------
  // שליחת הטופס:
  // - קודם מבצעים ולידציות
  // - אחר כך מריצים התחברות או הרשמה לפי המצב
  // ---------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    // אם יש שגיאה בוולידציה – עוצרים
    if (!validateInput()) {
      return;
    }

    // פונקציה פנימית שמבצעת את הפעולה מול השרת
    const authOperation = async () => {
      clearError();
      setSuccess("");

      if (isLoginMode) {
        // Login
        // ---------------------------------------------------
        // מצב התחברות:
        // שולחים אימייל וסיסמה לשרת
        // שומרים token + userInfo בלוקאל סטורג'
        // ומודיעים לאפליקציה על התחברות מוצלחת
        // ---------------------------------------------------
        const response = await axiosInstance.post("/auth/login", {
          email: formData.email,
          password: formData.password,
        });

        const responseData = response.data;
        localStorage.setItem("authToken", responseData.token);
        localStorage.setItem("userInfo", JSON.stringify(responseData.user));
        onLoginSuccess(responseData.user);
        return responseData;
      } else {
        // Registration
        // ---------------------------------------------------
        // מצב הרשמה:
        // בונים אובייקט משתמש בצורה שהשרת מצפה לה
        // שולחים לשרת
        // מציגים הודעת הצלחה
        // ומחזירים את המסך למצב התחברות
        // ---------------------------------------------------
        const userData = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: "customer",
        };

        const response = await axiosInstance.post("/auth/register", userData);
        setSuccess("Registration successful! Please login.");
        setIsLoginMode(true);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
        });
        return response.data;
      }
    };

    // ---------------------------------------------------
    // הרצת הפעולה עם טיפול שגיאות וטעינה דרך useErrorHandler
    // ---------------------------------------------------
    try {
      await executeWithErrorHandling(authOperation);
    } catch (err) {
      // Error is already handled by useErrorHandler
      console.error("Auth process failed:", err);
    }
  };

  // ---------------------------------------------------
  // תצוגת הטופס:
  // משתנה בהתאם למצב Login/Register
  // כולל הודעות שגיאה/הצלחה, כפתורים, קישורים ועוד
  // ---------------------------------------------------
  return (
    <form className={styles.formContainer} onSubmit={handleSubmit}>
      <h1 className={styles.title}>{isLoginMode ? "ברוכים הבאים" : "הרשמה"}</h1>
      <p className={styles.subtitle}>
        {isLoginMode
          ? "הזן את האימייל והסיסמה שלך להתחברות"
          : "מלא את הפרטים ליצירת חשבון חדש"}
      </p>

      {/* Error Display */}
      {/* הצגת שגיאה כללית אם קיימת */}
      {error && (
        <ErrorMessage
          error={error}
          onClose={clearError}
          className={styles.errorMessage}
        />
      )}

      {/* Success Display */}
      {/* הצגת הודעת הצלחה (למשל אחרי הרשמה) */}
      {success && (
        <ErrorMessage
          error={success}
          type="success"
          onClose={() => setSuccess("")}
          className={styles.successMessage}
        />
      )}

      {/* אזור שדות הטופס */}
      <div className={styles.inputGrid}>
        {/* במצב הרשמה מציגים גם שם פרטי/משפחה וטלפון */}
        {!isLoginMode && (
          <>
            <input
              type="text"
              name="firstName"
              placeholder="שם פרטי"
              className={styles.inputField}
              value={formData.firstName}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
            <input
              type="text"
              name="lastName"
              placeholder="שם משפחה"
              className={styles.inputField}
              value={formData.lastName}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
            <input
              type="tel"
              name="phone"
              placeholder="מספר טלפון"
              className={styles.inputField}
              value={formData.phone}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
          </>
        )}

        {/* אימייל - תמיד מופיע */}
        <input
          type="email"
          name="email"
          placeholder="אימייל"
          className={styles.inputField}
          value={formData.email}
          onChange={handleInputChange}
          required
          disabled={isLoading}
          autoComplete="email"
        />

        {/* סיסמה - תמיד מופיעה */}
        <input
          type="password"
          name="password"
          placeholder="סיסמה"
          className={styles.inputField}
          value={formData.password}
          onChange={handleInputChange}
          required
          disabled={isLoading}
          autoComplete={isLoginMode ? "current-password" : "new-password"}
        />

        {/* אימות סיסמה מופיע רק בהרשמה */}
        {!isLoginMode && (
          <input
            type="password"
            name="confirmPassword"
            placeholder="אימות סיסמה"
            className={styles.inputField}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
            disabled={isLoading}
          />
        )}
      </div>

      {/* כפתורי מילוי מהיר (רק במצב התחברות) */}
      {isLoginMode && (
        <div className={styles.quickLoginContainer}>
          <button
            type="button"
            className={styles.quickLoginButton}
            onClick={() => handleQuickFill("customer")}
            disabled={isLoading}
          >
            User
          </button>
          <button
            type="button"
            className={styles.quickLoginButton}
            onClick={() => handleQuickFill("business_owner")}
            disabled={isLoading}
          >
            Owner
          </button>
          <button
            type="button"
            className={styles.quickLoginButton}
            onClick={() => handleQuickFill("admin")}
            disabled={isLoading}
          >
            Admin
          </button>
        </div>
      )}

      {/* כפתור שליחה לטופס */}
      <button
        type="submit"
        className={styles.submitButton}
        disabled={isLoading}
      >
        {isLoading && (
          <LoadingSpinner
            size="small"
            color="white"
            className={styles.buttonSpinner}
          />
        )}
        {isLoading
          ? isLoginMode
            ? "מתחבר..."
            : "רושם..."
          : isLoginMode
          ? "התחבר"
          : "הרשם"}
      </button>

      {/* מעבר בין התחברות להרשמה */}
      <button
        type="button"
        className={styles.switchLink}
        onClick={() => setIsLoginMode((prevMode) => !prevMode)}
        disabled={isLoading}
      >
        {isLoginMode ? "אין לך חשבון? הרשם כאן" : "יש לך כבר חשבון? התחבר כאן"}
      </button>

      {/* Business Registration Link */}
      {/* קישור לרישום בית עסק חדש */}
      <div className={styles.businessRegisterContainer}>
        <p className={styles.businessRegisterText}>יש לך עסק?</p>
        <button
          type="button"
          className={styles.businessRegisterLink}
          onClick={() => navigate("/register-business")}
          disabled={isLoading}
        >
          רשום את העסק שלך כאן
        </button>
      </div>
    </form>
  );
}

export default AuthPage;
