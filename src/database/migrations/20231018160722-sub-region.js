'use strict';
import { Sequelize } from 'sequelize';

async function up({ context: queryInterface }) {
  try {
    await queryInterface.createTable('sub_regions', {
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
      regionID: {
        type: Sequelize.INTEGER,
        references: {
          model: 'regions',
          key: 'id',
        },
        allowNull: false,
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
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
    });

    await queryInterface.addIndex('sub_regions', ['name']);
  } catch (ex) {
    throw ex;
  }
}

async function down({ context: queryInterface }) {
  try {
    await queryInterface.dropTable('sub_regions');
  } catch (ex) {
    throw ex;
  }
}

export { up, down };
