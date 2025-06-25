
//components loading

var flag = 0; //flag for location validation
var inputDataFlag = 1; //flag for validating input data( email/name)

/* Issue with global local scope of these variables, presently they are not used in methods. 
Instead we extract ele. again*/ //(NOT RESOLVED)

function main() {

	// variables from HTML elements 
	spinner_overlay = document.getElementById('spinner_overlay');
	spinner_element = document.getElementById('spinner_element');

	button = document.getElementById('button_id');
	bypass_button = document.getElementById('report_button_id');
	message = document.getElementById('message_label_id');

	email_label = document.getElementById('email_label_id');
	email_input = document.getElementById('email_input_id');
	
	name_input = document.getElementById('name_input_id');
	name_label = document.getElementById('name_label_id');

	combobox_input = document.getElementById('combobox_id');
	
	// *** ``` backsticks must be used for ${} notation
	console.log(`Variables loaded with flag = ${flag}, inputDataFlag = 0`);

	//All listeners after DOM
	button.addEventListener('click', submit);
	bypass_button.addEventListener('click', bypassSubmit);
	email_input.addEventListener('change', emailValidation);
}	



//global variables
const timeStamper = new Date();
var date = `${timeStamper.getDate()}/${timeStamper.getMonth()}/${timeStamper.getFullYear()}`;
var time = `${timeStamper.getTime()}`;	
var latitude = 0.0;
var longitude = 0.0;
var message, name_input, bypass_button ,email_input, spinner_element, spinner_overlay, button;

// Functions......................................................................................................

function emailValidation(event){
	
	console.log(`Validating email string in emailValidation() >>`);
	console.log(`String: ${email_input.value}`);
	
	var testText = email_input.value;
	
	if ((testText.indexOf('@')=== -1) || (testText.indexOf('.')=== -1)){
		email_label.innerHTML = `ENTER EMAIL<br><p style='color : 'red'; fontsize : 2px;'>-email invalid</p>`;
		//inputDataFlag =	 0
		inputDataFlag = 0;
		console.log('inputDataFlag 0');

	} else {
		email_label.innerHTML = "ENTER EMAIL";
		inputDataFlag = 1;
		console.log('inputDataFlag 1');
	}
}


function submit(event) {
	
	//prevent reload as Geolocation API takes time
	event.preventDefault();
	
	console.log("working on submit function >>");

	// NOTE: This API needs HTTPS outside of development env.
	// Geolocation API START.........................................................................................................

	if (navigator.geolocation){

		console.log("framework supportable >>	");
		
		if (inputDataFlag == 1) {

			console.log('inputDataFlag 1');
			// navigator.geolocation.getCurrentPosition launches showPosition the moment it gets any real value API
			navigator.geolocation.getCurrentPosition(showPosition, processIT);
		
		} else {
			alert("Invalid input data!");
			console.log('inputDataFlag 0');
		}
		
		function processIT(something){
			
			alert(`Location validation failed ${JSON.stringify(something)}`);
			
			message.innerHTML = "Location validation failed! (Error code 2)" ;
			console.log(`Location validation failed, something = ${something}>>`);
		
			showPosition(something);
		}
	
		function showPosition(position){
			
			console.log("Collecting position >>");

			latitude = position.coords.latitude;
			longitude = position.coords.longitude;

			//console.log('Got location >> \nLatitude :'+ latitude.toString() +'\n Longitude :'+ longitude.toString());
			console.log(`Got location >> \nLatitude :${latitude}\nLongitude :${longitude}`);
			validatePosition();
		}

	} else {

		alert("Your browser does not support the framework(Error code 1)");
	
	}
}
	//Geolocation API END...........................................................................................................

/*	
LOCATION TEST [CHANGE LOCATION HERE]
FORMAT polygon = [[x1,y1], [x2,y2], [x3,y3], ...] -coordinates of edges of the definite room
*/

function validatePosition(){

	console.log('Working in validatePosition() >>');
	//Coordinates of the room(SET THIS)
	var x = latitude, y = longitude;
	var polygon = [[23.2027695, 72.6439792], [23.2027661, 72.6439791], [23.2095744, 72.630272], [23.2027559, 72.6439962]];
	var n = polygon.length;
	var i = 0, count = 0 ; //counter
	for (i = 0; i < n; i++) {
		var x1 = polygon[i] [0], y1 = polygon[i] [1];
		var x2 = polygon[(i + 1) % n][0], y2 = polygon[(i + 1) % n][1]; //modulo ensures that the points are taken in a circle

		if ((((y1 <= y) && (y <= y2)) || ((y2 <= y) && (y <= y1))) && 
		(x <= (x2 -x1) * (y - y1)/(y2 - y1) + x2)) {
			count+= 1;
		}
	}
	
	if ((count % 2) == 0) {
		flag = 0;
	} else {
		// Set flag to 1(TRUE)
		flag = 1
		console.log(`Location validation FLAG 1, count value : ${count}>>`);
		writeSheetInJS(flag);
	}

	console.log(``);
	
	if (flag == 0){ 
		console.log(`Location validation FLAG 0, count value : ${count}>>`); 
		alert("Location out of bound! Go to the defined classroom location, and try again(ERROR CODE 3)\n\
	Contact support or the developer if you think this is a mistake");
	}

	// var coordinatesOfRoom = []
	// var room_top_latitude = 0;
	// var room_top_longitude = 0;
	// var room_bottom_latitude = 1000;
	// var room_bottom_longitude = 1000;

	
	
	// if ((latitude >= room_top_latitude) && (latitude <= room_bottom_latitude)){

	// 	if ((longitude >= room_top_longitude) && (longitude <= room_bottom_longitude)){
			
	// 		//Set flag to 1(TRUE)
	// 		flag = 1
	// 		console.log("Location validation FLAG 1 >>");
	// 		writeSheetInJS(flag);
	// 	}
	// }

	// If both/one condition fail, alert location validation fail as still FLAG = 0
	
} 



function bypassSubmit(event){
	
	//Prevent reload
	event.preventDefault()

	console.log("working in bypassSubmit() >>");

	var bypassWarningText = `If instructor is absent in class after 15min of class commencement then bypassing location validation is expected to be used. Bypassing enables you to record attendance without location validation— by being outside the class. Be cautious that giving false bypass request may invite
disciplinary action.
P.S: Individual responses are being recorded. For more info, check T&C.

DO YOU WANT TO REPORT NO INSTRUCTOR?`

	var bypass_alert_ans = confirm(bypassWarningText);

	if (bypass_alert_ans == true){
		console.info("By bypass_alert_ans TRUE>>");
	} else {
		console.info("By bypass_alert_ans FALSE>>");
	}
}


function writeSheetInJS(flag_boolean) {

	console.log("Working in writeSheetInJS function >>");
	//Update date & time
	date = `${timeStamper.getDate()}/${timeStamper.getMonth()}/${timeStamper.getFullYear()}`;
	time = `${timeStamper.getTime()}`;

	console.log(`Date and Time updated: date >> ${date}, time >> ${time}`);

	if (flag_boolean == 1){

		console.log("Flag 1 in writeSheetInJS function >>");

		//Declaring the object--ya mapping :) -- to be sent as POST request
		const dataObject = { name: name_input.value,
			email: email_input.value,
			subject: combobox_input.value,
			date : date,
			time : time
		};

		console.log(dataObject);

		//options to fetch as object --> JSON
		var options = {
			method : 'POST',
			headers : {
				'Content-Type': 'application/json'
			},
			body : JSON.stringify(dataObject)// <-- Obj to JSON formatted string
			//P.S: something.json() is used to JSON --> Obj 
		};

		//FETCH method
		
		async function fetchMethod(){
			
			console.log("Working in async fetchMethod() >>");
			//add animation
			document.getElementById('spinner_overlay').style.display = 'block';
			document.getElementById('spinner_element').style.display = 'block';
			document.getElementById('button_id').style.visibility = 'hidden';
			document.getElementById('report_button_id').style.visibility = 'hidden';

			var postResponse = await fetch('/api', options); // NOTE: await always returns a Promise 
			
			console.log("Sent request --> Got response!");
			var data = await postResponse.json(); //Obj --> JSON(stringify) -->Server --> JSON --> Obj(.json())
			//Print the received response of POST request
			console.log(data);
			//Change message label (HTML in innerHTML)
			message.innerHTML = `${data.response}<br>Ended with CODE ${data.code}<br>Reload for doubtful attempts`;// <-- HTML code here, innerHTML
			console.log(data.code);
			
			//sleep in JS in flexing way :)
			await new Promise( (resolve, reject) => {
				setTimeout(resolve, 5 * 1000); // wait for the resolve() for 5 * 1000 s
			});
			//Remove animation
			document.getElementById('spinner_overlay').style.display = 'none';
			document.getElementById('spinner_element').style.display = 'none';
			document.getElementById('message_label_id').style.fontSize = '20';

			//NOTE: (!data.code == 200) tests NULL and (data.code !== 200) tests value
			if (data.code !== 200) {
				console.log('Redirecting as received STATUS CODE != 200...');
				window.location.replace('violation.html');
			}
			

		}
		fetchMethod();

	} else {
		alert("Flag not 1");
		console.log("Flag not 1 in writeSheetInJS function");
	}


}







// 	if (flag_boolean == 1){
// 		var fs = require("fs");
// 		console.log("fs created for reading writing files >>");

// 		data_set = [name_input, email]

// 		fs.writeFile("records.csv", data_set, err => { 
// 			if (err) {
// 				console.log(err);
// 			}
// 			console.log("Writing done >>"); 
// 		})




// 	} else {

// 		alert("Flag not 1.(ERROR CODE 3)");
// 	}
// }









function getDeviceInfo(){



//later....................... get unique identifier of a device

}


//All Listeners before DOM.................................................................................................

document.addEventListener('DOMContentLoaded', main);
