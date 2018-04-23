const moment = require('moment')
const { Report } = require('./services/report');
const { DataScraping } = require('./services/forecast-grabber/scraping-auth');

// (new DataScraping).ready((scrapingMethods) => {
//     scrapingMethods.getUtilization(moment(), moment().add(7, 'd')).then((weekData) => {
//         console.log(weekData);
//     })
// });

// Check departments load hours
// (new Report(1, 0)).load((weeksData) => {
//     console.log(weeksData[0].getDepartmentsList()['Developer'].getLoadHours())
// });

// Check total billable hours
// (new Report(3, 2)).load((weeksData) => {
//     console.log(weeksData[0].billedHours());
// });


// Load project list
// (new Report(1, 0)).load((weeksData) => {
//     console.log(weeksData[0].getProjectList());
// });

// Check member list loader
(new Report(1, 0)).load((weeksData) => {
    console.log(weeksData[0].getMembersList().getBenchMembers());
});