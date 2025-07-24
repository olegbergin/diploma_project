/**
 * Personal Information Panel Component
 * Allows users to edit their personal profile information including name, phone, avatar, and password
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.user - Current user object with profile data
 * @param {Function} props.setUser - Function to update user state
 * @returns {JSX.Element} Personal info editing form
 */

import React, { useState, useRef } from "react";
import axiosInstance from "../../../api/axiosInstance";
import styles from "./PersonalInfoPanel.module.css";

export default function PersonalInfoPanel({ user, setUser }) {
  const [form, setForm] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    phone: user.phone || "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(
    user.avatarUrl || "/default-avatar.png"
  );
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef();
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Password change state
  const [pw, setPw] = useState({ current: "", newPw: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwErrors, setPwErrors] = useState({});

  /**
   * Validates form input fields
   * @param {Object} data - Form data to validate
   * @returns {Object} - Validation errors object
   */
  const validateForm = (data) => {
    const errors = {};
    
    if (!data.firstName?.trim()) {
      errors.firstName = "שם פרטי נדרש / First name required";
    } else if (data.firstName.length < 2) {
      errors.firstName = "שם פרטי חייב להכיל לפחות 2 תווים / First name must be at least 2 characters";
    }
    
    if (!data.lastName?.trim()) {
      errors.lastName = "שם משפחה נדרש / Last name required";
    } else if (data.lastName.length < 2) {
      errors.lastName = "שם משפחה חייב להכיל לפחות 2 תווים / Last name must be at least 2 characters";
    }
    
    if (!data.phone?.trim()) {
      errors.phone = "מספר טלפון נדרש / Phone number required";
    } else if (!/^[0-9+\-\s()]{10,}$/.test(data.phone)) {
      errors.phone = "מספר טלפון לא תקין / Invalid phone number";
    }
    
    return errors;
  };

  /**
   * Validates password according to registration rules
   * @param {string} password - Password to validate
   * @returns {string|null} - Error message or null if valid
   */
  const validatePassword = (password) => {
    if (!password) return "יש למלא סיסמה / Password required";
    
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{3,8}$/;
    if (!passwordRegex.test(password)) {
      return "הסיסמה חייבת להכיל 3-8 תווים עם לפחות אות אחת וספרה אחת / Password must be 3-8 characters long and contain at least one letter and one number";
    }
    
    return null;
  };

  /**
   * Handles form input changes for profile fields
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  /**
   * Handles password input changes with validation
   * @param {Event} e - Input change event
   */
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPw((prev) => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (pwErrors[name]) {
      setPwErrors((prev) => ({ ...prev, [name]: "" }));
    }
    
    // Real-time validation for new password
    if (name === "newPw" && value) {
      const error = validatePassword(value);
      setPwErrors((prev) => ({ ...prev, newPw: error || "" }));
    }
    
    // Real-time validation for password confirmation
    if (name === "confirm" && value && pw.newPw) {
      if (value !== pw.newPw) {
        setPwErrors((prev) => ({ ...prev, confirm: "הסיסמאות אינן תואמות / Passwords do not match" }));
      } else {
        setPwErrors((prev) => ({ ...prev, confirm: "" }));
      }
    }
  };

  /**
   * Handles avatar file selection and preview generation
   * @param {Event} e - File input change event
   */
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setAvatarFile(file);
    
    // Generate preview
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  /**
   * Fetches updated user data from server and updates local state
   * Called after successful profile updates
   */
  const updateUserFromServer = async () => {
    try {
      const { data } = await axiosInstance.get(`/users/${user.user_id}`);
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
    } catch (err) {
      console.error("Failed to refresh user data:", err);
    }
  };

  /**
   * Toggles edit mode and resets form to original values if canceling
   */
  const toggleEditMode = () => {
    if (isEditing) {
      // Cancel editing - reset form to original values
      setForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
      });
      setFormErrors({});
      setMsg("");
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setSaving(true);
    setMsg("");
    setFormErrors({});

    let uploadedAvatarUrl = form.avatarUrl || user.avatarUrl;
    if (avatarFile) {
      const data = new FormData();
      data.append("image", avatarFile);
      try {
        const res = await axiosInstance.post(`/upload`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploadedAvatarUrl = res.data.url;
      } catch {
        setMsg("אירעה שגיאה בהעלאת תמונה");
        setSaving(false);
        return;
      }
    }
    try {
      await axiosInstance.put(`/users/${user.user_id}`, {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        avatarUrl: uploadedAvatarUrl,
      });
      setMsg("הפרטים נשמרו בהצלחה!");
      setAvatarPreview(uploadedAvatarUrl);
      setAvatarFile(null);
      setIsEditing(false);
      await updateUserFromServer();
    } catch (error) {
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        setMsg("אירעה שגיאה בשמירה");
      }
    }
    setSaving(false);
  };

  // שינוי סיסמה
  const handlePwChange = async (e) => {
    e.preventDefault();
    setPwMsg("");
    setPwErrors({});
    
    const errors = {};
    
    if (!pw.current) {
      errors.current = "יש למלא סיסמה נוכחית / Current password required";
    }
    
    if (!pw.newPw) {
      errors.newPw = "יש למלא סיסמה חדשה / New password required";
    } else {
      const passwordError = validatePassword(pw.newPw);
      if (passwordError) {
        errors.newPw = passwordError;
      }
    }
    
    if (!pw.confirm) {
      errors.confirm = "יש לאמת את הסיסמה החדשה / Password confirmation required";
    } else if (pw.newPw && pw.newPw !== pw.confirm) {
      errors.confirm = "הסיסמאות אינן תואמות / Passwords do not match";
    }
    
    if (Object.keys(errors).length > 0) {
      setPwErrors(errors);
      return;
    }
    setPwSaving(true);
    try {
      await axiosInstance.post(`/users/${user.user_id}/change-password`, {
        currentPassword: pw.current,
        newPassword: pw.newPw,
      });
      setPwMsg("הסיסמה עודכנה בהצלחה! / Password changed successfully!");
      setPw({ current: "", newPw: "", confirm: "" });
    } catch (error) {
      if (error.response?.data?.errors) {
        setPwErrors(error.response.data.errors);
      } else {
        setPwMsg("אירעה שגיאה. ודא שהסיסמה הנוכחית תקינה.");
      }
    }
    setPwSaving(false);
  };

  return (
    <div className={styles.personalPanel}>
      <h2 className={styles.title}>פרטים אישיים</h2>
      {/* תמונת פרופיל והעלאה */}
      <div className={styles.avatarArea}>
        <img src={avatarPreview} alt="avatar" className={styles.avatar} />
        <button
          type="button"
          className={styles.avatarUploadBtn}
          onClick={() => fileInputRef.current.click()}
        >
          העלה תמונה
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleAvatarChange}
        />
      </div>
      {/* טופס פרטים אישיים */}
      <form className={styles.form} onSubmit={handleSave}>
        <label>שם פרטי</label>
        <input
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          disabled={!isEditing}
          className={formErrors.firstName ? styles.inputError : ''}
        />
        {formErrors.firstName && <div className={styles.errorMsg}>{formErrors.firstName}</div>}
        
        <label>שם משפחה</label>
        <input 
          name="lastName" 
          value={form.lastName} 
          onChange={handleChange} 
          disabled={!isEditing}
          className={formErrors.lastName ? styles.inputError : ''}
        />
        {formErrors.lastName && <div className={styles.errorMsg}>{formErrors.lastName}</div>}
        
        <label>טלפון</label>
        <input 
          name="phone" 
          value={form.phone} 
          onChange={handleChange} 
          disabled={!isEditing}
          className={formErrors.phone ? styles.inputError : ''}
        />
        {formErrors.phone && <div className={styles.errorMsg}>{formErrors.phone}</div>}
        
        <div className={styles.buttonGroup}>
          {!isEditing ? (
            <button type="button" onClick={toggleEditMode} className={styles.editBtn}>
              ערוך פרטים
            </button>
          ) : (
            <>
              <button type="submit" disabled={saving} className={styles.saveBtn}>
                {saving ? "שומר..." : "שמור"}
              </button>
              <button type="button" onClick={toggleEditMode} className={styles.cancelBtn}>
                בטל
              </button>
            </>
          )}
        </div>
        {msg && <div className={styles.msg}>{msg}</div>}
      </form>
      <hr className={styles.hr} />
      <h4 className={styles.subtitle}>שינוי סיסמה</h4>
      <form className={styles.form} onSubmit={handlePwChange}>
        <label>סיסמה נוכחית</label>
        <input
          type="password"
          name="current"
          value={pw.current}
          onChange={handlePasswordChange}
          autoComplete="current-password"
          className={pwErrors.current ? styles.inputError : ''}
        />
        {pwErrors.current && <div className={styles.errorMsg}>{pwErrors.current}</div>}
        
        <label>סיסמה חדשה</label>
        <input
          type="password"
          name="newPw"
          value={pw.newPw}
          onChange={handlePasswordChange}
          autoComplete="new-password"
          className={pwErrors.newPw ? styles.inputError : ''}
        />
        {pwErrors.newPw && <div className={styles.errorMsg}>{pwErrors.newPw}</div>}
        
        <label>אימות סיסמה חדשה</label>
        <input
          type="password"
          name="confirm"
          value={pw.confirm}
          onChange={handlePasswordChange}
          autoComplete="new-password"
          className={pwErrors.confirm ? styles.inputError : ''}
        />
        {pwErrors.confirm && <div className={styles.errorMsg}>{pwErrors.confirm}</div>}
        
        <button type="submit" disabled={pwSaving}>
          {pwSaving ? "מעדכן..." : "עדכן סיסמה"}
        </button>
        {pwMsg && <div className={styles.msg}>{pwMsg}</div>}
      </form>
    </div>
  );
}
