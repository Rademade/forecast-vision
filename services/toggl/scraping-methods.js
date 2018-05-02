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

    getReport(startDate, endDate, projectId, callback) {

        // Pass empty report for feature dates. Don't spend request for load empty data
        if (startDate > moment()) {
            callback(new TogglReport(new TogglReportUserList()));
            return ;
        }

        this.toggl.summaryReport({
            workspace_id: WORKSPACE_ID,
            since: startDate.format('YYYY-MM-DD'),
            until: endDate.format('YYYY-MM-DD'),
            grouping: 'users',
            subgrouping: 'projects',
            billable: 'yes',
            project_ids: projectId,
        }, (err, data) => {
            let usersList = new TogglReportUserList( data.data.map((togglUserData) => {
                return new TogglReportUser(togglUserData);
            }) );
            callback( new TogglReport( usersList ) );
        });
    }

    getProjects(callback) {
        this.toggl.getWorkspaceProjects(WORKSPACE_ID, {}, (err, data) => {
            callback( data );
        });
    }

}

exports.TogglScrapingMethods = TogglScrapingMethods;