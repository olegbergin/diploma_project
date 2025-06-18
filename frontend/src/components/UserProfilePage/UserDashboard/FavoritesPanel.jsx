// ---------------------------------------------------------------------------
// קומפוננטה: עסקים שאהבתי (FavoritesPanel)
// מציגה: רשימת העסקים שסומנו ע"י המשתמש כאהובים, כולל כפתור מעבר לעמוד עסק
// Component: FavoritesPanel – shows user's favorite businesses, with a button to view business page
// ---------------------------------------------------------------------------

import React, { useEffect, useState } from "react";
import axiosInstance from "../../../api/axiosInstance";
import styles from "./FavoritesPanel.module.css"; // ודא שיש לך קובץ כזה, אפשר לייצר על פי הצורך

export default function FavoritesPanel({ userId }) {
  // --- State: רשימת עסקים אהובים וסטטוס טעינה
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- טעינת עסקים אהובים עבור המשתמש / Fetch user's favorite businesses
  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get(`/users/${userId}/favorites`)
      .then((res) => setFavorites(res.data))
      .catch(() => setFavorites([]))
      .finally(() => setLoading(false));
  }, [userId]);

  // --- טעינה / טקסט ריק / Empty & loading states
  if (loading) return <div className={styles.loading}>טוען עסקים...</div>;
  if (favorites.length === 0)
    return <div className={styles.empty}>אין עסקים שאהבת.</div>;

  // --- רנדר רשימת העסקים / Render favorites list
  return (
    <div className={styles.panelContainer}>
      <h3 className={styles.title}>העסקים שאהבת</h3>
      <ul className={styles.list}>
        {favorites.map((biz) => (
          <li key={biz.business_id} className={styles.listItem}>
            {/* Optional: Business image */}
            {/* {biz.image_url && (
              <img src={biz.image_url} alt={biz.business_name} className={styles.businessImage} />
            )} */}
            <span className={styles.businessName}>{biz.business_name}</span>
            <button
              className={styles.goButton}
              onClick={() =>
                window.open(`/business/${biz.business_id}`, "_self")
              }
            >
              לעמוד העסק
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
