'use strict';

async function up({ context: queryInterface }) {
  await queryInterface
    .bulkInsert(
      'TABLE_NAME_PLURAL_FORM',
      [
        {
          id: 1,
          //...,
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
    });

  await queryInterface.sequelize.query(
    "SELECT setval(''TABLE_NAME_PLURAL_FORM'_id_seq', (SELECT MAX(id) FROM 'TABLE_NAME_PLURAL_FORM'))"
  );
}

async function down({ context: queryInterface }) {
  await queryInterface
    .bulkDelete('TABLE_NAME_PLURAL_FORM', null, {})
    .catch((ex) => {
      console.error(ex);
    });
}

export { up, down };
