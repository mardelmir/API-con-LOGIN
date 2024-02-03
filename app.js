const express = require('express')
const app = express()
const PORT = 3000

const bodyParser = require('body-parser')
const session = require('express-session')

const hashedSecret = require('./crypto/config')
const routes = require('./routes/routes')

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: hashedSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))

app.use('/', routes)

app.listen(PORT, () => { console.log(`Express está escuchando en el puerto http://localhost:${PORT}`) })