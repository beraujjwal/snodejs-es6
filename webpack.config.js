import path from "path";
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
    entry: "./src/app.js",
    target: "node", // Important for backend apps
    externals: {
        "node:util": "commonjs util",
    },
    output: {
    filename: "bundle.js",
        path: path.resolve(__dirname, "dist"),
    },
    mode: "production",
};