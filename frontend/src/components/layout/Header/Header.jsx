import styles from "./header.module.css"; // Corrected filename to lowercase 'h'
import HeaderControls from "./HeaderControls"; // Corrected path to local import

// It's good practice to import Link if you plan to make the logo a link
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className={styles.header}>
      {/* Wrap logo with Link to make it navigable to homepage */}
      <Link to="/" className={styles.logoLink} aria-label="Go to homepage">
        <div className={styles.logo}>Diploma</div>
      </Link>

      {/* כפתורי הגדרות + התנתקות */}
      <HeaderControls />
    </header>
  );
}
