'use strict';
import { Sequelize } from 'sequelize';

async function up({ context: queryInterface }) {
  const transaction = await queryInterface.sequelize.transaction();
  const dbName = queryInterface.sequelize.getDialect();
  try {
    await queryInterface.createTable(
      'gnrl_countries',
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        regionID: {
          type: Sequelize.INTEGER,
          required: true,
          index: true,
          references: {
            model: 'gnrl_regions',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        subRegionID: {
          type: Sequelize.INTEGER,
          required: true,
          index: true,
          references: {
            model: 'gnrl_sub_regions',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        name: {
          type: Sequelize.STRING(100),
          unique: true,
          allowNull: false,
        },
        iso3: {
          type: Sequelize.STRING(3),
          unique: true,
          allowNull: false,
        },
        iso2: {
          type: Sequelize.STRING(2),
          unique: true,
          allowNull: false,
        },
        numericCode: {
          type: Sequelize.STRING(5),
          allowNull: false,
        },
        phoneCode: {
          type: Sequelize.STRING(20),
          allowNull: false,
        },
        capital: {
          type: Sequelize.STRING,
          required: true,
        },
        currency: {
          type: Sequelize.STRING(3),
          required: true,
        },
        currencyName: {
          type: Sequelize.STRING(50),
          required: true,
        },
        currencySymbol: {
          type: Sequelize.STRING(10),
          required: true,
        },
        tld: {
          type: Sequelize.STRING(10),
          required: true,
        },
        native: {
          type: Sequelize.STRING,
          required: true,
        },
        nationality: {
          type: Sequelize.STRING(50),
          required: true,
        },
        timezones: {
          type: Sequelize.TEXT('medium'),
          required: false,
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
        emoji: {
          type: Sequelize.STRING(10),
          required: true,
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
      await queryInterface.addIndex('gnrl_countries', {
        fields: ['name', 'deletedAt'],
        name: 'idx_gnrl_countries_name',
        transaction,
      });

      await queryInterface.addIndex('gnrl_countries', {
        fields: ['iso2', 'deletedAt'],
        unique: true,
        name: 'idx_unique_gnrl_countries_iso2',
        transaction,
      });

      await queryInterface.addIndex('gnrl_countries', {
        fields: ['iso3', 'deletedAt'],
        unique: true,
        name: 'idx_unique_gnrl_countries_iso3',
        transaction,
      });

      await queryInterface.addIndex('gnrl_countries', {
        fields: ['phoneCode', 'deletedAt'],
        name: 'idx_gnrl_countries_phone_code',
        transaction,
      });

      await queryInterface.addIndex('gnrl_countries', {
        fields: ['numericCode', 'deletedAt'],
        name: 'idx_gnrl_countries_numeric_code',
        transaction,
      });

      await queryInterface.addIndex('gnrl_countries', {
        fields: ['status', 'deletedAt'],
        name: 'idx_gnrl_countries_status',
        transaction,
      });
    } else if (dbName === 'postgres') {
      await queryInterface.addIndex('gnrl_countries', {
        fields: ['name'],
        name: 'idx_gnrl_countries_name',
        where: { deletedAt: null },
        transaction,
      });

      await queryInterface.addIndex('gnrl_countries', {
        fields: ['iso2'],
        unique: true,
        name: 'idx_unique_gnrl_countries_iso2',
        where: { deletedAt: null },
        transaction,
      });

      await queryInterface.addIndex('gnrl_countries', {
        fields: ['iso3'],
        unique: true,
        name: 'idx_unique_gnrl_countries_iso3',
        where: { deletedAt: null },
        transaction,
      });

      await queryInterface.addIndex('gnrl_countries', {
        fields: ['phoneCode'],
        name: 'idx_gnrl_countries_phone_code',
        where: { deletedAt: null },
        transaction,
      });

      await queryInterface.addIndex('gnrl_countries', {
        fields: ['numericCode'],
        name: 'idx_gnrl_countries_numeric_code',
        where: { deletedAt: null },
        transaction,
      });

      await queryInterface.addIndex('gnrl_countries', {
        fields: ['status'],
        name: 'idx_gnrl_countries_status',
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
    await queryInterface.removeIndex('gnrl_countries', 'idx_gnrl_countries_name', {
      transaction,
    });
    await queryInterface.removeIndex('gnrl_countries', 'idx_unique_gnrl_countries_iso2', {
      transaction,
    });
    await queryInterface.removeIndex('gnrl_countries', 'idx_unique_gnrl_countries_iso3', {
      transaction,
    });
    await queryInterface.removeIndex('gnrl_countries', 'idx_gnrl_countries_phone_code', {
      transaction,
    });
    await queryInterface.removeIndex('gnrl_countries', 'idx_gnrl_countries_numeric_code', {
      transaction,
    });
    await queryInterface.dropTable('gnrl_countries', {
      transaction,
    });
    await transaction.commit();
  } catch (ex) {
    await transaction.rollback();
    throw ex;
  }
}

export { up, down };
