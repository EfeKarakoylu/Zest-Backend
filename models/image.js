'use strict';
const {
  Model
} = require('sequelize');
const uppercaseFirst = str => `${str[0].toUpperCase()}${str.substr(1)}`;
module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    getOwner(options) {
      if (!this.ownerType) return Promise.resolve(null);
      const mixinMethodName = `get${uppercaseFirst(this.ownerType)}`;
      return this[mixinMethodName](options);
    }

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.ZestImage.belongsTo(models.Recipe, {foreignKey: 'ownerId', constraints: false})
      models.ZestImage.belongsTo(models.User, {foreignKey: 'ownerId', constraints: false})

    }
  };

  Image.init({
    imageKey: DataTypes.STRING,
    ownerId: DataTypes.INTEGER,
    ownerType: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ZestImage',
  });
  Image.addHook("afterFind", findResult => {
    if (!Array.isArray(findResult)) findResult = [findResult];
    for (const instance of findResult) {
      if (instance.ownerType === "recipe" && instance.recipe !== undefined) {
        instance.owner = instance.recipe;
      } else if (instance.ownerType === "user" && instance.user !== undefined) {
        instance.owner = instance.user;
      }
      // To prevent mistakes:
      delete instance.recipe;
      delete instance.dataValues.recipe;
      delete instance.user;
      delete instance.dataValues.user;
    }
  });

  return Image;
};