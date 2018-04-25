const { Duration } = require('../duration');
const {TogglReportUserItem} = require('./report-user-item')

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

    /**
     * @return {TogglReportUserItem[]}
     */
    getItems() {
        if (this.items) {
            return this.items;
        }

        // Broken data params
        if (!(this.data && this.data.items)) {
            return this.items = [];
        }

        return this.items = this.data.items.map((projectItem) => {
            return new TogglReportUserItem(projectItem);
        });
    }

    getBillableDuration() {
        if (!this.billableDuration) {
            this.billableDuration = this.getItems().reduce((a, item) => {
                return a.addMinutes( item.getTrackingMinutes() );
            }, new Duration());
        }
        return this.billableDuration;
    }

}

exports.TogglReportUser = TogglReportUser;