const moment = require('moment');
const { DataScraping } = require('./data-scraping');
const { WeekReportData } = require('./week-report-data');

const DAYS_IN_WEEK = 7;
const DISPLAY_WEEKS = 7;
const START_WEEKS_AGO = 2;

class Report {

    constructor() {
        this.scraper = new DataScraping();
    }

    /**
     * @param {DataScrapingMethods} scrapingMethods
     * @param {Array} resultData
     * @param {moment} loadDate
     * @param {moment} lastDate
     * @param {Function} loadWeekCallback
     */
    loadWeeksData(scrapingMethods, resultData, loadDate, lastDate, loadWeekCallback) {
        console.log('Called loadWeeksData ' + loadDate.format("dddd, MMMM Do YYYY"));

        let startDate  = loadDate.clone();
        let endDate = loadDate.clone().add(DAYS_IN_WEEK, 'd');

        scrapingMethods.getUtilization(startDate, endDate).then((weekData) => {
            resultData.push(new WeekReportData(startDate, endDate, weekData));

            if (loadDate < lastDate) {
                this.loadWeeksData(scrapingMethods, resultData, loadDate.add(DAYS_IN_WEEK, 'd'), lastDate, loadWeekCallback);
            } else {
                loadWeekCallback();
            }
        });
    }

    load(loadReadyCallback) {
        this.scraper.ready((scrapingMethods) => {
            let startDate = moment().startOf('week').subtract(DAYS_IN_WEEK * (START_WEEKS_AGO), 'days');
            let weeksListData = [];

            this.loadWeeksData(
                scrapingMethods,
                weeksListData,
                startDate,
                startDate.clone().add(DAYS_IN_WEEK * (DISPLAY_WEEKS - 1), 'd'),
                (() => {
                    console.log('All data loaded. Weeks count ' + weeksListData.length);
                    loadReadyCallback(weeksListData)
                })
            );

        });
    }

}

exports.Report = Report;