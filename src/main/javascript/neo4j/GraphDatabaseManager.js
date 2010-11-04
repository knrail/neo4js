/*
 * Copyright (c) 2002-2010 "Neo Technology,"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Manage a neo4j REST server with management enabled.
 * 
 * @class
 * @param url
 *            the url to the REST management server
 * @returns a new GraphDatabaseManager instance
 */
neo4j.GraphDatabaseManager = function(db) {

    this.db = db;
    this.url = db.manageUrl;

    /**
     * Backup service, instance of {@link neo4j.services.BackupService}
     */
    this.backup = new neo4j.services.BackupService(db);

    /**
     * Configuration service, instance of {@link neo4j.services.ConfigService}
     */
    this.config = new neo4j.services.ConfigService(db);

    /**
     * Import service, instance of {@link neo4j.services.ImportService}
     */
    this.importing = new neo4j.services.ImportService(db);

    /**
     * Export service, instance of {@link neo4j.services.ExportService}
     */
    this.exporting = new neo4j.services.ExportService(db);

    /**
     * Console service, instance of {@link neo4j.services.ConsoleService}
     */
    this.console = new neo4j.services.ConsoleService(db);

    /**
     * JMX service, instance of {@link neo4j.services.JmxService}
     */
    this.jmx = new neo4j.services.JmxService(db);

    /**
     * Lifecycle service, instance of {@link neo4j.services.LifecycleService}
     */
    this.lifecycle = new neo4j.services.LifecycleService(db);

    /**
     * Monitor service, instance of {@link neo4j.services.MonitorService}
     */
    this.monitor = new neo4j.services.MonitorService(db);

    this.discoverServices();

};

/**
 * Check if services have been loaded. You can also listen for the
 * services.loaded event.
 * 
 * @returns {Boolean} true if services are loaded.
 */
neo4j.GraphDatabaseManager.prototype.servicesLoaded = function() {
    return (this.services) ? true : false;
};

/**
 * Get a list of available services.
 * 
 * @throws Error
 *             if services have not been loaded yet (use {@link #servicesLoaded}
 *             or the services.loaded event to check).
 */
neo4j.GraphDatabaseManager.prototype.availableServices = function() {
    if (this.services)
    {

        if (!this.serviceNames)
        {
            this.serviceNames = [];
            for ( var name in this.services)
            {
                this.serviceNames.push(name);
            }
        }

        return this.serviceNames;
    } else
    {
        throw new Error("Service definition has not been loaded yet.")
    }
};

/**
 * Connect to the server and find out what services are available.
 */
neo4j.GraphDatabaseManager.prototype.discoverServices = function() {

    neo4j.Web.get(this.url,
    // Success
    neo4j.proxy(function(serviceDefinition) {
        this.services = serviceDefinition.services;

        for ( var service in serviceDefinition.services)
        {
            if (this[service])
            {
                this[service]
                        .makeAvailable(serviceDefinition.services[service]);
            }
        }

        this.db.trigger("services.loaded");

    }, this),
    // Failure
    neo4j.proxy(function(fail) {
        throw new Error("Unable to fetch service descriptions for server "
                + this.url);
    }, this));

};
