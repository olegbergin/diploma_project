import React, { useState } from 'react';
import styles from './ProfileView.module.css';

export default function ProfileView({ user }) {
  const [activeSection, setActiveSection] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || user?.first_name || '',
    lastName: user?.lastName || user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatarUrl || user?.avatar_url || null
  });

  const profileSections = [
    {
      key: 'personal',
      label: 'פרטים אישיים',
      icon: '👤',
      description: 'עדכן את הפרטים האישיים שלך'
    },
    {
      key: 'preferences',
      label: 'העדפות',
      icon: '⚙️',
      description: 'התאם את ההעדפות שלך'
    },
    {
      key: 'notifications',
      label: 'התראות',
      icon: '🔔',
      description: 'נהל את ההתראות שלך'
    },
    {
      key: 'privacy',
      label: 'פרטיות ואבטחה',
      icon: '🔒',
      description: 'הגדרות פרטיות ואבטחה'
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Handle save logic here
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || user?.first_name || '',
      lastName: user?.lastName || user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      avatar: user?.avatarUrl || user?.avatar_url || null
    });
    setIsEditing(false);
  };

  const renderPersonalInfo = () => (
    <div className={styles.sectionContent}>
      <div className={styles.profilePicture}>
        <div className={styles.avatarContainer}>
          {formData.avatar ? (
            <img 
              src={formData.avatar} 
              alt="תמונת פרофיל"
              className={styles.avatarImage}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {(formData.firstName?.charAt(0) || 'U').toUpperCase()}
            </div>
          )}
          {isEditing && (
            <button className={styles.changeAvatarButton}>
              📷 שנה תמונה
            </button>
          )}
        </div>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.label}>שם פרטי</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className={styles.input}
              placeholder="הכנס שם פרטי"
            />
          ) : (
            <div className={styles.displayValue}>{formData.firstName || 'לא הוגדר'}</div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>שם משפחה</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className={styles.input}
              placeholder="הכנס שם משפחה"
            />
          ) : (
            <div className={styles.displayValue}>{formData.lastName || 'לא הוגדר'}</div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>אימייל</label>
          {isEditing ? (
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={styles.input}
              placeholder="הכנס כתובת אימייל"
            />
          ) : (
            <div className={styles.displayValue}>{formData.email || 'לא הוגדר'}</div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>טלפון</label>
          {isEditing ? (
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={styles.input}
              placeholder="הכנס מספר טלפון"
            />
          ) : (
            <div className={styles.displayValue}>{formData.phone || 'לא הוגדר'}</div>
          )}
        </div>
      </div>

      <div className={styles.profileStats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📅</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>12</div>
            <div className={styles.statLabel}>תורים השנה</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>⭐</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>7</div>
            <div className={styles.statLabel}>עסקים מועדפים</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🌟</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>4.8</div>
            <div className={styles.statLabel}>דירוג ממוצע</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className={styles.sectionContent}>
      <div className={styles.preferenceGroup}>
        <h3 className={styles.preferenceTitle}>העדפות חיפוש</h3>
        <div className={styles.preferenceOptions}>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" className={styles.checkbox} defaultChecked />
            <span className={styles.checkboxText}>הצג רק עסקים פתוחים</span>
          </label>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" className={styles.checkbox} defaultChecked />
            <span className={styles.checkboxText}>מיין לפי דירוג</span>
          </label>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" className={styles.checkbox} />
            <span className={styles.checkboxText}>הצג רק עסקים עם זמינות מיידית</span>
          </label>
        </div>
      </div>

      <div className={styles.preferenceGroup}>
        <h3 className={styles.preferenceTitle}>קטגוריות מועדפות</h3>
        <div className={styles.categoryTags}>
          {['יופי ועיצוב', 'בריאות ורווחה', 'קוסמטיקה', 'מסאז\'', 'כושר'].map(category => (
            <button key={category} className={styles.categoryTag}>
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.preferenceGroup}>
        <h3 className={styles.preferenceTitle}>רדיוס חיפוש</h3>
        <div className={styles.sliderContainer}>
          <input 
            type="range" 
            min="1" 
            max="50" 
            defaultValue="10" 
            className={styles.slider}
          />
          <div className={styles.sliderLabels}>
            <span>1 ק"מ</span>
            <span>10 ק"מ</span>
            <span>50 ק"מ</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className={styles.sectionContent}>
      <div className={styles.notificationGroup}>
        <h3 className={styles.notificationTitle}>התראות תורים</h3>
        <div className={styles.notificationOptions}>
          <label className={styles.switchLabel}>
            <span className={styles.switchText}>התראה 24 שעות לפני התור</span>
            <div className={styles.switch}>
              <input type="checkbox" className={styles.switchInput} defaultChecked />
              <span className={styles.switchSlider}></span>
            </div>
          </label>
          <label className={styles.switchLabel}>
            <span className={styles.switchText}>התראה שעה לפני התור</span>
            <div className={styles.switch}>
              <input type="checkbox" className={styles.switchInput} defaultChecked />
              <span className={styles.switchSlider}></span>
            </div>
          </label>
          <label className={styles.switchLabel}>
            <span className={styles.switchText}>אישור תורים חדשים</span>
            <div className={styles.switch}>
              <input type="checkbox" className={styles.switchInput} defaultChecked />
              <span className={styles.switchSlider}></span>
            </div>
          </label>
        </div>
      </div>

      <div className={styles.notificationGroup}>
        <h3 className={styles.notificationTitle}>התראות מיוחדות</h3>
        <div className={styles.notificationOptions}>
          <label className={styles.switchLabel}>
            <span className={styles.switchText}>הנחות ומבצעים</span>
            <div className={styles.switch}>
              <input type="checkbox" className={styles.switchInput} />
              <span className={styles.switchSlider}></span>
            </div>
          </label>
          <label className={styles.switchLabel}>
            <span className={styles.switchText}>עסקים חדשים באזור</span>
            <div className={styles.switch}>
              <input type="checkbox" className={styles.switchInput} />
              <span className={styles.switchSlider}></span>
            </div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderPrivacy = () => (
    <div className={styles.sectionContent}>
      <div className={styles.privacyGroup}>
        <h3 className={styles.privacyTitle}>הגדרות פרטיות</h3>
        <div className={styles.privacyOptions}>
          <label className={styles.switchLabel}>
            <span className={styles.switchText}>הצג פרופיל לעסקים</span>
            <div className={styles.switch}>
              <input type="checkbox" className={styles.switchInput} defaultChecked />
              <span className={styles.switchSlider}></span>
            </div>
          </label>
          <label className={styles.switchLabel}>
            <span className={styles.switchText}>שתף היסטוריית ביקורים</span>
            <div className={styles.switch}>
              <input type="checkbox" className={styles.switchInput} />
              <span className={styles.switchSlider}></span>
            </div>
          </label>
        </div>
      </div>

      <div className={styles.securitySection}>
        <h3 className={styles.securityTitle}>אבטחה</h3>
        <div className={styles.securityActions}>
          <button className={styles.securityButton}>
            🔑 שנה סיסמה
          </button>
          <button className={styles.securityButton}>
            📱 הגדר אימות דו-שלבי
          </button>
          <button className={`${styles.securityButton} ${styles.danger}`}>
            🗑️ מחק חשבון
          </button>
        </div>
      </div>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'personal':
        return renderPersonalInfo();
      case 'preferences':
        return renderPreferences();
      case 'notifications':
        return renderNotifications();
      case 'privacy':
        return renderPrivacy();
      default:
        return renderPersonalInfo();
    }
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <h1 className={styles.pageTitle}>הפרופיל שלי</h1>
        <p className={styles.pageDescription}>
          נהל את הפרטים האישיים וההעדפות שלך
        </p>
      </div>

      <div className={styles.profileLayout}>
        <nav className={styles.profileNav}>
          {profileSections.map(section => (
            <button
              key={section.key}
              className={`${styles.navButton} ${activeSection === section.key ? styles.active : ''}`}
              onClick={() => setActiveSection(section.key)}
            >
              <span className={styles.navIcon}>{section.icon}</span>
              <div className={styles.navContent}>
                <span className={styles.navLabel}>{section.label}</span>
                <span className={styles.navDescription}>{section.description}</span>
              </div>
            </button>
          ))}
        </nav>

        <main className={styles.profileMain}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionInfo}>
              <h2 className={styles.sectionTitle}>
                {profileSections.find(s => s.key === activeSection)?.label}
              </h2>
              <p className={styles.sectionDescription}>
                {profileSections.find(s => s.key === activeSection)?.description}
              </p>
            </div>
            
            {activeSection === 'personal' && (
              <div className={styles.sectionActions}>
                {isEditing ? (
                  <>
                    <button 
                      className={`${styles.actionButton} ${styles.secondary}`}
                      onClick={handleCancel}
                    >
                      ביטול
                    </button>
                    <button 
                      className={`${styles.actionButton} ${styles.primary}`}
                      onClick={handleSave}
                    >
                      💾 שמור
                    </button>
                  </>
                ) : (
                  <button 
                    className={`${styles.actionButton} ${styles.primary}`}
                    onClick={() => setIsEditing(true)}
                  >
                    ✏️ ערוך
                  </button>
                )}
              </div>
            )}
          </div>

          {renderSectionContent()}
        </main>
      </div>
    </div>
  );
}