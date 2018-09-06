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
            team: new Team()
        });
    }

    static async show(req, res) {
        try {
            let team = await Team.findById(req.params.id);
            res.render('teams/form', {
                submitUrl: '/teams/' + team.id,
                team: team
            });
        } catch (e) {
            return res.redirect('/teams');
        }
    }

    static create(req, res) {
        let team = new Team();
        TeamsController._setParams(team, req.body).save();
        TeamsController._sendResult(team, res);
    }

    static async update(req, res) {
        try {
            let team = await Team.findById(req.params.id);
            TeamsController._setParams(team, req.body).save();
            TeamsController._sendResult(team, res);
        } catch (e) {
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

    static _setParams(document, body) {
        // TODO validate params
        document.set({
            name: body.name,
        });
        return document;
    }

    static _sendResult(document, res) {
        // TODO display errors
        res.redirect('/teams');
    }

}

module.exports = TeamsController;