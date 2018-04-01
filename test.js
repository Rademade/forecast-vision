const moment = require('moment')
const { Report } = require('./services/report');
const { DataScraping } = require('./services/data-scraping');

// (new DataScraping).ready((scrapingMethods) => {
//     scrapingMethods.getUtilization(moment(), moment().add(7, 'd')).then((weekData) => {
//         console.log(weekData);
//     })
// });

// (new Report(1, 0)).load((weeksData) => {
//     console.log(weeksData[0].getDepartmentsList()['Developer'].getLoadHours())
// });

(new Report(3, 2)).load((weeksData) => {
    console.log(weeksData[0].billedHours());
});