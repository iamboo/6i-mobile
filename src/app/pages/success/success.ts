import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController, NavController } from '@ionic/angular';
import { FormControl } from '@angular/forms';
import { Storage } from '@ionic/storage';
import { MapService } from '../../services/map.service';
import { StrategyMap } from '../../interfaces/strategyMap.interface';
import { MapSearchPage } from './mapSearch/mapSearch';
import { MapTemplatePage } from './map-template/map-template.page';
import { MainPopover } from '../main/popover';
import { ContentService } from 'src/app/services/content.service';

@Component({
	templateUrl: 'success.html',
	styleUrls: ['success.scss'],
	providers: [MapService]
})
export class SuccessPage implements OnInit {
	public mapList: StrategyMap[] = [];
	public filterMaps: StrategyMap[] = [];
	public templateTitle = {};
	public filterText = '';
	public emptyList: boolean = false;
	public mapFilterControl: FormControl = new FormControl([]);
	private authCode: string = '';
	public isX = false;

	constructor(
		private alertCtrl: AlertController,
		private mapService: MapService,
		private alertController: AlertController,
		private storage: Storage,
		private navCtrl: NavController,
		private modalController: ModalController,
		private contentService: ContentService
	) {}

	ngOnInit() {
		Promise.all([this.storage.get('account'), this.mapService.getTemplateTitles()]).then(([account, title]) => {
			if (account) {
				this.authCode = account.auth_code;
				this.templateTitle = title;
				this.loadMaps();
			} else {
				this.navCtrl.navigateRoot(['start']);
			}
		});
		this.isX = this.contentService.isX();
	}

	onSearch(event: CustomEvent) {
		this.filterText = event.detail.value;
	}

	loadMaps() {
		const now = new Date().getTime();
		this.storage.get('strategy_maps').then(mapData => {
			let updateMaps = false;
			if (mapData) {
				this.mapList = mapData.maps;
				this.filterMaps = this.sortBy(Object.assign([], this.mapList), 'name');
				this.filterMaps.forEach(map => {
					const isValid = this.mapService.mapComplete(map);
					map.isValid = isValid;
				});
				const timeDiff = now - mapData.date;
				if (timeDiff > 900000) {
					updateMaps = true;
				}
			}
			if (!mapData || updateMaps) {
				this.mapService.mapAPI({ action: 'account_maps', auth_code: this.authCode }).subscribe(maps => {
					if (maps.length > 0) {
						this.loadMaps();
					}
				});
			}
			this.emptyList = !mapData || !mapData.maps || mapData.maps.length === 0;
		});
	}

	sortBy(mapList, key) {
		const isDate = key === 'date_due';
		return mapList.sort((a, b) => {
			let objA = a[key] ? a[key].toLowerCase() : '';
			let objB = b[key] ? b[key].toLowerCase() : '';
			if (isDate) {
				objA = a['account_map'][key];
				objB = b['account_map'][key];
				if (objA == 0) {
					objA = 'no_date';
				}
				if (objB == 0) {
					objB = 'no_date';
				}
			}
			return objA > objB ? 1 : -1;
		});
	}

	mapClick(map) {
		const params = { slug: map.map_key, map_id: map.map_id };
		this.navCtrl.navigateForward(['main'], { queryParams: params });
	}

	async filterSort() {
		let alert = await this.alertCtrl.create({
			header: 'Filter & Sort Options',
			buttons: [
				{
					text: 'Sort by Name',
					handler: () => {
						this.filterMaps = this.sortBy(this.mapList, 'name');
					}
				},
				{
					text: 'Sort by Date Due',
					handler: () => {
						this.filterMaps = this.sortBy(this.mapList, 'date_due');
					}
				},
				{
					text: 'Show maps I authored',
					cssClass: 'admin',
					handler: () => {
						const maps = this.mapList.filter(map => map.is_admin === true);
						this.filterMaps = this.sortBy(maps, 'name');
					}
				},
				{
					text: 'Show all maps',
					handler: () => {
						this.filterMaps = this.sortBy(this.mapList, 'name');
					}
				},
				{
					text: 'Cancel',
					role: 'cancel'
				}
			]
		});
		return await alert.present();
	}

	async addMap() {
		let alert = await this.alertCtrl.create({
			header: 'Add Stategy Map',
			message:
				'Create a new strategy map using a template.<p>- OR -</p>Select from a list of strategy maps that have been created and shared by others.',
			buttons: [
				{
					text: 'Create New Map',
					handler: () => {
						this.presentModal(MapTemplatePage);
					}
				},
				{
					text: 'Select a Shared Map',
					handler: async () => {
						this.presentModal(MapSearchPage);
					}
				},
				{
					text: 'Cancel',
					role: 'cancel'
				}
			]
		});
		return await alert.present();
	}

	async mapInfo() {
		const modal = await this.modalController.create({
			component: MainPopover,
			cssClass: 'popover_sp',
			componentProps: {
				pageSlug: 'popover-sp-intro'
			}
		});
		return await modal.present();
	}

	async presentModal(component) {
		const modal = await this.modalController.create({
			component: component
		});
		modal.onDidDismiss().then(action => {
			switch (action.data) {
				case 'refresh':
					this.loadMaps();
					break;
				case 'showTemplates':
					this.presentModal(MapTemplatePage);
					break;
			}
		});
		return await modal.present();
	}

	duplicateItem(map, element) {
		this.mapService
			.mapAPI({
				action: 'duplicate_map',
				map_id: map.map_id,
				auth_code: this.authCode
			})
			.subscribe(maps => {
				if (maps.length > 0) {
					this.loadMaps();
				}
			});
		element.close();
	}

	async archiveItem(map, element) {
		const alertConfig = {
			header: 'Archive Map',
			message: 'Please confirm the request to archive the following map:<br><br><b>' + map.name + '</b>',
			buttons: [
				{
					text: 'Cancel',
					role: 'cancel',
					cssClass: 'secondary'
				},
				{
					text: 'Proceed',
					value: true
				}
			]
		};
		let alert = await this.alertController.create(alertConfig);
		await alert.present();
		alert.onDidDismiss().then(isProceed => {
			if (isProceed) {
				this.mapService
					.mapAPI({
						action: 'archive_map',
						map_id: map.map_id,
						auth_code: this.authCode
					})
					.subscribe(maps => {
						if (maps && maps.length > 0) {
							this.loadMaps();
						}
					});
			}
		});
		await element.close();
	}

	modifyItem(map, element) {
		const params = {
			slug: map.map_key,
			map_id: map.map_id,
			edit_map: '1'
		};
		this.navCtrl.navigateRoot(['main'], { queryParams: params });
		element.close();
	}
}
