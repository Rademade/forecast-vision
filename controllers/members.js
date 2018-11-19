const Member = require('../models/member');
const Team = require('../models/team');

class MembersController {

    static async index(req, res) {
        try {
            let members = await Member.find({}).populate('team').exec();
            res.render('members/index', {members: members});
        } catch (e) {
            console.error(e);
        }
    }

    static async form(req, res) {
        let teams = await Team.find();
        res.render('members/form', {
            submitUrl: '/members',
            member: new Member(),
            teams: teams
        });
    }

    static async show(req, res) {
        try {
            let member = await Member.findById(req.params.id);
            let teams = await Team.find({});
            res.render('members/form', {
                submitUrl: '/members/' + member.id,
                member: member,
                teams: teams
            });
        } catch (e) {
            res.redirect('/members');
        }
    }

    static create(req, res) {
        let member = new Member();
        MembersController._setParams(member, req.body).save();
        MembersController._sendResult(member, res);
    }

    static async update(req, res) {
        try {
            let member = await Member.findById(req.params.id);
            MembersController._setParams(member, req.body).save();
            MembersController._sendResult(member, res);
        } catch (e) {
            console.error(e);
            res.redirect('/members');
        }
    }

    static async delete(req, res) {
        try {
            let member = await Member.findById(req.params.id);
            member.remove();
            res.json({'status': 1});
        } catch (e) {
            res.json({'status': 0});
        }
    }

    static _setParams(document, body) {
        // TODO validate params
        if (!body.team) body.team = null;
        document.set({
            name: body.name,
            togglId: body.togglId,
            forecastId: body.forecastId,
            actualUtilization: body.actualUtilization,
            team: body.team
        });
        return document;
    }

    static _sendResult(document, res) {
        // TODO display errors
        res.redirect('/members');
    }

}

module.exports = MembersController;