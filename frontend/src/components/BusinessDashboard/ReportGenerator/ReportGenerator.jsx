import React, { useState, useEffect } from "react";
import styles from "./ReportGenerator.module.css";
import axiosInstance from "../../../api/axiosInstance";

// קומפוננטה להפקת דוחות לעסק (יומי / חודשי / שנתי)
const ReportGenerator = ({ businessId }) => {
  // האם המודאל פתוח או לא
  const [isOpen, setIsOpen] = useState(false);

  // סוג הדוח שנבחר: day / month / year
  const [reportType, setReportType] = useState("month");

  // תאריך/חודש/שנה שנבחרו לפי סוג הדוח
  const [selectedDate, setSelectedDate] = useState("");

  // מצב טעינה בזמן פנייה לשרת
  const [loading, setLoading] = useState(false);

  // הודעת שגיאה להצגה למשתמש
  const [error, setError] = useState("");

  // נתוני טווח תאריכים זמינים לדוחות (אם יש נתונים)
  const [availableDates, setAvailableDates] = useState(null);

  // ---------------------------------------------------
  // אפקט: ברגע שהמודאל נפתח
  // 1. מביא תאריכים זמינים מהשרת
  // 2. קובע תאריך ברירת מחדל לפי סוג דוח
  // ---------------------------------------------------
  useEffect(() => {
    if (isOpen) {
      fetchAvailableDates();
      setDefaultDate();
    }
  }, [isOpen, businessId]);

  // ---------------------------------------------------
  // אפקט: כל שינוי בסוג דוח יעדכן תאריך ברירת מחדל מתאים
  // ---------------------------------------------------
  useEffect(() => {
    setDefaultDate();
  }, [reportType]);

  // ---------------------------------------------------
  // מביא מהשרת מידע על טווח התאריכים שיש לגביו נתונים לדוחות
  // ---------------------------------------------------
  const fetchAvailableDates = async () => {
    try {
      const response = await axiosInstance.get(
        `/businesses/${businessId}/reports/available-dates`
      );
      setAvailableDates(response.data);
    } catch (error) {
      console.error("Error fetching available dates:", error);
    }
  };

  // ---------------------------------------------------
  // קובע תאריך ברירת מחדל לפי סוג הדוח
  // ---------------------------------------------------
  const setDefaultDate = () => {
    const today = new Date();
    switch (reportType) {
      case "day":
        // ברירת מחדל לדוח יומי: היום בפורמט YYYY-MM-DD
        setSelectedDate(today.toISOString().split("T")[0]);
        break;
      case "month":
        // ברירת מחדל לדוח חודשי: חודש נוכחי בפורמט YYYY-MM
        setSelectedDate(today.toISOString().slice(0, 7));
        break;
      case "year":
        // ברירת מחדל לדוח שנתי: השנה הנוכחית
        setSelectedDate(today.getFullYear().toString());
        break;
      default:
        setSelectedDate("");
    }
  };

  // ---------------------------------------------------
  // הפקת דוח PDF והורדה אוטומטית
  // ---------------------------------------------------
  const handleGenerateReport = async () => {
    // אם לא נבחר תאריך -> מציג שגיאה
    if (!selectedDate) {
      setError("אנא בחר תאריך");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Generate and download PDF
      // פנייה לשרת להפקת PDF, מקבלת blob
      const response = await axiosInstance.get(
        `/businesses/${businessId}/reports/generate`,
        {
          params: {
            period: reportType,
            date: selectedDate,
          },
          responseType: "blob",
        }
      );

      // Create download link
      // יצירת קישור הורדה מקומי ל-PDF
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Generate filename
      // יצירת שם קובץ לפי סוג הדוח והתאריך
      const businessName = "business";
      const dateStr = selectedDate.replace(/[^0-9]/g, "_");
      link.download = `${businessName}_${reportType}_report_${dateStr}.pdf`;

      // הורדה בפועל
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Close modal on success
      // סגירת המודאל אם הכל הצליח
      setIsOpen(false);
    } catch (error) {
      console.error("Error generating report:", error);
      setError(
        error.response?.data?.error || "שגיאה ביצירת הדוח. אנא נסה שוב."
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------
  // תצוגה מקדימה של הדוח בחלון חדש (JSON)
  // ---------------------------------------------------
  const handlePreviewReport = async () => {
    if (!selectedDate) {
      setError("אנא בחר תאריך");
      return;
    }

    try {
      // בקשה לשרת לקבל נתוני תצוגה מקדימה
      const response = await axiosInstance.get(
        `/businesses/${businessId}/reports/preview`,
        {
          params: {
            period: reportType,
            date: selectedDate,
          },
        }
      );

      // Open preview in new window
      // פתיחת חלון חדש והצגת הנתונים בפורמט JSON
      const previewWindow = window.open("", "_blank");
      previewWindow.document.write(`
        <html>
          <head>
            <title>תצוגה מקדימה - דוח ${getReportTypeLabel()}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                direction: rtl; 
                text-align: right;
                margin: 20px;
                line-height: 1.6;
              }
              .header { 
                background: #667eea; 
                color: white; 
                padding: 20px; 
                margin-bottom: 20px;
                border-radius: 8px;
              }
              .metric { 
                background: #f8f9fa; 
                padding: 15px; 
                margin: 10px 0;
                border-radius: 5px;
                border-right: 4px solid #667eea;
              }
              .metric strong { color: #667eea; }
              pre { 
                background: #f8f9fa; 
                padding: 15px; 
                border-radius: 5px;
                overflow-x: auto;
                direction: ltr;
                text-align: left;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>תצוגה מקדימה - דוח ${getReportTypeLabel()}</h1>
              <p>תאריך: ${selectedDate}</p>
            </div>
            <div class="metric">
              <strong>סוג דוח:</strong> ${getReportTypeLabel()}
            </div>
            <div class="metric">
              <strong>תאריך:</strong> ${selectedDate}
            </div>
            <h3>נתוני הדוח:</h3>
            <pre>${JSON.stringify(response.data, null, 2)}</pre>
          </body>
        </html>
      `);
      previewWindow.document.close();
    } catch (error) {
      console.error("Error previewing report:", error);
      setError("שגיאה בתצוגה מקדימה");
    }
  };

  // ---------------------------------------------------
  // מחזיר שם בעברית לסוג הדוח שנבחר
  // ---------------------------------------------------
  const getReportTypeLabel = () => {
    switch (reportType) {
      case "day":
        return "יומי";
      case "month":
        return "חודשי";
      case "year":
        return "שנתי";
      default:
        return "";
    }
  };

  // ---------------------------------------------------
  // מחזיר סוג input מתאים לפי סוג הדוח
  // ---------------------------------------------------
  const getDateInputType = () => {
    switch (reportType) {
      case "day":
        return "date";
      case "month":
        return "month";
      case "year":
        return "number";
      default:
        return "text";
    }
  };

  // ---------------------------------------------------
  // מחזיר placeholder מתאים לשדה תאריך
  // ---------------------------------------------------
  const getDatePlaceholder = () => {
    switch (reportType) {
      case "day":
        return "בחר תאריך";
      case "month":
        return "בחר חודש";
      case "year":
        return "הכנס שנה (לדוגמה: 2025)";
      default:
        return "";
    }
  };

  // ---------------------------------------------------
  // אם המודאל לא פתוח – מציג רק כפתור הפקה
  // ---------------------------------------------------
  if (!isOpen) {
    return (
      <button className={styles.triggerButton} onClick={() => setIsOpen(true)}>
        📊 הפק דוח
      </button>
    );
  }

  // ---------------------------------------------------
  // תצוגת מודאל ההפקה
  // ---------------------------------------------------
  return (
    <div className={styles.overlay} onClick={() => setIsOpen(false)}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>הפקת דוח עסקי</h2>
          <button
            className={styles.closeButton}
            onClick={() => setIsOpen(false)}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <div className={styles.content}>
          {/* בחירת סוג דוח */}
          <div className={styles.field}>
            <label className={styles.label}>סוג דוח *</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className={styles.select}
              disabled={loading}
            >
              <option value="day">דוח יומי</option>
              <option value="month">דוח חודשי</option>
              <option value="year">דוח שנתי</option>
            </select>
          </div>

          {/* שדה תאריך שמתאים לסוג הדוח */}
          <div className={styles.field}>
            <label className={styles.label}>תאריך *</label>
            {reportType === "year" ? (
              <input
                type="number"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                placeholder={getDatePlaceholder()}
                className={styles.input}
                disabled={loading}
                min="2020"
                max={new Date().getFullYear()}
              />
            ) : (
              <input
                type={getDateInputType()}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                placeholder={getDatePlaceholder()}
                className={styles.input}
                disabled={loading}
                max={
                  reportType === "day"
                    ? new Date().toISOString().split("T")[0]
                    : undefined
                }
              />
            )}
          </div>

          {/* הצגת הודעה אם אין נתונים */}
          {availableDates && !availableDates.hasData && (
            <div className={styles.warning}>
              <p>אין נתונים זמינים לדוחות עדיין</p>
            </div>
          )}

          {/* הצגת טווח תאריכים אם יש נתונים */}
          {availableDates && availableDates.hasData && (
            <div className={styles.info}>
              <p>
                נתונים זמינים מ-{availableDates.earliestDate} עד{" "}
                {availableDates.latestDate}
              </p>
            </div>
          )}

          {/* הצגת שגיאה למשתמש */}
          {error && <div className={styles.error}>{error}</div>}

          {/* רשימת תכולת הדוח לפי סוג */}
          <div className={styles.reportInfo}>
            <h3>הדוח יכלול:</h3>
            <ul>
              {reportType === "day" && (
                <>
                  <li>סיכום תורים יומי</li>
                  <li>הכנסות יומיות</li>
                  <li>פילוח שירותים</li>
                  <li>פילוח שעתי</li>
                  <li>נתוני לקוחות</li>
                </>
              )}
              {reportType === "month" && (
                <>
                  <li>ביצועים חודשיים</li>
                  <li>מגמת הכנסות יומית</li>
                  <li>ביצועי שירותים</li>
                  <li>אנליטיקת לקוחות</li>
                  <li>סיכום ביקורות</li>
                </>
              )}
              {reportType === "year" && (
                <>
                  <li>סיכום ביצועים שנתי</li>
                  <li>ביצועים חודשיים</li>
                  <li>השירותים המובילים</li>
                  <li>אנליטיקת לקוחות מעמיקה</li>
                  <li>תובנות אסטרטגיות</li>
                  <li>המלצות לשנה הבאה</li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* כפתורי פעולה תחתונים */}
        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className={styles.cancelButton}
            disabled={loading}
          >
            ביטול
          </button>

          <button
            type="button"
            onClick={handlePreviewReport}
            className={styles.previewButton}
            disabled={loading || !selectedDate}
          >
            תצוגה מקדימה
          </button>

          <button
            type="button"
            onClick={handleGenerateReport}
            className={styles.generateButton}
            disabled={loading || !selectedDate}
          >
            {loading ? "מפיק דוח..." : "הפק והורד PDF"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;
