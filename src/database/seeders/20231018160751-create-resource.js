'use strict';

async function up({ context: queryInterface }) {
  const dbName = queryInterface.sequelize.getDialect();
  await queryInterface
    .bulkInsert(
      'acl_resources',
      [
        {
          id: 1,
          parentID: null,
          name: 'Root',
          slug: 'root',
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          parentID: null,
          name: 'User Management',
          slug: 'user-management',
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          parentID: null,
          name: 'ACL Management',
          slug: 'acl-management',
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 4,
          parentID: 3,
          name: 'Role Section',
          slug: 'role-section',
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 5,
          parentID: 3,
          name: 'Resource Section',
          slug: 'resource-section',
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 6,
          parentID: 3,
          name: 'Permission Section',
          slug: 'permission-section',
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 7,
          parentID: 3,
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
      "SELECT setval('acl_resources_id_seq', (SELECT MAX(id) FROM acl_resources))"
    );
  }
}

async function down({ context: queryInterface }) {
  await queryInterface.bulkDelete('acl_resources', null, {}).catch((ex) => {
    console.error(ex);
    throw ex;
  });
}

export { up, down };
