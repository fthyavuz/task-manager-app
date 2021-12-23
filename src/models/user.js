const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const Task = require('./task')
const jwt = require('jsonwebtoken')
// create user Schema
const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required:true,
        trim: true
    },
    email : {
        type :String,
        required: true,
        unique:true,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid!')
            }
        }
    },
    age:{
        type: Number,
        default:0,
        validate(value){
            if(value < 0) {
                    throw new Error('Age must be positive number')
            }
        }   
    },
    password: {
        type : String,
        required : true,
        trim: true,
        minlength:7,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Your password can not include password word')
            }
        }
    },

    tokens:[{
        token:{
            type: String,
            required: true
        }
    }],
    avatar:{
        type:Buffer
    }
},{
    timestamps:true
})

// to store virtual data
userSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})

// define generateAuthToken()(instance Method using methods) to while user login , server genarate a token
userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET)
    
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
    
}  
// Get User Public Profile
userSchema.methods.toJSON = function (){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}
// define findByCredential() (Model Method using statics) to user login and check user information

userSchema.statics.findByCredentials = async (email,password) => {
    const user = await User.findOne({email:email})
    if(!user){
        console.log('no user')
        throw new Error('Unable to login!')

    }

    const isMatch = await bcrypt.compare(password,user.password)
    if(!isMatch){
        console.log('wrong password')
        throw new Error('Unable to login!')
        
    }

    return user

}

// hash the plain text password before save
userSchema.pre('save',async function (next) {

    const user = this
    
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8)
    }

    next()
})

// delete all tasks belenging to the user before user delete their qwn account 
userSchema.pre('remove',async function(next){
    const user = this
    await Task.deleteMany({owner:user._id})
    next()
})

// create model
const User = mongoose.model('User',userSchema)

module.exports = User