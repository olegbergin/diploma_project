import { useState } from "react";
import styles from "./ServicesModal.module.css";

// משכי זמן לבחירה בלבד
const DURATION_OPTIONS = [
  { label: "15 דקות", value: 15 },
  { label: "30 דקות", value: 30 },
  { label: "45 דקות", value: 45 },
  { label: "שעה", value: 60 },
  { label: "שעה ורבע", value: 75 },
  { label: "שעה וחצי", value: 90 },
  { label: "שעתיים", value: 120 },
  { label: " שעתיים ורבע", value: 135 },
  { label: " שעתיים וחצי", value: 150 },
  { label: " שלוש שעות ", value: 180 },
];

export default function ServicesModal({ services, onSave, onClose }) {
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

  // עדכון שם או משך של שירות
  const updateService = (idx, key, value) => {
    const updated = list.map((s, i) =>
      i === idx
        ? { ...s, [key]: key === "duration" ? Number(value) : value }
        : s
    );
    setList(updated);
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        <h3>ניהול שירותים</h3>
        <ul>
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
                title="מחק"
                tabIndex={-1}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M5 5 L15 15 M15 5 L5 15"
                    stroke="#ff4160"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>

        {/* הוספת שירות חדש */}
        <div className={styles.addServiceRow}>
          <button className={styles.addBtn} onClick={addService}>
            הוסף שירות
          </button>
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
          <input
            className={styles.nameInput}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="שם שירות חדש"
          />
        </div>

        <div className={styles.bottomBtns}>
          <button onClick={() => onSave(list)}>שמור</button>
          <button onClick={onClose}>ביטול</button>
        </div>
      </div>
    </div>
  );
}
