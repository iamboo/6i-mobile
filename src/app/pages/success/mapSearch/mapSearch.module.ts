import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { MapSearchPage } from './mapSearch';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
	declarations: [MapSearchPage],
	imports: [
		CommonModule,
		IonicModule,
		ComponentsModule,
		RouterModule.forChild([
			{
				path: '',
				component: MapSearchPage
			}
		])
	],
	exports: [MapSearchPage]
})
export class MapSearchPageModule {}
