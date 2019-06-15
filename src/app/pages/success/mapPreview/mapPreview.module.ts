import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { MapPreviewPage } from './mapPreview';
import { ComponentsModule } from 'src/app/components/components.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
	declarations: [MapPreviewPage],
	imports: [
		CommonModule,
		IonicModule,
		ComponentsModule,
		FontAwesomeModule,
		RouterModule.forChild([
			{
				path: '',
				component: MapPreviewPage
			}
		])
	],
	exports: [MapPreviewPage]
})
export class MapPreviewPageModule {}
