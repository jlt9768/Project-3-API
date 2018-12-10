class Forecast{
	constructor(dt,main,weather){
		
		this.time = new Date(dt*1000);
		this.dateString = this.time.toLocaleDateString();
		this.timeString = this.time.toLocaleTimeString();
		this.temperature = main.temp;
		this.weather = weather[0].description;
		this.weather = this.weather.charAt(0).toUpperCase() + this.weather.slice(1);
		this.max = main.temp_max;
		this.min = main.temp_min;
	}
	
}