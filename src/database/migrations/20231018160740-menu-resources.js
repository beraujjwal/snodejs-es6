'use strict';
import 'dotenv/config';
import { Sequelize } from 'sequelize';

async function up({ context: queryInterface }) {
  const transaction = await queryInterface.sequelize.transaction();
  try {
    await queryInterface.createTable(
      'menu_resources',
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        menuID: {
          type: Sequelize.INTEGER,
          references: {
            model: 'menus',
            key: 'id',
          },
          allowNull: false,
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        resourceID: {
          type: Sequelize.INTEGER,
          references: {
            model: 'resources',
            key: 'id',
          },
          allowNull: false,
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
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

    await queryInterface.addIndex('menu_resources', ['resourceID', 'menuID'], {
      transaction,
    });
    await transaction.commit();
  } catch (ex) {
    await transaction.rollback();
    throw ex;
  }
}

async function down({ context: queryInterface }) {
  await queryInterface.dropTable('menu_resources');
}

export { up, down };
