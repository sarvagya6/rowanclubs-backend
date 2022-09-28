'use strict';

/**
 * club controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const axios = require('axios');
const bcrypt = require('bcryptjs');
require('dotenv').config();
var validator = require('validator')
const { nanoid } = require('nanoid');

module.exports = createCoreController("api::club.club", ({ strapi }) => ({

  //superCreate: create all clubs from the ProfLink API
  async superCreate(ctx) {
    try {
      const response = await axios.get(
        "https://rowan.campuslabs.com/engage/api/discovery/search/organizations?orderBy[0]=UpperName%20asc&top=500"
      );
      const data = response.data.value;

      //map the data to the club model using strapi create
      data.forEach(async (club) => {
        try {
          const clubData = {
            name: club.Name,
            acronym: club.ShortName,
            websiteKey: club.WebsiteKey,
            uid: club.Id,
          };

          ctx.request.body.data = {
            ...ctx.request.body.data,
            ...clubData,
          };

          await super.create(ctx);


        } catch (error) {
          console.error(error);
          //return 400 error
          return ctx.badRequest(null, error);
        }
      });

      //return 200 success
      return ctx.send({ message: "success" });

    } catch (error) {
      console.error(error);
      //return 400 error
      return ctx.badRequest(null, error);
    }
  },

  //registrClub: register a club for the first time
  async registerManager(ctx) {
    try {

      //get token from url
      //example: /api/club/register?token=${token}
      const token = ctx.request.query.token;

      //get club and email from token jwt
      const data = strapi.plugins["users-permissions"].services.jwt.verify(token);
      if (!data) {
        return ctx.badRequest(null, "Invalid token");
      }

      const entity = await strapi.db
        .query("api::club.club")
        .update({ where: { uid:data.club },
        data: {
          manager: data.email,
        }
      });

      console.log("Added manager to club", entity);

      //return 200 success
      return ctx.send({ message: "success" });

    } catch (error) {
      console.error(error);

      //return 400 error
      return ctx.badRequest(null, error);
    }
  },

  //managerEmail: send an email to the club manager with a link to register the club with a token
  async managerEmail(ctx) {
    try {

      const data = ctx.request.body.data; //send the club UID and manager email
      const BASE_URL = process.env.BASE_URL;

      //search club by uid and check if manager is already registered
      const club = await strapi.db
        .query("api::club.club")
        .findOne({ uid: data.clubUID });

      if (club.manager) {
        return ctx.badRequest(null, "Manager already registered");
      }

      //generate a token for email verification
      const token = strapi.plugins['users-permissions'].services.jwt.issue({
        email: data.email,
        club: data.clubUID,
      });

      //link
      const link = `${BASE_URL}/api/club/register?token=${token}`;

      //send email to manager with link to register the club
      await strapi.plugins.email.services.email.send({
        to: email,
        subject: "Club Registration",
        text: "Please click the link below to register your club",
        html: `<a href="${link}">Verify and Register</a>`,
      });

      console.log(link);

      //return 200 success
      return ctx.send({ message: "success" });

    } catch (error) {
      console.error(error);

      //return 400 error
      return ctx.badRequest(null, error);
    }
  },

  //create club password for the first time
  async setPassword(ctx) {
    try {
      //get token from header
      const token = ctx.request.header.authorization.split(" ")[1];

      //get club and email from token jwt
      const data = strapi.plugins["users-permissions"].services.jwt.verify(token);
      if (!data) {
        return ctx.badRequest(null, "Invalid token");
      }

      //get club by uid
      const club = await strapi.db
        .query("api::club.club")
        .findOne({ uid: data.club });

      //check if password is already set
      if (club.password) {
        return ctx.badRequest(null, "Password already set");
      }

      //hash password
      const hash = await bcrypt.hash(data.password, 10);

      //update club password
      const entity = await strapi.db
        .query("api::club.club")
        .update({ where: { uid: data.club },
        data: {
          password: hash,
        }
      });

      console.log("Added password to club", entity);

      //return 200 success
      return ctx.send({ message: "success" });

    } catch (error) {
      console.error(error);

      //return 400 error
      return ctx.badRequest(null, error);
    }
  },

  //club login
  async login(ctx) {
    try {
      const data = ctx.request.body.data; //send the manager email, club UID and password

      //get club by uid
      const club = await strapi.db
        .query("api::club.club")
        .findOne({ uid: data.clubUID });

      //verify manager email
      if (club.manager !== data.email) {
        return ctx.badRequest(null, "Invalid credentials");
      }

      //check if password is set
      if (!club.password) {
        return ctx.badRequest(null, "Password not set");
      }

      //check if password is correct
      const valid = await bcrypt.compare(data.password, club.password);
      if (!valid) {
        return ctx.badRequest(null, "Invalid credentials");
      }

      //generate a token
      const token = strapi.plugins['users-permissions'].services.jwt.issue({
        club: data.clubUID,
        email: data.email,
      });

      //return 200 success
      return ctx.send({ message: "success", jwt: token });

    } catch (error) {
      console.error(error);

      //return 400 error
      return ctx.badRequest(null, error);
    }
  },

  //club password change
  async changePassword(ctx) {
    try {
      const data = ctx.request.body.data; //send the new password

      //get token from header
      const token = ctx.request.header.authorization.split(" ")[1];

      //get club and email from token jwt
      const jwt = strapi.plugins["users-permissions"].services.jwt.verify(token);
      if (!jwt) {
        return ctx.badRequest(null, "Invalid token");
      }

      //get club by uid
      const club = await strapi.db
        .query("api::club.club")
        .findOne({ uid: jwt.club });

      //verify manager email
      if (club.manager !== jwt.email) {
        return ctx.badRequest(null, "Invalid credentials");
      }

      //hash password
      const hash = await bcrypt.hash(data.password, 10);

      //update club password
      const entity = await strapi.db
        .query("api::club.club")
        .update({ where: { uid: jwt.club },
        data: {
          password: hash,
        }
      });

      console.log("Added password to club", entity);

      //return 200 success
      return ctx.send({ message: "success" });

    } catch (error) {
      console.error(error);

      //return 400 error
      return ctx.badRequest(null, error);
    }
  },

  //club password reset request
  async resetPasswordRequest(ctx) {
    try {
      const data = ctx.request.body.data; //send the manager email and club UID

      //get club by uid
      const club = await strapi.db
        .query("api::club.club")
        .findOne({ uid: data.clubUID });

      //verify manager email
      if (club.manager !== data.email) {
        return ctx.badRequest(null, "Invalid credentials");
      }

      //generate a token
      const token = strapi.plugins['users-permissions'].services.jwt.issue({
        club: data.clubUID,
        email: data.email,
      });

      //link
      const link = `${BASE_URL}/api/club/reset-password?token=${token}`;

      //send email to manager with link to reset password
      await strapi.plugins.email.services.email.send({
        to: email,
        subject: "Club Password Reset",
        text: "Please click the link below to reset your password",
        html: `<a href="${link}">Reset Password</a>`,
      });

      console.log(link);

      //return 200 success
      return ctx.send({ message: "success" });

    } catch (error) {
      console.error(error);

      //return 400 error
      return ctx.badRequest(null, error);
    }
  },

  //club password reset
  //this is the same as change password

  //transfer club manager using email
  async transferManager(ctx) {
    try {
      const data = ctx.request.body.data; //send the new manager email and club UID

      //get token from header
      const token = ctx.request.header.authorization.split(" ")[1];

      //get club and email from token jwt
      const jwt = strapi.plugins["users-permissions"].services.jwt.verify(token);
      if (!jwt) {
        return ctx.badRequest(null, "Invalid token");
      }

      //get club by uid
      const club = await strapi.db
        .query("api::club.club")
        .findOne({ uid: jwt.club });

      //verify manager email
      if (club.manager !== jwt.email) {
        return ctx.badRequest(null, "Invalid credentials");
      }

      //send email to new manager with link to accept transfer with new token
      const newToken = strapi.plugins['users-permissions'].services.jwt.issue({
        club: jwt.club,
        email: data.email,
      });

      //link
      const link = `${BASE_URL}/api/club/register?token=${newToken}`;

      //send email to manager with link to reset password
      await strapi.plugins.email.services.email.send({
        to: data.email,
        subject: "Club Manager Transfer",
        text: "Please click the link below to accept the transfer",
        html: `<a href="${link}">Accept Transfer</a>`,
      });

      console.log(link);

      //return 200 success
      return ctx.send({ message: "success" });

    } catch (error) {
      console.error(error);

      //return 400 error
      return ctx.badRequest(null, error);
    }
  },

  //update club details
  async clubProfile(ctx) {
    try {
      //get token from header
      const token = ctx.request.header.authorization.split(" ")[1];

      //fetch club details from body
      const data = ctx.request.body.data;

      //name, acronym, websiteKey, enable, bgColor, accentColor

      //get club and email from token jwt
      const jwt = strapi.plugins["users-permissions"].services.jwt.verify(token);
      if (!jwt) {
        return ctx.badRequest(null, "Invalid token");
      }

      //get club by uid
      const club = await strapi.db
        .query("api::club.club")
        .findOne({ uid: jwt.club });

      //verify manager email
      if (club.manager !== jwt.email) {
        return ctx.badRequest(null, "Invalid credentials");
      }

      //update club details
      const entity = await strapi.db
        .query("api::club.club")
        .update({ where: { uid: jwt.club },
        data: {
          name: data.name,
          acronym: data.acronym,
          websiteKey: data.websiteKey,
          enable: data.enable,
          bgColor: data.bgColor,
          accentColor: data.accentColor,
        }
      });

      console.log("Updated club details", entity);

      //return 200 success
      return ctx.send({ message: "success" });

    } catch (error) {
      console.error(error);

      //return 400 error
      return ctx.badRequest(null, error);
    }
  },

  //Links
  //Schema: links:[ { id, enable, title, redirectTo }, ... ]
  //get links
  async getLinks(ctx) {
    try {
      //get token from header
      const token = ctx.request.header.authorization.split(" ")[1];

      //get club and email from token jwt
      const jwt = strapi.plugins["users-permissions"].services.jwt.verify(token);
      if (!jwt) {
        return ctx.badRequest(null, "Invalid token");
      }

      //get club by uid
      const club = await strapi.db
        .query("api::club.club")
        .findOne({ uid: jwt.club });

      //verify manager email
      if (club.manager !== jwt.email) {
        return ctx.badRequest(null, "Invalid credentials");
      }

      //return links if not null and 200 success
      if (club.links) {
        return ctx.send({ links: club.links });
      } else {
        return ctx.send({ links: [] });
      }

    } catch (error) {
      console.error(error);

      //return 400 error
      return ctx.badRequest(null, error);
    }
  },

  //add link
  async addLink(ctx) {
    try {
      //get token from header
      const token = ctx.request.header.authorization.split(" ")[1];

      //fetch link details from body
      const data = ctx.request.body.data;

      //verify schema and validate redirect url
      if (
        !data.enable ||
        !data.title ||
        !data.redirectTo ||
        !validator.isURL(data.redirectTo)
      ) {
        return ctx.badRequest(null, "Invalid schema");
      }

      //get club and email from token jwt
      const jwt = strapi.plugins["users-permissions"].services.jwt.verify(token);
      if (!jwt) {
        return ctx.badRequest(null, "Invalid token");
      }

      //get club by uid
      const club = await strapi.db
        .query("api::club.club")
        .findOne({ uid: jwt.club });

      //verify manager email
      if (club.manager !== jwt.email) {
        return ctx.badRequest(null, "Invalid credentials");
      }

      //json object to be added to links array
      const link = {
        id: nanoid(6),
        enable: data.enable,
        title: data.title,
        redirectTo: data.redirectTo,
      };

      //check if links array is null
      if (club.links===null) {
          linkArray = [link];
      } else {
          linkArray = club.links;
          linkArray.push(link);
      }


      //add links to db
      const entity = await strapi.db
        .query("api::club.club")
        .update({ where: { uid: jwt.club },
        data: {
          links: linkArray
        }
      });

      console.log("Links added", entity);

      //return 200 success
      return ctx.send({ message: "success" });

    } catch (error) {
      console.error(error);

      //return 400 error
      return ctx.badRequest(null, error);
    }
  },

  //update link search by id
  async updateLink(ctx) {
    try {
      //get token from header
      const token = ctx.request.header.authorization.split(" ")[1];

      //fetch link details from body
      const data = ctx.request.body.data;

      //verify schema and validate redirect url
      if (
        !data.id ||
        !data.enable ||
        !data.title ||
        !data.redirectTo ||
        !validator.isURL(data.redirectTo)
      ) {
        return ctx.badRequest(null, "Invalid schema");
      }

      //get club and email from token jwt
      const jwt = strapi.plugins["users-permissions"].services.jwt.verify(token);
      if (!jwt) {
        return ctx.badRequest(null, "Invalid token");
      }

      //get club by uid
      const club = await strapi.db
        .query("api::club.club")
        .findOne({ uid: jwt.club });

      //verify manager email
      if (club.manager !== jwt.email) {
        return ctx.badRequest(null, "Invalid credentials");
      }

      //json object to be added to links array
      const link = {
        id: data.id,
        enable: data.enable,
        title: data.title,
        redirectTo: data.redirectTo,
      };

      //check if links array is null
      if (club.links===null) {
          return ctx.badRequest(null, "Link not found");
      } else {
          linkArray = club.links;
          //find index of link to be updated
          const index = linkArray.findIndex((link) => link.id === data.id);
          if (index === -1) {
            return ctx.badRequest(null, "Link not found");
          }
          linkArray[index] = link;
      }

      //add links to db
      const entity = await strapi.db
        .query("api::club.club")
        .update({ where: { uid: jwt.club },
        data: {
          links: linkArray
        }
      });

      console.log("Links updated", entity);

      //return 200 success
      return ctx.send({ message: "success" });

    } catch (error) {
      console.error(error);

      //return 400 error
      return ctx.badRequest(null, error);
    }
  },

  //delete link search by id
  async deleteLink(ctx) {
    try {
      //get token from header
      const token = ctx.request.header.authorization.split(" ")[1];

      //fetch link details from body
      const data = ctx.request.body.data;

      //verify schema
      if (!data.id) {
        return ctx.badRequest(null, "Invalid schema");
      }

      //get club and email from token jwt
      const jwt = strapi.plugins["users-permissions"].services.jwt.verify(token);
      if (!jwt) {
        return ctx.badRequest(null, "Invalid token");
      }

      //get club by uid
      const club = await strapi.db
        .query("api::club.club")
        .findOne({ uid: jwt.club });

      //verify manager email
      if (club.manager !== jwt.email) {
        return ctx.badRequest(null, "Invalid credentials");
      }

      //check if links array is null
      if (club.links===null) {
          return ctx.badRequest(null, "Link not found");
      } else {
          linkArray = club.links;
          //find index of link to be updated
          const index = linkArray.findIndex((link) => link.id === data.id);
          if (index === -1) {
            return ctx.badRequest(null, "Link not found");
          }
          linkArray.splice(index, 1);
      }

      //add links to db
      const entity = await strapi.db
        .query("api::club.club")
        .update({ where: { uid: jwt.club },
        data: {
          links: linkArray
        }
      });

      console.log("Links deleted", entity);

      //return 200 success
      return ctx.send({ message: "success" });

    } catch (error) {
      console.error(error);

      //return 400 error
      return ctx.badRequest(null, error);
    }
  },

  //reorder links
  async reorderLinks(ctx) {
    try {
      //get token from header
      const token = ctx.request.header.authorization.split(" ")[1];

      //fetch link details from body
      const data = ctx.request.body.data;

      //verify schema
      if (!data.links || data.links.length === 0 ||
        data.links.some((link) => !link.id || !link.enable || !link.title || !link.redirectTo || !validator.isURL(link.redirectTo))) {
        return ctx.badRequest(null, "Invalid schema");
      }

      //get club and email from token jwt
      const jwt = strapi.plugins["users-permissions"].services.jwt.verify(token);
      if (!jwt) {
        return ctx.badRequest(null, "Invalid token");
      }

      //get club by uid
      const club = await strapi.db
        .query("api::club.club")
        .findOne({ uid: jwt.club });

      //verify manager email
      if (club.manager !== jwt.email) {
        return ctx.badRequest(null, "Invalid credentials");
      }

      //add links to db
      const entity = await strapi.db
        .query("api::club.club")
        .update({ where: { uid: jwt.club },
        data: {
          links: data.links
        }
      });

      console.log("Links reordered", entity);

      //return 200 success
      return ctx.send({ message: "success" });

    } catch (error) {
      console.error(error);

      //return 400 error
      return ctx.badRequest(null, error);
    }
  }

}));
