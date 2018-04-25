const TogglClient = require('toggl-api');
const moment = require('moment');

const { TogglReport } = require('./report');
const { TogglReportUser } = require('./report-user');

const TOGGL_API_KEY = process.env.TOGGL_API_KEY || '';

class TogglScrapingMethods {

    constructor() {
        // TODO env variable
        this.toggl = new TogglClient({apiToken: TOGGL_API_KEY});
    }

    getReport(startDate, endDate, callback) {

        // Pass empty report for feature dates. Don't spend request for load empty data
        if (endDate > moment()) {
            callback(new TogglReport([]));
            return ;
        }

        this.toggl.summaryReport({
            workspace_id: 197313,
            since: startDate.format('YYYY-MM-DD'),
            until: endDate.format('YYYY-MM-DD'),
            grouping: 'users',
            subgrouping: 'projects',
            billable: 'yes'
        }, (err, data) => {
            callback( new TogglReport(data.data.map((togglUserData) => {
                return new TogglReportUser(togglUserData);
            })) );
        });
    }

}

exports.TogglScrapingMethods = TogglScrapingMethods;