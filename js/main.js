	var app = new Vue({
		el: '#app',
		data: {
			title: "Weather App",
			json: null,
			city: "Rochester",
			lat: 43.15,
			lon: -77.61,
			forecasts: [],
			map: null,
			infowindow: null,
			markers: [],
			limit: 10,
			userID: null
		},
		methods:{
			// Initialize the map
			initMap() {
				let mapOptions = {
					center: {lat: 43.083848, lng: -77.6799},
					zoom: 16,
					mapTypeId: google.maps.MapTypeId.ROADMAP
				};
				this.map = new google.maps.Map(document.querySelector('#map'), mapOptions);
				this.map.mapTypeId = 'satellite';
				this.map.setTilt(45);

				// Get the weather map user's ID
				if(localStorage.getItem("weather-map-user-id") == null){
					// If no user ID currently exists generate a new one and save to localStorage
					// GUID generation code from https://stackoverflow.com/a/2117523
					let guid = ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
					localStorage.setItem("weather-map-user-id", guid);
					userID = localStorage.getItem("weather-map-user-id");
				}else{
					// If a user ID does exist generate map pins using the matching data for this user on firebase
					userID = localStorage.getItem("weather-map-user-id");

					firebase.database().ref(userID).once('value').then(function(snapshot) {
						let pinLocations = snapshot.val();

						// Check whether any pins are currently saved in firebase
						if (pinLocations != null){
							// If so generate markers using firbase pin data
							for (var i = 0; i < Object.keys(pinLocations.locations).length; i++) {
								app.lat = pinLocations.locations[i].latitude;
								app.lon = pinLocations.locations[i].longitude;
								app.searchByClick();
							}
						}else{
							// If not just generate the default pin
							app.searchByClick();
						}
					});
				}

				//Event listner to see when the user clicks on the map itself
				google.maps.event.addListener(this.map, 'click', function(e) {
					app.lat = e.latLng.lat();
					app.lon = e.latLng.lng();
					app.searchByClick();
				});
			},

			//Adds a marker at the given city
			addMarker(latitude, longitude, title, contentText){
				let position = {lat:latitude, lng:longitude};
				let marker = new google.maps.Marker({position: position, map: app.map, title: title} );
				
				marker.infowindow = new google.maps.InfoWindow({
				content: contentText
				});
				marker.addListener('click', function(e){
					app.map.setCenter(new google.maps.LatLng(this.getPosition().lat(), this.getPosition().lng()));
					marker.infowindow.open(app.map, marker);
					app.city = title;
					app.forecast();
				});
				marker.infowindow.open(app.map, marker);
				app.markers.push(marker);
			},

			//Searches the OpenWeatherMap api for the city that first matches the name that was input
			search(){
				if (this.city == "") return;
				fetch("https://api.openweathermap.org/data/2.5/weather?q=" + this.city + "&units=imperial&appid=575bcc8891dfe93ad254039711d54a69")
				.then(response => {
					if(!response.ok){
						alert("No city with specified name found");
						return null;
					}
					return response.json();
				})
				.then(json => {
					
					if(json != null){
						this.build(json);
					}

				})
			}, // end search
			
			//Searches for the weather near where the map was clicked
			searchByClick(){
				fetch("https://api.openweathermap.org/data/2.5/weather?lat="+this.lat+"&lon="+this.lon+"&units=imperial&appid=575bcc8891dfe93ad254039711d54a69")
				.then(response => {
					if(!response.ok){
						throw Error(`ERROR: ${response.statusText}`);
					}
					return response.json();
				})
				.then(json => {	
					this.city = json.name;
					this.build(json);
				})
			},

			//Gets the forecast at the designated city
			forecast(){
				fetch("https://api.openweathermap.org/data/2.5/forecast?q=" + this.city + "&units=imperial&appid=575bcc8891dfe93ad254039711d54a69")
				.then(response => {
					if(!response.ok){
						throw Error(`ERROR: ${response.statusText}`);
					}
					return response.json();
				})
				.then(json => {	
					this.forecasts=[];
					for(let i = 0; i < this.limit;i++){
						this.forecasts.push(new Forecast(json.list[i].dt,json.list[i].main,json.list[i].weather));
					}
					
				})
			},

			//Centers the map around the city
			//Sets up the marker content for the marker at the given city
			build(json){
					this.json = json;
					app.map.setCenter(new google.maps.LatLng(this.json.coord.lat, this.json.coord.lon));
					let weather = json.weather[0].description;
					weather = weather.charAt(0).toUpperCase() + weather.slice(1);
					app.addMarker(json.coord.lat, json.coord.lon, this.city,
					// Content that will be displayed, currently just in the created marker
					'<p>'
					+
						'<h2>' + this.city + '</h2>' + '<br\>' +
						"Temperature: " + json.main.temp + "°F" + '<br\>' +
						"Weather: " + weather
					+
					'</p>'
					);
					this.forecast();
			},

			setZoom : function(level){
				app.map.setZoom(level);
			},
			
			expandAllPins : function(){
				for (var i = 0; i < app.markers.length; i++) {
					app.markers[i].infowindow.open(app.map, app.markers[i]);
				}
			},
			
			collapseAllPins : function(){
				for (var i = 0; i < app.markers.length; i++) {
					app.markers[i].infowindow.close();
				}
			},

			removeAllPins : function(){
				for (var i = 0; i < app.markers.length; i++) {
					app.markers[i].setMap(null);
				}
				app.markers = [];
			},

			saveAllPins : function(){
				// Get all Pin locations
				let pinLocations = [];
				for (var i = 0; i < app.markers.length; i++) {
					pinLocations.push(new PinLocation(app.markers[i].title, app.markers[i].getPosition().lat(), app.markers[i].getPosition().lng()));
				}
				
				// Push the data to firebase using the cached user ID
				let path = userID;
				firebase.database().ref(path).set({ // over-writes old values
					locations: pinLocations
				});
			}
		} // end methods
	});