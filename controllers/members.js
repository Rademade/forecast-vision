const Member = require('../models/member');

class MembersController {

    static index(req, res) {
        Member.find(function (err, members) {
            if (err) return console.error(err);
            res.render('members/index', {members: members});
        });
    }

    static form(req, res) {
        res.render('members/form', {
            submitUrl: '/members',
            member: new Member()
        });
    }

    static show(req, res) {
        Member.findById(req.params.id, function (err, member) {
            if (err) return res.redirect('/members');
            res.render('members/form', {
                submitUrl: '/members/' + member.id,
                member: member
            });
        });
    }

    static create(req, res) {
        let member = new Member();
        MembersController._setParams(member, req.body).save();
        MembersController._sendResult(member, res);
    }

    static update(req, res) {
        Member.findById(req.params.id, (err, member) => {
            if (err) return res.redirect('/members');
            MembersController._setParams(member, req.body).save();
            MembersController._sendResult(member, res);
        });
    }

    static delete(req, res) {
        Member.findById(req.params.id, (err, member) => {
            if (err) return res.json({'status': 0});
            member.remove();
            res.json({'status': 1});
        });

    }

    static _setParams(document, body) {
        // TODO validate params
        document.set({
            name: body.name,
            togglId: body.togglId,
            forecastId: body.forecastId,
        });
        return document;
    }

    static _sendResult(document, res) {
        // TODO display errors
        res.redirect('/members');
    }

}

module.exports = MembersController;