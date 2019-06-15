import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { MapPage } from './map';
import { ComponentsModule } from 'src/app/components/components.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
	declarations: [MapPage],
	imports: [
		CommonModule,
		ComponentsModule,
		IonicModule,
		ReactiveFormsModule,
		RouterModule.forChild([
			{
				path: '',
				component: MapPage
			}
		])
	],
	exports: [MapPage]
})
export class MapPageModule {}
