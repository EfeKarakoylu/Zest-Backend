const express = require('express')
const path = require('path')
const cors = require('cors')
const route = require('./routes/routes')


const app = express()
app.use(express.urlencoded({ extended: false }));
app.use(cors())
app.use(express.json());

route(app)

const PORT = process.env.PORT || 5000;


app.listen(PORT, () => console.log(`Server started on port ${PORT}`))