const { ReportLoaderFactory } = require('../services/report-loader-factory');
const { AnalyzerMap } = require('../services/analyzer-map');

class projectAnalyticsController {
  static async index(req, res) {
    let outputData = {};

    try {
      const intervalReport = await ReportLoaderFactory.getReportByPrevMonthCount(12);

      let chartData = new AnalyzerMap(intervalReport);

      chartData.createChartInterval();
      chartData.mapProjectInfo();
      outputData = chartData.createOutputData();

      res.render('project-analytics/index', {chartData: outputData});
    } catch (e) {
      console.log(e)
    }
  }
}

module.exports = projectAnalyticsController;
