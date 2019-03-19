class ForecastReportMember {

    /**
     * Data from GraphQL query – membersQuery
     * File scraping methods
     *
     * @param {Object} data
     */
    constructor(data) {
        this.data  = data;
    }

    isActive() {
        return this.data.active;
    }

    getId() {
        return this.data.id;
    }

    getName() {
        return [this.data.firstName, this.data.lastName].join(' ');
    }

    getRoleName() {
        return this.data.role ? this.data.role.name : null;
    }

    getAvailableMinutes() {
        console.log(this.data)

        return this.data.monday +
            this.data.tuesday +
            this.data.wednesday +
            this.data.thursday +
            this.data.friday +
            this.data.saturday +
            this.data.sunday;
    }

}

exports.ForecastReportMember = ForecastReportMember;
