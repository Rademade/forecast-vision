const moment = require('moment');

const { ForecastGrabberScrapingAuth } = require('./forecast-grabber/scraping-auth');
const { TogglScrapingMethods } = require('./toggl/scraping-methods');
const { ForecastAllocationList } = require('./forecast-allocation/list');
const { ReportDataBuilder } = require('./report-data-builder');

class ReportLoader {

    /**
     * @param dateStart
     * @param dateEnd
     * @param {Project} project
     * @param getIntervalEndDate
     */
    constructor(dateStart, dateEnd, project, getIntervalEndDate) {
        this.apiLoader = new ForecastGrabberScrapingAuth();
        this.togglLoader = new TogglScrapingMethods();
        this.dateStart = dateStart;
        this.dateEnd = dateEnd;
        this.project = project;
        this.getIntervalEndDate = getIntervalEndDate;
        this.reports = [];
        this.scrappingAPI = null;
    }

    getProjectTogglId() {
        return this.project ? this.project.togglId : null;
    }

    getProjectForecastId() {
        return this.project ? this.project.forecastCompanyId : null;
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
            this.togglLoader.getReport(startDate, endDate, {
                projectId: this.getProjectTogglId()
            }, (togglReport) => {

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
                    projectId: this.getProjectForecastId()
                });
                this.startIntervalLoading(loadReadyCallback);
            });

        });
    }

}

exports.ReportLoader = ReportLoader;