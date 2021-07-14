'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Rate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Rate.belongsToMany(models.Recipe, {foreignKey: "rateId", through: "recipe_rate"})
    }
  };
  Rate.init({
    point: DataTypes.DOUBLE,
    ratedBy: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Rate',
  });
  return Rate;
};