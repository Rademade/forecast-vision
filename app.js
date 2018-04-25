const express = require('express');
const basicAuth = require('express-basic-auth')

const { Report } = require('./services/report');

const app = express();

app.use(express.static('public'));
app.use(basicAuth({
    users: { 'rademade':  process.env.AUTH_PASSWORD || '' },
    challenge: true
}));

app.set('view engine', 'pug');
app.set('views', './views');

app.get('/', (req, res) => {
    (new Report(6, 1)).load(function(weeksData){
        res.render('index', {
            weeksData: weeksData
        });
    });
});

app.get('/plan-fact', (req, res) => {
    (new Report(3, 3)).load(function(weeksData){
        res.render('plan-fact', {
            weeksData: weeksData
        });
    });
});

app.get('/custom-report', (req, res) => {
    res.render('custom-report-form', {});
});

app.listen(process.env.PORT || 3000, () =>
    console.log('App listening on port ' + (process.env.PORT || 3000))
);