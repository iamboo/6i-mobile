import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { MainPage } from './main';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
	imports: [
		CommonModule,
		IonicModule,
		RouterModule.forChild([
			{
				path: '',
				component: MainPage
			}
		]),
		PipesModule
	],
	declarations: [MainPage]
})
export class MainPageModule {}
