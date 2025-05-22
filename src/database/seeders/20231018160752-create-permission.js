'use strict';

async function up({ context: queryInterface }) {
  await queryInterface
    .bulkInsert(
      'permissions',
      [
        {
          id: 1,
          name: 'Full Access',
          slug: 'full-access',
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'List View',
          slug: 'list-view',
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          name: 'Drop-down List',
          slug: 'drop-downList',
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 4,
          name: 'Single Details View',
          slug: 'single-details-view',
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 5,
          name: 'Create New',
          slug: 'create-new',
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 6,
          name: 'Update Existing',
          slug: 'update-existing',
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 7,
          name: 'Delete Existing',
          slug: 'delete-existing',
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 8,
          name: 'Download Single Details',
          slug: 'download-single-details',
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 9,
          name: 'Download List',
          slug: 'download-list',
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 10,
          name: 'Manage Columns',
          slug: 'manage-columns',
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 11,
          name: 'Full Deny',
          slug: 'full-deny',
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 12,
          name: 'Others',
          slug: 'others',
          status: true,
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
    "SELECT setval('permissions_id_seq', (SELECT MAX(id) FROM permissions))"
  );
}

async function down({ context: queryInterface }) {
  await queryInterface.bulkDelete('permissions', null, {}).catch((ex) => {
    console.error(ex);
    throw ex;
  });
}

export { up, down };
