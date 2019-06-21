import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { MapService } from '../../../services/map.service';
import { ModalController, NavController } from '@ionic/angular';
import { StrategyMap } from 'src/app/interfaces/strategyMap.interface';
import { AccountObject } from 'src/app/interfaces/account.interface';

@Component({
	templateUrl: 'mapSearch.html',
	styleUrls: ['./mapSearch.scss'],
	providers: [MapService]
})
export class MapSearchPage implements OnInit {
	public publicMapList;
	public emptyList: boolean = false;
	private accountMaps;
	public filterText = '';
	public showSearch;
	public templateTitle: any;
	private accountObj: AccountObject;

	constructor(
		private modalCtrl: ModalController,
		private mapService: MapService,
		private navCtrl: NavController,
		private storage: Storage
	) {}

	ngOnInit() {
		this.showSearch = false;
		Promise.all([
			this.storage.get('strategy_maps'),
			this.mapService.getTemplateTitles(),
			this.storage.get('account')
		]).then(([mapData, templateTitles, accountObj]) => {
			this.accountMaps = mapData.maps;
			this.templateTitle = templateTitles;
			this.accountObj = accountObj;
			let params = {
				searchQuery: this.filterText,
				orderBy: 'name'
			};
			this.mapSearchAPI('public_maps', params);
		});
	}

	onSearchChange(searchText: string) {
		let params = {
			searchQuery: searchText,
			orderBy: 'name'
		};
		this.mapSearchAPI('public_maps', params);
	}

	mapSearchAPI(action, params) {
		let postData = {
			action: action,
			auth_code: this.accountObj.auth_code
		};
		if (params) {
			Object.keys(params).forEach(key => {
				postData[key] = params[key];
			});
		}
		this.mapService.mapAPI(postData).subscribe(maps => {
			console.log(this.showSearch);
			if (maps) {
				if (!this.showSearch) {
					this.showSearch = maps.length > 9 && params.searchQuery === '';
				}
				maps.forEach((map: StrategyMap) => {
					const foundIndex = this.accountMaps.findIndex(am => am['map_id'] == map.map_id);
					if (foundIndex > -1) {
						map['inList'] = true;
					}
				});
				this.publicMapList = maps;
			}
			this.emptyList = !maps || maps.length === 0;
		});
	}

	mapClick(map: StrategyMap) {
		this.storage.set('preview_map', map);
		this.navCtrl.navigateRoot(['map_preview'], { queryParams: { map_id: map.map_id } });
		this.dismiss('refresh');
	}

	async createMap() {
		this.dismiss('showTemplates');
	}

	dismiss(action: string) {
		this.modalCtrl.dismiss(action);
	}
}
