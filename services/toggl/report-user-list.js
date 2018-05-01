class TogglReportUserList {

    /**
     * @param {TogglReportUser[]} users
     */
    constructor(users = []) {
        this.users = users;
    }

    /**
     * @return {TogglReportUser[]}
     */
    getUsers() {
        return this.users;
    }

}

exports.TogglReportUserList = TogglReportUserList;