'use strict';

/**
 * club controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const axios = require('axios');

module.exports = createCoreController("api::club.club", ({ strapi }) => ({
  async superCreate(ctx) {
    try {
      const response = await axios.get(
        "https://rowan.campuslabs.com/engage/api/discovery/search/organizations?orderBy[0]=UpperName%20asc&top=500"
      );
      const data = response.data.value;
      console.log(data);
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
          return data;

        } catch (error) {
          console.error(error);
          //return 400 error
          return ctx.badRequest(null, error);
        }
      });


    } catch (error) {
      console.error(error);
    }
  },
}));
