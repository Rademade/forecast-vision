const { Duration } = require('../duration');

class ReportDepartment {

    /**
     * @TODO Move department build
     *
     * @param {ReportMembersList} membersList
     * @return {ReportDepartment[]}
     */
    static buildDepartments(membersList) {
        let departments = {};
        membersList.getAllMembers().forEach(function(member) {
            let key = member.getDepartmentName();
            if (!key || key === 'null') return ;
            if (!departments[key]) {
                departments[key] = new ReportDepartment( member.getDepartmentName() );
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

    /**
     * @param {ReportMember} member
     * @return {boolean}
     */
    isMemberThere(member) {
        return member.getDepartmentName() === this.getName();
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