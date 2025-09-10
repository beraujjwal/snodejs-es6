// // system/core/base.model.js
// import { Model, DataTypes, Op } from 'sequelize';
// import slugify from 'slugify';
// import { BaseError } from '../error/baseError.js';

// export class BaseModel extends Model {
//   static defaults = {
//     enableSlug: true,
//     slugField: 'name',
//     slugTargetField: 'slug',
//     enableOrder: true,
//     orderField: 'order',
//     forceStatus: true,
//   };

//   /**
//    * Initializes the model with the given attributes and options.
//    * Adds "footprint" tracking if specified, which tracks the last activity by user.
//    * Automatically registers common and custom hooks for lifecycle methods.
//    *
//    * @author Ujjwal Bera
//    * @param {Object} attributes - The attributes for the model.
//    * @param {Object} options - Options for initializing the model.
//    * @param {boolean} [options.footprint=false] - If true, adds lastActivityBy tracking.
//    * @param {boolean} [this.autoRegisterCommonHooks=true] - If true, registers common hooks.
//    * @returns {Model} The initialized model.
//    */

//   static init(attributes, options) {
//     // 👣 Add footprints
//     if (options.footprint) {
//       attributes.lastActivityBy = {
//         type: DataTypes.INTEGER,
//         allowNull: true,
//         references: {
//           model: 'gnrl_users',
//           key: 'id',
//         },
//         onUpdate: 'CASCADE',
//         onDelete: 'RESTRICT',
//         comment: 'Tracks last activity by user.',
//       };
//     }
//     const model = super.init(attributes, options);
//     if (options.footprint) {
//       // model.addHook('beforeValidate', (instance, opts) => {
//       //   if (opts.userID) instance.set('lastActivityBy', opts.userID);
//       // });

//       // model.addHook('beforeCreate', (instance, opts) => {
//       //   if (opts.userID) instance.set('lastActivityBy', opts.userID);
//       // });

//       // model.addHook('beforeUpdate', (instance, opts) => {
//       //   if (opts.userID) instance.set('lastActivityBy', opts.userID);
//       // });

//       // model.addHook('beforeDestroy', (instance, opts) => {
//       //   if (opts.userID) instance.set('lastActivityBy', opts.userID);
//       // });

//       [
//         'beforeValidate',
//         'beforeCreate',
//         'beforeUpdate',
//         'beforeDestroy',
//       ].forEach((hook) => {
//         model.addHook(hook, (instance, opts) => {
//           if (opts.userID) instance.set('lastActivityBy', opts.userID);
//         });
//       });
//     }
//     // ✅ Automatically register commonBeforeSaveHook if enabled
//     if (this.autoRegisterCommonHooks !== false) {
//       model.addHook('beforeCreate', async (instance, opts) => {
//         await this.commonBeforeSaveHook(instance, opts);
//         if (typeof this.customBeforeCreateHook === 'function') {
//           await this.customBeforeCreateHook(instance, opts);
//         }
//       });

//       model.addHook('beforeUpdate', async (instance, opts) => {
//         await this.commonBeforeSaveHook(instance, opts);
//         if (typeof this.customBeforeUpdateHook === 'function') {
//           await this.customBeforeUpdateHook(instance, opts);
//         }
//       });
//     }

//     return model;
//   }

//   /**
//    * Common before save hook for models.
//    * Handles slug generation, order auto-incrementation, and status forcing.
//    *
//    * @author Ujjwal Bera
//    * @param {Model} instance - The model instance being validated.
//    * @param {Object} options - The options passed to the hook.
//    * @returns {Promise<void>}
//    */
//   static async commonBeforeSaveHook(instance, options) {
//     const ModelClass = instance.constructor;
//     options.logging?.(`Running commonBeforeSaveHook for ${ModelClass.name}`);
//     try {
//       const {
//         enableSlug = true,
//         slugField = 'name',
//         slugTargetField = 'slug',
//         enableOrder = true,
//         orderField = 'order',
//         forceStatus = true,
//       } = ModelClass;

//       //const config = { ...ModelClass.defaults, ...ModelClass };

//       // 🔤 Slug
//       if (
//         enableSlug &&
//         typeof instance[slugField] === 'string' &&
//         (!instance[slugTargetField] || instance.changed(slugField))
//       ) {
//         let baseSlug = slugify(instance[slugField], {
//           lower: true,
//           strict: true,
//         });
//         // let slug = baseSlug;
//         // let count = 1;

//         // while (
//         //   await ModelClass.findOne({
//         //     attributes: ['id'],
//         //     where: {
//         //       [slugTargetField]: slug,
//         //       ...(instance.id && { id: { [Op.ne]: instance.id } }),
//         //     },
//         //     logging: true,
//         //   })
//         // ) {
//         //   slug = `${baseSlug}-${count++}`;
//         // }

//         // instance[slugTargetField] = slug;
//         const existingSlugs = await ModelClass.findAll({
//           attributes: [slugTargetField],
//           where: {
//             [slugTargetField]: { [Op.like]: `${baseSlug}%` },
//             ...(instance.id && { id: { [Op.ne]: instance.id } }),
//           },
//           raw: true,
//         });

//         const slugSet = new Set(existingSlugs.map((s) => s[slugTargetField]));
//         let slug = baseSlug;
//         let count = 1;
//         while (slugSet.has(slug)) {
//           slug = `${baseSlug}-${count++}`;
//         }
//         instance[slugTargetField] = slug;
//       }

//       // 🔢 Order
//       if (
//         enableOrder &&
//         instance.isNewRecord &&
//         ModelClass.rawAttributes[orderField]
//       ) {
//         const maxOrder = await ModelClass.max(orderField);
//         instance[orderField] = (maxOrder || 0) + 1;
//       }

//       // Force status
//       if (
//         forceStatus &&
//         (typeof instance.status !== 'boolean' || instance.status !== false)
//       ) {
//         instance.status = true;
//       }
//     } catch (ex) {
//       console.error(
//         `Error in commonBeforeSaveHook for ${instance.constructor.name}:`,
//         {
//           message: ex.message,
//           stack: ex.stack,
//           instance: instance.get?.({ plain: true }) ?? instance,
//         }
//       );

//       // Re-throw to let Sequelize handle it
//       throw new BaseError(ex);
//     }
//   }
// }

// system/core/base.model.js
import { Model, DataTypes, Op } from 'sequelize';
import slugify from 'slugify';
import { BaseError } from '../error/baseError.js';

export class BaseModel extends Model {
  static defaults = {
    enableSlug: true,
    slugField: 'name',
    slugTargetField: 'slug',
    enableOrder: true,
    orderField: 'order',
    forceStatus: true,
  };

  static init(attributes, options) {
    // 👣 Add footprints
    if (options.footprint) {
      attributes.lastActivityBy = {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'gnrl_users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Tracks last activity by user.',
      };
    }

    const model = super.init(attributes, options);

    // 📌 Footprint hooks (DRY)
    if (options.footprint) {
      [
        'beforeValidate',
        'beforeCreate',
        'beforeUpdate',
        'beforeDestroy',
      ].forEach((hook) => {
        model.addHook(hook, (instance, opts) => {
          if (opts.userID) instance.set('lastActivityBy', opts.userID);
        });
      });
    }

    // ✅ Common hooks registration
    if (this.autoRegisterCommonHooks !== false) {
      model.addHook('beforeCreate', async (instance, opts) => {
        await this.commonBeforeSaveHook(instance, opts);
        if (typeof this.customBeforeCreateHook === 'function') {
          await this.customBeforeCreateHook(instance, opts);
        }
      });

      model.addHook('beforeUpdate', async (instance, opts) => {
        await this.commonBeforeSaveHook(instance, opts);
        if (typeof this.customBeforeUpdateHook === 'function') {
          await this.customBeforeUpdateHook(instance, opts);
        }
      });
    }

    return model;
  }

  static async commonBeforeSaveHook(instance, options) {
    try {
      const config = { ...this.defaults, ...this };
      await this.handleSlug(instance, config, options);
      await this.handleOrder(instance, config, options);
      this.handleStatus(instance, config);
    } catch (ex) {
      console.error(
        `Error in commonBeforeSaveHook for ${instance.constructor.name}:`,
        {
          message: ex.message,
          stack: ex.stack,
          instance: instance.get?.({ plain: true }) ?? instance,
        }
      );
      throw new BaseError(ex);
    }
  }

  /**
   * Transaction-safe unique slug generation
   */
  static async handleSlug(
    instance,
    { enableSlug, slugField, slugTargetField },
    options
  ) {
    if (
      !enableSlug ||
      typeof instance[slugField] !== 'string' ||
      (instance[slugTargetField] && !instance.changed(slugField))
    )
      return;

    const baseSlug = slugify(instance[slugField], {
      lower: true,
      strict: true,
    });
    const ModelClass = instance.constructor;
    const transaction = options?.transaction || null;

    // 🔒 Lock table rows for update (transaction-safe slug generation)
    const existingSlugs = await ModelClass.findAll({
      attributes: [slugTargetField],
      where: {
        [slugTargetField]: { [Op.like]: `${baseSlug}%` },
        ...(instance.id && { id: { [Op.ne]: instance.id } }),
      },
      lock: transaction ? transaction.LOCK.UPDATE : undefined,
      transaction,
      raw: true,
    });

    const slugSet = new Set(existingSlugs.map((s) => s[slugTargetField]));
    let slug = baseSlug;
    let count = 1;
    while (slugSet.has(slug)) slug = `${baseSlug}-${count++}`;

    instance[slugTargetField] = slug;
  }

  /**
   * Auto-increment order field (transaction-safe)
   */
  static async handleOrder(instance, { enableOrder, orderField }, options) {
    if (!enableOrder || !instance.isNewRecord) return;

    const ModelClass = instance.constructor;
    if (!ModelClass.rawAttributes[orderField]) return;

    const transaction = options?.transaction || null;
    const maxOrder = await ModelClass.max(orderField, { transaction });
    instance[orderField] = (maxOrder || 0) + 1;
  }

  /**
   * Default status handling
   */
  static handleStatus(instance, { forceStatus }) {
    if (!forceStatus) return;
    if (instance.status == null) instance.status = true; // only if not set
  }
}
