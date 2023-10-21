import mongoose, { Mongoose } from "mongoose";
import { config } from "./config";
import Logger from "bunyan";

const log: Logger = config.createLogger('setUpDatabase');

export default () => {          //an anonymous function
    const connect = ()  => {
        mongoose.connect(`${config.DATABASE_URL}`)
        .then(() => {
            // console.log("Successfully connected to Database");
            log.info("Successfully connected to Database");
        })
        .catch((error) => {
            // console.log("Connection to Database failed", error);
            log.error("Connection to Database failed", error);
            return process.exit(1);
        })
    };
    connect();
    mongoose.connection.on('disconnected', connect); //if DB is disconnected it will try to connect again
}