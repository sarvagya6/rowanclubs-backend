var validator = require('validator')
const { ValidationError } = require("@strapi/utils").errors;

module.exports = {
  beforeCreate(data) {
    console.log('beforeCreate', data.params.data.redirectTo);

    if (!validator.isURL(`${data.params.data.redirectTo}`)) {
      throw new ValidationError("Invalid URL");
    }
  }
};
