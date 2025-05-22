'use strict';

async function up({ context: queryInterface }) {
  await queryInterface
    .bulkInsert(
      'menus',
      [
        {
          id: 1,
          parentID: null,
          name: 'Dashboard',
          slug: 'dashboard',
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          parentID: null,
          name: 'User',
          slug: 'user',
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          parentID: 2,
          name: 'User Management',
          slug: 'user-management',
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 4,
          parentID: 2,
          name: 'ACL Management',
          slug: 'acl-management',
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 5,
          parentID: 2,
          name: 'Role Section',
          slug: 'role-section',
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 6,
          parentID: 2,
          name: 'Resource Section',
          slug: 'resource-section',
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 7,
          parentID: 2,
          name: 'Permission Section',
          slug: 'permission-section',
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 8,
          parentID: 2,
          name: 'Menu Section',
          slug: 'menu-section',
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
    "SELECT setval('menus_id_seq', (SELECT MAX(id) FROM menus))"
  );
}

async function down({ context: queryInterface }) {
  await queryInterface.bulkDelete('menus', null, {}).catch((ex) => {
    console.error(ex);
    throw ex;
  });
}

export { up, down };
