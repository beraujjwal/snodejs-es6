'use strict';
import { Sequelize } from 'sequelize';

async function up({ context: queryInterface }) {
  const transaction = await queryInterface.sequelize.transaction();
  try {
    await queryInterface.createTable(
      'countries',
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
            model: 'regions',
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
            model: 'sub_regions',
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
          type: Sequelize.TEXT,
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
      'countries',
      ['name', 'iso2', 'iso3', 'phoneCode', 'regionID', 'subRegionID'],
      { transaction }
    );
    await transaction.commit();
  } catch (ex) {
    await transaction.rollback();
    throw ex;
  }
}

async function down({ context: queryInterface }) {
  await queryInterface.dropTable('countries');
}

export { up, down };
