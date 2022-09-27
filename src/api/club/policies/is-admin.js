'use strict';

/**
 * `is-admin` policy
 */

module.exports = (policyContext, config, { strapi }) => {
    strapi.log.info('In is-admin policy.');

    if (policyContext.state.user.role.name === 'Administrator') {
      // Go to next policy or will reach the controller's action.
      return true;
    }

    return false;
};
