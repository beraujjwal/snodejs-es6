'use strict';

async function up({ context: queryInterface }) {
  const dbName = queryInterface.sequelize.getDialect();
  await queryInterface
    .bulkInsert(
      'acl_menus',
      [
        {
          id: 1,
          parentID: null,
          name: 'Dashboard',
          slug: 'dashboard',
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          parentID: null,
          name: 'User',
          slug: 'user',
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          parentID: 2,
          name: 'User Management',
          slug: 'user-management',
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 4,
          parentID: 2,
          name: 'ACL Management',
          slug: 'acl-management',
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 5,
          parentID: 2,
          name: 'Role Section',
          slug: 'role-section',
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 6,
          parentID: 2,
          name: 'Resource Section',
          slug: 'resource-section',
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 7,
          parentID: 2,
          name: 'Permission Section',
          slug: 'permission-section',
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 8,
          parentID: 2,
          name: 'Menu Section',
          slug: 'menu-section',
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
      "SELECT setval('acl_menus_id_seq', (SELECT MAX(id) FROM acl_menus))"
    );
  }
}

async function down({ context: queryInterface }) {
  await queryInterface.bulkDelete('acl_menus', null, {}).catch((ex) => {
    console.error(ex);
    throw ex;
  });
}

export { up, down };
