'use strict';

async function up({ context: queryInterface }) {
  const dbName = queryInterface.sequelize.getDialect();
  await queryInterface
    .bulkInsert(
      'gnrl_regions',
      [
        {
          id: 1,
          name: 'Africa',
          slug: 'africa',
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Americas',
          slug: 'americas',
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          name: 'Asia',
          slug: 'asia',
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 4,
          name: 'Europe',
          slug: 'europe',
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 5,
          name: 'Oceania',
          slug: 'oceania',
          status: true,
          lastActivityBy: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 6,
          name: 'Polar',
          slug: 'polar',
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
      "SELECT setval('gnrl_regions_id_seq', (SELECT MAX(id) FROM gnrl_regions))"
    );
  }
}

async function down({ context: queryInterface }) {
  await queryInterface.bulkDelete('gnrl_regions', null, {}).catch((ex) => {
    console.error(ex);
    throw ex;
  });
}

export { up, down };
