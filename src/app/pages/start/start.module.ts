import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { StartPage } from './start';

@NgModule({
	declarations: [StartPage],
	imports: [
		CommonModule,
		IonicModule,
		RouterModule.forChild([
			{
				path: '',
				component: StartPage
			}
		])
	],
	exports: [StartPage]
})
export class StartPageModule {}
