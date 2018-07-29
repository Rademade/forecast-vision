const moment = require('moment');

const { ForecastGrabberScrapingAuth } = require('./forecast-grabber/scraping-auth');
const { TogglScrapingMethods } = require('./toggl/scraping-methods');
const { ForecastAllocationList } = require('./forecast-allocation/list');
const { ForecastToggl } = require('./forecast-toggl');
const { ReportDataBuilder } = require('./report-data-builder');

class ReportLoader {

    /**
     * @param dateStart
     * @param dateEnd
     * @param projectId
     * @param getIntervalEndDate
     */
    constructor(dateStart, dateEnd, projectId, getIntervalEndDate) {
        this.apiLoader = new ForecastGrabberScrapingAuth();
        this.togglLoader = new TogglScrapingMethods();
        this.dateStart = dateStart;
        this.dateEnd = dateEnd;
        this.projectId = !isNaN(projectId) ? parseInt(projectId, 10) : 0;
        this.getIntervalEndDate = getIntervalEndDate;
        this.reports = [];
        this.scrappingAPI = null;
    }

    /**
     * Utilization week loading. Recursion function
     *
     * @param {moment} loadDate
     * @param {Function} loadedWeeksCallback
     */
    loadIntervalData(loadDate, loadedWeeksCallback) {
        const startDate  = loadDate.clone();
        const endDate = this.getIntervalEndDate(startDate);

        // If last date load break out
        if (endDate > this.dateEnd) {
            loadedWeeksCallback();
            return ;
        }

        this.scrappingAPI.getUtilization(startDate, endDate).then((weekData) => {
            // TODO request for all toggl project. Launch matching proccess
            //  - by names and config file
            // console.log(this.projectId);
            let togglProjectId = ForecastToggl.getTogglProjectId(this.projectId);
            this.togglLoader.getReport(startDate, endDate, togglProjectId, (togglReport) => {

                (new ReportDataBuilder(startDate, endDate, weekData, this.allocationReport, togglReport))
                    .getReport()
                    .then((report) => {
                        this.reports.push(report);
                        this.loadIntervalData(endDate, loadedWeeksCallback);
                    });

            });
        });
    }

    /**
     * @param {Function} loadReadyCallback
     */
    startIntervalLoading(loadReadyCallback) {
        this.loadIntervalData(this.dateStart, () => {
            console.log('All intervals loaded. Count ' + this.reports.length);
            loadReadyCallback(this.reports);
        });
    }

    load(loadReadyCallback) {
        this.apiLoader.ready((api) => {

            // Init ForecastGrabberScrapingMethods API
            this.scrappingAPI = api;

            // Load Allocations
            api.getScheduleAllocations().then((allocationData) => {
                this.allocationReport = new ForecastAllocationList(allocationData, {
                    projectId: this.projectId
                });
                this.startIntervalLoading(loadReadyCallback);
            });

        });
    }

}

exports.ReportLoader = ReportLoader;