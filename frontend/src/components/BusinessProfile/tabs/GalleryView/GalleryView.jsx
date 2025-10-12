// src/components/BusinessProfile/tabs/galleryView.jsx
import styles from "./GalleryView.module.css";

export default function GalleryView({ images = [] }) {
  if (!images.length) {
    return <div className={styles.empty}>אין תמונות בגלריה עדיין.</div>;
  }
  return (
    <div className={styles.galleryGrid}>
      {images.map((url, idx) => (
        <div key={idx} className={styles.imageBox}>
          <img src={url} alt={`gallery-img-${idx}`} className={styles.image} />
        </div>
      ))}
    </div>
  );
}
