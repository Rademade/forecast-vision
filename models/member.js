const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
    name: String,
    togglId: String,
    forecastId: String,
    email: String,
    peopleHRId: String,
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

const _self = MemberSchema.statics;

/**
 * @param {TogglReportUser} togglMember
 */
_self.getByTogglUser = (togglMember) => {
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
_self.getMembersForHolidaysSync = async () => {
    return await mongoose.model('Member').find({
        peopleHRId: {$exists: true}
    });
};

/**
 * @param togglMember
 * @return {Model}
 */
_self.createByTogglProject = (togglMember) => {
    return (new (mongoose.model('Member'))).set({
        name: togglMember.getUserName(),
        togglId: togglMember.getTogglId()
    }).save();
};

/**
 * @param {ForecastReportMember} forecastMember
 */
_self.getByForecastUser = (forecastMember) => {
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
_self.createByForecastUser = (forecastMember) => {
    return (new (mongoose.model('Member'))).set({
        name: forecastMember.getName(),
        forecastId: forecastMember.getId()
    }).save();
};

module.exports.MemberSchema = MemberSchema;
module.exports.Member = mongoose.model('Member', MemberSchema);
