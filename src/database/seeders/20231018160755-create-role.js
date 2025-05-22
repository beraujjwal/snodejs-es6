'use strict';

async function up({ context: queryInterface }) {
  await queryInterface
    .bulkInsert(
      'roles',
      [
        {
          id: 1,
          parentID: null,
          name: 'Super Admin',
          slug: 'super-admin',
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          parentID: null,
          name: 'Admin',
          slug: 'admin',
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          parentID: null,
          name: 'Manager',
          slug: 'manager',
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 4,
          parentID: null,
          name: 'Tenant',
          slug: 'tenant',
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
    "SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles))"
  );
}

async function down({ context: queryInterface }) {
  await queryInterface.bulkDelete('roles', null, {}).catch((ex) => {
    console.error(ex);
    throw ex;
  });
}

export { up, down };
