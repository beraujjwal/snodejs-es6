'use strict';

async function up({ context: queryInterface }) {
  await queryInterface
    .bulkInsert(
      'sub_regions',
      [
        {
          id: 1,
          name: 'Northern Africa',
          regionID: 1,
          status: true,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Middle Africa',
          regionID: 1,
          status: true,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          name: 'Western Africa',
          regionID: 1,
          status: true,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 4,
          name: 'Eastern Africa',
          regionID: 1,
          status: true,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 5,
          name: 'Southern Africa',
          regionID: 1,
          status: true,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 6,
          name: 'Northern America',
          regionID: 2,
          status: true,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 7,
          name: 'Caribbean',
          regionID: 2,
          status: true,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 8,
          name: 'South America',
          regionID: 2,
          status: true,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 9,
          name: 'Central America',
          regionID: 2,
          status: true,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 10,
          name: 'Central Asia',
          regionID: 3,
          status: true,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 11,
          name: 'Western Asia',
          regionID: 3,
          status: true,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 12,
          name: 'Eastern Asia',
          regionID: 3,
          status: true,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 13,
          name: 'South-Eastern Asia',
          regionID: 3,
          status: true,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 14,
          name: 'Southern Asia',
          regionID: 3,
          status: true,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 15,
          name: 'Eastern Europe',
          regionID: 4,
          status: true,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 16,
          name: 'Southern Europe',
          regionID: 4,
          status: true,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 17,
          name: 'Western Europe',
          regionID: 4,
          status: true,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 18,
          name: 'Northern Europe',
          regionID: 4,
          status: true,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 19,
          name: 'Australia and New Zealand',
          regionID: 5,
          status: true,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 20,
          name: 'Melanesia',
          regionID: 5,
          status: true,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 21,
          name: 'Micronesia',
          regionID: 5,
          status: true,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 22,
          name: 'Polynesia',
          regionID: 5,
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
    "SELECT setval('sub_regions_id_seq', (SELECT MAX(id) FROM sub_regions))"
  );
}

async function down({ context: queryInterface }) {
  await queryInterface.bulkDelete('sub_regions', null, {}).catch((ex) => {
    console.error(ex);
    throw ex;
  });
}

export { up, down };
