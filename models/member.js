const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
    name: String,
    togglId: String,
    forecastId: String,
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }
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
 * @param forecastItem
 */
_self.getByForecastUser = (forecastItem) => {
    return new Promise((resolve) => {
        mongoose.model('Member')
            .findOne({$or: [
                {forecastId: forecastItem.id},
                {name: forecastItem.name}
            ]})
            .then((document) => {
                if (!document) {
                    _self.createByForecastUser(forecastItem).then((document) => { resolve(document) });
                } else {
                    resolve(document);
                }
            });
    }).then((member) => {
        if (!member.forecastId) {
            member.set({forecastId: forecastItem.id}).save();
        }
        return member;
    });
};

/**
 * @param forecastItem
 * @return {Model}
 */
_self.createByForecastUser = (forecastItem) => {
    return (new (mongoose.model('Member'))).set({
        name: forecastItem.name,
        forecastId: forecastItem.id
    }).save();
};


module.exports = mongoose.model('Member', MemberSchema);