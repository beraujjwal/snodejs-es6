'use strict';
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../system/core/db.connection.js';

class MODEL_SINGULAR_FORM extends Model {
  static associate(models) {
    // MODEL_SINGULAR_FORM.hasMany(MODEL_SINGULAR_FORM, {
    //   as: "childrens",
    //   foreignKey: "parentID",
    //   attributes: ["id", "status"],
    // });
    // MODEL_SINGULAR_FORM.belongsTo(MODEL_SINGULAR_FORM, {
    //   as: "parent",
    //   foreignKey: "parentID",
    //   attributes: ["id", "status"],
    // });
  }
}

MODEL_SINGULAR_FORM.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    parentID: {
      type: DataTypes.BIGINT,
      references: {
        model: 'TABLE_NAME_PLURAL_FORM',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      validate: {
        isInt: true,
        notIn: [[1, 2]],
      },
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'This column is for name of the city.',
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'This column is for checking status.',
    },
  },
  {
    sequelize,
    modelName: 'MODEL_SINGULAR_FORM',
    tableName: 'TABLE_NAME_PLURAL_FORM',
    timestamps: true,
    paranoid: true,
    defaultScope: {
      attributes: {
        exclude: ['deletedAt'],
      },
      where: {
        status: true,
      },
    },
  }
);

export default MODEL_SINGULAR_FORM;
