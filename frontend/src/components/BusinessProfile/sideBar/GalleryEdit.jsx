import { useRef, useState } from "react";
import styles from "./GalleryEdit.module.css";

export default function GalleryEdit({ gallery = [], onSave }) {
  const [images, setImages] = useState([...gallery]);
  const fileInputRef = useRef(null);

  const handleAdd = (e) => {
    const files = Array.from(e.target.files);
    const urls = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...urls]);
  };

  const handleDelete = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    onSave?.(images);
  };

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>עריכת גלריה</h2>

      <div className={styles.grid}>
        {images.map((src, i) => (
          <div key={i} className={styles.imageBox}>
            <img src={src} alt={`img-${i}`} className={styles.image} />
            <button className={styles.delete} onClick={() => handleDelete(i)}>
              🗑
            </button>
          </div>
        ))}
        <div
          className={styles.addBox}
          onClick={() => fileInputRef.current.click()}
        >
          <span>+</span>
          <span>הוסף תמונות</span>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={handleAdd}
      />
      <button onClick={handleSave} className={styles.saveBtn}>
        שמור שינויים
      </button>
    </section>
  );
}
