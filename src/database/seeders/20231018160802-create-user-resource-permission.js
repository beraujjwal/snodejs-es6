'use strict';

async function up({ context: queryInterface }) {
  const dbName = queryInterface.sequelize.getDialect();
  await queryInterface
    .bulkInsert(
      'acl_user_resource_permissions',
      [
        {
          id: 1,
          userID: 2,
          resourceID: 6,
          permissionID: 11,
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          userID: 2,
          resourceID: 4,
          permissionID: 2,
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          userID: 2,
          resourceID: 4,
          permissionID: 3,
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 4,
          userID: 2,
          resourceID: 4,
          permissionID: 4,
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
      "SELECT setval('acl_user_resource_permissions_id_seq', (SELECT MAX(id) FROM acl_user_resource_permissions))"
    );
  }
}

async function down({ context: queryInterface }) {
  await queryInterface
    .bulkDelete('acl_user_resource_permissions', null, {})
    .catch((ex) => {
      console.error(ex);
      throw ex;
    });
}

export { up, down };
