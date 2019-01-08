let initChart = function(chartData) {
  const MOMENT_FORMAT = 'YYYY-MM-DD';
  const MINUTES_IN_HOUR = 60;

  let labels = chartData.labels.filter(function (item, pos) {
    return chartData.labels.indexOf(item) === pos;
  });

  labels = labels.map(function (item, index) {
    return '# ' + index
  });

  function isBillable(project) {
    return project.billable
  }

  function mapProjects(projects) {
    let chartDatasets = [];

    projects = _.filter(chartData.projects, isBillable);

    _.forEach(projects, function (value, key) {
      value.dates = value.dates.filter(function (item, pos) {
        return value.dates.indexOf(item) === pos;
      });

      value.dates.map(function (item) {
        return moment(item).format(MOMENT_FORMAT)
      });

      let data = [];

      value.dates.forEach(function (date, index) {
        const sortedLabels = labels.sort(function (a, b) {
          return a - b
        })

        data.push({
          x: sortedLabels[0],
          y: value.duration[index] / MINUTES_IN_HOUR
        })
      });

      chartDatasets.push({
        label: value.label,
        borderColor: value.borderColor,
        data: data,
        fill: false
      })
    });

    return chartDatasets;
  }

  new Chart(document.getElementById("chart"), {
    type: 'line',
    data: {
      labels: labels,
      datasets: mapProjects(chartData.project)
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            callback: function (value, index, values) {
              return value + ' hours';
            }
          }
        }]
      },
      title: {
        display: true,
        text: 'Rademade project analytics'
      }
    }
  });
};
