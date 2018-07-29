const { ForecastGrabberScrapingAuth } = require('./../services/forecast-grabber/scraping-auth');
const { ReportFactory } = require('./../services/report-factory');

class ReportsController {

    static weekReport(req, res) {
        ReportFactory.getWeeksRhythmReport().load((weeksData) => {
            res.render('reports/index', {weeksData: weeksData});
        });
    }

    static factReport(req, res) {
        ReportFactory.getWeeksFactReport().load((weeksData) => {
            res.render('reports/plan-fact', {weeksData: weeksData});
        });
    }

    static monthReport(req, res) {
        ReportFactory.getMonthsReport().load((monthsReport) => {
            res.render('reports/month-report', {monthsReport: monthsReport});
        });
    }

    static customReport(req, res) {
        // TODO build via co*
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
            res.render('reports/custom-report-form', Object.assign({
                dateFrom: req.query.dateFrom,
                dateTo: req.query.dateTo,
                projectId: req.query.projectId,
            }, result));
        });
    }

}

module.exports = ReportsController;