'use strict';
import 'dotenv/config';
import bcrypt from 'bcryptjs';
const saltRounds = parseInt(process.env.SALT_FACTOR);

async function up({ context: queryInterface }) {
  const salt = await bcrypt.genSalt(saltRounds);
  const password1 = bcrypt.hashSync('9876543210', salt);
  const password2 = bcrypt.hashSync('9876543211', salt);
  const password3 = bcrypt.hashSync('9876543212', salt);
  await queryInterface
    .bulkInsert(
      'users',
      [
        {
          id: 1,
          first_name: 'Super',
          last_name: 'Admin',
          ext: '+91',
          phone: '9876543210',
          email: 'super-admin@yopmail.com',
          password: password1,
          loginAttempts: 0,
          blockExpires: null,
          isCompleted: true,
          timezone: 'Asia/Kolkata',
          status: true,
          verified: JSON.stringify({ email: true, phone: true }),
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          first_name: 'Admin',
          last_name: 'User',
          ext: '+91',
          phone: '9876543211',
          email: 'admin@yopmail.com',
          password: password2,
          loginAttempts: 0,
          blockExpires: null,
          isCompleted: true,
          timezone: 'Asia/Kolkata',
          status: true,
          verified: JSON.stringify({ email: true, phone: true }),
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          first_name: 'Manager',
          last_name: 'User',
          ext: '+91',
          phone: '9876543212',
          email: 'manager@yopmail.com',
          password: password3,
          loginAttempts: 0,
          blockExpires: null,
          isCompleted: true,
          timezone: 'Asia/Kolkata',
          status: true,
          verified: JSON.stringify({ email: true, phone: true }),
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    )
    .catch((ex) => {
      console.error(ex);
      throw ex;
    });

  await queryInterface.sequelize.query(
    "SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))"
  );
}

async function down({ context: queryInterface }) {
  await queryInterface.bulkDelete('users', null, {}).catch((ex) => {
    console.error(ex);
    throw ex;
  });
}

export { up, down };
