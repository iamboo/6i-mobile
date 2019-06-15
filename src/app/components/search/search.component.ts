import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

@Component({
	selector: 'app-search',
	templateUrl: './search.component.html',
	styleUrls: ['./search.component.scss']
})
export class SearchComponent {
	@Input()
	public placeHolderText: string = '';

	@Output()
	public searchChange = new EventEmitter<string>();

	public filterText: string = '';
	public searchControl: FormControl = new FormControl();

	constructor() {
		this.searchControl.valueChanges.pipe(debounceTime(200)).subscribe(value => {
			this.filterText = value;
			this.searchChange.emit(value);
		});
	}
}
