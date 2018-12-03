	let map;
	let infowindow;
	let markers = [];
    function initMap() {
		let mapOptions = {
			center: {lat: 43.083848, lng: -77.6799},
			zoom: 16,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		map = new google.maps.Map(document.querySelector('#map'), mapOptions);
		//for(let cs of coffeeShops){
		//	addMarker(cs.latitude, cs.longitude, cs.title);
		//}
		map.mapTypeId = 'satellite';
		map.setTilt(45);
		//Event listner to see when the user clicks on the map itself
		google.maps.event.addListener(map, 'click', function(e) {
			console.log(e.latLng.lat() + ", " + e.latLng.lng());
			app.lat = e.latLng.lat();
			app.lon = e.latLng.lng();
			app.searchByClick();
		});

    }
	function addMarker(latitude, longitude, title, contentText){
		let position = {lat:latitude, lng:longitude};
		let marker = new google.maps.Marker({position: position, map: map, title: title} );
		
		let infowindow = new google.maps.InfoWindow({
          content: contentText
        });
		marker.addListener('click', function(){
			infowindow.open(map, marker);
			app.city = title;
		});
		infowindow.open(map, marker);
		markers.push(marker);
	}
	function makeInfoWindow(position, msg){
	
		if(infowindow) infowindow.close();		
		infowindow = new google.maps.InfoWindow({map: map, position: position, content: "<b>" + msg + "<b>" });
	
	}
	
	
	const app = new Vue({
		el: '#app',
		data: {
			title: "Weather App",
			json: null,
			city: "Rochester",
			lat: 43.15,
			lon: -77.61
		},
		created(){
			this.searchByClick();
		},
		methods:{
			//Searches the OpenWeatherMap api for the city that first matches the name that was input
			search(){
				//if (! this.term.trim()) return;
				fetch("https://api.openweathermap.org/data/2.5/weather?q=" + this.city + "&units=imperial&appid=575bcc8891dfe93ad254039711d54a69")
				.then(response => {
					if(!response.ok){
						throw Error(`ERROR: ${response.statusText}`);
					}
					return response.json();
				})
				.then(json => {	
					console.log(json);
					this.result = json;
					map.setCenter(new google.maps.LatLng(json.coord.lat, json.coord.lon));
					addMarker(json.coord.lat, json.coord.lon, this.city,
					
					//Content that will be displayed, currently just in the created marker
					'<p>'
					+
						'<h2>' + this.city + '</h2>' + '<br\>' +
						"Temperature: " + json.main.temp + "°F" + '<br\>' +
						"Weather: " + json.weather[0].main
					+
					'</p>'
					)
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
					console.log(json);
					this.result = json;
					map.setCenter(new google.maps.LatLng(json.coord.lat, json.coord.lon));
					this.city = json.name;
					addMarker(json.coord.lat, json.coord.lon, this.city,
					//Content that will be displayed, currently just in the created marker
					'<p>'
					+
						'<h2>' + this.city + '</h2>' + '<br\>' +
						"Temperature: " + json.main.temp + "°F" + '<br\>' +
						"Weather: " + json.weather[0].main
					+
					'</p>'
					);
				})
			},
			setZoom : function(level){
				map.setZoom(level);
				console.log(level);
			}
		} // end methods
	});