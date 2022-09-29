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

    //update club
    {
      method: 'PUT',
      path: '/club/:id',
      handler: 'club.update',
      config: {
        policies: ['is-admin']
      }
    },

    //delete club
    {
      method: 'DELETE',
      path: '/club/:id',
      handler: 'club.delete',
      config: {
        policies: ['is-admin']
      }
    },

    //add manager to club
    {
      method: 'GET',
      path: '/club/register',
      handler: 'club.setManager',
      config: {}
    },

    //manager email verification for first time registration
    {
      method: 'POST',
      path: '/club/register',
      handler: 'club.managerSignup',
      config: {
        auth: false
      }
    },

    //login
    {
      method: 'POST',
      path: '/club/login',
      handler: 'club.login',
      config: {
        auth: false
      }
    },

    //password change
    {
      method: 'POST',
      path: '/club/change-password',
      handler: 'club.changePassword',
      config: {
        auth: false
      }
    },

    //forgot password
    {
      method: 'POST',
      path: '/club/forgot-password',
      handler: 'club.forgotPassword',
      config: {
        auth: false
      }
    },

    //transfer manager
    {
      method: 'POST',
      path: '/club/transfer-manager',
      handler: 'club.transferManager',
      config: {
        auth: false
      }
    },

    //update club Profile from manager
    {
      method: 'PUT',
      path: '/club/update',
      handler: 'club.updateClubProfile',
      config: {
        auth: false
      }
    },

    //Links
    //get links
    {
      method: 'GET',
      path: '/club/links',
      handler: 'club.getLinks',
      config: {
        auth: false
      }
    },

    //add link
    {
      method: 'POST',
      path: '/club/links',
      handler: 'club.addLink',
      config: {
        auth: false
      }
    },

    //update link
    {
      method: 'PUT',
      path: '/club/links',
      handler: 'club.updateLink',
      config: {
        auth: false
      }
    },

    //delete link
    {
      method: 'DELETE',
      path: '/club/links',
      handler: 'club.deleteLink',
      config: {
        auth: false
      }
    },

    //reorder links
    {
      method: 'PUT',
      path: '/club/links/reorder',
      handler: 'club.reorderLinks',
      config: {
        auth: false
      }
    },
  ]
}
