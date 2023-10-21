import {Application, json, urlencoded, response, request, NextFunction, Request, Response} from 'express';
import http from 'http';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import hpp from 'hpp';
import cookieSession from 'cookie-session';
import HTTP_STATUS from 'http-status-codes';
import logger from 'bunyan';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from 'socket.io-redis-adapter';
import 'express-async-errors';
import { config } from './config';
import applicationRoutes from './route';
import { IErrorRespponse, customError } from './shared/global/helpers/error-handler';

const SERVER_PORT = 5000;
const log:logger = config.createLogger("server");

export class ChattyServer{
private app: Application;

    constructor(app:Application){
        this.app = app;
    }

    public start(): void {
        this.securityMiddleware(this.app);
        this.standardMiddleware(this.app);
        this.routeMiddleware(this.app);
        this.globalErrorHandler(this.app);
        this.startServer(this.app);
    }

    private securityMiddleware(app: Application) : void {
        app.use(
            cookieSession({
                name: 'session',
                keys: [config.SECRET_KEY_ONE!, config.SECRET_KEY_TWO!],
                maxAge: 24 * 7 * 3600000,
                secure: config.NODE_ENV !== "development"
            })
        );
        app.use(hpp());
        app.use(helmet());
        app.use(
            cors({
                origin: '*',
                credentials: true,
                optionsSuccessStatus: 200,
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
            })
        )
    }

    private standardMiddleware(app: Application) : void {
        app.use(compression);
        app.use(json({limit: '50mb'})); //each req should not exceed 50mb otherwise it throws an error
        app.use(urlencoded({extended: true, limit: '50mb' }))
    }

    private routeMiddleware(app: Application) : void {
        applicationRoutes(app);
    }

    private globalErrorHandler(app: Application) : void {
        //for handling URL or endpoint request that does not exist in our application
        app.all('*', (req, res) => {
            res.status(HTTP_STATUS.NOT_FOUND).json({message: `${req.originalUrl} not found`});
        });

        //use customErrorhandler
        app.use((error: IErrorRespponse, _req: Request, res: Response, next: NextFunction) => {
            // console.log(error);
            log.error(error);
            if (error instanceof customError) {
                return res.status(error.statusCode).json(error.serializeErrors)
            }
            //If no error just call the next function
            next();
        });
    }

    private async startServer(app: Application) : Promise<void> {
        try {
            const httpServer: http.Server = new http.Server(app); //created instance of httpServer
            const socketIO : Server = await this.createSocketIO(httpServer);
            this.startHttpServer(httpServer);
            this.socketIOConnections(socketIO);
        } catch (error) {
            //console.log(error);
            log.error(error);
        }
    }

    private async createSocketIO(httpServer: http.Server) : Promise<Server> {
        const io: Server = new Server(httpServer, {
            cors: {
                origin: config.CLIENT_URL,
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
            }
        });
        const pubClient = createClient({ url: config.REDIS_HOST});  //create cleint for publishing
        const subClient = pubClient.duplicate();    //create cleint for subscription
        await Promise.all([pubClient.connect(), subClient.connect()]);
        io.adapter(createAdapter(pubClient, subClient));
        return io;
    }

    private startHttpServer(httpServer: http.Server) : void {
        // console.log(`Server has started with process ${process.pid}`);
        log.info(`Server has started with process ${process.pid}`);
        httpServer.listen(SERVER_PORT, ()=> {
            // console.log(`Server running on port ${SERVER_PORT} `);
            log.info(`Server running on port ${SERVER_PORT} `);
        })
    }

    private socketIOConnections(io: Server): void {

    }
}