const { TogglReportUserEmpty } = require('./report-user-empty');

// TODO move to conf file or database
const userMapper = {
    'Alexander Buzan': 'Alexandr Buzan',
    'Denis Dvoryashin': 'Denys Dvoriashyn',
    'Maksym Shutiak': 'Maxym Shutyak',
    'Mikhail Gubenko': 'Mihail Gubenko',
    'Denis Dymko': 'Denis'
};

class TogglReport {

    /**
     * @param {TogglReportUser[]}users
     */
    constructor(users) {
        this.users = users;
    }

    findUserReportByName(userName) {

        if (this.users.length === 0) {
            return this.getUserNotFound();
        }

        let matchedUser;
        let searchOptions = [userName, userMapper[userName]];

        this.users.forEach((userReport) => {
            if (searchOptions.indexOf(userReport.getUserName()) !== -1) {
                matchedUser = userReport;
            }
        });

        if (matchedUser) {
            return matchedUser;
        } else {
            console.log(userName + ' not founded', searchOptions);
            return this.getUserNotFound();
        }

    }

    getUserNotFound() {
        return new TogglReportUserEmpty({});
    }

    findProjectReportByName(projectName) {
        // console.log('Find project name', projectName);
        return null;
    }


}

exports.TogglReport = TogglReport;