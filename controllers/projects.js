const Project = require('../models/project');

class ProjectsController {

    static index(req, res) {
        Project.find(function (err, projects) {
            if (err) return console.error(err);
            res.render('projects/index', {projects: projects});
        });
    }

    static form(req, res) {
        res.render('projects/form', {
            submitUrl: '/projects',
            project: new Project()
        });
    }

    static show(req, res) {
        Project.findById(req.params.id, function (err, project) {
            if (err) return res.redirect('/projects');
            res.render('projects/form', {
                submitUrl: '/projects/' + project.id,
                project: project
            });
        });
    }

    static create(req, res) {
        let project  = new Project()
        ProjectsController._setParams(project, req.body).save();
        ProjectsController._sendResult(project, res);
    }

    static update(req, res) {
        Project.findById(req.params.id, (err, project) => {
            if (err) return res.redirect('/projects');
            ProjectsController._setParams(project, req.body).save();
            ProjectsController._sendResult(project, res);
        });
    }

    static delete(req, res) {
        Project.findById(req.params.id, (err, project) => {
            if (err) return res.json({'status': 0});
            project.remove();
            res.json({'status': 1});
        });
    }

    static _setParams(document, body) {
        // TODO validate params
        document.set({
            name: body.name,
            togglId: body.togglId,
            forecastCompanyId: body.forecastCompanyId
        });
        return document;
    }

    static _sendResult(document, res) {
        // TODO display errors
        res.redirect('/projects');
    }

}

module.exports = ProjectsController;