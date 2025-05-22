'use strict';
import { Sequelize } from 'sequelize';

async function up({ context: queryInterface }) {
  const transaction = await queryInterface.sequelize.transaction();
  try {
    await queryInterface.createTable(
      'states',
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        stateCode: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        countryID: {
          type: Sequelize.INTEGER,
          references: {
            model: 'countries',
            key: 'id',
          },
          allowNull: false,
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        type: {
          type: Sequelize.STRING(100),
          allowNull: true,
          defaultValue: null,
        },
        latitude: {
          type: Sequelize.STRING(20),
          required: true,
        },
        longitude: {
          type: Sequelize.STRING(20),
          required: true,
        },
        status: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        deletedAt: {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: null,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      },
      { transaction }
    );

    await queryInterface.addIndex('states', ['name', 'stateCode'], {
      transaction,
    });
    await transaction.commit();
  } catch (ex) {
    await transaction.rollback();
    throw ex;
  }
}

async function down({ context: queryInterface }) {
  await queryInterface.dropTable('states');
}

export { up, down };
