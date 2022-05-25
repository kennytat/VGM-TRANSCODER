import { Component } from '@angular/core';


@Component({
	selector: 'vgm-converter-root',
	templateUrl: 'app.component.html',
	styleUrls: ['app.component.scss'],
})
export class AppComponent {
	constructor() { }

	async test() {
		const test = await fetch('http://localhost:41919/items/list/jing-shu-xi-lie.00-dao-lun-zong-jie.06-shu-shi-de.json');
		console.log(test);
	}


}
