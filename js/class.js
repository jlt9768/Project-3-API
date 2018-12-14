//A single forecast item pulled from the JSON file
class Forecast{
	constructor(dt,main,weather){	
		this.time = new Date(dt*1000);
		this.dateString = this.time.toLocaleDateString();
		this.timeString = this.time.toLocaleTimeString();
		this.temperature = main.temp;
		this.weather = weather[0].description;
		this.weather = this.weather.charAt(0).toUpperCase() + this.weather.slice(1);
	}
}

class PinLocation{
	constructor(name, latitude, longitude){
		this.name = name;
		this.latitude = latitude;
		this.longitude = longitude;
	}
}