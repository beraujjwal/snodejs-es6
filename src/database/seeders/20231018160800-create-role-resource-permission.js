'use strict';

async function up({ context: queryInterface }) {
  const dbName = queryInterface.sequelize.getDialect();
  await queryInterface
    .bulkInsert(
      'acl_role_resource_permissions',
      [
        {
          id: 1,
          roleID: 1,
          resourceID: 1,
          permissionID: 1,
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          roleID: 2,
          resourceID: 1,
          permissionID: 11,
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          roleID: 3,
          resourceID: 1,
          permissionID: 11,
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 4,
          roleID: 2,
          resourceID: 2,
          permissionID: 1,
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 5,
          roleID: 3,
          resourceID: 2,
          permissionID: 1,
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 6,
          roleID: 2,
          resourceID: 3,
          permissionID: 1,
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 7,
          roleID: 3,
          resourceID: 3,
          permissionID: 11,
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 8,
          roleID: 2,
          resourceID: 4,
          permissionID: 1,
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 9,
          roleID: 2,
          resourceID: 5,
          permissionID: 1,
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 10,
          roleID: 2,
          resourceID: 6,
          permissionID: 1,
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 11,
          roleID: 2,
          resourceID: 7,
          permissionID: 1,
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 12,
          roleID: 2,
          resourceID: 8,
          permissionID: 1,
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 13,
          roleID: 2,
          resourceID: 18,
          permissionID: 1,
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
      "SELECT setval('acl_role_resource_permissions_id_seq', (SELECT MAX(id) FROM acl_role_resource_permissions))"
    );
  }
}

async function down({ context: queryInterface }) {
  await queryInterface
    .bulkDelete('acl_role_resource_permissions', null, {})
    .catch((ex) => {
      console.error(ex);
      throw ex;
    });
}

export { up, down };
