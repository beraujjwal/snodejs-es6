'use strict';
import 'dotenv/config';
import { Sequelize } from 'sequelize';

async function up({ context: queryInterface }) {
  const transaction = await queryInterface.sequelize.transaction();
  try {
    await queryInterface.createTable(
      'role_resource_permissions',
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        roleID: {
          type: Sequelize.INTEGER,
          references: {
            model: 'roles',
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
        permissionID: {
          type: Sequelize.INTEGER,
          references: {
            model: 'permissions',
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

    await queryInterface.addIndex(
      'role_resource_permissions',
      ['roleID', 'resourceID', 'permissionID'],
      { transaction }
    );
    await transaction.commit();
  } catch (ex) {
    await transaction.rollback();
    throw ex;
  }
}

async function down({ context: queryInterface }) {
  const transaction = await queryInterface.sequelize.transaction();
  try {
    await queryInterface.removeColumn('role_resource_permissions', 'roleID');
    await queryInterface.removeColumn(
      'role_resource_permissions',
      'resourceID'
    );
    await queryInterface.removeColumn(
      'role_resource_permissions',
      'permissionID'
    );

    await queryInterface.dropTable('role_resource_permissions', {
      transaction,
    });
    await transaction.commit();
  } catch (ex) {
    await transaction.rollback();
    throw ex;
  }
}

export { up, down };
