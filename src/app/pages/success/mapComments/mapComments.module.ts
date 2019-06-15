import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { MapCommentsPage } from './mapComments';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
	declarations: [MapCommentsPage],
	imports: [
		CommonModule,
		IonicModule,
		ComponentsModule,
		RouterModule.forChild([
			{
				path: '',
				component: MapCommentsPage
			}
		])
	],
	exports: [MapCommentsPage]
})
export class MapCommentsPageModule {}
