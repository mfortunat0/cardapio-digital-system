import morgan from "morgan";
import fs from "fs";
import path from "path";

const logDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const accessLogStream = fs.createWriteStream(path.join(logDir, "access.log"), {
  flags: "a",
});

morgan.token("body", (req: any) => JSON.stringify(req.body));

const morganFormat =
  ":method :url :status :res[content-length] - :response-time ms :body";

export const logger = morgan(morganFormat, { stream: accessLogStream });
export const loggerConsole = morgan("dev");
