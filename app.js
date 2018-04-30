const express = require('express');
const basicAuth = require('express-basic-auth')

const { ReportFactory } = require('./services/report-factory');

const app = express();

app.use(express.static('public'));
app.use(basicAuth({
    users: { 'rademade':  process.env.AUTH_PASSWORD || '' },
    challenge: true
}));

app.set('view engine', 'pug');
app.set('views', './views');

app.get('/', (req, res) => {
    ReportFactory.getWeeksRhythmReport().load(function(weeksData){
        res.render('index', {
            weeksData: weeksData
        });
    });
});

app.get('/plan-fact', (req, res) => {
    ReportFactory.getWeeksFactReport().load(function(weeksData){
        res.render('plan-fact', {
            weeksData: weeksData
        });
    });
});

app.get('/month-report', (req, res) => {
    ReportFactory.getMonthsReport().load(function(monthsReport){
        res.render('month-report', {
            monthsReport: monthsReport
        });
    });
});

app.get('/custom-report', (req, res) => {
    res.render('custom-report-form', {});
});

app.listen(process.env.PORT || 3000, () =>
    console.log('App listening on port ' + (process.env.PORT || 3000))
);