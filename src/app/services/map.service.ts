import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { LoaderService } from './loading.service';
import { NotifyService } from './notify.service';
import { StrategyMap } from '../interfaces/strategyMap.interface';
import { Observable, of as observableOf } from 'rxjs';
import { NavController } from '@ionic/angular';
import { MapReview } from '../interfaces/mapReview.interface';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { ResponseTodo } from '../interfaces/response.todo.interface';
import { ResponseMap } from '../interfaces/response.map.interface';
import { ContentService } from './content.service';

@Injectable()
export class MapService {
	constructor(
		private http: HttpClient,
		private loaderService: LoaderService,
		private navCtrl: NavController,
		private contentService: ContentService,
		private notifyService: NotifyService,
		private storage: Storage
	) {}

	public getDateString(ts: number | string) {
		if (ts && typeof ts === 'string') {
			ts = parseInt(ts);
		}
		if (!ts || ts === 0) {
			return null;
		}
		const dateObj = new Date(ts);
		return (
			dateObj.getFullYear() +
			'-' +
			('0' + (dateObj.getMonth() + 1)).slice(-2) +
			'-' +
			('0' + dateObj.getDate()).slice(-2)
		);
	}

	public getAccountMapRating(params): Observable<number> {
		return this.http.post(this.contentService.apiUrl + '/action/strategy_map.php', params, {}).pipe(
			map((response: ResponseMap) => {
				if (response['rating']) {
					return parseInt(response['rating']);
				}
			})
		);
	}

	public mapAPI(params): Observable<StrategyMap[]> {
		if (params.action != 'public_maps') {
			this.loaderService.startLoader('Loading...');
		}
		return this.http.post(this.contentService.apiUrl + '/action/strategy_map.php', params, {}).pipe(
			map((response: ResponseMap) => {
				this.stopLoader();
				if (response && response.status && response.status === 'success') {
					if (response.key === 'strategy_map-public_maps' && response['public_maps']) {
						return response['public_maps'];
					}
					if (response.key === 'strategy_map-update_goal' && response['goal_data']) {
						return response['goal_data'];
					}
					if (response.account_maps && response.account_maps.length > 0) {
						this.storage.set('strategy_maps', {
							date: new Date().getTime(),
							maps: response.account_maps
						});
						return response.account_maps;
					}
					return [];
				} else if (response && response.status && response.status === 'error') {
					this.navCtrl.navigateRoot('start');
					const alertConfig = {
						title: 'Notice',
						message: response.message,
						buttons: [{ label: 'Close', value: false }]
					};
					this.contentService.promptAlert(alertConfig);
					return [];
				}
			}),
			catchError(err => {
				this.stopLoader();
				return [];
			})
		);
	}

	public mapComplete(mapObj) {
		let returnVal = true;
		const responseList = mapObj.response ? JSON.parse(mapObj.response) : [];
		if (responseList.length === 0) {
			returnVal = false;
		}
		Object.keys(responseList).forEach(key => {
			if (responseList[key] === '') {
				returnVal = false;
			}
		});
		return returnVal;
	}

	public mapMatch(response1: string, response2: string) {
		if (response1 === '' || response2 === '') {
			return false;
		}
		const responseObj1 = JSON.parse(response1);
		const responseObj2 = JSON.parse(response2);
		var isMatch = true;
		Object.keys(responseObj1).forEach(key => {
			if (responseObj1[key] != responseObj2[key]) {
				isMatch = false;
			}
		});
		return isMatch;
	}

	public setGoals(thisMap: StrategyMap, auth_code: string) {
		const responseList = thisMap && thisMap.response ? JSON.parse(thisMap.response) : null;
		const dayKeyList = responseList ? Object.keys(responseList).filter(k => k.indexOf('_day') > 0) : [];
		let todoList = [];
		dayKeyList.forEach((key, i) => {
			const date_due = this.notifyService.getDateDue(i, thisMap.account_map.date_start);
			todoList.push({
				date_due: date_due.getTime(),
				description: responseList[key],
				prompt: key
			});
		});
		let postData = {
			action: 'saveTodoList',
			auth_code: auth_code,
			map_id: thisMap.map_id,
			todo_list: todoList
		};
		if (thisMap.account_map.date_due) {
			const message = 'Your Strategy Map is due today: ' + thisMap.name;
			this.notifyService.setNotification(
				thisMap.map_id,
				'Completion Reminder',
				message,
				thisMap.account_map.date_due
			);
		}
		this.http.post(this.contentService.apiUrl + '/action/strategy_map.php', postData, {}).pipe(
			map((responseData: ResponseTodo) => {
				if (responseData.goal_data && responseData.goal_data.length > 0) {
					const storeGoalData = this.notifyService.doParseInt(responseData.goal_data);
					this.storage.set('goalData', storeGoalData);
					const mapGoals = storeGoalData.filter(g => g.map_id === thisMap.map_id);
					this.notifyService.scheduleNotifications(mapGoals);
				}
			})
		);
	}

	public getTemplateTitles(): any {
		return this.storage.get('content-popover-sp-templates').then(pageData => {
			if (pageData) {
				let parser = new DOMParser();
				let parsedHtml = parser.parseFromString(pageData.markup, 'text/html');
				let keyJSON = {};
				[].slice.call(parsedHtml.querySelectorAll('a')).forEach(a => {
					let key = a.getAttribute('href');
					key = key.substring(key.indexOf('sp_'), key.length - 1);
					keyJSON[key] = a.innerHTML;
				});
				return keyJSON;
			} else {
				this.navCtrl.navigateRoot(['start']);
				return null;
			}
		});
	}

	public getMapReviews(map_id: number): Observable<MapReview[]> {
		let postData = {
			action: 'map_reviews',
			map_id: map_id
		};
		return this.http.post<MapReview[]>(this.contentService.apiUrl + '/action/strategy_map.php', postData, {}).pipe(
			map(responseData => {
				const mapReviews: MapReview[] = responseData['reviews'] ? responseData['reviews'] : [];
				return mapReviews;
			})
		);
	}

	stopLoader() {
		setTimeout(() => {
			this.loaderService.stopLoader();
		}, 1000);
	}
}
