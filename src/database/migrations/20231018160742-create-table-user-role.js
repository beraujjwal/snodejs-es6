'use strict';
import { Sequelize } from 'sequelize';

async function up({ context: queryInterface }) {
  const transaction = await queryInterface.sequelize.transaction();
  const dbName = queryInterface.sequelize.getDialect();
  try {
    await queryInterface.createTable(
      'acl_user_roles',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        userID: {
          type: Sequelize.INTEGER,
          references: {
            model: 'gnrl_users',
            key: 'id',
          },
          allowNull: false,
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        roleID: {
          type: Sequelize.INTEGER,
          references: {
            model: 'acl_roles',
            key: 'id',
          },
          allowNull: false,
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        status: {
          type: Sequelize.BOOLEAN,
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
      await queryInterface.addIndex('acl_user_roles', {
        fields: ['roleID', 'userID', 'status', 'deletedAt'],
        unique: true,
        name: 'idx_unique_acl_user_roles_fks',
        transaction,
      });
    } else if (dbName === 'postgres') {
      await queryInterface.addIndex('acl_user_roles', {
        fields: ['roleID', 'userID', 'status'],
        unique: true,
        name: 'idx_unique_acl_user_roles_fks',
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
  const dbName = queryInterface.sequelize.getDialect();
  try {
    await queryInterface.removeIndex(
      'acl_user_roles',
      'idx_unique_acl_user_roles_fks',
      {
        transaction,
      }
    );
    await queryInterface.dropTable('acl_user_roles', {
      transaction,
    });
    await transaction.commit();
  } catch (ex) {
    await transaction.rollback();
    throw ex;
  }
}

export { up, down };
