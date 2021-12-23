const express = require('express')

require('./db/mongoose')

const routerUser = require('./routers/user')
const routerTask = require('./routers/task')

const app = express()

app.use(express.json())
app.use(routerUser)
app.use(routerTask)

// run server and Listen individual ports 
app.listen(process.env.PORT,()=>{
    console.log('Server Up On',process.env.PORT)
})


