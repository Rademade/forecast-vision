const TogglClient = require('toggl-api');
const moment = require('moment');

const { TogglReport } = require('./report');
const { TogglReportUser } = require('./report-user');
const { TogglReportUserList } = require('./report-user-list');

const TOGGL_API_KEY = process.env.TOGGL_API_KEY || '';
const WORKSPACE_ID = 197313;

class TogglScrapingMethods {

    constructor() {
        this.toggl = new TogglClient({apiToken: TOGGL_API_KEY});
    }

    getProjects(callback) {
        this.toggl.getWorkspaceProjects(WORKSPACE_ID, {}, (err, data) => {
            callback( data );
        });
    }

    /**
     * Data loaded from Toggl API
     *
     * @param {Object} startDate
     * @param {Object} endDate
     *
     * projectId – Toggl Project Id
     * @param {Object} opt
     */
    getReport(startDate, endDate, opt) {
        return new Promise((resolve, reject) => {
            // Pass empty report for feature dates. Don't spend request for load empty data
            if (startDate > moment()) {
                return resolve(new TogglReport(new TogglReportUserList()));
            }

            this.toggl.summaryReport({
                workspace_id: WORKSPACE_ID,
                since: startDate.format('YYYY-MM-DD'),
                until: endDate.format('YYYY-MM-DD'),
                grouping: 'users',
                subgrouping: 'projects',
                billable: 'yes',
                project_ids: opt.projectId ? opt.projectId : null,
            }, async (err, data) => {
                // TODO return report raw data
                let billableReports = data.data.map((togglUserData) => {
                    togglUserData.emptyProjects = [];

                    return togglUserData
                });

                let reportsWithoutProject = await this._getEmptyProjectsReport(startDate, endDate, opt);

                let mergedReports = this._mergeReports(billableReports, reportsWithoutProject);

                mergedReports = new TogglReportUserList( mergedReports.map((togglUserData) => {
                    return new TogglReportUser(togglUserData);
                }) );

                resolve( new TogglReport( mergedReports ) );
            });
        });
    }

    _getEmptyProjectsReport (startDate, endDate, opt) {
        return new Promise((resolve, reject) => {
            this.toggl.summaryReport({
                workspace_id: WORKSPACE_ID,
                since: startDate.format('YYYY-MM-DD'),
                until: endDate.format('YYYY-MM-DD'),
                grouping: 'users',
                subgrouping: 'projects',
                billable: 'both',
                project_ids: opt.projectId ? opt.projectId : null,
            }, (err, data) => {
                // TODO return raw data
                let outputResult = data.data.filter(userReport => {
                    return userReport.items.some(report => !report.title.project)
                }).map(userReport => {
                    userReport.emptyProjects = userReport.items.filter(report => !report.title.project);
                    userReport.items = [];

                    return userReport
                });

                resolve(outputResult)
            });
        })
    }

    // TODO extract method with data mapping and initialization TogglReportUserList

    _mergeReports (billableReports, emptyReports) {
        let mergedReports = billableReports;

        emptyReports.forEach(emptyReport => {
            let existingUser = billableReports.find(billableReport => billableReport.id === emptyReport.id);

            if (existingUser) {
                existingUser.emptyProjects = emptyReport.emptyProjects
            } else {
                mergedReports.push(emptyReport)
            }
        });

        return mergedReports
    }

}

exports.TogglScrapingMethods = TogglScrapingMethods;
