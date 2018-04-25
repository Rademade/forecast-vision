class TogglReportUserItem {

    constructor(data) {
        this.data = data;
        this.projectName = this.data.title.project.trim('');
    }

    getProjectName() {
        return this.projectName;
    }

    getTrackingMinutes() {
        return this.data.time / 1000 / 60
    }

}

exports.TogglReportUserItem = TogglReportUserItem;