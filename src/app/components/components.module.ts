import { NgModule } from '@angular/core';
import { RatingComponent } from './rating/rating.component';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search/search.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@NgModule({
	declarations: [RatingComponent, SearchComponent],
	imports: [CommonModule, ReactiveFormsModule, FormsModule],
	exports: [RatingComponent, SearchComponent]
})
export class ComponentsModule {}
