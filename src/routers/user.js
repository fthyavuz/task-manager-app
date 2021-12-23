const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeEmail,sendGoodByeEmail} = require('../emails/account')
const router = new express.Router()
const auth = require('../middleware/auth')
const User = require('../models/user')

// create new user
router.post('/users',async (req,res)=>{

    const user = new User(req.body)
    try {
        await user.save()
        sendWelcomeEmail(user.email,user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user:user,token:token})
    } catch (error) {
        res.status(500).send(error)
    }
})

// login user
router.post('/users/login',async (req,res)=>{
    try {
        const user = await User.findByCredentials(req.body.email,req.body.password)
        //console.log(user)
        const token = await user.generateAuthToken()
        res.send({user:user,token:token})    
    } catch (e) {
        res.status(400).send()
    }
    
})

// logout user
router.post('/users/logout',auth,async (req,res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})
// logoutAll
router.post('/users/logoutall',auth,async (req,res)=>{
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }

})
// get individual user
router.get('/users/me',auth,async (req,res)=>{
    res.send(req.user)
})

// update user
router.patch('/users/me',auth,async (req,res)=>{

    const allowedUpdates = ['name','email','password','age']
    const updates = Object.keys(req.body)
    const isValidOperation = updates.every((update)=>{
        return allowedUpdates.includes(update)
    }) 

    if(!isValidOperation){
        res.status(400).send({'error': 'invalid Updates!'})
    }

    try {
        updates.forEach((update)=>{
            req.user[update] = req.body[update]
        })
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

// delete user
router.delete('/users/me', auth ,async (req,res)=>{
    try {
        await req.user.remove()
        sendGoodByeEmail(req.user.email,req.user.name)
        res.send(req.user)
    } catch (error) {
        res.status(500).send()
    }
})
// upload user avatar
const upload = multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpeg|jpg|png)$/)){
            return cb(new Error('Uploaded file must be jpg,jpeg or png'))
        }
        cb(undefined,true)
    }
    
})
router.post('/users/me/avatar',auth,upload.single('avatar'),async (req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
    req.user.avatar = buffer
    req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({
        error:error.message
    })
})

// delete avatar image
router.delete('/users/me/avatar',auth,async (req,res)=>{
    try {
        req.user.avatar = undefined
        req.user.save()
        res.send()    
    } catch (e) {
        res.status(500).send()
    }
    
})

// serve avatar
router.get('/users/:id/avatar',async (req,res)=>{
    try {
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error()
        }
        res.set('Content-Type','image/png')
        res.send(user.avatar)    
    } catch (e) {
        res.status(404).send()
    }
    
    
})

module.exports = router