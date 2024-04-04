var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')

var appRouter = require('./routes/lbse')

var app = express()

const swaggerJsdoc = require('swagger-jsdoc')
var swaggerParser = require('swagger-parser')
const swaggerUi = require('swagger-ui-express')
// const swaggerFile = require('./swagger_output.json')

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'LBSE API',
      version: '1.0.0',
      description: 'Generate LBSE API document with swagger.',
    },
    servers: [
      {
        url: 'http://localhost:8888',
        description: 'LBSE',
      },
    ],
  },
  apis: ['./routes/*.js']
}

const specs = swaggerJsdoc(options)
app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(specs))

var fs = require('fs')
var parser = new swaggerParser()

parser.validate(specs, function (err, api) {
    if (!err) {
        let data = JSON.stringify(api, null, 2);

        fs.writeFile('spec.json', data, (err) => {
          if (err) throw err;
        });
    }
    else {
    }
})

let cors = require('cors')
var whitelist = [
  `http://localhost:3030`
];
var corsOptions = {
  origin: function (origin, callback) {
      var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
      callback(null, originIsWhitelisted);
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true
};

app.use(cors(corsOptions))

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', appRouter)

app.use(function(req, res, next) {
  next(createError(404))
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  res.status(err.status || 500)
  res.render('error')
})

// module.exports = app
app.listen(8888)