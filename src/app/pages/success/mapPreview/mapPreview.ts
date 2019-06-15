import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { MapService } from 'src/app/services/map.service';
import { StrategyMap } from 'src/app/interfaces/strategyMap.interface';
import { MapReview } from 'src/app/interfaces/mapReview.interface';
import { combineLatest } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';

export interface TabInterface {
	name: string;
	icon: string;
	label: string;
	count: number;
}

@Component({
	selector: 'app-map-preview',
	templateUrl: 'mapPreview.html',
	styleUrls: ['mapPreview.scss'],
	providers: [MapService]
})
export class MapPreviewPage implements OnInit {
	public map: StrategyMap;
	public mapTemplate: string = '';
	public mapReviews: MapReview[] = [];
	public mapChallenges: string[] = [];
	public currentTab: string = 'info';
	public tabs: TabInterface[] = [];

	constructor(
		private storage: Storage,
		private mapService: MapService,
		private route: ActivatedRoute,
		private navCtrl: NavController,
		private alertController: AlertController
	) {}

	ngOnInit() {
		this.route.queryParams.subscribe(params => {
			const map_id = params['map_id'] ? params['map_id'] : null;
			if (map_id) {
				combineLatest(
					this.storage.get('preview_map'),
					this.mapService.getTemplateTitles(),
					this.mapService.getMapReviews(map_id)
				).subscribe(([map, templates, reviews]) => {
					this.map = map;
					this.mapTemplate = templates[map.map_key];
					this.mapReviews = reviews;
					let challenges = [];
					const responseData = JSON.parse(map.response);
					Object.keys(responseData).forEach(c => {
						challenges.push(responseData[c]);
					});
					this.mapChallenges = challenges;
					this.tabs = [
						{ name: 'info', icon: 'information-circle', label: 'Map Info', count: null },
						{ name: 'challenges', icon: 'checkmark-circle', label: 'Challenges', count: null },
						{ name: 'reviews', icon: 'text', label: 'Reviews', count: this.mapReviews.length }
					];
				});
			}
		});
	}

	async addMap() {
		if (this.map.inList) {
			let alert = await this.alertController.create({
				header: 'Notice',
				message: 'This strategy map is already in your list:<br><br><b>' + this.map.name + '</b>',
				buttons: ['Close']
			});
			await alert.present();
		} else {
			this.storage.get('account').then(account => {
				let params = {
					auth_code: account.auth_code,
					map_id: this.map.map_id,
					action: 'add_account_map'
				};
				this.mapService.mapAPI(params).subscribe(maps => {
					if (maps.length > 0) {
						this.returnToMapList();
					}
				});
			});
		}
	}

	private returnToMapList() {
		this.navCtrl.navigateRoot(['success']);
	}
}
