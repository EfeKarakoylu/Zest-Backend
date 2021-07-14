const bcrypt = require('bcrypt')
const model = require('../models')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const jwt = require('jsonwebtoken')
const {User, Recipe} = model

async function Register(req, res){
    let { name, password, password2, email} = req.body;
    console.log(req.body)
    let msg = ''
    let userEmail = await User.findOne({ where: { email: email } });
    let userName = await User.findOne({where: {name: name}})
    if (userName) {
        msg = "User with that name already registered."
    }

    if (userEmail){
        msg = "user with that email already registered"
    }

    if (password !== password2){
        msg = 'Password should match'
    }

    if (password.length < 6){
        msg = 'Password should be longer than 5'
    }

    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);

    if (!userEmail && !userName){
        User.create({
            name: name,
            password: password,
            email: email
        })
            .then( user => {
                console.log('x')
            })
            .catch((err) => {
                console.log(err)
            })
        msg = "successfully registered you can go to login page now"
    }
    jwt.sign({msg: msg}, 'secretkey', (err, token) => {
        res.json({
            msg: msg
        })
    })
}

async function getUserWithName(req, res){
    try{
        let userToBeLinked = await User.findOne({where: {name: req.body.name}})

        if (userToBeLinked){
            jwt.sign({userToBeLinked: userToBeLinked}, 'secretkey', (err, token) => {
                res.json({
                    userToBeLinked: userToBeLinked
                })
            })
        }
    }catch (err){
        console.log(err)
    }
}

async function getUserLogin(req, res){
    let {email, password} = req.body
    let user = await User.findOne({ where: { email: email } });
    if (!user){
        console.log("!user")
        return res.status(404).send('err')
    }
    const verified = bcrypt.compareSync(password, user.password)

    if (user && verified){
        console.log("yes user", user)
        jwt.sign({user: user}, 'secretkey', (err, token) => {
            res.json({
                token: token,
                user: user
            })
        })
    }
    else{
        console.log("getUserLogin else")
        return res.status(404).send()
    }
}

async function getUserWithId(req, res){
    try{
        let id = req.data.user.id
        let user = await User.findByPk(id)

        jwt.sign({user: user}, 'secretkey', (err, token) => {
            res.json({
                token: token,
                user: user
            })
        })
    } catch (err){
        console.log(err)
    }
}

async function addToMyRecipes(req, res){
    try{
        let {id} = req.query.id
        console.log(req.query.id)
        addRecipeToUser(req.data.user.id, req.query.id)
        let msg = "recipe successfully added to your recipes"
        jwt.sign({msg: msg}, 'secretkey', (err, token) => {
            res.json({
                msg: msg
            })
        })

    }catch (err){
        console.log(err)
    }
}

async function addRecipeToUser(userId, recipeId){
    return Recipe.findByPk(recipeId)
        .then((recipe) => {
            if (!recipe){
                console.log("recipe not found!")
                return null
            }
            return User.findByPk(userId).then((user) => {
                if (!user){
                    console.log("user not found!")
                    return null
                }
                recipe.addUsers(user)
                return recipe
            })

        })
}

async function followUser(req, res){
    try{
        addUserToFollowers(req.query.id, req.data.user.id)
        let msg = "user successfully followed"
        jwt.sign({msg: msg}, 'secretkey', (err, token) => {
            res.json({
                msg: msg
            })
        })
    }catch (err){
        console.log(err)
    }
}

async function getAllFollowers(req, res){
    try{
        const user = await User.findByPk(req.query.id)
        const followers = await user.getFollowed()
        jwt.sign({followers: followers}, 'secretkey', (err, token) => {
            res.json({
                followers: followers
            })
        })
    }catch (err){
        console.log(err)
    }
}

async function getAllFollowings(req, res){
    try{
        let {id} = req.query
        const user = await User.findByPk(id)
        const followings = await user.getFollower()
        jwt.sign({followings: followings}, 'secretkey', (err, token) => {
            res.json({
                followings: followings
            })
        })
    }catch (err){
        console.log(err)
    }
}

async function unfollowUser(req, res){
    try{

        const following = await User.findByPk(req.data.user.id)
        const user = await User.findByPk(req.query.id)
        following.removeFollower(user)
        let msg = "user successfully unfollowed"
        jwt.sign({msg: msg}, 'secretkey', (err, token) => {
            res.json({
                msg: msg
            })
        })
    }catch (err){
        console.log(err)
    }
}



async function addUserToFollowers(followerUserId, beingFolloweduserId){
    try{
        const followerUser = await User.findByPk(followerUserId)
        const followedUser = await User.findByPk(beingFolloweduserId)
        followedUser.addFollower(followerUser)
    }catch (err){
        console.log(err)
    }
}

async function updateUser(req, res){
    try{
        let {description} = req.body
        const user = await User.findByPk(req.data.user.id)
        console.log("HEHEHEHEHHEHEHEHEHE", user)
        console.log("HEHEHEHEHHEHEHEHEHE", req.body.imageKey)
        console.log("HEHEHEHEHHEHEHEHEHE", req.body.description)
        user.description = description
        const image = await user.getZestImages()
        console.log("HEHEHEHEHHEHEHEHEHE", image)
        console.log("HEHEHEHEHHEHEHEHEHE", image[0].imageKey)
        if (image.length > 0){
            image[0].imageKey = req.body.imageKey
            await image[0].save()
        }
        else{
            const newImage = await user.createZestImage({imageKey: req.body.imageKey})
        }
        await user.save( {fields: ['description']})
        return res.send('user successfully updated')
    }catch (err){
        console.log(err)
    }
}

const methods = {
    Register,
    getUserLogin,
    getUserWithId,
    addToMyRecipes,
    getUserWithName,
    followUser,
    getAllFollowers,
    getAllFollowings,
    unfollowUser,
    updateUser
}

module.exports = methods
