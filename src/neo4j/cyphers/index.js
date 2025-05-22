// const fs = require('fs')

// module.exports = file => {
//     try {
//         const buffer = fs.readFileSync(`${__dirname}/${file}.cypher`)
//         return buffer.toString();
//     } catch (err) {
//         //console.log(err);
//         return false;
//     }
// }

import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default (file) => {
    try {
        const buffer = fs.readFileSync(`${__dirname}/${file}.cypher`);
        return buffer.toString();
    } catch (err) {
        return false;
    }
};