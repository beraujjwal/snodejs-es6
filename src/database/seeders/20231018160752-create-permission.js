'use strict';

async function up({ context: queryInterface }) {
  const dbName = queryInterface.sequelize.getDialect();
  await queryInterface
    .bulkInsert(
      'acl_permissions',
      [
        {
          id: 1,
          name: 'Full Access',
          slug: 'full-access',
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'List View',
          slug: 'list-view',
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          name: 'Drop-down List',
          slug: 'drop-downList',
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 4,
          name: 'Single Details View',
          slug: 'single-details-view',
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 5,
          name: 'Create New',
          slug: 'create-new',
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 6,
          name: 'Update Existing',
          slug: 'update-existing',
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 7,
          name: 'Delete Existing',
          slug: 'delete-existing',
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 8,
          name: 'Download Single Details',
          slug: 'download-single-details',
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 9,
          name: 'Download List',
          slug: 'download-list',
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 10,
          name: 'Manage Columns',
          slug: 'manage-columns',
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 11,
          name: 'Full Deny',
          slug: 'full-deny',
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 12,
          name: 'Others',
          slug: 'others',
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
      "SELECT setval('acl_permissions_id_seq', (SELECT MAX(id) FROM acl_permissions))"
    );
  }
}

async function down({ context: queryInterface }) {
  await queryInterface.bulkDelete('acl_permissions', null, {}).catch((ex) => {
    console.error(ex);
    throw ex;
  });
}

export { up, down };
