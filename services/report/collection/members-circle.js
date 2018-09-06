const { Duration } = require('../../duration');

class MembersCircle {

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

    getAllMembers() {
        return this.members;
    }

    getName() {
        return this.name;
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

    getBillableDuration() {
        if (!this.billableDuration) {
            this.billableDuration = this.members.reduce((duration, member) => {
                return duration.add( member.getBillableDuration() );
            }, new Duration());
        }
        return this.billableDuration;
    }

    getFactBillableDuration() {
        if (!this.factBillableDuration) {
            this.factBillableDuration = this.members.reduce((duration, member) => {
                return duration.add( member.getFactBillableDuration() );
            }, new Duration());
        }
        return this.factBillableDuration;
    }

    getLoadPercent() {
        return this.getBillableDuration().getRatio( this.getAvailableDuration());
    }

    getPlanningAccuracyPercent() {
        return this.getFactBillableDuration().getRatio( this.getBillableDuration());
    }


}

exports.MembersCircle = MembersCircle;