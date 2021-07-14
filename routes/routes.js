const Ucontroller = require('../controllers/Ucontroller')
const Rcontroller = require('../controllers/Rcontroller')
const Ccontroller = require('../controllers/Ccontroller')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const upload = multer({dest: 'uploads/'})

const routes = (router) => {
    router.post('/register', Ucontroller.Register)
    router.post('/login', Ucontroller.getUserLogin)
    router.get('/user', verifyToken, Ucontroller.getUserWithId)
    router.post('/updateUser', verifyToken, Ucontroller.updateUser)
    router.post('/addRecipe', verifyToken, Rcontroller.createRecipe)
    router.get('/getRecipes', verifyToken, Rcontroller.getAllRecipes)
    router.get('/getRecipe', verifyToken, Rcontroller.getRecipe)
    router.get('/getUserRecipes', verifyToken, Rcontroller.getRecipesForUser)
    router.get('/addToMyRecipes', verifyToken, Ucontroller.addToMyRecipes)
    router.get('/deleteRecipeForUser', verifyToken, Rcontroller.deleteRecipeForMe)
    router.get('/deleteRecipeForAll', verifyToken, Rcontroller.deleteRecipeForEveryone)
    router.post('/updateRecipe', verifyToken, Rcontroller.updateRecipe)
    router.post('/getUserWithName', verifyToken, Ucontroller.getUserWithName)
    router.get('/followUser', verifyToken, Ucontroller.followUser)
    router.get('/getFollowers', verifyToken, Ucontroller.getAllFollowers)
    router.get('/getAllFollowings', verifyToken, Ucontroller.getAllFollowings)
    router.get('/unfollowUser', verifyToken, Ucontroller.unfollowUser)
    router.post('/rateRecipe', verifyToken, Rcontroller.rateRecipe)
    router.get('/getRatesOfTheRecipe', verifyToken, Rcontroller.getRatesOfRecipe)
    router.get('/getAllCategories', verifyToken, Ccontroller.getAllCategories)
    router.get('/getCategory', verifyToken, Ccontroller.getParticularCategory)
    router.get('/getHashtags', verifyToken, Rcontroller.getHashtagsOfRecipe)
    router.post('/getTagRecipes', verifyToken, Rcontroller.getRecipesWithTag)
    router.post('/postImage', verifyToken, upload.single('image'), Rcontroller.postImage)
    router.get('/recipeImages/:id', Rcontroller.getImage)
    router.get('/userImages/:id', Rcontroller.getUserImage)
}

function verifyToken(req,res,next){
    // Get auth header value
    const bearerHeader = req.headers['authorization']
    // check bearer is undefined
    if (typeof bearerHeader !== 'undefined'){

        // Split at the space
        const bearer = bearerHeader.split(' ')

        // get token from array
        const bearerToken = bearer[1]

        if (bearerToken === null) return res.sendStatus(401)
        jwt.verify(bearerToken, 'secretkey', (err, data) => {
            if (err){
                return res.sendStatus(403)
            }else{

                req.data = data;
                req.token = bearerToken;
                next();
            }
        })
    }else{
        res.sendStatus(403)
    }
}

module.exports = routes