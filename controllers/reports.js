const moment = require('moment');

const { ForecastGrabberScrapingAuth } = require('./../services/forecast-grabber/scraping-auth');
const { ReportLoaderFactory } = require('../services/report-loader-factory');

const Project = require('../models/project');


class ReportsController {

    static weekReport(req, res) {
        ReportLoaderFactory.getWeeksRhythmReport().load((weeksData) => {
            res.render('reports/index', {weeksData: weeksData});
        });
    }

    static factReport(req, res) {
        ReportLoaderFactory.getWeeksFactReport().load((weeksData) => {
            res.render('reports/plan-fact', {weeksData: weeksData});
        });
    }

    static monthReport(req, res) {
        ReportLoaderFactory.getMonthsReport().load((monthsReport) => {
            res.render('reports/month-report', {monthsReport: monthsReport});
        });
    }

    static customReport(req, res) {
        Project.findReportsReady().then((projects) => {

            return new Promise(async (resolve) => {

                // TODO validation && extract service
                if (!(req.query.dateFrom && req.query.dateTo)) {
                    resolve({projects: projects});
                    return;
                }

                let dateFrom = moment(req.query.dateFrom);
                let dateTo = moment(req.query.dateTo);
                let project = await Project.findById(req.query.projectId);

                ReportLoaderFactory.getCustomFactReport(dateFrom, dateTo, project).load((factReports) => {
                    resolve({
                        projects: projects,
                        factReports: factReports
                    });
                });

            });

        }).then((result) => {
            res.render('reports/custom-report-form', Object.assign({
                dateFrom: req.query.dateFrom,
                dateTo: req.query.dateTo,
                projectId: req.query.projectId
            }, result));
        });
    }

}

module.exports = ReportsController;