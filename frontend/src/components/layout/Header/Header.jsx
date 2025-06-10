import styles from "./Header.module.css";
import HeaderControls from "../Header/HeaderControls";


export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>Diploma</div>

      {/* כפתורי הגדרות + התנתקות */}
      <HeaderControls />
    </header>
  );
}
