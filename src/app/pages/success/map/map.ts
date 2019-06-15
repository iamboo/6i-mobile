import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, AlertController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Storage } from '@ionic/storage';

import { DatePicker } from '@ionic-native/date-picker/ngx';
import { MapCommentsPage } from '../../success/mapComments/mapComments';
import { MapService } from '../../../services/map.service';
import { StrategyMap } from '../../../interfaces/strategyMap.interface';
import { ActivatedRoute } from '@angular/router';
import { AccountObject } from 'src/app/interfaces/account.interface';

@Component({
	templateUrl: 'map.html',
	styleUrls: ['./map.scss'],
	providers: [DatePicker, MapService]
})
export class MapPage implements OnInit {
	public mapForm: FormGroup;
	private currentMap: StrategyMap;
	private mapList: any = [];
	private account: AccountObject;
	public rating: number = 0;
	public startMinDate: string = '';
	public dueMinDate: string = '';
	public showPublic: boolean = false;
	public showRating: boolean = false;
	public isMapEdit: boolean = false;
	public isValid: boolean = true;
	public needsUpdate: boolean = false;
	public mapId: number;

	constructor(
		private formBuilder: FormBuilder,
		private storage: Storage,
		private navCtrl: NavController,
		private alertCtrl: AlertController,
		private mapService: MapService,
		private modalController: ModalController,
		private route: ActivatedRoute
	) {
		this.mapForm = this.formBuilder.group({
			name: [{ value: '', disabled: true }, Validators.required],
			date_start: ['', [Validators.required]],
			date_due: ['', []],
			public: [false, []],
			review: ['', []],
			author_notes: ['', []]
		});
		this.mapForm.controls.date_start.valueChanges.subscribe(() => {
			this.setMinDueDate();
		});
	}

	ngOnInit() {
		const now = new Date();
		const queryParams = this.route.snapshot.queryParams;
		Promise.all([this.storage.get('new_map'), this.storage.get('strategy_maps'), this.storage.get('account')]).then(
			([newMap, mapData, accountData]) => {
				this.mapId = queryParams.mapId ? parseInt(queryParams.mapId) : null;
				this.isMapEdit = queryParams.editMode ? queryParams.editMode === 'true' : false;
				this.mapList = mapData.maps;

				this.isMapEdit ? this.mapForm.get('name').enable() : this.mapForm.get('name').disable();

				this.account = accountData;
				if (this.mapId === -1 && newMap) {
					this.currentMap = newMap;
				} else {
					this.currentMap = this.mapList.find(m => parseInt(m.map_id) === this.mapId);
				}
				let postData = {
					action: 'get_rating',
					auth_code: this.account.auth_code,
					map_id: this.currentMap.map_id
				};
				this.mapService.getAccountMapRating(postData).subscribe(mapRating => {
					this.rating = mapRating;
				});

				if (this.currentMap) {
					this.isValid = this.mapService.mapComplete(this.currentMap);
					this.setMapProperties();
					this.startMinDate = this.mapService.getDateString(now.getTime());
					this.mapForm.get('date_start').setValue(this.startMinDate);
					this.setMinDueDate();
				} else {
					console.log('show error');
				}
			}
		);
	}

	setMinDueDate() {
		const startDate = this.mapForm.controls.date_start.value;
		if (startDate && startDate != '') {
			const dateObj = new Date(startDate);
			dateObj.setDate(dateObj.getDate() + 10);
			this.dueMinDate =
				dateObj.getFullYear() +
				'-' +
				('0' + (dateObj.getMonth() + 1)).slice(-2) +
				'-' +
				('0' + dateObj.getDate()).slice(-2);
			this.mapForm.get('date_due').setValue(this.dueMinDate);
		}
	}

	async showModeratorComments() {
		const modal = await this.modalController.create({
			component: MapCommentsPage,
			cssClass: 'success_planner',
			componentProps: {
				map: this.currentMap
			}
		});
		return await modal.present();
	}

	private setMapProperties() {
		if (!this.isValid) {
			this.currentMap.status = '';
		}
		this.needsUpdate =
			(this.currentMap.map_review &&
				this.currentMap.map_review.moderator_comments != '' &&
				this.currentMap.map_review.status === 'rejected') ||
			(this.currentMap && this.currentMap.status === 'rejected' && this.currentMap.comments != '');
		const mapName = this.currentMap && this.currentMap.name ? this.currentMap.name : '';
		const isPublic = this.currentMap && this.currentMap.public ? this.currentMap.public == 1 : false;
		const authorNotes = !this.currentMap.author_notes ? '' : this.currentMap.author_notes;

		this.mapForm.controls.name.setValue(mapName);
		if (this.isMapEdit) {
			this.mapForm.controls.name.setValidators([Validators.required]);
			this.mapForm.controls.date_start.setValidators([]);
		} else {
			this.mapForm.controls.name.setValidators([]);
			this.mapForm.controls.date_start.setValidators([Validators.required]);
		}
		if (this.currentMap.account_map && this.currentMap.account_map.date_start) {
			this.mapForm.controls.date_start.setValue(
				this.mapService.getDateString(this.currentMap.account_map.date_start)
			);
		}
		if (this.currentMap.account_map && this.currentMap.account_map.date_due) {
			this.mapForm.controls.date_due.setValue(
				this.mapService.getDateString(this.currentMap.account_map.date_due)
			);
		}
		this.mapForm.controls.public.setValue(isPublic);
		this.mapForm.controls.author_notes.setValue(authorNotes);
		if (this.currentMap.map_review && this.currentMap.map_review.review) {
			this.mapForm.controls.review.setValue(this.currentMap.map_review.review);
		}
		if (this.currentMap) {
			this.showRating = this.currentMap.is_admin != true;
			this.showPublic = this.currentMap.is_admin;
		}
	}

	private convertToDate(dateString) {
		if (dateString === '') {
			return null;
		}
		const splitDate = dateString.split('-');
		const dateObj = new Date(
			parseInt(splitDate[0]),
			parseInt(splitDate[1]) - 1,
			parseInt(splitDate[2]),
			0,
			0,
			0,
			0
		);
		return dateObj.getTime();
	}

	async showError() {
		let alert = await this.alertCtrl.create({
			header: 'Error',
			message: 'A map name is required.',
			buttons: [
				{
					text: 'Cancel',
					role: 'cancel'
				}
			]
		});
		await alert.present();
	}

	public saveMap() {
		if (this.mapForm.get('name').value === '') {
			this.showError();
			return;
		}
		if (this.mapForm.dirty && this.mapForm.valid) {
			this.currentMap.name = this.mapForm.get('name').value;
			this.currentMap.author_notes = this.mapForm.get('author_notes').value;
			this.currentMap.public = this.mapForm.get('public').value === true ? 1 : 0;
			this.currentMap.date_modified = new Date().getTime();
			const date_start = this.mapForm.get('date_start').value;
			if (!this.currentMap.map_review && this.currentMap.map_id) {
				this.currentMap.map_review = { map_id: this.currentMap.map_id };
			}
			if (date_start && date_start != '') {
				this.currentMap.account_map.date_start = this.convertToDate(date_start);
			}
			const date_due = this.mapForm.get('date_due').value;
			if (date_due && date_due != '') {
				this.currentMap.account_map.date_due = this.convertToDate(date_due);
			}
			const map_review = this.mapForm.get('review').value;
			if (!this.currentMap.is_admin && map_review) {
				this.currentMap.map_review.review = map_review;
			}
			if (this.currentMap.archived === null) {
				this.currentMap.archived = 0;
			}
			if (this.mapList) {
				const mapIndex = this.mapList.findIndex(m => m.map_id === this.currentMap.map_id);
				this.mapList[mapIndex] = this.currentMap;
			}
			let postData = {
				action: 'saveMap',
				auth_code: this.account.auth_code,
				map: this.currentMap
			};
			this.mapService.setGoals(this.currentMap, this.account.auth_code);
			this.mapService.mapAPI(postData).subscribe(() => {
				this.returnToMapList();
			});
		} else {
			this.returnToMapList();
		}
	}

	private returnToMapList() {
		this.navCtrl.navigateRoot(['success']);
	}

	onStarClick(rating: number) {
		this.mapForm.markAsDirty();
		this.rating = rating;
		let postData = {
			action: 'set_rating',
			auth_code: this.account.auth_code,
			map_id: this.currentMap.map_id,
			rating: rating
		};
		this.mapService.mapAPI(postData).subscribe();
	}

	goBack() {
		this.navCtrl.back();
	}
}
