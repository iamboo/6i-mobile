import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonicStorageModule } from '@ionic/storage';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';

import { LoaderService } from './services/loading.service';
import { NotifyService } from './services/notify.service';
import { ContentService } from './services/content.service';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { ComponentsModule } from './components/components.module';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { PagesModule } from './pages/pages.module';

library.add(fas, far);

@NgModule({
	declarations: [AppComponent],
	entryComponents: [],
	imports: [
		BrowserModule,
		IonicModule.forRoot(),
		IonicStorageModule.forRoot(),
		AppRoutingModule,
		HttpClientModule,
		FontAwesomeModule,
		ComponentsModule,
		PagesModule
	],
	providers: [
		ContentService,
		InAppBrowser,
		LoaderService,
		LocalNotifications,
		NotifyService,
		StatusBar,
		SplashScreen,
		{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
	],
	bootstrap: [AppComponent]
})
export class AppModule {}
