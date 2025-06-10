const dbSingleton = require("../dbSingleton");

// יצירת עסק חדש (placeholder)
const createBusiness = async (req, res) => {
  res.send("createBusiness placeholder");
};

// שליפת כל העסקים (placeholder)
const getAllBusinesses = async (req, res) => {
  res.send("getAllBusinesses placeholder");
};

// שליפת עסק לפי מזהה
const getBusinessById = async (req, res) => {
  const businessId = req.params.id;

  try {
    const db = await dbSingleton.getConnection(); // התחברות למסד

    const [rows] = await db.query(
      "SELECT * FROM businesses WHERE business_id = ?",
      [businessId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "עסק לא נמצא" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching business:", error);
    res.status(500).json({ error: "שגיאה בשרת", details: error.message });
  }
};

module.exports = {
  createBusiness,
  getAllBusinesses,
  getBusinessById,
};
