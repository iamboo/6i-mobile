import { NgModule } from '@angular/core';
import { SafeHtmlPipe } from './safe-html.pipe';
import { FilterPipe } from './filter.pipe';
@NgModule({
	declarations: [ SafeHtmlPipe, FilterPipe],
	imports: [],
	exports: [SafeHtmlPipe, FilterPipe]
})
export class PipesModule {}
