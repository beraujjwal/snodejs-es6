'use strict';
import 'dotenv/config';
import { Sequelize } from 'sequelize';

async function up({ context: queryInterface }) {
  await queryInterface.createTable(
    'user_resource_permissions',
    {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      userID: {
        type: Sequelize.BIGINT,
        references: {
          model: 'users',
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
    {
      uniqueKeys: {
        unique_user_resource_permission_deletedAt: {
          customIndex: true,
          fields: ['userID', 'resourceID', 'permissionID', 'deletedAt'],
        },
      },
    }
  );
  /*.then(() =>
        queryInterface.addIndex("user_resource_permissions", [
          "userID",
          "resourceID",
          "permissionID",
          "deletedAt",
        ])
      )
      .then(() => {
        // perform further operations if needed
      })*/
}

async function down({ context: queryInterface }) {
  await queryInterface.dropTable('user_resource_permissions');
}

export { up, down };
