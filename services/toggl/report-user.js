const { Duration } = require('../duration');
const {TogglReportUserItem} = require('./report-user-item');

class TogglReportUser {

    static null() {
        return new TogglReportUser({
            items: [],
            title: {
                user: ''
            }
        });
    }

    constructor(data) {
        this.data = data;
    }

    getUserName() {
        if (!this.userName) {
            this.userName = this.data.title.user.trim();
        }
        return this.userName;
    }

    getTogglId() {
        return this.data.id;
    }

    isTasksWithoutProjects () {
        return this.data.withoutProject.length > 0
    }

    /**
     * @description Filter tasks without project
     */
    setTasksWithoutProject () {
        let withoutProject = [];

        this.getItems().forEach(item => {
            if (!item.data.title.project) {
                withoutProject.push(item.data)
            }
        });

        this.data.withoutProject = withoutProject;
    }

    /**
     * @return {TogglReportUser}
     * @description filtered toogleUserReport by billable projects
     */
    getUserBillableReport () {
        this.setTasksWithoutProject();

        let userReport = {...this};

        userReport.data.items = userReport.data.items.filter(item => {
            return item.sum > 0 && item.title.project
        });

        return new TogglReportUser(userReport.data)
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

    /**
     * @param {TogglReportUser} togglReport
     */
    groupWith(togglReport) {
        // Valid type check
        if (!(togglReport instanceof TogglReportUser)) return;

        this.billableDuration = null;
        this.userName = this.getUserName() || togglReport.getUserName();

        // TODO add unique item validation
        this.items = this.getItems().concat( togglReport.getItems() );
    }

}

exports.TogglReportUser = TogglReportUser;
