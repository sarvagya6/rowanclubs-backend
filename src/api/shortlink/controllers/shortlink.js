'use strict';

/**
 * shortlink controller
 */

const { customAlphabet } = require('nanoid');
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::shortlink.shortlink', ({strapi}) => ({
  async findOne(ctx) {
      const { uid } = ctx.params;

      const entity = await strapi.db.query('api::shortlink.shortlink').findOne({
        where: { uid }
      });

      const sanitizedEntity = await this.sanitizeOutput(entity);
      return this.transformResponse(sanitizedEntity);
    },

    async create(ctx) {
      const randomid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 5)
      const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

      ctx.request.body.data = {
        ...ctx.request.body.data,
        uid: randomid(),
        deleteAt: new Date(Date.now() + TWENTY_FOUR_HOURS),
      };

      const response = await super.create(ctx)

      return response;
    },
}));
