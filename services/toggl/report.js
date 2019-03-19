const { TogglReportUserList } = require('./report-user-list');
const { TogglReportProjectList } = require('./report-project-list');

/**
 * Toggl report init from TogglReportUser array
 * After transforming this data created TogglReportProjectList
 */
class TogglReport {

    /**
     * @param {TogglReportUserList} usersList
     */
    constructor(usersList) {
        this.usersList = usersList;
    }

    getUsersList() {
        return this.usersList;
    }

    /**
     * @return {TogglReportProjectList}
     */
    getProjectsList() {
        if (this.projectsList) {
            return this.projectsList;
        }
        this.projectsList = this._createProjectsList();
        return this.projectsList;
    }

    /**
     * @return {TogglReportProjectList}
     * @private
     */
    _createProjectsList() {
        let projectsList = new TogglReportProjectList();
        this.usersList.getUsers().forEach((userReport) => {
            userReport.getBillableItems().forEach((projectItem) => {
                let projectReport = projectsList.findOrCreate(projectItem.getProjectName());
                projectReport.addItem(projectItem);
            });
        });
        return projectsList;
    }


}

exports.TogglReport = TogglReport;
