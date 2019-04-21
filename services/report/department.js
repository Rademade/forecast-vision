const { MembersCircle } = require('./collection/members-circle');

class ReportDepartment extends MembersCircle {

    /**
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

    /**
     * @param {ReportMember} member
     * @return {boolean}
     */
    isMemberThere(member) {
        return member.getDepartmentName() === this.getName();
    }

}

exports.ReportDepartment = ReportDepartment;