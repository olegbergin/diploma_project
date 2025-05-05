const db = require("../db");

const createAppointment = (req, res) => {
  const { userId, businessId, serviceId, date, time, status } = req.body;
  const sql =
    "INSERT INTO appointments (user_id, business_id, service_id, date, time, status) VALUES (?, ?, ?, ?, ?, ?)";
  db.getConnection().query(
    sql,
    [userId, businessId, serviceId, date, time, status],
    (err, result) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.status(201).json({ appointmentId: result.insertId });
    }
  );
};

const getAppointmentsForUser = (req, res) => {
  const sql = "SELECT * FROM appointments WHERE user_id = ?";
  db.getConnection().query(sql, [req.params.userId], (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.status(200).json(results);
  });
};

module.exports = { createAppointment, getAppointmentsForUser };
