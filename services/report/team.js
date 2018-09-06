const { Duration } = require('../duration');
const { MembersCircle } = require('./collection/members-circle');

class ReportTeam extends MembersCircle {

    static buildTeams(membersList) {
        let teams = {};
        membersList.getAllMembers().forEach(function(member) {
            let name = member.getTeamName();
            if (!name || name === 'null') {
                name = "No Team"
            }
            if (!teams[name]) {
                teams[name] = new ReportTeam( name );
            }
            teams[name].addMember( member );
        });
        return teams;
    }

    /**
     * @param {ReportMember} member
     * @return {boolean}
     */
    isMemberThere(member) {
        return member.getTeamName() === this.getName();
    }
}

exports.ReportTeam = ReportTeam;