'use strict';

async function up({ context: queryInterface }) {
  const dbName = queryInterface.sequelize.getDialect();
  await queryInterface
    .bulkInsert(
      'gnrl_tokens',
      [
        {
          id: 1,
          userID: 1,
          token: '543210',
          sentTo: 'sms',
          sentOn: '9876543210',
          sentFor: 'activation',
          status: true,
          expireAt: new Date(),
          createdAt: new Date(),
        },
        {
          id: 2,
          userID: 2,
          token: '543211',
          sentTo: 'sms',
          sentOn: '9876543211',
          sentFor: 'activation',
          status: true,
          expireAt: new Date(),
          createdAt: new Date(),
        },
        {
          id: 3,
          userID: 3,
          token: '543212',
          sentTo: 'sms',
          sentOn: '9876543212',
          sentFor: 'activation',
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

  if (dbName === 'postgres') {
    await queryInterface.sequelize.query(
      "SELECT setval('gnrl_tokens_id_seq', (SELECT MAX(id) FROM gnrl_tokens))"
    );
  }
}

async function down({ context: queryInterface }) {
  await queryInterface.bulkDelete('gnrl_tokens', null, {}).catch((ex) => {
    console.error(ex);
    throw ex;
  });
}

export { up, down };
