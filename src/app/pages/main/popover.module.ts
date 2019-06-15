import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { MainPopover } from './popover';
import { PipesModule } from '../../pipes/pipes.module';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
	declarations: [MainPopover],
	imports: [
		CommonModule,
		IonicModule,
		ComponentsModule,
		RouterModule.forChild([
			{
				path: '',
				component: MainPopover
			}
		]),
		PipesModule
	],
	exports: [MainPopover]
})
export class MainPopoverModule {}
