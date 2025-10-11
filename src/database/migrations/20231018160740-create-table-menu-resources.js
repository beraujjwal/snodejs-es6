'use strict';
import { Sequelize } from 'sequelize';

async function up({ context: queryInterface }) {
  const transaction = await queryInterface.sequelize.transaction();
  const dbName = queryInterface.sequelize.getDialect();
  try {
    await queryInterface.createTable(
      'acl_menu_resources',
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
            model: 'acl_menus',
            key: 'id',
          },
          allowNull: false,
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        resourceID: {
          type: Sequelize.INTEGER,
          references: {
            model: 'acl_resources',
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
        lastActivityBy: {
          type: Sequelize.INTEGER,
          references: {
            model: 'gnrl_users',
            key: 'id',
          },
          allowNull: false,
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        deletedAt: {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: null,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      },
      {
        initialAutoIncrement: 1,
        engine: 'InnoDB', // (optional) ENGINE=InnoDB
        charset: 'utf8mb4', // (optional) DEFAULT CHARSET
        collate: 'utf8mb4_general_ci', // (optional) COLLATE
        transaction,
      }
    );

    if (dbName === 'mysql') {
      await queryInterface.addIndex('acl_menu_resources', {
        fields: ['resourceID', 'menuID', 'status', 'deletedAt'],
        unique: true,
        name: 'idx_unique_acl_menu_resources_fks',
        transaction,
      });
    } else if (dbName === 'postgres') {
      await queryInterface.addIndex('acl_menu_resources', {
        fields: ['resourceID', 'menuID', 'status'],
        unique: true,
        name: 'idx_unique_acl_menu_resources_fks',
        where: { deletedAt: null },
        transaction,
      });
    }
    await transaction.commit();
  } catch (ex) {
    await transaction.rollback();
    throw ex;
  }
}

async function down({ context: queryInterface }) {
  const transaction = await queryInterface.sequelize.transaction();
  // const dbName = queryInterface.sequelize.getDialect();
  try {
    await queryInterface.removeIndex('acl_menu_resources', 'idx_unique_acl_menu_resources_fks', {
      transaction,
    });
    await queryInterface.dropTable('acl_menu_resources', {
      transaction,
    });
    await transaction.commit();
  } catch (ex) {
    await transaction.rollback();
    throw ex;
  }
}

export { up, down };
