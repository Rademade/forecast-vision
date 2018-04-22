const _ = require('lodash');

const { WeekReportMember } = require('./week-report-member');
const { Duration } = require('./duration');

const MIN_HOURS = 1;
const BENCH_MIN_HOURS = 9;

class WeekReportMembersList {

    /**
     * @param {Object} utilizationListData
     * @param {ReportAllocationList} allocationReport
     * @param {DateRange} dateRange
     * @return {WeekReportMembersList}
     */
    static buildMembersList(utilizationListData, allocationReport, dateRange) {
        let members = utilizationListData.map((memberData) => {
            return new WeekReportMember(memberData);
        });

        let membersList = new WeekReportMembersList(members);

        allocationReport.matchAllocations(dateRange, (allocation, matchedRange) => {
            membersList.addAllocation( allocation, matchedRange );
        });

        return membersList;
    }

    /**
     * @param {Array<WeekReportMember>} members
     */
    constructor(members) {
        this.members = members;
    }

    /**
     * @param {ReportAllocation} allocation
     * @param {DateRange} matchedRange
     */
    addAllocation(allocation, matchedRange) {
        let member = this.findByName( allocation.getMemberName() );
        if (!member) {
            console.log('Member ' + allocation.getMemberName() + ' not founded');
        }
        member.addAllocation( allocation, matchedRange );
    }

    /**
     * @param name
     * @return WeekReportMember
     */
    findByName(name) {
        return _.find(this.members, (member) => {
            return member.getName() === name;
        });
    }


    /**
     * @return {WeekReportMember[]}
     */
    getAllMembers() {
        return _.values( this.members );
    }

    /**
     * @return {WeekReportMember[]}
     */
    getUnplannedMembers() {
        return this.getAllMembers().filter((member) => {
            return MIN_HOURS < member.getUnplannedDuration().getHours();
        }).sort((a, b) => {
            return a.getUnplannedDuration().compare( b.getUnplannedDuration() );
        });
    }

    /**
     * @return {WeekReportMember[]}
     */
    getBenchMembers() {
        return this.getAllMembers().filter((member) => {
            return BENCH_MIN_HOURS < member.getBenchDuration().getHours();
        }).sort((a, b) => {
            return a.getBenchDuration().compare( b.getBenchDuration() );
        });
    }

    getPlannedDuration() {
        return this.getAllMembers().reduce((a, b) => {
            return a.add( b.getScheduledDuration() );
        }, new Duration() );
    }

    getBillableDuration() {
        return this.getAllMembers().reduce((a, b) => {
            return a.add( b.getBillableDuration() );
        }, new Duration());
    }

    getUnplannedDuration() {
        return this.getUnplannedMembers().reduce((a, b) => {
            return a.add( b.getUnplannedDuration() );
        }, new Duration());
    }

    getBenchDuration() {
        return this.getBenchMembers().reduce((a, b) => {
            return a.add( b.getBenchDuration() );
        }, new Duration());
    }

}

exports.WeekReportMembersList = WeekReportMembersList;