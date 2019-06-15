import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { SuccessPage } from './success';
import { PipesModule } from '../../pipes/pipes.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
	declarations: [SuccessPage],
	imports: [
		CommonModule,
		FontAwesomeModule,
		IonicModule,
		ComponentsModule,
		RouterModule.forChild([
			{
				path: '',
				component: SuccessPage
			}
		]),
		PipesModule
	],
	exports: [SuccessPage]
})
export class SuccessPageModule {}
