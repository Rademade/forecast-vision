class WeekReportMember {
    constructor(data) {
        this.data = data
    }
    getName() {
        return this.data.name;
    }
    getAvailableMinutes() {
        return this.data.availableMinutes;
    }
    getScheduledMinutes() {
        return this.data.scheduledMinutes;
    }
    getBenchMinutes() {
        return this.getAvailableMinutes() - this.getScheduledMinutes()
    }
    getBenchHours() {
        return Math.round(this.getBenchMinutes() / 60);
    }
}

exports.WeekReportMember = WeekReportMember;