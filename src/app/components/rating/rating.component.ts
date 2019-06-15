import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
	selector: 'app-rating',
	templateUrl: './rating.component.html',
	styleUrls: ['./rating.component.scss']
})
export class RatingComponent implements OnInit {
	@Input()
	public ratingCount: number = 0;

	@Input()
	public ratingAve: number = 0;

	@Output()
	public starClick = new EventEmitter<number>();

	clickDefined = false;

	constructor() {}

	ngOnInit() {
		this.ratingCount = Number(this.ratingCount);
		this.clickDefined = this.starClick.observers.length > 0;
	}

	onStarClick(starInt: number) {
		this.starClick.emit(starInt);
	}
}
