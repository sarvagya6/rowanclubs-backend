'use strict';

/**
 * A set of functions called "actions" for `debug`
 */

module.exports = {
  exampleAction: async (ctx, next) => {
    try {
      //get token from query
      const token = ctx.query.token;
      //get user from token
      const getToken = await strapi.plugins['users-permissions'].services.jwt.getToken(token);
      console.log("getToken", getToken);

      const verifyToken = await strapi.plugins['users-permissions'].services.jwt.verify(token);
      console.log("verifyToken", verifyToken);

      //get id and acronym from token
      const { id, acronym } = verifyToken;
      console.log("id", id);
      console.log("acronym", acronym);

    } catch (err) {
      ctx.body = err;
    }
  },

  exampleGen: async (ctx) => {
    try {
      //placeholder data
      const data = {
        name: 'test',
        acronym: 'test',
        websiteKey: 'test',
        uid: '222',
      };

      //generate token
      const token = await strapi.plugins['users-permissions'].services.jwt.issue({
        id: data.uid,
        acronym: data.acronym,
      });

      //make link for /debug?token=${token}
      const link = `http://localhost:1337/api/debug?token=${token}`;
      console.log("link", link);
      //return 200 success
      return ctx.send({ message: "success" });


    } catch (err) {
      ctx.body = err;
    }
  },

  exampleAddLinks: async (ctx) => {
    try {

      //stuff

      //return 200 success
      return ctx.send({ message: "success" });

    } catch (err) {
      ctx.body = err;

      //return 400 error
      return ctx.send({ message: "error" });
    }
  },
};
