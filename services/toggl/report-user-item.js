class TogglReportUserItem {

    constructor(data) {
        this.data = data;
        this._initProjectName();
    }

    getProjectName() {
        return this.projectName;
    }

    getTrackingMinutes() {
        return this.data.time / 1000 / 60
    }

    _initProjectName() {
        if (this.data.title.project) {
            this.projectName = this.data.title.project.trim('');
        } else {
            this.projectName = '';
        }
    }
}

exports.TogglReportUserItem = TogglReportUserItem;
