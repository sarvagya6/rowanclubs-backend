"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/shortlink/:uid",
      handler: "shortlink.findOne",
      config: {
        auth: false,
      }
    }
  ]
}
