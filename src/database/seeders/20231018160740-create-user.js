'use strict';
import 'dotenv/config';
import bcrypt from 'bcryptjs';
const saltRounds = parseInt(process.env.SALT_FACTOR);

async function up({ context: queryInterface }) {
  const dbName = queryInterface.sequelize.getDialect();
  const salt = await bcrypt.genSalt(saltRounds);
  const restPassword = bcrypt.hashSync('123456789', salt);
  await queryInterface
    .bulkInsert(
      'gnrl_users',
      [
        {
          id: 1,
          firstName: 'Super',
          lastName: 'Admin',
          ext: '+91',
          phone: '9876543210',
          email: 'super-admin@yopmail.com',
          password: bcrypt.hashSync('9876543210', salt),
          loginAttempts: 0,
          blockExpires: null,
          isCompleted: true,
          timezone: 'Asia/Kolkata',
          status: true,
          verified: JSON.stringify({ email: true, phone: true }),
          lastActivityBy: null,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          firstName: 'Admin',
          lastName: 'User',
          ext: '+91',
          phone: '9876543211',
          email: 'admin@yopmail.com',
          password: bcrypt.hashSync('9876543211', salt),
          loginAttempts: 0,
          blockExpires: null,
          isCompleted: true,
          timezone: 'Asia/Kolkata',
          status: true,
          verified: JSON.stringify({ email: true, phone: true }),
          lastActivityBy: 1,
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

  if (dbName === 'postgres') {
    await queryInterface.sequelize.query(
      "SELECT setval('gnrl_users_id_seq', (SELECT MAX(id) FROM gnrl_users))"
    );
  }
}

async function down({ context: queryInterface }) {
  await queryInterface.bulkDelete('gnrl_users', null, {}).catch((ex) => {
    console.error(ex);
    throw ex;
  });
}

export { up, down };
