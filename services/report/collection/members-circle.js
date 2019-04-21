const { Duration } = require('../../duration');
const { CollectionList } = require('./list');

class MembersCircle extends CollectionList {

    constructor(name) {
        super();
        this.name = name;
        this.members = [];
    }

    /**
     * @param {ReportMember} member
     */
    addMember(member) {
        // console.log(member)
        this.members.push(member);
    }

    getAllMembers() {
        return this.members;
    }

    getName() {
        return this.name;
    }

    getAvailableDuration() {
        if (!this.avaliableHours) {
            this.avaliableHours = this.getAllMembers().reduce((duration, member) => {
                return duration.add( member.getAvailableDuration() );
            }, new Duration());
        }
        return this.avaliableHours;
    }

    getPlannedDuration() {
        if (!this.loadHours) {
            this.loadHours = this.getAllMembers().reduce((duration, member) => {
                return duration.add( member.getPlannedDuration() );
            }, new Duration());
        }
        return this.loadHours;
    }

    getBillableDuration() {
        if (!this.billableDuration) {
            this.billableDuration = this.getAllMembers().reduce((duration, member) => {
                return duration.add( member.getBillableDuration() );
            }, new Duration());
        }
        return this.billableDuration;
    }

    getFactBillableDuration() {
        if (!this.factBillableDuration) {
            this.factBillableDuration = this.getAllMembers().reduce((duration, member) => {
                return duration.add( member.getFactBillableDuration() );
            }, new Duration());
        }
        return this.factBillableDuration;
    }

    getLoadPercent() {
        return this.getBillableDuration().getRatio( this.getAvailableDuration());
    }

    getFactLoadPercent() {
        return this.getFactBillableDuration().getRatio( this.getAvailableDuration());
    }

    getPlanningAccuracyPercent() {
        return this.getFactBillableDuration().getRatio( this.getBillableDuration());
    }


}

exports.MembersCircle = MembersCircle;
