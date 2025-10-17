const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'project_db'
  });

  console.log('Testing daily revenue query for business 11...\n');

  const [result] = await connection.query(`
    SELECT DATE(a.appointment_datetime) as date, SUM(s.price) as revenue
    FROM appointments a
    JOIN services s ON a.service_id = s.service_id
    WHERE a.business_id = 11 AND a.status = 'completed' AND a.appointment_datetime >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    GROUP BY DATE(a.appointment_datetime)
    ORDER BY date ASC
  `);

  console.log('Query result:', JSON.stringify(result, null, 2));
  console.log('\nNumber of rows:', result.length);

  await connection.end();
})();
