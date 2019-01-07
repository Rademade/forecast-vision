const { ReportLoaderFactory } = require('../services/report-loader-factory');

class projectAnalyticsController {
  static async index(req, res) {
    let chartData = {};

    try {
      ReportLoaderFactory.getReportByPrevMonthCount(12).load((intervalReport) => {
        chartData.labels = projectAnalyticsController.createChartInterval(intervalReport);
        chartData.projects = projectAnalyticsController.mapProjectInfo(intervalReport);

        console.log('PROJECTS!!!')
        console.log(chartData.projects);

        res.render('project-analytics/index', {chartData: chartData});
      });
    } catch (e) {
      console.log(e)
    }
  }

  static mapProjectInfo (intervalReport) {
    let projects = {};

    intervalReport.forEach(interval => {
      Object.entries(interval.projectList.items).forEach(
        ([key, value]) => {
          if (!projects[key]) {
            projects[key] = {};
            projects[key].dates = [];
            projects[key].duration = []
          }

          projects[key].dates.push(new Date(interval.startDate));
          projects[key].dates.push(new Date(interval.endDate));
          projects[key].label = value.name;
          projects[key].billable = value.billable;
          projects[key].borderColor = projectAnalyticsController.createProjectRandomColor();

          if (value.duration) {
            projects[key].duration.push(value.duration.minutes)
          }
        }
      );
    });

    return projects
  }

  static createChartInterval (intervalReport) {
    let labels = []

    intervalReport.forEach(interval => {
      let start = new Date(interval.startDate),
          end = new Date(interval.endDate);

      labels.push(start);
      labels.push(end);
    });

    return labels
  }

  static createProjectRandomColor () {
    const LETTERS = '0123456789ABCDEF';
    let   color = '#';

    for (let i = 0; i < 6; i++) {
      color += LETTERS[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}

module.exports = projectAnalyticsController;