import { useRef, useState, useCallback, useEffect } from "react";
import useImageUpload from '../../../hooks/useImageUpload';
import DragDropUpload from '../../shared/DragDropUpload/DragDropUpload';
import styles from "./GalleryEdit.module.css";

export default function GalleryEdit({ gallery = [], onSave }) {
  const [images, setImages] = useState([...gallery]);
  const { isUploading } = useImageUpload();
  
  // Convert initial gallery URLs to proper format
  useEffect(() => {
    const formattedImages = gallery.map(item => {
      if (typeof item === 'string') {
        return { url: item, id: Date.now() + Math.random() };
      }
      return item;
    });
    setImages(formattedImages);
  }, [gallery]);


  const handleDelete = useCallback((imageId) => {
    setImages((prev) => prev.filter(img => img.id !== imageId));
  }, []);

  const handleSave = useCallback(() => {
    onSave?.(images);
  }, [images, onSave]);

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>עריכת גלריה</h2>


      <div className={styles.grid}>
        {images.map((image) => {
          const imageUrl = typeof image === 'string' ? image : image.url;
          const imageId = typeof image === 'string' ? image : image.id;
          
          return (
            <div key={imageId} className={styles.imageBox}>
              <img 
                src={imageUrl} 
                alt={`תמונה ${imageId}`} 
                className={styles.image}
                onError={(e) => {
                  console.error('Image load error:', imageUrl);
                  e.target.style.display = 'none';
                }}
              />
              <button 
                className={styles.delete} 
                onClick={() => handleDelete(imageId)}
                disabled={isUploading}
              >
                🗑
              </button>
            </div>
          );
        })}
        <DragDropUpload
          onUploadComplete={(uploadedImages) => {
            setImages((prev) => [...prev, ...uploadedImages]);
          }}
          multiple={true}
          disabled={isUploading}
          className={styles.dragDropArea}
        >
          <div className={styles.addBoxContent}>
            <span className={styles.addIcon}>{isUploading ? '⏳' : '+'}</span>
            <span className={styles.addText}>
              {isUploading ? 'מעלה...' : 'גרור תמונות כאן או לחץ לבחירה'}
            </span>
          </div>
        </DragDropUpload>
      </div>

      <button 
        onClick={handleSave} 
        className={styles.saveBtn}
        disabled={isUploading}
      >
        {isUploading ? 'מעלה תמונות...' : 'שמור שינויים'}
      </button>
    </section>
  );
}
