const _ = require('lodash');
const moment = require('moment');

class AnalyzerMap {
  constructor (intervalReport) {
    this.intervalReport = intervalReport;
    this.outputChartData = null;
    this.labels = null
  }

  mapProjectInfo () {
    let projects = {};

    this.intervalReport.forEach(interval => {
      Object.entries(interval.projectList.items).forEach(
      ([key, value]) => {
        if (!projects[key]) {
          projects[key] = {};
          projects[key].dates = [];
          projects[key].duration = []
        }

        // projects[key].dates.push(new Date(interval.startDate));
        projects[key].dates.push(new Date(interval.endDate));
        projects[key].label = value.name;
        projects[key].billable = value.billable;
        projects[key].borderColor = this.createProjectRandomColor();

        // if (value.name === 'OneReach') {
        //   console.log('interval start date', interval.startDate)
        //
        //   console.log(value.duration)
        //
        //   console.log('interval end date date', interval.endDate)
        // }

        if (value.duration) {
          projects[key].duration.push(value.duration.minutes)
        }
      }
      );
    });

    this.outputChartData = projects;

    return projects
  }

  createChartInterval () {
    let labels = [];

    this.intervalReport.forEach(interval => {
      let start = new Date(interval.startDate),
      end = new Date(interval.endDate);

      labels.push(start);
      labels.push(end);
    });

    this.labels = _.uniq(labels.map(item => item.toString()));
    this.labels = this.labels.map(label => new Date(label));

    return labels
  }

  createProjectRandomColor () {
    const LETTERS = '0123456789ABCDEF';
    let color = '#';

    for (let i = 0; i < 6; i++) {
      color += LETTERS[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  isBillable (project) {
    return project.billable
  }

  createOutputData () {
    let chartDatasets = [];
    let projects = this.outputChartData;
    let labels = this.labels.map((item, index) => {
      index = index + 1

      return '# ' + index
    });

    projects = _.filter(projects, this.isBillable);

    _.forEach(projects, (value, key) => {
      value.dates = _.uniq(value.dates.map(item => item.toString()));
      value.dates = value.dates.map(label => new Date(label));

      let sortedLabels = this.labels.sort(function (a, b) {
        return a - b
      });

      sortedLabels = sortedLabels.map(label => label.toString());

      let outputData = []
      let dates = value.dates.map(date => date.toString());
      let differences = _.difference(sortedLabels, dates);
      let emptyIndexes = []

      differences.forEach(dif => {
        emptyIndexes.push(sortedLabels.findIndex(label => label === dif))
      });

      emptyIndexes.forEach(date => {
        outputData.push({
          y: 0,
          x: new Date(date)
        })
      });

      dates.forEach((date, index) => {
        outputData.push({
          y: value.duration[index],
          x: new Date(date)
        })
      });

      outputData = _.sortBy(outputData, 'x');

      chartDatasets.push({
        label: value.label,
        borderColor: value.borderColor,
        data: outputData,
        fill: false
      })
    });

    this.outputChartData.chartDatasets = chartDatasets
    this.outputChartData.labels = labels

    return this.outputChartData;
  }
}

exports.AnalyzerMap = AnalyzerMap;
