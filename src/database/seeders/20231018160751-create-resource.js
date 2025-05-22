'use strict';

async function up({ context: queryInterface }) {
  await queryInterface
    .bulkInsert(
      'resources',
      [
        {
          id: 1,
          parentID: null,
          name: 'Root',
          slug: 'root',
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          parentID: null,
          name: 'User Management',
          slug: 'user-management',
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          parentID: null,
          name: 'ACL Management',
          slug: 'acl-management',
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 4,
          parentID: 3,
          name: 'Role Section',
          slug: 'role-section',
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 5,
          parentID: 3,
          name: 'Resource Section',
          slug: 'resource-section',
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 6,
          parentID: 3,
          name: 'Permission Section',
          slug: 'permission-section',
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 7,
          parentID: 3,
          name: 'Menu Section',
          slug: 'menu-section',
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 8,
          parentID: 2,
          name: 'Tenant Section',
          slug: 'tenant-section',
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
    "SELECT setval('resources_id_seq', (SELECT MAX(id) FROM resources))"
  );
}

async function down({ context: queryInterface }) {
  await queryInterface.bulkDelete('resources', null, {}).catch((ex) => {
    console.error(ex);
    throw ex;
  });
}

export { up, down };
