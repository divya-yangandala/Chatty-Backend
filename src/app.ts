import express, { Express } from 'express';
import { ChattyServer } from './setupServer';
import databaseConnection from "./setupDatabase";
import { config } from './config';

class Application {
    public initialize(): void {
        this.loadConfig();      //always load env variables first
        databaseConnection(); 
        const app: Express = express();
        const server: ChattyServer = new ChattyServer(app);
        server.start();
    };

    // We need to call the env configurations in app.ts or app initialize
    public loadConfig(): void {
        config.validateConfig();
    }

}

//create instance of application

const application:Application = new Application();
application.initialize();