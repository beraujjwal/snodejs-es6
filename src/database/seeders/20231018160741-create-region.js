'use strict';

async function up({ context: queryInterface }) {
  await queryInterface
    .bulkInsert(
      'regions',
      [
        {
          id: 1,
          name: 'Africa',
          status: true,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Americas',
          status: true,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          name: 'Asia',
          status: true,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 4,
          name: 'Europe',
          status: true,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 5,
          name: 'Oceania',
          status: true,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 6,
          name: 'Polar',
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
    "SELECT setval('regions_id_seq', (SELECT MAX(id) FROM regions))"
  );
}

async function down({ context: queryInterface }) {
  await queryInterface.bulkDelete('regions', null, {}).catch((ex) => {
    console.error(ex);
    throw ex;
  });
}

export { up, down };
