Vue.component('forecast-item',{
	props: ['f'],
	template: 
	
		`<div class="muted" >
			<hr></hr>
			<h5><b>Date: {{ f.dateString}}</b></h5> 
			<h6><b>Time: {{f.timeString}}</b></h6>
			
			<p>
				Temperature: {{ f.temperature }}°F</br>
				Weather: {{ f.weather }}
			</p>
			
		</div>`
});