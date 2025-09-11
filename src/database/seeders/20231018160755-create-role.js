'use strict';

async function up({ context: queryInterface }) {
  const dbName = queryInterface.sequelize.getDialect();
  await queryInterface
    .bulkInsert(
      'acl_roles',
      [
        {
          id: 1,
          parentID: null,
          name: 'Super Admin',
          slug: 'super-admin',
          description: 'The highest level of access',
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          parentID: null,
          name: 'Admin',
          slug: 'admin',
          description: 'Manage users and roles',
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          parentID: null,
          name: 'Customer',
          slug: 'customer',
          description: 'Manage customer',
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
      "SELECT setval('acl_roles_id_seq', (SELECT MAX(id) FROM acl_roles))"
    );
  }
}

async function down({ context: queryInterface }) {
  await queryInterface.bulkDelete('acl_roles', null, {}).catch((ex) => {
    console.error(ex);
    throw ex;
  });
}

export { up, down };
