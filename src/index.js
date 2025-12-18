import dotenv from "dotenv";
import server from "./server.js";

dotenv.config({
    path: ".env",
});
const port = process.env.PORT || 9001;

/**
 * Starts the server and listens on the specified port.
 *
 * @async
 * @function startServer
 * @returns {Promise<void>} - Returns nothing.
 */

const startServer = async () => {
    try {
        const app = await server();

        app.listen(port, () => {
            console.log("server is running on port " + port);
        });
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

startServer();
