const { Duration } = require('../duration');

class TogglReportProject {

    static initNull() {
        return new TogglReportProject('');
    }

    constructor(name) {
        this.name = name;
        this.items = [];
    }

    getName() {
        return this.name;
    }

    /**
     * @param {TogglReportUserItem} item
     */
    addItem(item) {
        // TODO item unique validation
        this.items.push(item);
    }

    getItems() {
        return this.items;
    }

    getBillableDuration() {
        if (!this.billableDuration) {
            this.billableDuration = this.getItems().reduce((a, item) => {
                return a.addMinutes( item.getTrackingMinutes() );
            }, new Duration());
        }
        return this.billableDuration;
    }

    /**
     * @param {TogglReportProject} togglReport
     */
    groupWith(togglReport) {
        // Valid type check
        if (!(togglReport instanceof TogglReportProject)) return;

        this.name = this.getName() || togglReport.getName();
        this.billableDuration = null;
        togglReport.getItems().forEach((item) => {
            this.addItem( item );
        });
    }

}

exports.TogglReportProject = TogglReportProject;