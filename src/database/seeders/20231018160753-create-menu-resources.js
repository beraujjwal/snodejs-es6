'use strict';

async function up({ context: queryInterface }) {
  const dbName = queryInterface.sequelize.getDialect();
  await queryInterface
    .bulkInsert(
      'acl_menu_resources',
      [
        {
          resourceID: 1,
          menuID: 1,
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          resourceID: 2,
          menuID: 2,
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          resourceID: 3,
          menuID: 3,
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          resourceID: 4,
          menuID: 4,
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          resourceID: 5,
          menuID: 5,
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          resourceID: 6,
          menuID: 6,
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          resourceID: 7,
          menuID: 7,
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
      "SELECT setval('acl_menu_resources_id_seq', (SELECT MAX(id) FROM acl_menu_resources))"
    );
  }
}

async function down({ context: queryInterface }) {
  await queryInterface
    .bulkDelete('acl_menu_resources', null, {})
    .catch((ex) => {
      console.error(ex);
      throw ex;
    });
}

export { up, down };
