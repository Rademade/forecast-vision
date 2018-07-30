const moment = require('moment');

const { ReportLoaderFactory } = require('../services/report-loader-factory');

const Project = require('../models/project');

const MOMENT_FORMAT = 'YYYY-MM-DD';

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

    static matrixReport(req, res) {
        let dateFrom = moment(req.query.dateFrom, MOMENT_FORMAT);
        let dateTo = moment(req.query.dateTo, MOMENT_FORMAT);

        if (dateTo.isValid() && dateTo.isValid()) {
            ReportLoaderFactory.getMonthReport(dateFrom, dateTo).load((monthReport) => {
                res.render('reports/matrix', {
                    report: monthReport[0],
                    dateFrom: req.query.dateFrom,
                    dateTo: req.query.dateTo
                });
            });
        } else {
            res.render('reports/matrix', {
                dateFrom: moment().subtract(14, 'days').format(MOMENT_FORMAT),
                dateTo: moment().format(MOMENT_FORMAT)
            });
        }
    }

    static customReport(req, res) {
        Project.findReportsReady().then((projects) => {

            return new Promise(async (resolve) => {

                let dateFrom = moment(req.query.dateFrom, MOMENT_FORMAT);
                let dateTo = moment(req.query.dateTo, MOMENT_FORMAT);

                if (!(dateFrom.isValid() && dateTo.isValid())) {
                    resolve({projects: projects});
                    return;
                }

                let project = await Project.findById(req.query.projectId);

                ReportLoaderFactory.getCustomFactReport(dateFrom, dateTo, project).load((factReports) => {
                    resolve({
                        project: project,
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