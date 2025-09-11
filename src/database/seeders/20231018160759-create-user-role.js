'use strict';

async function up({ context: queryInterface }) {
  const dbName = queryInterface.sequelize.getDialect();
  await queryInterface
    .bulkInsert(
      'acl_user_roles',
      [
        {
          id: 1,
          userID: 1,
          roleID: 1,
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          userID: 2,
          roleID: 2,
          status: true,
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
      "SELECT setval('acl_user_roles_id_seq', (SELECT MAX(id) FROM acl_user_roles))"
    );
  }
}

async function down({ context: queryInterface }) {
  await queryInterface.bulkDelete('acl_user_roles', null, {}).catch((ex) => {
    console.error(ex);
    throw ex;
  });
}

export { up, down };
