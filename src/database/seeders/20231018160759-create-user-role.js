'use strict';

async function up({ context: queryInterface }) {
  await queryInterface
    .bulkInsert(
      'user_roles',
      [
        {
          id: 1,
          userID: 1,
          roleID: 1,
          status: true,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          userID: 2,
          roleID: 2,
          status: true,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          userID: 3,
          roleID: 3,
          status: true,
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
    "SELECT setval('user_roles_id_seq', (SELECT MAX(id) FROM user_roles))"
  );
}

async function down({ context: queryInterface }) {
  await queryInterface.bulkDelete('user_roles', null, {}).catch((ex) => {
    console.error(ex);
    throw ex;
  });
}

export { up, down };
