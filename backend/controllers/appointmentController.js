// פונקציית placeholder ליצירת תור
const createAppointment = (req, res) => {
  res.send("createAppointment placeholder");
};

// פונקציית placeholder לשליפת תורים לפי מזהה משתמש
const getAppointmentsForUser = (req, res) => {
  const userId = req.params.userId;
  res.send(`getAppointmentsForUser placeholder for user ${userId}`);
};

module.exports = {
  createAppointment,
  getAppointmentsForUser,
};
