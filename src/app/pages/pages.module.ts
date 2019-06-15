import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AccountPageModule } from './account/account.module';
import { MainPageModule } from './main/main.module';
import { MainPopoverModule } from './main/popover.module';
import { StartPageModule } from './start/start.module';
import { SuccessPageModule } from './success/success.module';
import { MapPageModule } from './success/map/map.module';
import { MapCommentsPageModule } from './success/mapComments/mapComments.module';
import { MapSearchPageModule } from './success/mapSearch/mapSearch.module';
import { TodoPageModule } from './todo/todo.module';
import { MapPreviewPageModule } from './success/mapPreview/mapPreview.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LibraryPageModule } from './library/library.module';
import { MapTemplatePageModule } from './success/map-template/map-template.module';
import { HomePageModule } from './home/home.module';

@NgModule({
	imports: [
		AccountPageModule,
		HomePageModule,
		LibraryPageModule,
		MapPageModule,
		MainPageModule,
		MainPopoverModule,
		MapCommentsPageModule,
		MapSearchPageModule,
		MapPreviewPageModule,
		MapTemplatePageModule,
		StartPageModule,
		SuccessPageModule,
		IonicModule,
		TodoPageModule,
		FontAwesomeModule
	]
})
export class PagesModule {}
