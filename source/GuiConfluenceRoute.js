'use strict';

/**
 * Requirements
 * @ignore
 */
const GuiTemplateRoute = require('entoj-system').server.route.GuiTemplateRoute;
const UrlsConfiguration = require('entoj-system').model.configuration.UrlsConfiguration;
const GlobalConfiguration = require('entoj-system').model.configuration.GlobalConfiguration;
const PathesConfiguration = require('entoj-system').model.configuration.PathesConfiguration;
const BuildConfiguration = require('entoj-system').model.configuration.BuildConfiguration;
const EntitiesRepository = require('entoj-system').model.entity.EntitiesRepository;
const EntityCategoriesRepository = require('entoj-system').model.entity.EntityCategoriesRepository;
const SitesRepository = require('entoj-system').model.site.SitesRepository;
const CliLogger = require('entoj-system').cli.CliLogger;
const Environment = require('entoj-system').nunjucks.Environment;
const path = require('path');
const co = require('co');


/**
 * @memberOf server.route
 */
class GuiConfluenceRoute extends GuiTemplateRoute
{
    /**
     * @param {cli.CliLogger} cliLogger
     * @param {model.site.SitesRepository} sitesRepository
     * @param {model.entity.EntityCategoriesRepository} entityCategoriesRepository
     * @param {model.entity.EntitiesRepository} entitiesRepository
     * @param {model.configuration.GlobalConfiguration} globalConfiguration
     * @param {model.configuration.UrlsConfiguration} urlsConfiguration
     * @param {model.configuration.PathesConfiguration} pathesConfiguration
     * @param {model.configuration.BuildConfiguration} buildConfiguration
     * @param {nunjucks.Environment} nunjucks
     */
    constructor(cliLogger, sitesRepository, entityCategoriesRepository, entitiesRepository, globalConfiguration,
                urlsConfiguration, pathesConfiguration, buildConfiguration, nunjucks)
    {
        const options =
        {
            templatePaths:
            [
                pathesConfiguration.sites,
                require('entoj-gui').templateRoot,
                path.resolve(__dirname + '/template')
            ],
            staticRoute: '/confluence/viewer/_'
        };
        super(cliLogger.createPrefixed('gui'), sitesRepository, entityCategoriesRepository, entitiesRepository, globalConfiguration,
                urlsConfiguration, pathesConfiguration, buildConfiguration, nunjucks, [], options);
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [CliLogger, SitesRepository, EntityCategoriesRepository, EntitiesRepository,
                                GlobalConfiguration, UrlsConfiguration, PathesConfiguration, BuildConfiguration, Environment] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'server.routes/GuiConfluenceRoute';
    }


    /**
     * @inheritDocs
     */
    register(server)
    {
        const scope = this;
        const promise = super.register(server);
        promise.then(() =>
        {
            // Add templates
            this.addTemplateHandler('/integrations/confluence/viewer/atlassian-connect.json', 'atlassian-connect.j2');
            this.addTemplateHandler('/integrations/confluence/viewer/display/:site/:entityId/:variant', 'display.j2', false, (route, request, model) =>
            {
                const promise = co(function*()
                {
                    model.location.variant = request.params.variant;
                    model.location.site = yield scope.sitesRepository.findBy({ '*': request.params.site });
                    model.location.entity = yield scope.entitiesRepository.getById(request.params.entityId, model.location.site);
                    if (model.location.entity)
                    {
                        model.location.entityId = model.location.entity.id;
                    }
                });
                return promise;
            });

            // Add static files
            const staticPath = (url, request) =>
            {
                request.isAuthorizationRequired = false;
                return path.join(this.templatePaths[2], request.params[0]);
            };
            this.addStaticFileHandler('/integrations/confluence/viewer/*', staticPath, ['.png', '.js', '.css']);
        });
        return promise;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.GuiConfluenceRoute = GuiConfluenceRoute;
