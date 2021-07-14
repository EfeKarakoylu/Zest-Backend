const {uploadFile, getFileStream, deleteFile} = require('../s3')

const bcrypt = require('bcrypt')
const model = require('../models')
const Sequelize = require('sequelize')
const jwt = require('jsonwebtoken')
const {Recipe} = model
const {User} = model
const {Rate} = model
const {Category} = model
const {Hashtag} = model



async function createRecipe(req, res){
    let { name, description, ingredients, createdBy } = req.body.recipe;
    let {hashtags} =  req.body;
    let {imageKey} = req.body;
    let msg;

    if(!name){
        msg = '404you should add a name to your recipe'
    }

    else if (!imageKey){
        msg = '404You should add an image to your recipe'
    }

    // if (!imageKey){
    //     return res.send('you should add an image to your recipe')
    // }

    else if (!description){
        msg = '404You should add a description to your recipe'
    }

    else if (!ingredients){
        msg = '404There should be at least one ingredient right? :D'
    }
    else{
        let category = await Category.findOne({where: {name: req.body.category}})

        const newRecipe = await Recipe.create({
            name: name,
            description: description,
            ingredients: ingredients,
            createdBy: createdBy,
        }).then((recipe) => {
            addRecipeToUser(category, req.data.user.id, recipe.dataValues.id)
            const image = recipe.createZestImage({imageKey: req.body.imageKey})
            if (hashtags){
                let hashtagArr = hashtags.split('#')
                hashtagArr.map(function (item){
                    if (item.length > 0){
                        item = item.trim()
                        item = "#" + item
                        Hashtag.findOne({where: {tag: item}})
                            .then((isThere) => {
                                if (isThere){
                                    addRecipeToHashtag(recipe.dataValues.id, isThere.id)
                                }
                                else{
                                    Hashtag.create({
                                        tag: item
                                    })
                                        .then(hashtag => {
                                            addRecipeToHashtag(recipe.dataValues.id, hashtag.dataValues.id)
                                        })
                                }
                            })
                    }
                })
            }
            msg = "recipe successfully added your recipe"
        })

            .catch((err) => console.log(err))
    }

    // console.log("HAHAHAHAHAHHAHAHAHAH", image.ownerId === theRecipe.id)
    // console.log("HAHAHAHAHAHHAHAHAHAH", image)


    jwt.sign({msg: msg}, 'secretkey', (err, token) => {
        res.json({
            msg: msg
        })
    })

}

async function getRecipesWithTag(req, res){
    try{
        let hashtag = await Hashtag.findOne({where: {tag: req.body.hashtag}})
        let tagRecipes = await hashtag.getRecipes()

        jwt.sign({tagRecipes: tagRecipes}, 'secretkey', (err, token) => {
            res.json({
                tagRecipes: tagRecipes
            })
        })
    }catch (err){
        console.log(err)
    }
}

async function getAllRecipes(req, res){
    try{
        let recipes = await Recipe.findAll({order: [['updatedAt', 'DESC']]});
        let {page} = req.query
        console.log("HAHAHAHAHAHHAHAHA", page)
        console.log("HAHAHAHAHAHHAHAHA", req.query.page)
        recipes = recipes.slice(0, page*9)
        jwt.sign({recipes: recipes}, 'secretkey', (err, token) => {
            res.json({
                recipes: recipes
            })
        })
    }catch (err){
        return res.status(404).send("get recipes failed")
    }
}

async function getRecipesForUser(req, res){
    try{
        let {id} = req.query
        const user = await User.findByPk(id)
        const recipes = await user.getRecipes()


        jwt.sign({recipes: recipes}, 'secretkey', (err, token) => {
            res.json({
                recipes: recipes
            })
        })

    }catch (err){
        return res.status(404).send("get recipes for that user is failed")
    }
}

async function getRecipe(req, res){
    try{
        let {id} = req.query
        let recipe = await Recipe.findOne({ where: { id: id } });
        jwt.sign({recipe: recipe}, 'secretkey', (err, token) => {
            res.json({
                recipe: recipe
            })
        })
    } catch (err){
        return res.status(404).send("get recipe failed")
    }
}

async function getHashtagsOfRecipe(req, res){
    try{
        let {id} = req.query
        let recipe = await Recipe.findOne({ where: { id: id } });
        const hashtags = await recipe.getHashtags()
        jwt.sign({hashtags: hashtags}, 'secretkey', (err, token) => {
            res.json({
                hashtags: hashtags
            })
        })
    }catch (err){
        console.log(err)
    }
}

async function deleteRecipeForEveryone(req, res){
    try{
        let {id} = req.query
        const recipe = await Recipe.findByPk(id)
        const image = await recipe.getZestImages()
        if (image.length > 0){
            const result = deleteFile(image[0].imageKey)
            await recipe.removeZestImage(image)
        }

        await recipe.destroy()
        let msg = "recipe successfully removed from all recipes"
        jwt.sign({msg: msg}, 'secretkey', (err, token) => {
            res.json({
                msg: msg
            })
        })
    }catch (err){
        console.log(err)
    }
}

async function deleteRecipeForMe(req, res){
    try{
        let {id} = req.query
        const recipe = await Recipe.findByPk(id)
        const user = await User.findByPk(req.data.user.id)
        user.removeRecipe(recipe)
        let msg = "recipe successfully removed from your recipes"
        jwt.sign({msg: msg}, 'secretkey', (err, token) => {
            res.json({
                msg: msg
            })
        })
    }catch (err){
        console.log(err)
    }
}

async function addRecipeToUser(category, userId, recipeId){
    return User.findByPk(userId)
        .then((user) => {
            if (!user){
                console.log("user not found!")
                return null
            }
            return Recipe.findByPk(recipeId).then((recipe) => {
                if (!recipe){
                    console.log("recipe not found!")
                    return null
                }
                recipe.setCategory(category)
                user.addRecipes(recipe)
                return user
            })

        })
}

async function addRecipeToHashtag(recipeId, hashtagId){
    return Hashtag.findByPk(hashtagId)
        .then((hashtag) => {
            if (!hashtag){
                console.log("hashtag not found!")
                return null
            }
            return Recipe.findByPk(recipeId)
                .then((recipe) => {
                    if (!recipe){
                        console.log("recipe not found!")
                        return null
                    }
                    hashtag.addRecipes(recipe)
                    return hashtag
                })
        })
}

async function updateRecipe(req, res){
    try{
        let {id} = req.query
        const theRecipe = await Recipe.findByPk(id)
        let category = await Category.findOne({where: {name: req.body.categoryName}})
        theRecipe.name = req.body.recipe.name
        theRecipe.description = req.body.recipe.description
        theRecipe.ingredients = req.body.recipe.ingredients
        theRecipe.setCategory(category)
        theRecipe.imageKey = req.body.imageKey
        // const image = await theRecipe.createImage({imageKey: req.body.imageKey})
        const image = await theRecipe.getZestImages()
        // const image = await theRecipe.createZestImage({imageKey: req.body.imageKey})
        image[0].imageKey = req.body.imageKey
        await image[0].save()
        // console.log("HAHAHAHAHAHHAHAHAHAH", image.ownerId === theRecipe.id)
        // console.log("HAHAHAHAHAHHAHAHAHAH", image)


        let oldHashtags = await theRecipe.getHashtags()
        let {newHashtags} = req.body

        oldHashtags.map(function (oldItem){
            if (!newHashtags.includes(oldItem)){
                theRecipe.removeHashtags(oldItem)
            }
        })
        newHashtags = newHashtags.split("#")
        newHashtags.map(function (newItem){
            if (newItem.length > 0){
                newItem = newItem.trim()
                newItem = "#" + newItem
                if (!oldHashtags.includes(newItem)){
                    Hashtag.findOne({where: {tag: newItem}})
                        .then((isThere) => {
                            if (isThere){
                                addRecipeToHashtag(theRecipe.dataValues.id, isThere.id)
                            }
                            else{
                                Hashtag.create({
                                    tag: newItem
                                })
                                    .then(hashtag => {
                                        addRecipeToHashtag(theRecipe.dataValues.id, hashtag.dataValues.id)
                                    })
                            }
                        })
                }
            }
        })
        await theRecipe.save()

        let msg = "recipe successfully updated"
        jwt.sign({msg: msg}, 'secretkey', (err, token) => {
            res.json({
                msg: msg
            })
        })
    }catch (err){
        console.log(err)
    }
}

async function rateRecipe(req, res){
    try{
        let {recipeId} = req.query
        let {userId} = req.query
        const recipe = await Recipe.findByPk(recipeId)
        const user = await User.findByPk(userId)
        const {point} = req.body
        const rates = await recipe.getRates()
        let msg = "recipe successfully rated."
        const isRated = rates.find((rate) => {
            return rate.dataValues.ratedBy === user.name
        })

        let averageRate
        let newRate = 0

        if (isRated === undefined){
            await Rate.create({
                point: point,
                ratedBy: user.name
            }).then(rate => {
                addRateToRecipe(recipeId, rate.dataValues.id)
                newRate = rate.dataValues.point
            })
                .catch((err) => console.log(err))
            averageRate = await getRatesOfRecipe(recipeId, newRate)

        }
        else{
            isRated.point = point
            await isRated.save()
            averageRate = await getRatesOfRecipe(recipeId, newRate)
        }
        recipe.averageRate = averageRate

        await recipe.save({fields: ['averageRate']})
        jwt.sign({msg: msg}, 'secretkey', (err, token) => {
            res.json({
                msg: msg
            })
        })

    }catch (err){
        console.log(err)
    }
}

async function addRateToRecipe(recipeId, rateId){
    return Recipe.findByPk(recipeId)
        .then((recipe) => {
            if (!recipe){
                console.log("recipe not found!")
                return null
            }
            return Rate.findByPk(rateId).then((rate) => {
                if (!rate){
                    console.log("recipe not found!")
                    return null
                }
                recipe.addRates(rate)
                return rate.point
            })

        })
}

async function getRatesOfRecipe(recipeId, newRate){
    try{

        const recipe = await Recipe.findByPk(recipeId)
        const rates = await recipe.getRates()

        if (rates.length !== 0){

            let sum = 0;
            let numberOfRates = 0;
            rates.map(function (item){
                sum += item.point
                numberOfRates += 1
            })
            if (newRate !== 0){
                sum += newRate
                numberOfRates += 1
            }
            const rate = sum / numberOfRates
            return rate
        }
        else{
            return newRate
        }

    }catch (err){
        console.log(err)
    }
}

async function postImage(req, res){
    try{

        const fs = require('fs')
        const util = require('util')
        const unlinkFile = util.promisify(fs.unlink)

        //there is a better way multer s3 but in this way I have sometime to filter
        // or change the size of the image sooo in your other projects
        //think about it

        console.log("HAHHAHAHAHAHSDAHSDHASDAKDJADAS", req.file)
        console.log("HAHHAHAHAHAHSDAHSDHASDAKDJADAS", req.description)
        const result = await uploadFile(req.file)
        await unlinkFile(req.file.path)

        console.log(result, "HAHSFKLJASDGHFIASDUGFLASDF")

        return res.send(result.Key)
    }catch (err){
        console.log(err)
    }
}

async function getImage(req, res){
    try{
        let id = req.params.id
        const recipe = await Recipe.findByPk(id)
        const image = await recipe.getZestImages()
        console.log("HAAHASKDFJHASKLFDJHDSAFASFASDAF IMAGE",image)
        console.log("HAAHASKDFJHASKLFDJHDSAFASFASDAF IMAGE KEY",image[0].imageKey)

        if (image === null){
            return res.send('sorry')
        }
        else{
            const readStream = await getFileStream(image[0].imageKey)
            console.log("GETGETGETGETGETGETGET", readStream)
            readStream.pipe(res)
        }


    }catch (err){
        console.log(err)
    }
}

async function getUserImage(req, res){
    try{
        let id = req.params.id
        const user = await User.findByPk(id)
        const image = await user.getZestImages()
        console.log("HAAHASKDFJHASKLFDJHDSAFASFASDAF IMAGE",image)
        console.log("HAAHASKDFJHASKLFDJHDSAFASFASDAF IMAGE KEY",image[0].imageKey)

        if (image === null){
            return res.send('sorry')
        }
        else{
            const readStream = await getFileStream(image[0].imageKey)
            console.log("GETGETGETGETGETGETGET", readStream)
            readStream.pipe(res)
        }


    }catch (err){
        console.log(err)
    }
}

const methods = {
    createRecipe,
    getAllRecipes,
    getRecipe,
    getRecipesForUser,
    deleteRecipeForEveryone,
    deleteRecipeForMe,
    updateRecipe,
    rateRecipe,
    getRatesOfRecipe,
    getHashtagsOfRecipe,
    getRecipesWithTag,
    postImage,
    getImage,
    getUserImage
}
module.exports = methods