const axios = require('axios');

module.exports = {
  '0 * * * *': async function({ strapi }) {
    const now = new Date();

    // Delete all unauth shortlinks that are older than 24 hours - checked hourly
    await strapi.db.query('api::shortlink.shortlink').deleteMany({
      where: {
        deleteAt: { $lt: now },
       }
    });
    console.log('Hourly UnAuth ShortLink Check at', now);
  },
  '0 0 * * *': async function({ strapi }) {
    //Update club data from the ProfLink API - checked daily
    try {
      const response = await axios.get('https://rowan.campuslabs.com/engage/api/discovery/search/organizations?orderBy[0]=UpperName%20asc&top=500');
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  },
};
