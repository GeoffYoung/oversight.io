var routes = require("./app/routes");

var express = require('express');
var app = express();

// environment and port
var env = process.env.NODE_ENV || 'development';
var port = parseInt(process.argv[2], 10);
if (isNaN(port)) port = 3000;

// app middleware/settings
app.engine('.html', require('ejs').__express);
app.enable('trust proxy')
  .use(require('body-parser')())
  .use(require('method-override')())
  .use(express.static(__dirname + '/public'));

// development vs production
if (env == "development")
  app.use(require('errorhandler')({dumpExceptions: true, showStack: true}))
else
  app.use(require('errorhandler')())


// helpers and routes
app.locals.helpers = require("./app/helpers");
app.get('/', routes.index);
app.get('/results', routes.redirect);
app.get('/results/:query', routes.results);
app.get('/results/:query/rss', routes.queryFeed);
app.get('/agency/:agency', routes.agency);
app.get('/agency/:agency/rss', routes.agencyFeed);
app.get('/report/:inspector/:report_id', routes.report);


// boot it up!
app.listen(port, function() {
  console.log("Express server listening on port %s in %s mode", port, env);
});
