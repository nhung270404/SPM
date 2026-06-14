const { createServer } = require("http");
const next = require("next");

process.env.NODE_ENV = process.env.NODE_ENV || "production";

const port = parseInt(process.env.PORT || "3000", 10);
const hostname = "0.0.0.0";
const dev = false;

const app = next({
    dev,
    hostname,
    port,
});

const handle = app.getRequestHandler();

app.prepare().then(() => {
    createServer(async (req, res) => {
        try {
            await handle(req, res);
        } catch (error) {
            console.error("SERVER_ERROR:", req.url, error);
            res.statusCode = 500;
            res.end("Internal Server Error");
        }
    }).listen(port, hostname, () => {
        console.log(`AutoGrade server running on http://${hostname}:${port}`);
    });
});