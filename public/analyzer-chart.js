let initChart = function(chartData) {
  new Chart(document.getElementById("chart"), {
    type: 'line',
    data: {
      labels: chartData.labels,
      datasets: chartData.chartDatasets
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
