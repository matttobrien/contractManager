const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const helmet = require('helmet')
// expose the header file name for the file management
const corsOptions = {
  exposedHeaders: 'File-Name',
}

const app = express()
app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors(corsOptions))
app.use(helmet())

require('./routes')(app) 
require('./controllers/emailController')

// the port that the backend will run on
app.listen(process.env.PORT || 8081)