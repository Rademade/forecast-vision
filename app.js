const express = require('express');
const moment = require('moment');
const basicAuth = require('express-basic-auth')

const { ForecastGrabberScrapingAuth } = require('./services/forecast-grabber/scraping-auth');
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
    ReportFactory.getWeeksRhythmReport().load((weeksData) => {
        res.render('index', {
            weeksData: weeksData
        });
    });
});

app.get('/plan-fact', (req, res) => {
    ReportFactory.getWeeksFactReport().load((weeksData) => {
        res.render('plan-fact', {
            weeksData: weeksData
        });
    });
});

app.get('/month-report', (req, res) => {
    ReportFactory.getMonthsReport().load((monthsReport) => {
        res.render('month-report', {
            monthsReport: monthsReport
        });
    });
});

app.get('/custom-report', (req, res) => {
    new Promise((resolve) => {
        // TODO extract service
        (new ForecastGrabberScrapingAuth()).ready((api) => {
            api.getProjects().then((projectData) => {
                resolve({projects: projectData.data.viewer.projects.edges});
            })
        });
    }).then((result) => {
        // TODO extract service

        return new Promise((resolve) => {
            // TODO validation
            if (!(req.query.dateFrom && req.query.dateTo)) {
                resolve(result);
                return ;
            }

            let dateFrom = moment(req.query.dateFrom);
            let dateTo = moment(req.query.dateTo);
            ReportFactory.getCustomFactReport(dateFrom, dateTo, req.query.projectId).load((factReports) => {
                result.factReports = factReports;
                resolve(result);
            });
        });

    }).then((result) => {
        res.render('custom-report-form', Object.assign({
            dateFrom: req.query.dateFrom,
            dateTo: req.query.dateTo,
            projectId: req.query.projectId,
        }, result));
    });
});

app.listen(process.env.PORT || 3000, () =>
    console.log('App listening on port ' + (process.env.PORT || 3000))
);