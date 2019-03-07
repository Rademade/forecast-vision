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
        return this.getTasksWithoutProject().length > 0
    }

    /**
     * @description Filter tasks without project
     */
    getTasksWithoutProject () {
        if (this.tasksWithoutProject) return this.tasksWithoutProject;

        this.tasksWithoutProject = [];

        this.getItems().forEach(item => {
            if (!item.data.title.project) {
                this.tasksWithoutProject.push(item.data)
            }
        });

        return this.tasksWithoutProject;
    }

    getBillableItems () {
        if (this.billableTasks) return this.billableTasks;

        return this.billableTasks = this.getItems().filter(item => {
            return item.data.sum > 0 && item.data.title.project
        });
    }

    /**
     * @return {TogglReportUserItem[]}
     */
    getItems() {
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
            this.billableDuration = this.getBillableItems().reduce((a, item) => {
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
        this.items = this.getBillableItems().concat( togglReport.getBillableItems() );
    }

}

exports.TogglReportUser = TogglReportUser;
