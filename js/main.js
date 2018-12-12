	//let map;
	//let infowindow;
	//let markers = [];

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
			limit: 10
		},
		methods:{
			initMap() {
				let mapOptions = {
					center: {lat: 43.083848, lng: -77.6799},
					zoom: 16,
					mapTypeId: google.maps.MapTypeId.ROADMAP
				};
				this.map = new google.maps.Map(document.querySelector('#map'), mapOptions);
				//for(let cs of coffeeShops){
				//	addMarker(cs.latitude, cs.longitude, cs.title);
				//}
				this.map.mapTypeId = 'satellite';
				this.map.setTilt(45);
				//Event listner to see when the user clicks on the map itself
				google.maps.event.addListener(this.map, 'click', function(e) {
					console.log(e.latLng.lat() + ", " + e.latLng.lng());
					app.lat = e.latLng.lat();
					app.lon = e.latLng.lng();
					app.searchByClick();
				});
				this.searchByClick();
			},
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
			makeInfoWindow(position, msg){
				if(app.infowindow) app.infowindow.close();		
				app.infowindow = new google.maps.InfoWindow({map: app.map, position: position, content: "<b>" + msg + "<b>" });
			},
			//Searches the OpenWeatherMap api for the city that first matches the name that was input
			search(){
				//console.log(this.city);
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
			forecast(){
				//if (! this.term.trim()) return;
				fetch("https://api.openweathermap.org/data/2.5/forecast?q=" + this.city + "&units=imperial&appid=575bcc8891dfe93ad254039711d54a69")
				.then(response => {
					if(!response.ok){
						throw Error(`ERROR: ${response.statusText}`);
					}
					return response.json();
				})
				.then(json => {	
					console.log(json);
					this.forecasts=[];
					for(let i = 0; i < this.limit;i++){
						this.forecasts.push(new Forecast(json.list[i].dt,json.list[i].main,json.list[i].weather));
					}
					
				})
			},
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
				console.log(level);
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
			}
		} // end methods
	});