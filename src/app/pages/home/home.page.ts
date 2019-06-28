import { Component, OnInit } from '@angular/core';
import { ToDoInterface } from 'src/app/interfaces/todo.interface';
import { Storage } from '@ionic/storage';
import { NavController } from '@ionic/angular';
import { ContentService } from 'src/app/services/content.service';
import { LoaderService } from 'src/app/services/loading.service';

@Component({
	selector: 'app-home',
	templateUrl: './home.page.html',
	styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {
	public homeLinks;
	public badgeData;
	constructor(
		private loaderService: LoaderService,
		private storage: Storage,
		private navCtrl: NavController,
		private contentService: ContentService
	) {}

	ngOnInit() {
		this.badgeData = {};
		this.loaderService.startLoader('Loading...');
		Promise.all([
			this.storage.get('menu_main'),
			this.storage.get('goalData'),
			this.storage.get('challengeData')
		]).then(
			([menuData, goalData, challengeData]) => {
				if (!menuData) {
					this.navCtrl.navigateRoot(['start']);
					return;
				}
				const filteredLinks = menuData ? menuData.filter(menuItem => menuItem.slug !== 'signout') : [];
				this.homeLinks = filteredLinks;
				const filteredGoals: ToDoInterface[] = goalData.filter(g => g.complete === 0 || g.complete === '0');
				this.badgeData['to-do'] = filteredGoals.length;
				this.showChallengePercentage(menuData, challengeData);
				this.loaderService.stopLoader();
			},
			() => {
				this.loaderService.stopLoader();
			}
		);
	}

	showChallengePercentage(menuData, challengeData) {
		const challengeMenuItem = menuData.find(menuItem => menuItem.total !== '');
		const totalCount = parseInt(challengeMenuItem.total);
		let completeCount = 0;
		Object.keys(challengeData).forEach(groupKey => {
			Object.values(challengeData[groupKey]).forEach(val => {
				if (val === true) {
					completeCount++;
				}
			});
		});
		let percent = Math.floor((completeCount / totalCount) * 100);
		this.badgeData[challengeMenuItem.slug] = percent + '%';
	}

	pageClick(link) {
		this.contentService.contentClick(link.slug);
	}
}
