const { TogglReportUser } = require('./report-user');
const { Duration } = require('../duration');

class TogglReportUserEmpty extends TogglReportUser {

    getUserName() {
        return 'Empty user';
    }

    getBillableDuration() {
        return new Duration(0);
    }

}

exports.TogglReportUserEmpty = TogglReportUserEmpty;