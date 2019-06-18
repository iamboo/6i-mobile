import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';

import { Platform, MenuController, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ContentService } from './services/content.service';

@Component({
	selector: 'app-root',
	templateUrl: 'app.component.html'
})
export class AppComponent {
	public appPages = [];

	constructor(
		private platform: Platform,
		private splashScreen: SplashScreen,
		private statusBar: StatusBar,
		private storage: Storage,
		private navCtrl: NavController,
		private contentService: ContentService,
		private menuCtrl: MenuController
	) {
		this.initializeApp();
	}

	initializeApp() {
		this.platform.ready().then(() => {
			this.statusBar.styleDefault();
			this.splashScreen.hide();
			this.getMenu();
		});
	}

	getMenu() {
		this.storage.get('menu_main').then(menuData => {
			if (menuData) {
				this.appPages = menuData;
			} else {
				this.contentService.getMenuData();
				setTimeout(() => {
					this.getMenu();
				}, 500);
			}
		});
	}

	goHome() {
		this.menuCtrl.close();
		this.navCtrl.navigateRoot(['home']);
	}

	navMenu(page) {
		this.contentService.contentClick(page.slug);
	}
}
