'use strict';
import { Sequelize } from 'sequelize';

async function up({ context: queryInterface }) {
  const transaction = await queryInterface.sequelize.transaction();
  const dbName = queryInterface.sequelize.getDialect();
  try {
    await queryInterface.createTable(
      'gnrl_cities',
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
        stateID: {
          type: Sequelize.INTEGER,
          references: {
            model: 'gnrl_states',
            key: 'id',
          },
          allowNull: false,
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        countryID: {
          type: Sequelize.INTEGER,
          references: {
            model: 'gnrl_countries',
            key: 'id',
          },
          allowNull: false,
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
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
        // lastActivityBy: {
        //   type: Sequelize.INTEGER,
        //   references: {
        //     model: 'gnrl_users',
        //     key: 'id',
        //   },
        //   allowNull: false,
        //   onUpdate: 'CASCADE',
        //   onDelete: 'RESTRICT',
        // },
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
      await queryInterface.addIndex('gnrl_cities', {
        fields: ['name', 'deletedAt'],
        name: 'idx_gnrl_cities_name',
        transaction,
      });

      await queryInterface.addIndex('gnrl_cities', {
        fields: ['status', 'deletedAt'],
        name: 'idx_gnrl_cities_status',
        transaction,
      });
    } else if (dbName === 'postgres') {
      await queryInterface.addIndex('gnrl_cities', {
        fields: ['name'],
        name: 'idx_gnrl_cities_name',
        where: { deletedAt: null },
        transaction,
      });

      await queryInterface.addIndex('gnrl_cities', {
        fields: ['status'],
        name: 'idx_gnrl_cities_status',
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
    await queryInterface.removeIndex('gnrl_cities', 'idx_gnrl_cities_name', {
      transaction,
    });
    await queryInterface.dropTable('gnrl_cities', {
      transaction,
    });
    await transaction.commit();
  } catch (ex) {
    await transaction.rollback();
    throw ex;
  }
}

export { up, down };
