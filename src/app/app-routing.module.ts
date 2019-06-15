import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{
		path: '',
		redirectTo: 'start',
		pathMatch: 'full'
	},
	{
		path: 'home',
		loadChildren: './pages/home/home.module#HomePageModule'
	},
	{
		path: 'main',
		loadChildren: './pages/main/main.module#MainPageModule'
	},
	{
		path: 'start',
		loadChildren: './pages/start/start.module#StartPageModule'
	},
	{
		path: 'account',
		loadChildren: './pages/account/account.module#AccountPageModule'
	},
	{
		path: 'todo',
		loadChildren: './pages/todo/todo.module#TodoPageModule'
	},
	{
		path: 'success',
		loadChildren: './pages/success/success.module#SuccessPageModule'
	},
	{
		path: 'map',
		loadChildren: './pages/success/map/map.module#MapPageModule'
	},
	{
		path: 'map_preview',
		loadChildren: './pages/success/mapPreview/mapPreview.module#MapPreviewPageModule'
	},
	{ path: 'library', loadChildren: './pages/library/library.module#LibraryPageModule' },
	{ path: 'map-template', loadChildren: './pages/success/map-template/map-template.module#MapTemplatePageModule' },
	{ path: 'home', loadChildren: './pages/home/home.module#HomePageModule' }
];

@NgModule({
	imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
	exports: [RouterModule]
})
export class AppRoutingModule {}
