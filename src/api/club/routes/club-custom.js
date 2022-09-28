"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/club/supercreate",
      handler: "club.superCreate",
      config: {
        policies: ['is-admin']
      }
    },
    {
      method: 'POST',
      path: '/clubs',
      handler: 'club.create',
      config: {
        /**
          The `is-admin` policy found at `./src/api/club/policies/is-admin.js`
          is executed before the `find` action in the `club.js` controller.
         */
        policies: ['is-admin']
      }
    },

    //add manager to club
    {
      method: 'GET',
      path: '/club/register',
      handler: 'club.registerManager',
      config: {}
    },

    //manager email verification for first time registration
    {
      method: 'POST',
      path: '/clubs/register-manager',
      handler: 'club.managerEmail',
      config: {
        auth: false
      }
    },
  ]
}
