module.exports = {
  routes: [
    {
     method: 'GET',
     path: '/debug',
     handler: 'debug.exampleAction',
     config: {
       policies: [],
       middlewares: [],
     },
    },

    //post
    {
      method: 'POST',
      path: '/debug',
      handler: 'debug.exampleGen',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
