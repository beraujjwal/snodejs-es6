'use strict';
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../system/core/db.connection.js';

class SubRegion extends Model {
  static associate(models) {
    this.belongsTo(models.Region, { foreignKey: 'regionID', as: 'region' });
  }
}

SubRegion.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    regionID: {
      type: DataTypes.BIGINT,
      references: {
        model: {
          tableName: 'regions',
          modelName: 'Region',
        },
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment:
        'This column is for checking if the sub-region is active or not.',
    },
  },
  {
    sequelize,
    modelName: 'SubRegion',
    tableName: 'sub_regions',
    timestamps: true,
    paranoid: true,
    defaultScope: {
      attributes: { exclude: ['deletedAt'] },
    },
    scopes: {
      activeSubRegions: { where: { status: true } },
    },
  }
);

export default SubRegion;
