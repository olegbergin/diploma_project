// src/components/UserProfilePage/UserDashboard/PersonalInfoPanel.jsx

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

  const [pw, setPw] = useState({ current: "", newPw: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  // אחרי שמירה – שלוף משתמש מעודכן
  const updateUserFromServer = async () => {
    try {
      const { data } = await axiosInstance.get(`/users/${user.user_id}`);
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
    } catch (err) {
      // הודעת שגיאה אם צריך
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");

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
      await updateUserFromServer();
    } catch {
      setMsg("אירעה שגיאה בשמירה");
    }
    setSaving(false);
  };

  // שינוי סיסמה
  const handlePwChange = async (e) => {
    e.preventDefault();
    setPwMsg("");
    if (!pw.current || !pw.newPw || !pw.confirm) {
      setPwMsg("יש למלא את כל השדות / All fields required");
      return;
    }
    if (pw.newPw.length < 6) {
      setPwMsg("הסיסמה החדשה צריכה להכיל לפחות 6 תווים");
      return;
    }
    if (pw.newPw !== pw.confirm) {
      setPwMsg("הסיסמאות אינן תואמות / Passwords do not match");
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
    } catch {
      setPwMsg("אירעה שגיאה. ודא שהסיסמה הנוכחית תקינה.");
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
        />
        <label>שם משפחה</label>
        <input name="lastName" value={form.lastName} onChange={handleChange} />
        <label>טלפון</label>
        <input name="phone" value={form.phone} onChange={handleChange} />
        <button type="submit" disabled={saving}>
          {saving ? "שומר..." : "שמור שינויים"}
        </button>
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
          onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
          autoComplete="current-password"
        />
        <label>סיסמה חדשה</label>
        <input
          type="password"
          name="newPw"
          value={pw.newPw}
          onChange={(e) => setPw((p) => ({ ...p, newPw: e.target.value }))}
          autoComplete="new-password"
        />
        <label>אימות סיסמה חדשה</label>
        <input
          type="password"
          name="confirm"
          value={pw.confirm}
          onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
          autoComplete="new-password"
        />
        <button type="submit" disabled={pwSaving}>
          {pwSaving ? "מעדכן..." : "עדכן סיסמה"}
        </button>
        {pwMsg && <div className={styles.msg}>{pwMsg}</div>}
      </form>
    </div>
  );
}
