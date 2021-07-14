const bcrypt = require('bcrypt')
const model = require('../models')
const Sequelize = require('sequelize')
const jwt = require('jsonwebtoken')
const {Category} = model
const {Recipe} = model



async function getAllCategories(req, res){
    try{
        const categorires = await Category.findAll();
        jwt.sign({categories: categorires}, 'secretkey', (err, token) => {
            res.json({
                categories: categorires
            })
        })
    }catch (err){
        return res.status(404).send("get recipes failed")
    }
}

async function getParticularCategory(req, res){
    try{
        let {id} = req.query

        const recipe = await Recipe.findByPk(id)
        const category = await recipe.getCategory()
        console.log(category, "[[[[[[[[[[[[]]]]]]]]]]]]")
        jwt.sign({category: category}, 'secretkey', (err, token) => {
            res.json({
                category: category
            })
        })
    }catch (err){
        console.log(err)
    }

}

const methods = {
    getAllCategories,
    getParticularCategory
}
module.exports = methods