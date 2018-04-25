const { TogglReportUserEmpty } = require('./report-user-empty');
const { TogglReportUserList } = require('./report-user-list');
const { TogglReportProjectList } = require('./report-project-list');

// TODO move to conf file or database
const forecastToTogglMembers = {
    'Alexander Buzan': 'Alexandr Buzan',
    'Denis Dvoryashin': 'Denys Dvoriashyn',
    'Maksym Shutiak': 'Maxym Shutyak',
    'Mikhail Gubenko': 'Mihail Gubenko',
    'Denis Dymko': 'Denis'
};

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

    /**
     * @todo remove matching
     *
     * @param userName
     * @return {TogglReportUser|TogglReportUserEmpty}
     */
    findUserReportByName(userName) {
        if (this.usersList.isEmpty()) {
            return new TogglReportUserEmpty({})
        }

        let matchedUser;
        let searchOptions = [userName, forecastToTogglMembers[userName]];

        this.usersList.getUsers().forEach((userReport) => {
            if (searchOptions.indexOf(userReport.getUserName()) !== -1) {
                matchedUser = userReport;
            }
        });

        if (matchedUser) {
            return matchedUser;
        } else {
            console.log(userName + ' not founded', searchOptions);
            return new TogglReportUserEmpty({})
        }

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

    findProjectReportByName(projectName) {
        return this.getProjectsList().findOrCreate(projectName);
    }

    /**
     * @return {TogglReportProjectList}
     * @private
     */
    _createProjectsList() {
        let projectsList = new TogglReportProjectList();
        this.usersList.getUsers().forEach((userReport) => {
            userReport.getItems().forEach((projectItem) => {
                let projectReport = projectsList.findOrCreate(projectItem.getProjectName());
                projectReport.addItem(projectItem);
            });
        });
        return projectsList;
    }


}

exports.TogglReport = TogglReport;