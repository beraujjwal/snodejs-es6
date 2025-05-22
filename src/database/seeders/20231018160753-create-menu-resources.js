'use strict';

async function up({ context: queryInterface }) {
  await queryInterface
    .bulkInsert(
      'menu_resources',
      [
        {
          resourceID: 1,
          menuID: 1,
          status: true,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          resourceID: 2,
          menuID: 2,
          status: true,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          resourceID: 3,
          menuID: 3,
          status: true,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          resourceID: 4,
          menuID: 4,
          status: true,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          resourceID: 5,
          menuID: 5,
          status: true,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          resourceID: 6,
          menuID: 6,
          status: true,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          resourceID: 7,
          menuID: 7,
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
    "SELECT setval('menu_resources_id_seq', (SELECT MAX(id) FROM menu_resources))"
  );
}

async function down({ context: queryInterface }) {
  await queryInterface.bulkDelete('menu_resources', null, {}).catch((ex) => {
    console.error(ex);
    throw ex;
  });
}

export { up, down };
