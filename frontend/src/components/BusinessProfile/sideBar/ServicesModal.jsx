import { useState } from "react";
import styles from "./ServicesModal.module.css";

// אופציות משך שירות
const DURATION_OPTIONS = [
  { label: "15 דקות", value: 15 },
  { label: "30 דקות", value: 30 },
  { label: "45 דקות", value: 45 },
  { label: "שעה", value: 60 },
  { label: "שעה ורבע", value: 75 },
  { label: "שעה וחצי", value: 90 },
  { label: "שעתיים", value: 120 },
  { label: "שעתיים ורבע", value: 135 },
  { label: "שעתיים וחצי", value: 150 },
  { label: "שלוש שעות", value: 180 },
];

export default function ServicesPanel({ services = [], onSave }) {
  const [list, setList] = useState(services || []);
  const [newName, setNewName] = useState("");
  const [newDuration, setNewDuration] = useState(30);

  // הוספת שירות חדש
  const addService = () => {
    if (!newName.trim()) return;
    setList([...list, { name: newName.trim(), duration: Number(newDuration) }]);
    setNewName("");
    setNewDuration(30);
  };

  // מחיקת שירות
  const removeService = (idx) => {
    setList(list.filter((_, i) => i !== idx));
  };

  // עדכון שם/משך שירות
  const updateService = (idx, key, value) => {
    const updated = list.map((s, i) =>
      i === idx
        ? { ...s, [key]: key === "duration" ? Number(value) : value }
        : s
    );
    setList(updated);
  };

  // שמירה
  const handleSave = () => {
    if (onSave) onSave(list);
  };

  return (
    <section className={styles.wrapper}>
      <h2 className={styles.heading}>ניהול שירותים</h2>
      <ul className={styles.servicesList}>
        {list.map((service, i) => (
          <li key={i} className={styles.serviceRow}>
            <input
              className={styles.nameInput}
              value={service.name}
              onChange={(e) => updateService(i, "name", e.target.value)}
              placeholder="שם השירות"
            />
            <select
              className={styles.durationSelect}
              value={service.duration}
              onChange={(e) => updateService(i, "duration", e.target.value)}
            >
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              className={styles.removeBtn}
              onClick={() => removeService(i)}
              title="מחק שירות"
              tabIndex={-1}
            >
              ❌
            </button>
          </li>
        ))}
      </ul>

      {/* הוספת שירות חדש */}
      <div className={styles.addServiceRow}>
        <input
          className={styles.nameInput}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="שם שירות חדש"
        />
        <select
          className={styles.durationSelect}
          value={newDuration}
          onChange={(e) => setNewDuration(Number(e.target.value))}
        >
          {DURATION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button className={styles.addBtn} onClick={addService}>
          הוסף שירות
        </button>
      </div>

      <div className={styles.bottomBtns}>
        <button className={styles.saveBtn} onClick={handleSave}>
          שמור
        </button>
      </div>
    </section>
  );
}
