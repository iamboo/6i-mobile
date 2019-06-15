import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { TodoPage } from './todo';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
	declarations: [TodoPage],
	imports: [
		CommonModule,
		IonicModule,
		ComponentsModule,
		RouterModule.forChild([
			{
				path: '',
				component: TodoPage
			}
		])
	],
	exports: [TodoPage]
})
export class TodoPageModule {}
