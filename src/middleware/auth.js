const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req,res,next) => {

    try {
        const token = req.header('Authorization').replace('Bearer ','')
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        const user = await User.findOne({'_id':decoded._id,'tokens.token':token})
        if(!user){
            throw new Error()
        }
        req.token = token // store token to use in router handler
        req.user = user // saving time and performance , i dont want to fetch same user data again
        next()
    } catch (e) {
        res.status(401).send({
            error:'Please Authenticate!!'
        })
    }

}

module.exports =  auth
