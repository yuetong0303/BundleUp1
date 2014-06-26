
/*====Temperature Preferences====*/

var lowtemp = 45;
var hightemp = 75;
var pref = "default";

var feels_t = 0;

//ranges: <20, 20-50, >50
function setCold() {
	$("#right").removeClass("selected");
	$("#center").removeClass("selected");
	$("#left").addClass("selected");
	lowtemp = 20;
	hightemp = 50;
	pref = "cold";
}

//ranges: <45, 45-75, >75
function setWarm() {
	$("#left").removeClass("selected");
	$("#center").removeClass("selected");
	$("#right").addClass("selected");
	lowtemp = 45;
	hightemp = 75;
	pref = "warm";
}

//ranges: <35, 35-65, >65
function setDef() {
	$("#left").removeClass("selected");
	$("#right").removeClass("selected");
	$("#center").addClass("selected");
	lowtemp = 35;
	hightemp = 65;
	pref = "default";
}

function setPref() {
	var pref2 = localStorage.getItem("pref");
	if (pref2) {
		switch(pref2) {
			case "cold":
				setCold();
				break;
			case "warm":
				setWarm();
				break;
			default:
				setDef();
				break;
		}
	}
	else {
		setDef();
	}
}

function storePrefs() {
	localStorage.setItem("lowtemp", lowtemp);
	localStorage.setItem("hightemp", hightemp);
	localStorage.setItem("pref", pref);
	return true;
}



var err = 0;

function setErrors(err) {
	localStorage.setItem("err", err);
	console.log("Error set: " + err);
}

function loadErrors() {
	err = localStorage.getItem("err");
	console.log("Error retrieved: " + err);
	if(err==1) {
		console.log("Error: " + err);
		document.getElementById("loc_error").style.display='block';
		localStorage.setItem("err", 0);
	}
}


function getLocation(form) {
	var city = form.city.value;
	localStorage.setItem("city", city);
	var state = form.state.value;
	localStorage.setItem("state", state);
	localStorage.setItem("lowtemp", lowtemp);
	localStorage.setItem("hightemp", hightemp);
	localStorage.setItem("pref", pref);

	var url = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "," + state;
 	console.log(url);
 	$.ajax( {
 		type: 'POST',
 		url: url,
 		datatype: 'jsonp',
 		async: false,
 		success: function(data) {
 			if(data['message']) {
 					err = 1;
 					setErrors(err);
 					loadErrors();
 					localStorage.setItem("city", null);
 					localStorage.setItem("state", null);
 			}
 			else {
 					err = 0;
 					console.log("Success location");
 					setErrors(err);
 					document.location = "index.html";
 			}
 		}
 	});
}


function getLocation1(city1, state1) {
	var city = city1;
	localStorage.setItem("city", city);
	var state = state1;
	localStorage.setItem("state", state);
	localStorage.setItem("lowtemp", lowtemp);
	localStorage.setItem("hightemp", hightemp);
	localStorage.setItem("pref", pref);

	var url = "https://api.wunderground.com/api/871d6fab2c5007d4/geolookup/q/" + state + "/"+city+".json";
 	console.log(url);
 	var ret_val;
	$.ajax( {
		type : 'POST',
 		url: url,
 		dataType: 'jsonp',
 		async: false,
 		success: function(data) {
 			if(data['response']['results'] || data['response']['error']) {
 					err = 1;
 					console.log("Failed location");
 					setErrors(err)
 					loadErrors()
 					localStorage.setItem("city", null);
 					localStorage.setItem("state", null);
					ret_val = false;
 			}
 			else {
 					err = 0;
 					console.log("Success location");
 					setErrors(err);

 					document.location = "index.html";
					ret_val = true;
 			}
 		},
 		error: function(err) {
 			console.log(JSON.stringify(err))
 		}
 	});
	return ret_val;
}

function currentLocation()
{
	if (navigator.geolocation)
	{
		navigator.geolocation.getCurrentPosition(getWeather);
	}
	else
	{
		alert("Geolocation is not supported by this browser.");
	}
}

function getSavedLocation() {
	console.log(localStorage.getItem("city"));
	if (localStorage.getItem("city") === null || localStorage.getItem("city") === "null") {
		currentLocation();
	} else {
		getWeather(null, localStorage.getItem("city"), localStorage.getItem("state"));	
	}
}

function getWeather(position, city, state) {
	var city = city;
	var state = state;
	console.log(position)
	if (position != null) {
		var geoAPI = "https://api.wunderground.com/api/871d6fab2c5007d4/geolookup/q/"+ position.coords.latitude +","+ position.coords.longitude+".json";
		$.ajax ({
		  dataType : "jsonp",
		  url : geoAPI,
		  success : function(data) {
			console.log(data["location"])
			state = data['location']['state']
			console.log(state)
			city = data['location']['city']
			console.log(city)
			setWeather(city,state);
		  }
		});
	} else {
		setWeather(city,state);	
	}
}
function setWeather(city,state){
	var temp = 0;
/*
	var city = localStorage.getItem("city");
	var state = localStorage.getItem("state");
	*/
			document.getElementById("cold").style.display='none';
			document.getElementById("mild").style.display='none';
			document.getElementById("warm").style.display='none';
			document.getElementById("rain").style.display='none';
			document.getElementById("sunny").style.display='none';

	$("#loc").html(city + ', ' + state);
	var url = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "," + state;
	console.log(url);
	$.ajax( {
		type : "POST",
		dataType : "jsonp",
		url : url + "&callback=?",
		success : function(data) {
			if(data['message']) {
				err = 1;
				console.log("Failed location");
				localStorage.setItem("city", null);
				localStorage.setItem("state", null);
			}
			else {
				err = 0;
				console.log("Success location");
				setErrors(err);
				localStorage.setItem("city",city)
				localStorage.setItem("state",state)
			}
			temp = data['main']['temp'];
			ftemp = (9/5)*(temp - 273) + 32;
			ftemp = ftemp.toFixed(0);
			$("#temp").html(ftemp + " &deg;F");

			wind = data['wind']['speed'];
			$("#wind").html(wind + " mph");
			gusts = data['wind']['gust'];
			$("#gusts").html(gusts + " mph");

			humidity = data['main']['humidity'];
			$("#humid").html(humidity + "%");

			icon = data['weather'][0]['icon'];
			iconurl = "https://openweathermap.org/img/w/" + icon + ".png";
			$("#weathericon").attr("src", iconurl);
			desc = data['weather'][0]['main'];
			$("#desc").html(desc);
			switch(desc) {
				case "sky is clear":
				case "few clouds":
				case "shower rain":
					document.getElementById('desc').style.fontSize = "large";
					break;
				case "scattered clouds":
				case "broken clouds":
				case "Thunderstorm":
					document.getElementById('desc').style.fontSize = "medium";
					break;
				default:
					break;
			}

			code = data['weather'][0]['id'];

			if ([201, 202, 211, 212, 221, 231, 232].indexOf(code) > -1) {
				$("#alert_cond").html("thunderstorms");
				document.getElementById("alert").style.display='block';
			}
			else if([500, 501, 502, 503, 504, 511, 520, 521, 522, 531].indexOf(code) > -1) {
				$("#alert_cond").html("rain");
				document.getElementById("alert").style.display='block';
			}
			else {
				switch(code) {
					case 600:
					case 601:
					case 602:
						$("#alert_cond").html("snow");
						document.getElementById("alert").style.display='block';
						break;
					case 611:
					case 612:
						$("#alert_cond").html("sleet");
						document.getElementById("alert").style.display='block';
						break;
					case 615:
					case 616:
					case 620:
					case 621:
					case 622:
						$("#alert_cond").html("rain and snow");
						document.getElementById("alert").style.display='block';
						break;
					case 741:
						$("#alert_cond").html("fog");
						document.getElementById("alert").style.display='block';
						break;
					case 781:
					case 900:
						$("#alert_cond").html("tornado");
						document.getElementById("alert").style.display='block';
						break;
					case 901:
						$("#alert_cond").html("tropical storm");
						document.getElementById("alert").style.display='block';
						break;
					case 902:
					case 962:
						$("#alert_cond").html("hurricane");
						document.getElementById("alert").style.display='block';
						break;
					case 903:
						$("#alert_cond").html("extreme cold");
						document.getElementById("alert").style.display='block';
						break;
					case 904:
						$("#alert_cond").html("extreme heat");
						document.getElementById("alert").style.display='block';
						break;
					case 905:
					case 957:
						$("#alert_cond").html("high winds");
						document.getElementById("alert").style.display='block';
						break;
					case 906:
						$("#alert_cond").html("hail");
						document.getElementById("alert").style.display='block';
						break;
					default:
						break;
				}
			}
		},
		error : function(errorData) {
			alert("Error while getting weather data :: " + errorData.status);
		}
	});

	function getUV(hourly) {
		var UVmax = 0;
		var i = 0;
		for(i=0; i<24; i++) {
			if(hourly[i].uvi > UVmax) {
				UVmax = hourly[i].uvi;
			}
		}
		return UVmax;
	}

	$.ajax( {
		//5bb4e5428ca66275
		url : "https://api.wunderground.com/api/871d6fab2c5007d4/hourly/q/" + state + "/"+city+".json",
		dataType: "jsonp",
		success: function(parsed_json) {
			var hourly = parsed_json['hourly_forecast'];
			precip = hourly[0].pop;
			if (precip > 50) {
				setrain();
			}
			$("#precip").html(precip + "%");
			uvi = getUV(hourly);
			console.log(uvi);
			if (uvi > 5) {
				checkSun(city, state);
			}
			$("#uvi").html(uvi);

			feels_t = hourly[0]['feelslike']['english'];
			console.log("feels like temp is "+feels_t)
			$("#feels_t").html(feels_t + " &deg;F");
			listsuggestions(feels_t);
			toggleOptions(feels_t);
			//localStorage.setItem("feels_t", feels_t);
		},
		error: function() {
			$("#error").html("Problem with finding hourly.");
			$("#error").prop("hidden", false);
		}
	});

	$.ajax({
		url: "https://api.wunderground.com/api/871d6fab2c5007d4/forecast/q/" + state + "/"+city+".json",
		dataType: "jsonp",
		success: function(parsed_json){			
			hightemp = parsed_json['forecast']['simpleforecast']['forecastday'][0]['high']['fahrenheit'];
			$("#high").html(hightemp + " &deg;F");
			lowtemp = parsed_json['forecast']['simpleforecast']['forecastday'][0]['low']['fahrenheit'];
			$("#low").html(lowtemp + " &deg;F");
		},
		error: function() {
			$("#error").html("Problem with finding forecast.");
			$("#error").prop("hidden", false);
		}
	});
}

function getForecastHourly(timeOfDay) {
	var time;
	if (timeOfDay) {
	  switch (timeOfDay) {
	  	case 'Morning':
			time = 6;
		break;
		case 'Noon':
			time = 12;
		break;
		case 'Night': 
			time = 18;
		break; 
	  }
	}	
	
	$.ajax({
		url:"https://api.wunderground.com/api/5bb4e5428ca66275/hourly/q/"
		+state+"/"+city+".json",
		dataType:"jsonp",
		success: function(parsed_json) {
			var hourly = parsed_json['hourly_forecast'];
			for (var i = 0; i < hourly.length; i++) {
				if (hourly[i].FCTTIME.hour >= time) {
					var temp = hourly[i].temp.english;
					var wind_mph = hourly[i].wspd.english;
					var humidity = hourly[i].humidity;
					var precip = hourly[i].pop;
					$("#temp").html(temp_f);
					$("#wind").html(wind_mph);
					$("#humid").html(humidity);
					$("#precip").html(precip);
					break;
				}
			}
		},
		error: function() {
			$("#error").html("Problem with finding forecast.");
			$("#error").prop("hidden", false);
		}
	});
}

function findcondition(temp) {
	lowtemp = localStorage.getItem("lowtemp");
	hightemp = localStorage.getItem("hightemp");
	if (temp < lowtemp) {
		return 'cold';}
	if (temp < hightemp) {
		return 'mild';}
	return 'warm';
}

function listsuggestions(temp) {
	var condition = findcondition(temp);
	document.getElementById(condition).style.display='block';
}

/* 
====> If 2+ temp preferences overlap (i.e. changing between "Less" and
	"Average" doesn't change anything), remove options so there isn't 
	confusion
*/
function toggleOptions(feelslike) {
	if (feelslike < 20) {
		var condition1 = 'cold';
	}
	else if (feelslike < 50) {
		var condition1 = 'mild';
	}
	else {
		var condition1 = 'warm';
	}
	if (feelslike < 35) {
		var condition2 = 'cold';
	}
	else if (feelslike < 65) {
		var condition2 = 'mild';
	}
	else {
		var condition2 = 'warm';
	}
	if (feelslike < 45) {
		var condition3 = 'cold';
	}
	else if (feelslike < 75) {
		var condition3 = 'mild';
	}
	else {
		var condition3 = 'warm';
	}
	if ((condition1==condition2) && (condition2==condition3)) {
		document.getElementById("cond_prefs").style.display='none';
	}
	else if (condition1==condition2) {
		if($("#left").hasClass("selected")) {
			$("#left").removeClass("selected");
			$("#center").addClass("selected");
		}
		document.getElementById("left").style.display='none';
	}
	else if (condition2==condition3) {
		if($("#right").hasClass("selected")) {
			$("#right").removeClass("selected");
			$("#center").addClass("selected");
		}
		document.getElementById("right").style.display='none';
	}
}

function changesuggestions() {
	//var feels_t = localStorage.getItem("feels_t");
	document.getElementById("cold").style.display='none';
	document.getElementById("mild").style.display='none';
	document.getElementById("warm").style.display='none';

	listsuggestions(feels_t);
}

function setrain() {
	document.getElementById('rain').style.display='block';
}

function toggleDetails() {
	var val = $("#weatherdetails").html();
	if(val.indexOf("More") > -1) {
		$("#weatherdetails h4").html("Less Weather Details");
	}
	else {
		$("#weatherdetails h4").html("More Weather Details");
	}
}

function setSunglasses() {
	document.getElementById('sunny').style.display='block';
}

function checkSun(city, state) {
	//var d = new Date();
	//var chour = d.getHours();
	//var cmin = d.getMinutes();
	
	$.ajax({
		url:"https://api.wunderground.com/api/5bb4e5428ca66275/astronomy/q/"
		+state+"/"+city+".json",
		dataType:"jsonp",
		success: function(parsed_json) {
			var chour = parseInt(parsed_json["moon_phase"]["current_time"]["hour"]);
			var sunset_hour = parseInt(parsed_json["moon_phase"]["sunset"]["hour"]);

			if (chour<sunset_hour) {
				setSunglasses();
			}
		},
		error: function() {
			$("#error").html("Problem with finding sunrise/sunset.");
			$("#error").prop("hidden", false);
		}
	});
}

function changeLocation()
{
	$("#loc").val($("#new_city").val() + "," + $("#new_state").val());
	return getLocation1($("#new_city").val(), $("#new_state").val());
}

function createlightboxlogin() {
	document.getElementById('lightlogin').style.display='block';
	document.getElementById('fade').style.display='block';
}

function closelightbox() {
	document.getElementById('fade').style.display='none';
	document.getElementById('lightlogin').style.display='none';
}

//press 'Enter' to submit location search
$(document).keypress(function(event) {
	if (event.keyCode == 13) {
		event.preventDefault();
		changeLocation();
	}
})