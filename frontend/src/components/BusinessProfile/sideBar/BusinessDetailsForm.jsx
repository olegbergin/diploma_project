import { useState } from "react";
import styles from "./‎BusinessDetailsForm.module.css";
import axios from "axios";

const CATEGORY_OPTIONS = [
  "מספרה",
  "מניקור פדיקור",
  "קוסמטיקה",
  "קעקועים",
  "עיסוי וטיפול",
  "חיות מחמד",
  "ספורט",
  "בריאות",
  "מסעדה",
  "סלון יופי",
  "אחר",
];

export default function BusinessDetailsForm({ initialData, onSave }) {
  // נא למלא תמיד את initialData עם הערכים מהשרת!
  const [form, setForm] = useState({
    name: initialData.name ?? "",
    category: initialData.category ?? "",
    description: initialData.description ?? "",
    schedule: initialData.schedule ?? "",
    address: initialData.address ?? "",
    phone: initialData.phone ?? "",
    email: initialData.email ?? "",
    image_url: initialData.image_url ?? "",
  });

  const [msg, setMsg] = useState("");
  const [imgFile, setImgFile] = useState(null);
  const [imgMsg, setImgMsg] = useState("");
  const [pwd, setPwd] = useState({ current: "", newPass: "", confirm: "" });
  const [pwdMsg, setPwdMsg] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImgFile(file);
    const reader = new FileReader();
    reader.onloadend = () =>
      setForm((p) => ({ ...p, image_url: reader.result }));
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    // שולחים לעריכה את כל הערכים (או הערך הקיים אם השדה ריק)
    const updated = {
      name: form.name || initialData.name || "",
      category: form.category || initialData.category || "",
      description: form.description || initialData.description || "",
      schedule:
        typeof form.schedule === "string" && form.schedule.trim() === ""
          ? initialData.schedule || null
          : form.schedule,
      address: form.address || initialData.address || "",
      phone: form.phone || initialData.phone || "",
      email: form.email || initialData.email || "",
      image_url: form.image_url || initialData.image_url || "",
    };
    try {
      await axios.put(`/api/businesses/${initialData.business_id}`, updated);
      setMsg("השינויים נשמרו בהצלחה!");
      onSave({ ...initialData, ...updated });
    } catch (err) {
      setMsg("אירעה שגיאה. נסי שנית.");
    }
  }

  async function handleImageSave(e) {
    e.preventDefault();
    setImgMsg("");
    if (!imgFile) return setImgMsg("בחרי קובץ תמונה קודם.");
    try {
      const formData = new FormData();
      formData.append("image", imgFile);
      // דוגמה – יש להתאים ל-backend שלך (לא כלול כאן)
      await axios.post(
        `/api/businesses/${initialData.business_id}/upload-image`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setImgMsg("התמונה נשמרה בהצלחה!");
      onSave({ ...form, image_url: form.image_url });
    } catch {
      setImgMsg("שגיאה בשמירת התמונה.");
    }
  }

  async function handlePwdSave(e) {
    e.preventDefault();
    setPwdMsg("");
    if (!pwd.current || !pwd.newPass || !pwd.confirm) {
      setPwdMsg("יש למלא את כל השדות.");
      return;
    }
    if (pwd.newPass !== pwd.confirm) {
      setPwdMsg("הסיסמה החדשה ואימות הסיסמה אינן תואמות.");
      return;
    }
    try {
      await axios.post(
        `/api/businesses/${initialData.business_id}/change-password`,
        {
          currentPassword: pwd.current,
          newPassword: pwd.newPass,
        }
      );
      setPwdMsg("הסיסמה עודכנה בהצלחה!");
      setPwd({ current: "", newPass: "", confirm: "" });
    } catch {
      setPwdMsg("שגיאה בעדכון הסיסמה. ודאי שהסיסמה הנוכחית נכונה.");
    }
  }

  return (
    <form className={styles.formPage} onSubmit={handleSubmit}>
      <h2 className={styles.formTitle}>עריכת פרטי העסק</h2>
      <div className={styles.formColumns}>
        {/* טור ימין */}
        <div className={styles.formColumn}>
          <label>
            שם העסק
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className={styles.input}
            />
          </label>
          <label>
            קטגוריה
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="">בחר קטגוריה...</option>
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>
          <label>
            תיאור
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className={styles.textarea}
            />
          </label>
          <label>
            שעות פתיחה
            <input
              name="schedule"
              value={form.schedule}
              onChange={handleChange}
              placeholder="א-ה 08:00-17:00"
              className={styles.input}
            />
          </label>
        </div>
        {/* טור שמאל */}
        <div className={styles.formColumn}>
          <label>
            טלפון עסקי
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              type="tel"
              className={styles.input}
            />
          </label>
          <label>
            מייל עסקי
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              className={styles.input}
            />
          </label>
          <label>
            כתובת
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              className={styles.input}
            />
          </label>
        </div>
      </div>

      <div className={styles.formActionsCenter}>
        <button type="submit" className={styles.save}>
          שמור שינויים
        </button>
      </div>
      {msg && <div style={{ textAlign: "center", marginTop: 10 }}>{msg}</div>}

      {/* --- אזור החלפת תמונת פרופיל --- */}
      <hr style={{ margin: "30px 0" }} />
      <h3 style={{ textAlign: "center", color: "#a33fe7" }}>
        החלפת תמונת פרופיל
      </h3>
      <div style={{ textAlign: "center" }}>
        <img
          src={form.image_url || "/images/placeholder_business.png"}
          alt="תמונה נוכחית"
          className={styles.preview}
          style={{ maxWidth: 200, margin: "0 auto 12px" }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 18 }}>
        <input
          type="file"
          accept="image/*"
          onChange={handleImage}
          style={{ marginBottom: 0 }}
        />
        <button className={styles.save} onClick={handleImageSave} type="button">
          שמור תמונה חדשה
        </button>
      </div>
      {imgMsg && (
        <div style={{ textAlign: "center", marginTop: 7 }}>{imgMsg}</div>
      )}

      {/* --- אזור שינוי סיסמה --- */}
      <hr style={{ margin: "30px 0" }} />
      <h3 style={{ textAlign: "center", color: "#a33fe7" }}>שינוי סיסמה</h3>
      <div style={{ maxWidth: 340, margin: "0 auto" }}>
        <label>
          סיסמה נוכחית
          <input
            type="password"
            value={pwd.current}
            onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
            className={styles.input}
          />
        </label>
        <label>
          סיסמה חדשה
          <input
            type="password"
            value={pwd.newPass}
            onChange={(e) => setPwd({ ...pwd, newPass: e.target.value })}
            className={styles.input}
          />
        </label>
        <label>
          אימות סיסמה חדשה
          <input
            type="password"
            value={pwd.confirm}
            onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
            className={styles.input}
          />
        </label>
        <div className={styles.formActionsCenter}>
          <button
            type="button"
            className={styles.save}
            onClick={handlePwdSave}
            style={{ minWidth: 140 }}
          >
            שמור סיסמה חדשה
          </button>
        </div>
        {pwdMsg && (
          <div style={{ textAlign: "center", marginTop: 7 }}>{pwdMsg}</div>
        )}
      </div>
    </form>
  );
}
