// seed.js
const db = require('./dbSingleton').getConnection();
const bcrypt = require('bcrypt');

async function seedUsers() {
  const users = [
    ['Alice', 'Smith', 'alice@example.com', '1234567890', 'password1', 'client'],
    ['Bob', 'Jones', 'bob@example.com', '2345678901', 'password2', 'business'],
    ['Charlie', 'Brown', 'charlie@example.com', '3456789012', 'password3', 'client'],
    ['Diana', 'White', 'diana@example.com', '4567890123', 'password4', 'admin'],
  ];

  for (const [first, last, email, phone, plainPassword, role] of users) {
    const hash = await bcrypt.hash(plainPassword, 10);
    const sql = `
      INSERT INTO users (first_name, last_name, email, phone, password_hash, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [first, last, email, phone, hash, role], (err) => {
      if (err) console.error(err.message);
      else console.log(`Inserted user ${email}`);
    });
  }
}

seedUsers().then(() => {
  console.log('Done seeding users.');
  process.exit();
});
