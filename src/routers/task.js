const express = require('express')
const auth = require('../middleware/auth')
const router = new express.Router()
const Task = require('../models/task')

// create new task
router.post('/tasks',auth,async (req,res)=>{
    //const task = new Task(req.body)
     const task = new Task({
        ...req.body,
        owner:req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(500).send()
    }

})

// GET /tasks?complted=true
// GET /tasks?limit=1&skip=2
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks',auth,async (req,res)=>{
    match = {}
    sort = {}

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1 
    }

    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }
    try {
        await req.user.populate({
            path : 'tasks',
            match:match,
            options : {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort:sort
            },

        })    
        res.send(req.user.tasks)
    } catch (error) {
        res.status(500).send()
    }
})

// get a task 
router.get('/tasks/:id',auth,async (req,res)=>{
    const id = req.params.id
    try {
        const task = await Task.findOne({_id:id,owner:req.user._id})
        if(!task){
            res.status(404).send('Page Not Found!')
        }

        res.send(task)
    } catch (error) {
        res.status(500).send()
    }
})

// update task

router.patch('/tasks/:id',auth,async (req,res)=>{
    const allowedUpdates = ['description','completed']
    const updates = Object.keys(req.body)
    const isValidOperation = updates.every((update)=>{
        return allowedUpdates.includes(update)
    })
    if(!isValidOperation){
        return res.status(400).send({
            error:'Invalid Updates!'
        })
    }
    try {
        const task = await Task.findOne({_id:req.params.id,owner:req.user._id})

        if(!task){
            return res.status(404).send('Page Nor Found!')
        }

        updates.forEach((update)=>{
            task[update] = req.body[update]
        })
        await task.save()

        res.send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

// delete task
router.delete('/tasks/:id',auth,async (req,res)=>{
    try {
        //const task = await Task.findByIdAndDelete(req.params.id)
        const task = await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id})
        if(!task){
            return res.status(404).send('Page Not Found!')
        }
        res.send(task)
    } catch (error) {
        res.status(500).send()
    }
})

module.exports = router