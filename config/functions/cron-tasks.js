module.exports = {
  '0 * * * *': async function({ strapi }) {
    const now = new Date();
    console.log('Hourly UnAuth ShortLink Check at', now);

    // Delete all shortlinks that are older than 24 hours - checked hourly
    await strapi.db.query('api::shortlink.shortlink').deleteMany({
      where: {
        deleteAt: { $lt: now },
       }
    });
  }
};
