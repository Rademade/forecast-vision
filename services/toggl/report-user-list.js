class TogglReportUserList {

    /**
     * @param {TogglReportUser[]} users
     */
    constructor(users = []) {
        this.users = users;
    }

    isEmpty() {
        return this.users.length === 0;
    }

    /**
     * @return {TogglReportUser[]}
     */
    getUsers() {
        return this.users;
    }

}

exports.TogglReportUserList = TogglReportUserList;