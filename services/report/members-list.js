const _ = require('lodash');

const { ReportMember } = require('./member');
const { MembersCircle } = require('./collection/members-circle');
const { Duration } = require('../duration');

const MIN_HOURS = 1;
const BENCH_MIN_HOURS = 8;

class ReportMembersList extends MembersCircle {

    constructor() {
        super('Member list report');
    }

    /**
     * @param {ReportMember} member
     */
    addMember(member) {
        let slug = member.getSlug();
        if (this.items[slug]) {
            this.items[slug].groupWith( member );
        } else {
            // TODO add search by Mongo Document ID
            // We can avoid Group Similar step
            this.items[slug] = member;
        }
    }

    /**
     * @param {ForecastAllocationItemMatch} matchedItem
     */
    addMatchedAllocationItem(matchedItem) {

        // Option 1. Search by name

        let slug = matchedItem.getAllocation().getMemberName();
        let member = this.items[ slug ];

        if (member) {
            member.addMatchedAllocationItem( matchedItem );
            return true;
        }


        // Option 2. Search by forecastId

        member =_.find(this.getAllMembers(), (member) => {
            return member.getForecastId() === matchedItem.getAllocation().getMemberId();
        });

        if (member) {
            member.addMatchedAllocationItem( matchedItem );
            return true;
        }

        // Option 3
        console.log(slug + ' member not found. Please check member list and Forecast');
        return false;
    }

    /**
     * @return {ReportMember[]}
     */
    getAllMembers() {
        return _.values( this.items );
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
            return BENCH_MIN_HOURS <= member.getBenchDuration().getHours();
        }).sort((a, b) => {
            return a.getBenchDuration().compare( b.getBenchDuration() );
        });
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

    getVacationDuration() {
        return this.getBenchMembers().reduce((a, b) => {
            return a.add( b.getTotalLeaveDaysDuration() );
        }, new Duration());
    }

}

exports.ReportMembersList = ReportMembersList;
