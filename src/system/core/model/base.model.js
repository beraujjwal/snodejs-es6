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
    // Add footprints
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

    // Footprint hooks
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

    // Common hooks registration
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

    // Lock table rows for update (transaction-safe slug generation)
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
