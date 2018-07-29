const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
    name: String,
    togglId: String,
    forecastId: String
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
            .exec()
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
    let member = new (mongoose.model('Member'));
    return member.set({
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
            .exec()
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
    let member = new (mongoose.model('Member'));
    return member.set({
        name: forecastItem.name,
        forecastId: forecastItem.id
    }).save();
};


module.exports = mongoose.model('Member', MemberSchema);