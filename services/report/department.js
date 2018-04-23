const { Duration } = require('../duration');

class ReportDepartment {

    /**
     * @param {ReportMembersList} membersList
     * @return {ReportDepartment[]}
     */
    static buildDepartments(membersList) {
        let departments = {};
        membersList.getAllMembers().forEach(function(member) {
            let key = member.getRole();
            if (!departments[key]) {
                departments[key] = new ReportDepartment( member.getRole() );
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
     * @param {ReportMember} member
     */
    addMember(member) {
        this.members.push(member);
    }

    getName() {
        return this.name;
    }

    getAvailableDuration() {
        if (!this.avaliableHours) {
            this.avaliableHours = this.members.reduce((duration, member) => {
                return duration.add( member.getAvailableDuration() );
            }, new Duration());
        }
        return this.avaliableHours;
    }

    getScheduledDuration() {
        if (!this.loadHours) {
            this.loadHours = this.members.reduce((duration, member) => {
                return duration.add( member.getScheduledDuration() );
            }, new Duration());
        }
        return this.loadHours;
    }

    getLoadPercent() {
        return this.getScheduledDuration().getRatio( this.getAvailableDuration());
    }

}

exports.ReportDepartment = ReportDepartment;