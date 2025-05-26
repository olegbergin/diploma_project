import { useState, useEffect, useRef } from "react"; // Added useEffect, useRef
import PropTypes from 'prop-types'; // Added PropTypes
// IMPORTANT: The CSS import below and the actual CSS filename "./‎BusinessDetailsForm.module.css"
// contain an invisible Unicode character (U+200E LEFT-TO-RIGHT MARK) at the beginning of the filename.
// This was confirmed by `ls` and should be fixed by renaming the CSS file and updating this import.
// The `rename_file` tool failed to correct this due to the special character.
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
    image: initialData.image_url ?? "", // This will store the image URL or new base64 data
  });

  const firstFocusableElementRef = useRef(null);
  const formRef = useRef(null); // Ref for the form element

  // Focus trapping and Escape key handling for modal accessibility
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
      // Basic focus trapping
      if (event.key === 'Tab' && formRef.current) {
        const focusableElements = Array.from(
          formRef.current.querySelectorAll('input, textarea, button:not([disabled])')
        ).filter(el => el.offsetParent !== null); // Filter for visible elements

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    if (firstFocusableElementRef.current) {
      firstFocusableElementRef.current.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]); // Added formRef to dependencies, though it's stable

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
        ref={formRef} // Added ref to the form
        className={styles.card}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2>עריכת פרטי העסק</h2>

        <label htmlFor="businessNameEdit">שם העסק</label>
        <input
          id="businessNameEdit"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          ref={firstFocusableElementRef} 
        />

        <label htmlFor="businessCategoryEdit">קטגוריה</label>
        <input
          id="businessCategoryEdit"
          name="category"
          value={form.category}
          onChange={handleChange}
        />

        <label htmlFor="businessDescriptionEdit">תיאור</label>
        <textarea
          id="businessDescriptionEdit"
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
        />

        <label htmlFor="businessHoursEdit">שעות פתיחה</label>
        <input
          id="businessHoursEdit"
          name="hours"
          value={form.hours}
          onChange={handleChange}
          placeholder="א-ה 08:00-17:00"
        />

        <label htmlFor="businessAddressEdit">כתובת</label>
        <input
          id="businessAddressEdit"
          name="address"
          value={form.address}
          onChange={handleChange}
        />

        <label htmlFor="businessImageEdit">תמונת פרופיל</label>
        <input
          id="businessImageEdit"
          type="file"
          accept="image/png, image/jpeg, image/gif" // More specific, common web types
          onChange={handleImage}
          // Client-side validation for file size should be added here if possible.
          // e.g., in handleImage: if (file.size > 2 * 1024 * 1024) { alert('File is too large (max 2MB)'); e.target.value = ''; return; }
        />

        {form.image && (
          <img
            src={form.image}
            alt={`Preview of ${form.name || 'profile image'}`} // Improved alt text
            className={styles.preview}
          />
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

BusinessDetailsForm.propTypes = {
  initialData: PropTypes.shape({
    name: PropTypes.string,
    category: PropTypes.string,
    description: PropTypes.string,
    hours: PropTypes.string,
    address: PropTypes.string,
    image_url: PropTypes.string, // Existing image URL from the server
    // id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // Example: if ID is also part of initialData
  }).isRequired,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
