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

        this.items[slug] = member
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
     * @param {ReportMembersList} firstList
     * @param {ReportMembersList} secondList
     * @returns {ReportMembersList}
     */
    mergeMemberList (firstList, secondList) {

        let customMerge =((objMember, scrMember) => {
            /**
             * Find in second list member with same id and than merge them
             */
            if (!objMember) return;
            if (!scrMember) return;

            let sameMember = _.find(secondList.getAllMembers(), member => member.memberDocument.id === objMember.memberDocument.id);

            if (!sameMember) return scrMember;

            this.addMember( objMember.groupWith(sameMember) )
        });

        _.mergeWith(firstList.getAllMembers(), secondList.getAllMembers(), customMerge);

        return this;
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
