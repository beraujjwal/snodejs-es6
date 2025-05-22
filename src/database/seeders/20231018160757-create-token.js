'use strict';

async function up({ context: queryInterface }) {
  await queryInterface
    .bulkInsert(
      'tokens',
      [
        {
          id: 1,
          userID: 1,
          token: '543210',
          sentTo: 'PHONE',
          sentOn: '9876543210',
          sentFor: 'ACTIVATION',
          status: true,
          expireAt: new Date(),
          createdAt: new Date(),
        },
        {
          id: 2,
          userID: 2,
          token: '543211',
          sentTo: 'PHONE',
          sentOn: '9876543211',
          sentFor: 'ACTIVATION',
          status: true,
          expireAt: new Date(),
          createdAt: new Date(),
        },
        {
          id: 3,
          userID: 3,
          token: '543212',
          sentTo: 'PHONE',
          sentOn: '9876543212',
          sentFor: 'ACTIVATION',
          status: true,
          expireAt: new Date(),
          createdAt: new Date(),
        },
      ],
      {}
    )
    .catch((ex) => {
      console.error(ex);
      throw ex;
    });

  await queryInterface.sequelize.query(
    "SELECT setval('tokens_id_seq', (SELECT MAX(id) FROM tokens))"
  );
}

async function down({ context: queryInterface }) {
  await queryInterface.bulkDelete('tokens', null, {}).catch((ex) => {
    console.error(ex);
    throw ex;
  });
}

export { up, down };
