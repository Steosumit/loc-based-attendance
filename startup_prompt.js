var readLineSync = require('readline-sync');
var startPromptObject = {
    maxAgeTime : 1 * 60 * 1000,
    maxAgeTimeResetHr : 11,
    maxAgeTimeResetMin : 45,
    port : 5000
} //global obj

function promptUser(){
    var answer = readLineSync.question("What's your name?");
    console.log(`Hi ${answer}`);
    console.log("Thanks for using this app - Sumit\nIn case of doubts, consult the documentation\nHere are the server start-up questions:");
    answer = readLineSync.question("Enter PORT TO BE USED >>>>");
    startPromptObject.port = answer;
    answer = readLineSync.question("Q. Enter max session life?(Number in milli sec, no spaces, 1s = 1000ms)  >>>>");
    startPromptObject.maxAgeTime = answer;
    console.log("\nNow we need hour and min separately.\nThe app uses hour style time i.e 13:45, 18 : 45 and NOT 1:45 PM or 6:45 PM");
    answer = readLineSync.question("\nQ. Session data reset time(HOUR)?(ONLY HOUR in number, no spaces)  >>>>");
    startPromptObject.maxAgeTimeResetHr = answer;
    answer = readLineSync.question("\nQ. Session data reset time(MIN)?(ONLY MIN in number, no spaces)  >>>>");
    startPromptObject.maxAgeTimeResetMin = answer;
    console.log("\n\nAll questions answered. In case of any abnormal behavior, please check the docs or contact support");
    
    return startPromptObject;

}


//See how to export, remember only functions are exported
module.exports = promptUser;