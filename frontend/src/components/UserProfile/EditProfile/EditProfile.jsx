import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import styles from "./EditProfile.module.css";

export default function EditProfile({ user }) {
  const navigate = useNavigate();
  const userId = user?.user_id ?? user?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  // שינוי סיסמה
  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwdForm, setPwdForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdErrors, setPwdErrors] = useState({});

  // טען פרטים
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get(`/users/${userId}`);
        setForm({
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          phone: data.phone || "",
        });
      } catch (e) {
        setMsg("שגיאה בטעינת פרטי המשתמש");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (userId) load();
  }, [userId]);

  const onChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors({});
    setMsg("");
  };

  const validate = () => {
    const e = {};
    if (!form.firstName || form.firstName.trim().length < 2)
      e.firstName = "שם פרטי חייב לפחות 2 תווים";
    if (!form.lastName || form.lastName.trim().length < 2)
      e.lastName = "שם משפחה חייב לפחות 2 תווים";
    if (!form.phone || !/^[0-9+\-\s()]{10,}$/.test(form.phone.trim()))
      e.phone = "מספר טלפון לא תקין";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSaving(true);
      await axiosInstance.put(`/users/${userId}`, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
      });
      setMsg("הפרטים נשמרו בהצלחה");
    } catch (e) {
      console.error(e);
      setMsg("שמירת פרטים נכשלה");
    } finally {
      setSaving(false);
    }
  };

  // שינוי סיסמה
  const onPwdChange = (e) => {
    setPwdForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setPwdErrors({});
    setPwdMsg("");
  };

  const validatePwd = () => {
    const e = {};
    if (!pwdForm.currentPassword) e.currentPassword = "יש להזין סיסמה נוכחית";
    if (!pwdForm.newPassword) e.newPassword = "יש להזין סיסמה חדשה";
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{3,8}$/;
    if (pwdForm.newPassword && !regex.test(pwdForm.newPassword)) {
      e.newPassword = "3–8 תווים, לפחות אות ומספר";
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      e.confirmPassword = "הסיסמאות אינן תואמות";
    }
    setPwdErrors(e);
    return Object.keys(e).length === 0;
  };

  const onPwdSubmit = async (e) => {
    e.preventDefault();
    if (!validatePwd()) return;
    try {
      await axiosInstance.post(`/users/${userId}/change-password`, {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      });
      setPwdMsg("הסיסמה הוחלפה בהצלחה");
      setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error(err);
      const apiErrors = err?.response?.data?.errors;
      if (apiErrors) setPwdErrors(apiErrors);
      else setPwdMsg("שגיאה בעדכון הסיסמה");
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loader}>
          <div className={styles.spinner} />
          <span>טוען…</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h1>עריכת פרופיל</h1>
          <button className={styles.linkBtn} onClick={() => navigate(-1)}>
            ⬅ חזרה
          </button>
        </div>

        <form onSubmit={onSave}>
          <div className={styles.formGrid}>
            <label>
              שם פרטי
              <input
                name="firstName"
                value={form.firstName}
                onChange={onChange}
              />
              {errors.firstName && (
                <span className={styles.err}>{errors.firstName}</span>
              )}
            </label>
            <label>
              שם משפחה
              <input
                name="lastName"
                value={form.lastName}
                onChange={onChange}
              />
              {errors.lastName && (
                <span className={styles.err}>{errors.lastName}</span>
              )}
            </label>
            <label>
              טלפון
              <input name="phone" value={form.phone} onChange={onChange} />
              {errors.phone && (
                <span className={styles.err}>{errors.phone}</span>
              )}
            </label>
          </div>

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.primaryBtn}
              disabled={saving}
            >
              {saving ? "שומר…" : "שמירת פרטים"}
            </button>
            {msg && <span className={styles.success}>{msg}</span>}
          </div>
        </form>
      </div>

      <div className={styles.card}>
        <div className={styles.pwdHeader}>
          <h2>שינוי סיסמה</h2>
          <button
            className={styles.linkBtn}
            onClick={() => setPwdOpen((o) => !o)}
          >
            {pwdOpen ? "הסתר" : "פתח"}
          </button>
        </div>

        {pwdOpen && (
          <form onSubmit={onPwdSubmit} className={styles.pwdGrid}>
            <label>
              סיסמה נוכחית
              <input
                type="password"
                name="currentPassword"
                value={pwdForm.currentPassword}
                onChange={onPwdChange}
              />
              {pwdErrors.currentPassword && (
                <span className={styles.err}>{pwdErrors.currentPassword}</span>
              )}
            </label>
            <label>
              סיסמה חדשה
              <input
                type="password"
                name="newPassword"
                value={pwdForm.newPassword}
                onChange={onPwdChange}
              />
              {pwdErrors.newPassword && (
                <span className={styles.err}>{pwdErrors.newPassword}</span>
              )}
            </label>
            <label>
              אימות סיסמה
              <input
                type="password"
                name="confirmPassword"
                value={pwdForm.confirmPassword}
                onChange={onPwdChange}
              />
              {pwdErrors.confirmPassword && (
                <span className={styles.err}>{pwdErrors.confirmPassword}</span>
              )}
            </label>

            <div className={styles.actions}>
              <button className={styles.primaryBtn}>עדכון סיסמה</button>
              {pwdMsg && <span className={styles.success}>{pwdMsg}</span>}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
