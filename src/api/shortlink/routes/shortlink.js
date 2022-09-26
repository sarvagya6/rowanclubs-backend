'use strict';

/**
 * shortlink router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::shortlink.shortlink');
