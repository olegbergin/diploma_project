import { useState } from "react";
import styles from "./‎BusinessDetailsForm.module.css";

/**
 * מודאל לעריכת פרטי העסק
 * props:
 *  – initialData  (אובייקט העסק הנוכחי)
 *  – onSave(data) (נקרא בלחיצה על “שמור” עם הערכים המעודכנים)
 *  – onClose()    (סגירת המודאל ללא שמירה)
 */
export default function BusinessDetailsForm({ initialData, onSave, onClose }) {
  const [form, setForm] = useState({
    name: initialData.name ?? "",
    category: initialData.category ?? "",
    description: initialData.description ?? "",
    hours: initialData.hours ?? "",
    address: initialData.address ?? "",
    image: initialData.image_url ?? "",
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
    reader.onloadend = () => setForm((p) => ({ ...p, image: reader.result }));
    reader.readAsDataURL(file);
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <form
        className={styles.card}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2>עריכת פרטי העסק</h2>

        <label>
          שם העסק
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          קטגוריה
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
          />
        </label>

        <label>
          תיאור
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
          />
        </label>

        <label>
          שעות פתיחה
          <input
            name="hours"
            value={form.hours}
            onChange={handleChange}
            placeholder="א-ה 08:00-17:00"
          />
        </label>

        <label>
          כתובת
          <input name="address" value={form.address} onChange={handleChange} />
        </label>

        <label>
          תמונת פרופיל
          <input type="file" accept="image/*" onChange={handleImage} />
        </label>

        {form.image && (
          <img src={form.image} alt="preview" className={styles.preview} />
        )}

        <div className={styles.actions}>
          <button type="submit" className={styles.save}>
            שמור
          </button>
          <button type="button" className={styles.cancel} onClick={onClose}>
            בטל
          </button>
        </div>
      </form>
    </div>
  );
}
