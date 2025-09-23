import User from '../models/user.model.js';
//const userGraph = require('../neo4j/services/user');

export const xxxxx = function(messageBody) {
    try{
        const message = String(messageBody.value);
        const { XXXXXXXX } = JSON.parse(message);
        User.create({
            XXXXXXXX
        });
    } catch(ex){
        console.log(ex);
    }
};