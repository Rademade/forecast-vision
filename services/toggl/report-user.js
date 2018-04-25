const { Duration } = require('../duration');

class TogglReportUser {

    constructor(data) {
        this.data = data;
    }

    getUserName() {
        if (!this.userName) {
            this.userName = this.data.title.user.trim();
        }
        return this.userName;
    }

    getBillableDuration() {
        if (!this.billableDuration) {
            this.billableDuration = this.data.items.reduce((a, b) => {
                return a.addMinutes( b.time / 1000 / 60 );
            }, new Duration());
        }
        return this.billableDuration;
    }

}

exports.TogglReportUser = TogglReportUser;