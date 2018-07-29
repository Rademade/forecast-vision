const express = require('express');
const basicAuth = require('express-basic-auth')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');


// Database connection. // TODO Add config
mongoose.connect('mongodb://localhost:27017/forecast');

// Load controllers
const MemberController = require('./controllers/members');
const ProjectController = require('./controllers/projects');
const ReportsController = require('./controllers/reports');

const app = express();

// Settings
app.set('view engine', 'pug');
app.set('views', './views');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));

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


// Reports routes
app.get('/', ReportsController.weekReport);
app.get('/plan-fact', ReportsController.factReport);
app.get('/month-report', ReportsController.monthReport);
app.get('/custom-report', ReportsController.customReport);

app.listen(process.env.PORT || 3000, () =>
    console.log('App listening on port ' + (process.env.PORT || 3000))
);