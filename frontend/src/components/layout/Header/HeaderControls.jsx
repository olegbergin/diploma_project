import { FiSettings, FiLogOut } from "react-icons/fi";
import Button from "../../ui/Button"; // נתיב יחסי ל־Button.jsx

export default function HeaderControls() {
  return (
    <div className="controls">
      <Button variant="settings" icon={FiSettings}>
        הגדרות
      </Button>

      <Button variant="logout" icon={FiLogOut}>
        התנתקות
      </Button>
    </div>
  );
}
