const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
    name: String,
    togglId: String,
    forecastId: String,
    email: String,
    peopleHRId: {
        type: String,
        required: false
    },
    actualUtilization: {
        type: Number,
        default: 100
    },
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        default: null
    }
});

class MemberClass {

    hasEmail() {
        return this.email && this.email.length > 0;
    }

    /**
     * @param {TogglReportUser} togglMember
     */
    static getByTogglUser(togglMember) {
        return new Promise((resolve) => {
            mongoose.model('Member')
                .findOne({$or: [
                        {togglId: togglMember.getTogglId()},
                        {name: togglMember.getUserName()}
                    ]})
                .populate('team')
                .then((document) => {
                    if (!document) {
                        _self.createByTogglProject(togglMember).then((document) => { resolve(document) });
                    } else {
                        resolve(document);
                    }
                });
        }).then((member) => {
            if (!member.togglId) {
                member.set({togglId: togglMember.getTogglId()}).save();
            }
            return member;
        });
    };


    /**
     * @returns {Promise<*>}
     */
    static async getMembersForHolidaysSync() {
        return await mongoose.model('Member').find({
            peopleHRId: {$exists: true}
        });
    };

    /**
     * @param togglMember
     * @return {Model}
     */
    static createByTogglProject(togglMember) {
        return (new (mongoose.model('Member'))).set({
            name: togglMember.getUserName(),
            togglId: togglMember.getTogglId()
        }).save();
    };

    /**
     * @param {ForecastReportMember} forecastMember
     */
    static getByForecastUser(forecastMember) {
        return new Promise((resolve) => {
            mongoose.model('Member')
                .findOne({$or: [
                        {forecastId: forecastMember.getId()},
                        {name: forecastMember.getName()}
                    ]})
                .populate('team')
                .then((document) => {
                    if (!document) {
                        _self.createByForecastUser(forecastMember).then((document) => { resolve(document) });
                    } else {
                        resolve(document);
                    }
                });
        }).then((member) => {
            if (!member.forecastId) {
                member.set({forecastId: forecastMember.getId()}).save();
            }
            return member;
        });
    };

    /**
     * @param {ForecastReportMember} forecastMember
     * @return {Model}
     */
    static createByForecastUser(forecastMember) {
        return (new (mongoose.model('Member'))).set({
            name: forecastMember.getName(),
            forecastId: forecastMember.getId()
        }).save();
    };

}

MemberSchema.loadClass(MemberClass);

module.exports.MemberSchema = MemberSchema;
module.exports.Member = mongoose.model('Member', MemberSchema);
