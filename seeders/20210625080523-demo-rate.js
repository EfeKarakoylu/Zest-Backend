'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
     return queryInterface.bulkInsert('Rates', [{
     point:10,
     createdAt: new Date(),
     updatedAt: new Date()
     }]);
  },
  down: async (queryInterface, Sequelize) => {
      return queryInterface.bulkDelete('Rates', null, {});
  }
};
