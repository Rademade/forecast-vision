const { ReportLoaderFactory } = require('../services/report-loader-factory');
const { AnalyzerMap } = require('../services/analyzer-map');

class projectAnalyticsController {
  static async index(req, res) {
    let outputData = {}

    try {
      ReportLoaderFactory.getReportByPrevMonthCount(12).load((intervalReport) => {
        let chartData = new AnalyzerMap(intervalReport);

        chartData.createChartInterval();
        chartData.mapProjectInfo();
        outputData = chartData.createOutputData();

        res.render('project-analytics/index', {chartData: outputData});
      });
    } catch (e) {
      console.log(e)
    }
  }
}

module.exports = projectAnalyticsController;
