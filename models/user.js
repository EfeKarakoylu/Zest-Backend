'use strict';


const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.User.belongsToMany(models.Recipe, {foreignKey: "userId", through: "users_recipes"})
      models.User.belongsToMany(models.User, {as: "Followed", foreignKey: "userId", through: "follow"})
      models.User.belongsToMany(models.User, {as: "Follower", foreignKey: "followerId", through: "follow"})
      // models.Recipe.belongsToMany(models.User, { as: "Recipe", foreignKey: "recipeId", through: "users_recipes"})
      models.User.hasMany(models.ZestImage, {
        foreignKey: "ownerId",
        constraints: false,
        scope: {
          ownerType: 'user'
        }
      })
    }
  };
  User.init({
    name: DataTypes.STRING,
    password: DataTypes.STRING,
    email: DataTypes.STRING,
    description: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};