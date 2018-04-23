const moment = require('moment');

const { ForecastGrabberScrapingAuth } = require('./forecast-grabber/scraping-auth');
const { ForecastAllocationList } = require('./forecast-allocation/list');
const { ReportData } = require('./report-data');

const DAYS_IN_WEEK = 7;
const DEFAULT_DISPLAY_WEEKS = 7;
const DEFAULT_START_WEEKS_AGO = 2;

class Report {

    constructor(
        displayWeeks = DEFAULT_DISPLAY_WEEKS,
        preWeeks = DEFAULT_START_WEEKS_AGO
    ) {
        this.apiLoader = new ForecastGrabberScrapingAuth();
        this.displayWeeks = displayWeeks;
        this.preWeeks = preWeeks;
    }

    /**
     * Utilization week loading. Recursion function
     *
     * @param {ForecastGrabberScrapingMethods} api
     * @param {Array} resultData
     * @param {moment} loadDate
     * @param {moment} lastDate
     * @param {Function} loadedWeeksCallback
     */
    loadWeeksData(api, resultData, loadDate, lastDate, loadedWeeksCallback) {
        console.log('Called loadWeeksData(). Date: ' + loadDate.format("dddd, MMMM Do YYYY"));

        const startDate  = loadDate.clone();
        const endDate = loadDate.clone().add(DAYS_IN_WEEK, 'd');

        api.getUtilization(startDate, endDate).then((weekData) => {
            resultData.push(new ReportData(startDate, endDate, weekData, this.allocationReport));

            if (loadDate < lastDate) {
                this.loadWeeksData(api, resultData, loadDate.add(DAYS_IN_WEEK, 'd'), lastDate, loadedWeeksCallback);
            } else {
                loadedWeeksCallback();
            }
        });
    }

    /**
     * @param {ForecastGrabberScrapingMethods} api
     * @param {Function} loadReadyCallback
     */
    startWeeksLoading(api, loadReadyCallback) {
        let startDate = moment().startOf('week').subtract(DAYS_IN_WEEK * (this.preWeeks), 'days');
        let weeksListData = [];

        this.loadWeeksData(
            api,
            weeksListData,
            startDate,
            startDate.clone().add(DAYS_IN_WEEK * (this.displayWeeks - 1), 'd'),
            (() => {
                console.log('All data loaded. Weeks count ' + weeksListData.length);
                loadReadyCallback(weeksListData)
            })
        );
    }

    load(loadReadyCallback) {
        this.apiLoader.ready((api) => {
            api.getScheduleAllocations().then((allocationData) => {
                this.allocationReport = new ForecastAllocationList(allocationData);
                this.startWeeksLoading(api, loadReadyCallback);
            });
        });
    }

}

exports.Report = Report;