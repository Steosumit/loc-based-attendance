/*  File info: server app.js (node.js script version = 1)
    Developed by: Sumit Gupta(steosumit@gmail.com)
    Tested on: Google Chrome, Windows OS, Samsung Android Browser
*/

//Loading Components
var promptUser = require('./startup_prompt')
var promptSync = require('prompt-sync')({sigint: true}); //used to communicate with server owner in cmd
var session = require('express-session');
var express = require('express');
var path = require('path');
var fs = require('fs');
var fsPromises = require('fs').promises;
var bodyParser = require('body-parser');
const exp = require('constants');
const { type } = require('os');


var app = express();

//Global variables

var fileWrittenFlag = 0;
var status_code = 500;
var status_string = 'FAILED!';
var ip = '', id = '';
var ipQueue = [];
var idQueue = [];
var maxAgeTime = 1 * 60 * 1000 // in ms— milli-sec(SET THIS) 
var maxAgeTimeResetHr
var maxAgeTimeResetMin

//PROMPT interface during startup
var port;
var promptUserObject = promptUser (); //promptUser is a custom module --> Obj
maxAgeTime = promptUserObject.maxAgeTime;
maxAgeTimeResetHr = promptUserObject.maxAgeTimeResetHr;
maxAgeTimeResetMin = promptUserObject.maxAgeTimeResetMin;
port = promptUserObject.port;

console.info(`The server is ONLINE with 
maxAgeTime = ${maxAgeTime}, maxAgeTimeResetHr = ${maxAgeTimeResetHr}, maxAgeTimeMin = ${maxAgeTimeResetMin}, PORT = ${port}\n 
Here you go >> -thanks for using!`);

//MIDDLEWARE methods

app.use(express.json()); // parses JSON and matches 'Content-Type' header
app.use(session({
    secret : 'hash_key',
    resave : false,
    saveUninitialized : true,
    cookie : { maxAge : parseFloat(maxAgeTime)}, //convert to float for security purpose inc case its still str
    submittedIPs : [],
    sessionIDs : [],

}));

app.use('/', (req, res, next) => { //will be called for every requests even for the css and js files

    //Remember req is a circular obj and cannot be parsed as req alone but req.<property>

    console.log(`\nUSE method >> REQUESTED path --> ${req.path}`); 
    res.status(200, 'Connection OK');
    ip = req.socket.remoteAddress; //Get IP
    id = req.sessionID; //Get sessionID
    console.log(`Got IP Address -->${ip}, Got session ID --> ${id}`);
    //NOTE: submittedIPs property needs to be put manually which CANNOT be done in session({ - : -}) 
    //as its not a default property
    if (!req.session.submittedIPs) {
        req.session.submittedIPs = [];
        console.log('idQueue --> submittedIPs [] obj NOT existing, so created');
    }
    if (!req.session.sessionIDs) {
        req.session.sessionIDs = [];
        console.log('idQueue --> sessionIDs [] obj NOT existing, so created');
    }
    ipQueue = req.session.submittedIPs;
    idQueue = req.session.sessionIDs;
    console.log(`Got ipQueue --> ${req.session.submittedIPs}, idQueue --> ${req.session.sessionIDs}`);
    
    next(); //don't forget the next() method to pass to next statement

    //Send HTML CSS JS to browser
    // NO NEED IN CASE OF MIDDLEWARE res.sendFile(path.join(__dirname, 'public', 'Index.html')); 
})
app.use('/', express.static(path.join(__dirname, 'public'))); //Give the directory of CSS HTML JS
app.use(express.json()); //JSON object parsing


// Route definitions :
//GET methods

// ... NOT in use due to app.use() method, may be transferred to link_server.js in the future ...


//POST methods
app.post('/api', async (req, res, next) => {

    //UNCOMMENT TO OFF SERVER TEMPORARILY \/
    //res.status(403, 'NOT TAKING ATTENDANCE').send("SERVER OFF");
    
    //IP validation
    
    console.log(`POST method >> REQUESTED path --> ${req.path}`);
    console.log(`IP object --> ${JSON.stringify(req.session.submittedIPs)}, ID object --> ${JSON.stringify(req.session.sessionIDs)} `);
    //Declaring data object on Node.js side --> same as the JSON object sent from client side
    var dataObjectInNode_ = {email: '', name: '', subject: '', date: '', time: ''};

    //NOTE: Here after req.body we use the <input name="xyz" --> as key of JSON object/>
    dataObjectInNode_.email = req.body.email;
    dataObjectInNode_.name = req.body.name;
    dataObjectInNode_.subject = req.body.subject;
    dataObjectInNode_.date = req.body.date;
    dataObjectInNode_.time = req.body.time;

    //NOTE: Client Object --> JSON --> JSON.stringify(JSON formatted string) --> Converted to Mapping Obj
    // --> dataObjectInNode --> JSON.stringify --> console.log() [viewed as string instead of 
    //[object Object]] -->reverse to client--> jsonObj.json()--> Object

    console.log(`Received request to POST: ${JSON.stringify(dataObjectInNode_)} (Stringifiy object)`);
    
    //NOTE: res is like a writestream, anything happens to it goes as response .send(normal), .sendFile(file)
    //.json(to package JSON objects)

    //Test same IP duplicacy 
    if (!checkIP(req)) {
        console.log('checkIP() --> FALSE. POST request denied. Detected repeated attempt');
        //Change JSON data to be sent to client
        status_code = 500, status_string = 'Failed!'
        //res.status(403, 'Duplicate Attempt').sendFile(path.join(__dirname, 'public','violation.html'));
    } else {
        console.log('checkIP() --> TRUE. POST request accepted. Detected new attempt');

        await writeSheetInNode(dataObjectInNode_, req);
        //Change JSON data to be sent to client 
        status_code = 200/*not str*/, status_string = 'SUCCESS!'; 
        if (fileWrittenFlag == 1) {
            console.log('fileWrittenFlag ended with 1');
            // putting ipQueue/idQueue to session objects
            req.session.submittedIPs = ipQueue;
            req.session.sessionIDs = idQueue; //Remember sessionID is a property but sessionIDs is a self-made array
            console.log(`req.session.submittedIPs <-- ipQueue as : ${JSON.stringify(req.session.submittedIPs)} (Stringifiy object)`);
            console.log(`req.session.sessionIDs <-- idQueue as : ${JSON.stringify(req.session.sessionIDs)} (Stringifiy object)`);
        } else {
            console.log('filewrittenFlag ended with 0');
        }
    }

    // SUPER CAUTION --> DON'T remove the below 3 lines, it will make all requests approved... ISSUE NOT RESOLVED
    res.json({
        code: status_code,
        response: status_string
    });  
})


//Listening PORT

app.listen(port, () => {
    console.log(`Attendance Server is listening at PORT ${port} >>`);


});


//Routers(NOT in use now)

router = express.Router();

//Router route methods


//All function................................................................................


function checkIP (req) {
    if ((ipQueue.includes(ip)) || (idQueue.includes(id))) {
        console.log(`IP/ID: ${ip}/${id} already entered. Resubmission REJECTED`);
        return false;
    } else {
        console.log(`New IP/ID: ${ip}/${id} detected for this session. Submission APPROVED`);
        return true;
    }
}

function writeSheetInNode(dataObjectInNode, req) {

    console.log('\nWorking in writeSheetInNode(dataObjectInNode) >>');

    return new Promise( (resolve, reject) => { 
        var fieldArray = Object.keys(dataObjectInNode); //extract keys as a array; ['-', '-', '-']
        var recordArray = [
            dataObjectInNode.email, 
            dataObjectInNode.name, 
            dataObjectInNode.subject,
            dataObjectInNode.date,
            dataObjectInNode.time
            ]; // {'email' : '-', name : '-'} --> ['-', '-']

        //file format: '<coursename>_<year_of_start>-<year_of_end>_<subject>.csv' [full name with all small letters]

        var coursename = 'btechmtech', year = '2023-2028';
        var subjectname = dataObjectInNode.subject;
        var filename = `${coursename}_${year}_${subjectname}.csv`;
        var dataToWrite = recordArray[0] + ',' + recordArray[1] + '\n'; // not used
        var fileFlag = 1; // not used

        var bufferString = '', bufferString2 = '';

        recordArray.forEach((key, index)/*index 2nd data ++ itself*/ => {
        if(index < recordArray.length - 1){
            bufferString2 += key + ',';
        } else {
            bufferString2 += key + '\n';
        }
        console.log('bufferString2: ' + bufferString2);
        });

        fs.stat(filename, async (err) => {
            if (err){
                fieldArray.forEach((key, index)/*index 2nd data ++ itself*/ => {
                if(index < fieldArray.length - 1){
                    bufferString += key + ',';
                } else {
                    bufferString += key + '\n';
                }
                console.log('bufferString: ' + bufferString);
                }); 
                await fsPromises.appendFile(path.join(__dirname, filename), bufferString, 'utf8');
                console.log(`File not present, new file created: header bufferString written--> ${bufferString}`);
            } 
            fsPromises.appendFile(path.join(__dirname, filename), bufferString2, 'utf8');
            console.log(`Writing into file: data bufferString2 written --> ${bufferString2}`);
            //Pushing ip/id to ipQueue/idQueue as record entered successfully
            ipQueue.push(ip);
            idQueue.push(id);
            console.log(`ip: ${ip} pushed to ipQueue, id: ${id} pushed to idQueue`);
            console.log(`\nipQueue --> ${ipQueue}`);
            console.log(`\n\nidQueue --> ${idQueue}\n`)
            fileWrittenFlag = 1; //change fileWrittenFlag
            resolve();
        });
        
    });
}



    //function to add records with sync way(1 thread) by appendFile method
    // function putRecordsByAppendFile(data){
    //     console.log(`putRecordsByAppendFile ${data}`);
    //     fs.appendFile(filename, data, (err) => {
    //         if (err){
    //             console.log(err);
    //         } else {
    //             console.log('Record instance put >>');
    //         }
    //     });
    // }   

    // var bufferString = ''; //starts with empty buffer
    // function test(){
    //     fs.stat(filename, (err) => {
    //         if (err){
    //             fieldArray.forEach((key, index)/*index 2nd data ++ itself*/ => {
    //                 if(index < fieldArray.length - 1){
    //                     bufferString += key + ',';
    //                 } else {
    //                     bufferString += key + '\n';
    //                 }
    //                 console.log(bufferString);
    //             });
    //         }
    //     return bufferString;
    //     });
    // }

    // //Preparing the bufferString
    
    // function writing(testResponseString){
    //     recordArray.forEach((key, index)/*index 2nd data ++ itself*/ => {
    //         if(index < recordArray.length - 1){
    //             testResponseString += key + ',';
    //         } else {
    //             testResponseString += key + '\n';
    //         }
    //         console.log(testResponseString);
    //         return testResponseString;
    //     });
    // }

    // async function overall (){
    //     var testResponse = await test();
    //     var writingResponse = await writing(testResponse);
    //     putRecordsByAppendFile(writingResponse);
    // }

    // overall()

    //test for file existence, and otherwise create one using createWriteStream method
/*    function test(){
        return new Promise((resolve, reject) => {
            fs.stat(filename, (err) => {
                if (err){
                    const file = fs.createWriteStream(filename, { flag : 'a'});
                    fieldArray.forEach((key, index) => {
                        if (index < fieldArray.length - 1){
                            file.write(`${key},`);
                        } else {
                            file.write(`${key}\n`);
                        }
                    //console.log(`File didn't existed. Created one: ${filename}`);
                    });
                    resolve('New file created! >>');
                } else {
                    reject('File present! >>')
                }
            });
        });
    }

    test().then((previousOutput) => {
        console.log(`test() returns ${previousOutput}`);
        //dump into file and change status code/string
        putRecordsByAppendFile(bufferString);
        console.log(`BufferString: ${bufferString}`);
        status_code = 200;
        status_string = 'Attendance Recorded!';
    }).catch((previousOutput) => {
        console.log(`test() returns ${previousOutput}`);
        //dump into file and change status code/string
        putRecordsByAppendFile(bufferString);
        console.log(`BufferString: ${bufferString}`);
        status_code = 200;
        status_string = 'Attendance Recorded!';
    });
*/

/* 

*** Troublesome part below NOT RESOLVED [ISSUE: The code below handles appending by createWriteStream method, but 
is truncating the csv file each time it enters data]***

    fs.stat(filename, (err, fileState) => {

        if (err){

            console.log(`Creating ${filename} as it does not exists >>`);

            var file = fs.createWriteStream(filename, 'utf-8', { flag : 'a'});
            
            //creating new csv file if not existing and putting field headings
            i = 1;
            fieldNamesArray.forEach((key) => {
                
                if (i < fieldNamesArray.length){
                    file.write(key + ',');
                    i ++;

                } else {

                    file.write(key + '\n');
                }
            });

            console.log('Field names put in the file >>');
        }

        //Run it
        putRecords(); 
    });

    //Put records function to simplify stuffs
    
    function putRecords(){
        
        console.log('Working in putRecords() >>');
        var file = fs.createWriteStream(filename, {encoding :'utf8', flag : 'r+'});

        //putting records
        i = 1;
        recordArray.forEach((key) => {
            
            if (i < recordArray.length){
                file.write(key + ',');
                i ++;
            } else {
                file.write(key + '\n');
            }
        })
        // End of attendance entry request
        
        status_code = 'Attendance recorded!';
        status_code = 200;

        console.log('Records put >>');

        file.end();
}
    


    var file = fs.createWriteStream(filename, 'utf-8', 'w+');

    if (file){

        i = 0;
        recordArray.forEach((key) => {
            
            if (i < recordArray.length){
                file.write(key + ',');
                i ++;

            } else {
                file.write(key + '\n');
            }
        })




    } else {

        //creating new csv file if not existing
        i = 0;
        fieldNamesArray.forEach((key) => {
            
            if (i < fieldNamesArray.length){
                file.write(key + ',');
                i ++;

            } else {
                file.write(key + '\n');
            }
        })
    }
*/






