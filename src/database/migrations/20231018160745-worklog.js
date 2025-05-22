'use strict';
import 'dotenv/config';
import { Sequelize } from 'sequelize';

async function up({ context: queryInterface }) {
  const transaction = await queryInterface.sequelize.transaction();
  try {
    await queryInterface.createTable(
      'worklogs',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.BIGINT,
        },
        userID: {
          type: Sequelize.BIGINT,
          references: {
            model: 'users',
            key: 'id',
          },
          allowNull: false,
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        module: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        referenceId: {
          type: Sequelize.BIGINT,
          index: true,
          allowNull: false,
        },
        action: {
          type: Sequelize.STRING(30),
          index: true,
          allowNull: false,
        },
        deviceId: {
          type: Sequelize.STRING(50),
          index: true,
          allowNull: false,
        },
      },
      { transaction }
    );

    await queryInterface.addIndex(
      'worklogs',
      ['userID', 'module', 'action', 'deviceId'],
      { transaction }
    );
    await transaction.commit();
  } catch (ex) {
    await transaction.rollback();
    throw ex;
  }
}

async function down({ context: queryInterface }) {
  try {
    await queryInterface.dropTable('worklogs');
  } catch (ex) {
    throw ex;
  }
}

export { up, down };
