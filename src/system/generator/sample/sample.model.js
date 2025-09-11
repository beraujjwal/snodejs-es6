'use strict';
import { sequelize, DataTypes } from '../system/core/db.connection.js';
import { BaseModel } from '../system/core/model/base.model.js';

class MODEL_SINGULAR_FORM extends BaseModel {
  // ✅ Per-model configuration
  static autoRegisterCommonHooks = true;
  static enableSlug = true;
  static slugField = 'name';
  static slugTargetField = 'slug';

  static enableOrder = true;
  static orderField = 'order';

  static forceStatus = true;

  static associate(models) {
    // this.hasMany(MODEL_SINGULAR_FORM, {
    //   as: "childrens",
    //   foreignKey: "parentID",
    //   attributes: ["id", "status"],
    // });
    // this.belongsTo(MODEL_SINGULAR_FORM, {
    //   as: "parent",
    //   foreignKey: "parentID",
    //   attributes: ["id", "status"],
    // });
  }

  // Optional custom logic
  static async customBeforeCreateHook(instance, options) {
    // e.g., set defaults or validate something
  }

  static async customBeforeUpdateHook(instance, options) {
    // e.g., audit tracking or soft validation
  }
}

MODEL_SINGULAR_FORM.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    parentID: {
      type: DataTypes.INTEGER,
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
      comment: 'This column is for name of the item.',
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
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
    paranoid: true, // Enables `deletedAt` for soft deletes
    footprint: true, // Enables `lastActivityBy` for last user activity
    defaultScope: {
      attributes: {
        exclude: ['deletedAt'],
      },
    },
    hooks: {},
  }
);

export default MODEL_SINGULAR_FORM;
