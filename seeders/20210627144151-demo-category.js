'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Categories', [
      {
        name: 'Ana yemek',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Tatli',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Ara sicak',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Icecek',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Baslangic',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
