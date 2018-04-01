const { TimeRound } = require('./time-round');
const { WeekReportMember } = require('./week-report-member');

const MIN_HOURS = 1;
const NEED_ROTATION_LIMIT = 14;

class WeekReportMembersList {

    /**
     * @param {Object} membersData
     * @returns {WeekReportMembersList}
     */
    static buildMembers(membersData) {
        let members = membersData.map((memberData) => {
            return new WeekReportMember(memberData);
        });
        return new WeekReportMembersList(members);
    }

    /**
     * @param {Array<WeekReportMember>} members
     */
    constructor(members) {
        this.members = members;
    }

    getAllMembers() {
        return this.members;
    }

    getBenchMembers() {
        return this.members.filter((member) => {
            return NEED_ROTATION_LIMIT < member.getBenchHours();
        });
    }

    getTotalAvailableMemebers() {
        return this.members.filter((member) => {
            return MIN_HOURS < member.getBenchHours();
        });
    }

    getBadPlaningMembers() {
        return this.members.filter((member) => {
            return MIN_HOURS < member.getBenchHours()&& member.getBenchHours() <= NEED_ROTATION_LIMIT;
        });
    }

    getBadPlaningHours() {
        return TimeRound.roundHours( this.getBadPlaningMembers().reduce((a, b) => {
            return a + b.getBenchHours();
        }, 0) );
    }

    getBenchHours() {
        return TimeRound.roundHours( this.getBenchMembers().reduce((a, b) => {
            return a + b.getBenchHours();
        }, 0) );
    }

    getTotalAvailableHours() {
        return TimeRound.roundHours( this.getTotalAvailableMemebers().reduce((a, b) => {
            return a + b.getBenchHours();
        }, 0) );
    }

}

exports.WeekReportMembersList = WeekReportMembersList;