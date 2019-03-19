const { reportNotification } = require('./commands/commands');
const cron = require('node-cron');

const express = require('express');
const basicAuth = require('express-basic-auth')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config()

mongoose.connect([
    process.env.MONGODB_URI || 'mongodb://localhost:27017/forecast',
].join(''), { useNewUrlParser: true });

// Load controllers
const MemberController = require('./controllers/members');
const ProjectController = require('./controllers/projects');
const TeamsController = require('./controllers/teams');
const ReportsController = require('./controllers/reports');
const ProjectAnalyticsController = require('./controllers/project-analytics');

const app = express();
app.locals._ = require('lodash');

// Settings
app.set('view engine', 'pug');
app.set('views', './views');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(function(req, res, next){
  res.locals._ = require('lodash');
  next();
});

app.use(basicAuth({
    users: { 'rademade':  process.env.AUTH_PASSWORD || '' },
    challenge: true
}));


// Member CRUD
app.get('/members', MemberController.index);
app.get('/members/form', MemberController.form);
app.get('/members/:id', MemberController.show);
app.post('/members', MemberController.create);
app.post('/members/:id', MemberController.update);
app.delete('/members/:id', MemberController.delete);


// Project CRUD
app.get('/projects', ProjectController.index);
app.get('/projects/form', ProjectController.form);
app.get('/projects/toggl-reload', ProjectController.togglReload);
app.get('/projects/:id', ProjectController.show);
app.post('/projects', ProjectController.create);
app.post('/projects/:id', ProjectController.update);
app.delete('/projects/:id', ProjectController.delete);

// Teams CRUD
app.get('/teams', TeamsController.index);
app.get('/teams/form', TeamsController.form);
app.get('/teams/:id', TeamsController.show);
app.post('/teams', TeamsController.create);
app.post('/teams/:id', TeamsController.update);
app.delete('/teams/:id', TeamsController.delete);

// Reports routes
app.get('/', ReportsController.weekReport);
app.get('/plan-fact', ReportsController.factReport);
app.get('/month-report', ReportsController.monthReport);
app.get('/custom-report', ReportsController.customReport);
app.get('/matrix', ReportsController.matrixReport);

// Project Analytics routes
app.get('/project-analytics', ProjectAnalyticsController.index);

app.listen(process.env.PORT || 3000, () => {
  console.log('App listening on port ' + (process.env.PORT || 3000))
});


/**
 * Command for run report email notifications
 *
 */
// reportNotification()
