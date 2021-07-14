'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Recipe extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Recipe.belongsToMany(models.User, {foreignKey: "recipeId", through: "users_recipes"})
      models.Recipe.belongsToMany(models.Rate, {foreignKey: "recipeId", through: "recipe_rate"})
      models.Recipe.belongsTo(models.Category)
      models.Recipe.belongsToMany(models.Hashtag, {foreignKey: "recipeId,", through: "recipe_hashtag"})
      models.Recipe.hasMany(models.ZestImage, {
        foreignKey: "ownerId",
        constraints: false,
        scope: {
          ownerType: 'recipe'
        }
      })
    }
  };
  Recipe.init({
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    ingredients: DataTypes.JSONB,
    createdBy: DataTypes.STRING,
    averageRate:DataTypes.DOUBLE,
  }, {
    sequelize,
    modelName: 'Recipe',
  });
  return Recipe;
};