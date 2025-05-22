'use strict';

async function up({ context: queryInterface }) {
  await queryInterface
    .bulkInsert(
      'role_resource_permissions',
      [
        {
          id: 1,
          roleID: 1,
          resourceID: 1,
          permissionID: 1,
          status: true,
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
    "SELECT setval('role_resource_permissions_id_seq', (SELECT MAX(id) FROM role_resource_permissions))"
  );
}

async function down({ context: queryInterface }) {
  await queryInterface
    .bulkDelete('role_resource_permissions', null, {})
    .catch((ex) => {
      console.error(ex);
      throw ex;
    });
}

export { up, down };
