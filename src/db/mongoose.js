const mongoose = require('mongoose')
// connect to database
try {
    mongoose.connect(process.env.DB_CONNECTION_SRTRING)
    //mongoose.connect(dbPath)
    console.log('Connected to mongoDB databases via mongoose')
} catch (error) {
   return console.log('Error!',error)
}




