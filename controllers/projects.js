const { TogglScrapingMethods } = require('./../services/toggl/scraping-methods');

const Project = require('../models/project');

class ProjectsController {

    static async index(req, res) {
        try {
            let projects = await Project.find();
            res.render('projects/index', {projects: projects});
        } catch (e) {
            console.error(e);
        }
   }

    static async togglReload(req, res) {
        try {
            let projects = await (new TogglScrapingMethods()).getProjects();
            for (let projectData of projects) {
                Project.buildByTogglProjectData( projectData );
            }
        } catch (e) {
            res.redirect('/projects?toggl-reload=done');
        }
    }

    static form(req, res) {
        res.render('projects/form', {
            submitUrl: '/projects',
            project: new Project()
        });
    }

    static async show(req, res) {
        try {
            let project = await Project.findById(req.params.id)
            res.render('projects/form', {
                submitUrl: '/projects/' + project.id,
                project: project
            });
        } catch (e) {
            res.redirect('/projects');
        }
    }

    static create(req, res) {
        let project  = new Project()
        ProjectsController._setParams(project, req.body).save();
        ProjectsController._sendResult(project, res);
    }

    static async update(req, res) {
        try {
            let project = await Project.findById(req.params.id);
            ProjectsController._setParams(project, req.body).save();
            ProjectsController._sendResult(project, res);
        } catch (e) {
            res.redirect('/projects');
        }
    }

    static async delete(req, res) {
        try {
            let project = await Project.findById(req.params.id)
            project.remove();
            res.json({'status': 1});
        } catch (e) {
            res.json({'status': 0});
        }
    }

    static _setParams(document, body) {
        // TODO validate params
        document.set({
            name: body.name,
            togglName: body.togglName,
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