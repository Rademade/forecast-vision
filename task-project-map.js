const { ForecastGrabberScrapingAuth } = require('./services/forecast-grabber/scraping-auth');
const { TogglScrapingMethods } = require('./services/toggl/scraping-methods');

let projects = [];

// TODO make as background task
    // - store this data in database
    // - use names mapping for config

(new ForecastGrabberScrapingAuth()).ready((api) => {
    api.getProjects().then((projectData) => {
        let forecastProjects = projectData.data.viewer.projects.edges;
        (new TogglScrapingMethods()).getProjects((togglProjects) => {

            togglProjects.forEach((togglProject) => {
                forecastProjects.forEach((forecastProject) => {

                    if (togglProject.name.trim().toLowerCase() === forecastProject.node.name.trim().toLowerCase()) {
                        console.log('case ' +  forecastProject.node.companyProjectId + ': return ' + togglProject.id + ';');
                        projects.push({
                            name: togglProject.name.trim(),
                            togglId: togglProject.id,
                            forecastId: forecastProject.node.companyProjectId,
                        });
                    }

                });
            });
        })
    })
});