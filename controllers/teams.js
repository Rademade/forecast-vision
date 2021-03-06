const Team = require('../models/team');

class TeamsController {

    static async index(req, res) {
        try {
            let teams = await Team.find({});
            res.render('teams/index', {teams: teams});
        } catch (e) {
            console.error(e);
        }
    }

    static form(req, res) {
        res.render('teams/form', {
            submitUrl: '/teams',
            team: new Team(),
            members: []
        });
    }

    static async show(req, res) {
        try {
            let team = await Team.findById(req.params.id);
            let members = await team.getMembers();
            res.render('teams/form', {
                submitUrl: '/teams/' + team.id,
                team: team,
                members: members
            });
        } catch (e) {
            console.log(e);
            return res.redirect('/teams');
        }
    }

    static async create(req, res) {
        let team = new Team();
        let updatedTeam = await TeamsController._setParams(team, req.body);
        updatedTeam.save();
        TeamsController._sendResult(updatedTeam, res);
    }

    static async update(req, res) {
        try {
            let team = await Team.findById(req.params.id);
            let updatedTeam = await TeamsController._setParams(team, req.body);

            await updatedTeam.save();
            TeamsController._sendResult(team, res);
        } catch (e) {
            console.error(e);

            res.redirect('/teams');
        }
    }

    static async delete(req, res) {
        try {
            let team = await Team.findById(req.params.id);
            team.remove();
            res.json({'status': 1});
        } catch (e) {
            res.json({'status': 0});
        }
    }

    static async _setParams(document, body) {
        // // TODO validate params
        document.set({
            name: body.name,
        });

        if (body.representative && body.representative !== '') {
            let representativeMember = await document.getMemberById(body.representative);
            document.set({
                representative: representativeMember
            });
        } else {
            document.representative = undefined
        }

        return document;
    }

    static _sendResult(document, res) {
        // TODO display errors
        res.redirect('/teams');
    }

    static validateBody (body) {
        // FIXME here should be validation
    }
}

module.exports = TeamsController;
