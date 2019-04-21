const moment = require('moment');

const { ForecastScrapingAuth } = require('./forecast/scraping-auth');
const { TogglScrapingMethods } = require('./toggl/scraping-methods');
const { ForecastAllocationList } = require('./forecast/allocation/list');
const { ReportDataBuilder } = require('./report-data-builder');

class ReportLoader {

    /**
     * @param dateStart
     * @param dateEnd
     * @param {Project} project
     * @param getIntervalEndDate
     */
    constructor(dateStart, dateEnd, project, getIntervalEndDate) {
        this.apiLoader = new ForecastScrapingAuth();
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
     async loadIntervalData(loadDate) {
      const startDate  = loadDate.clone();
      const endDate = this.getIntervalEndDate(startDate);

      // If last date load break out
      if (endDate > this.dateEnd) {
        return this.reports
      }

      let membersReport = await this.scrappingAPI.getMembers()
      let togglReport = await this.togglLoader.getReport(startDate, endDate, {
        projectId: this.getProjectTogglId()
      });

      let report = await new ReportDataBuilder(startDate, endDate, membersReport, this.allocationReport, togglReport).getReport()

      this.reports.push(report);

      return await this.loadIntervalData(endDate)
        // TODO. Store locally or cache. It's the same for all reports
    }


    async load() {
      return new Promise((resolve, reject) => {
        this.apiLoader.ready((api) => {
          // Init ForecastScrapingMethods API
          this.scrappingAPI = api;
          // TODO. Store locally or cache. It's the same for all reports
          // Load Allocations
          api.getScheduleAllocations().then(async (allocationData) => {
            this.allocationReport = new ForecastAllocationList(allocationData, {
              projectId: this.getProjectForecastId()
            });

            const reports = await this.loadIntervalData(this.dateStart);

            resolve(reports)
          });

        });
      })
    }

}

exports.ReportLoader = ReportLoader;
