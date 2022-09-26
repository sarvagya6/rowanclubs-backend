'use strict';

/**
 * shortlink service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::shortlink.shortlink');
