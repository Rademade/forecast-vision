const _ = require('lodash');

const { ReportMember } = require('./member');
const { Duration } = require('../duration');

const MIN_HOURS = 1;
const BENCH_MIN_HOURS = 9;

class ReportMembersList {

    /**
     * @param {ReportMember[]} members
     */
    constructor(members) {
        this.members = members;
    }

    /**
     * @param {ForecastAllocationItem} allocation
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
     * @return ReportMember
     */
    findByName(name) {
        return _.find(this.members, (member) => {
            return member.getName() === name;
        });
    }


    /**
     * @return {ReportMember[]}
     */
    getAllMembers() {
        return _.values( this.members );
    }

    /**
     * @return {ReportMember[]}
     */
    getUnplannedMembers() {
        return this.getAllMembers().filter((member) => {
            return MIN_HOURS < member.getUnplannedDuration().getHours();
        }).sort((a, b) => {
            return a.getUnplannedDuration().compare( b.getUnplannedDuration() );
        });
    }

    /**
     * @return {ReportMember[]}
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

    getFactBillableDuration() {
        return this.getAllMembers().reduce((a, b) => {
            return a.add( b.getFactBillableDuration() );
        }, new Duration() );
    }

    getPlanningAccuracyPercent() {
        return this.getFactBillableDuration().getRatio( this.getBillableDuration() );
    }

}

exports.ReportMembersList = ReportMembersList;