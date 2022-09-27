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
    }
  ]
}
