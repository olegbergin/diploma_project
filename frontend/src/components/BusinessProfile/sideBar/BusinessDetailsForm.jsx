import { useState } from "react";
import styles from "./‎BusinessDetailsForm.module.css";

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

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ ...initialData, ...form });
  }

  function handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      setForm((p) => ({ ...p, image_url: reader.result }));
    reader.readAsDataURL(file);
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
              required
              className={styles.input}
            />
          </label>
          <label>
            קטגוריה
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
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
          <label>
            תמונת פרופיל
            <input type="file" accept="image/*" onChange={handleImage} />
          </label>
          {form.image_url && (
            <img
              src={form.image_url}
              alt="preview"
              className={styles.preview}
            />
          )}
        </div>
      </div>
      <div className={styles.formActionsCenter}>
        <button type="submit" className={styles.save}>
          שמור
        </button>
      </div>
    </form>
  );
}
