const moment = require('moment');

const { ReportLoaderFactory } = require('../services/report-loader-factory');

const Project = require('../models/project');

const MOMENT_FORMAT = 'YYYY-MM-DD';

class ReportsController {

    static async weekReport(req, res) {
        const weeksData = await ReportLoaderFactory.getWeeksRhythmReport();

        res.render('reports/index', {weeksData: weeksData});
    }

    static async factReport(req, res) {
        const weeksData = await ReportLoaderFactory.getWeeksFactReport();

        res.render('reports/plan-fact', {weeksData: weeksData});
    }

    static async monthReport(req, res) {
        const monthsReport = await ReportLoaderFactory.getMonthsReport();

        res.render('reports/month-report', {monthsReport: monthsReport});
    }

    static async matrixReport(req, res) {
        let dateFrom = moment(req.query.dateFrom, MOMENT_FORMAT);
        let dateTo = moment(req.query.dateTo, MOMENT_FORMAT);

        if (dateTo.isValid() && dateTo.isValid()) {
            let monthReport = await ReportLoaderFactory.getMonthReport(dateFrom, dateTo);

            res.render('reports/matrix', {
                report: monthReport[0],
                dateFrom: req.query.dateFrom,
                dateTo: req.query.dateTo
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
                let factReports = await ReportLoaderFactory.getCustomFactReport(dateFrom, dateTo, project);

                resolve({
                    project: project,
                    projects: projects,
                    factReports: factReports
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
