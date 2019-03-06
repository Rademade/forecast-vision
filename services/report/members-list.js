const _ = require('lodash');

const { ReportMember } = require('./member');
const { CollectionList } = require('./collection/list');
const { Duration } = require('../duration');

const MIN_HOURS = 1;
const BENCH_MIN_HOURS = 8;

class ReportMembersList extends CollectionList {

    /**
     * @param {ReportMember} member
     */
    addMember(member) {
        return this.addItem(member);
    }

    /**
     * @param {ForecastAllocationItemMatch} matchedItem
     */
    addMatchedAllocationItem(matchedItem) {
        let slug = matchedItem.getAllocation().getMemberName();
        let member = this.items[ slug ];
        if (member) {
            member.addMatchedAllocationItem( matchedItem );
        } else {
            console.log('Member ' + slug + ' not founded');
        }
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