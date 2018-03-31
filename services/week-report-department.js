const { TimeRound } = require('./time-round');

class WeekReportDepartment {

    /**
     * @param {WeekReportMembersList} membersList
     * @return {Array<WeekReportDepartment>}
     */
    static buildDepartments(membersList) {
        let departments = {};
        membersList.getAllMembers().forEach(function(member){
            let key = member.getRole();
            if (!departments[key]) {
                departments[key] = new WeekReportDepartment( member.getRole() );
            }
            departments[key].addMember( member );
        });
        return departments;
    }

    constructor(name) {
        this.name = name;
        this.members = [];
    }

    /**
     * @param {WeekReportMember} member
     */
    addMember(member) {
        this.members.push(member);
    }

    getName() {
        return this.name;
    }

    getAvailableHours() {
        if (!this.avaliableHours) {
            this.avaliableHours = this.members.reduce((hours, member) => {
                return hours + member.getAvailableHours();
            }, 0);
            this.avaliableHours = TimeRound.roundHours( this.avaliableHours );
        }
        return this.avaliableHours;
    }

    getLoadHours() {
        if (!this.loadHours) {
            this.loadHours = this.members.reduce((hours, member) => {
                return hours + member.getScheduledHours();
            }, 0);
            this.loadHours = TimeRound.roundHours( this.loadHours );
        }
        return this.loadHours;
    }

    getLoadPercent() {
        return TimeRound.roundPercents( this.getLoadHours() / this.getAvailableHours());
    }

}

exports.WeekReportDepartment = WeekReportDepartment;