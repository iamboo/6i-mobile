import { Component, ViewChild, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { AlertController, NavController, IonContent, ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { MapService } from '../../services/map.service';
import { AccountObject } from '../../interfaces/account.interface';
import { StrategyMap } from '../../interfaces/strategyMap.interface';
import { AccountService } from '../../services/account.service';
import { ActivatedRoute } from '@angular/router';
import { of as observableOf, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ContentService } from 'src/app/services/content.service';
import { MainPopover } from './popover';

@Component({
	templateUrl: 'main.html',
	styleUrls: ['main.scss'],
	providers: [AccountService, MapService]
})
export class MainPage implements OnInit, OnDestroy {
	@ViewChild(IonContent)
	private scrollElement: IonContent;

	@ViewChild('mainContent')
	private mainContent: ElementRef;

	@ViewChild('headerElement') headerElement;
	template: string = '';
	pageTitle: string = '';
	contentTitle: string = '';
	pageId: string = '';
	pageSlug: string = '';
	headerClass: string = '';
	challengeData: any;
	path: string = '';
	pageKey: string = '';
	account: AccountObject;
	pageSlugClick: string = '';
	strategyMap: StrategyMap = null;
	mapList: any[] = [];
	isMap = false;
	isMapEdit = false;
	isMapValid = true;
	leaderNextUrl: string = '';
	leaderButtonText: string = '';
	jumpstartButtonText: string = '';
	isLeader: boolean = false;
	isJumpstart: boolean = false;
	subheader: string = '';
	pageContentSubscription: Subscription;
	showPopoverSubscription: Subscription;
	editClass: string = '';
	public isX = false;

	constructor(
		private accountService: AccountService,
		private alertCtrl: AlertController,
		private contentService: ContentService,
		private navCtrl: NavController,
		private mapService: MapService,
		private route: ActivatedRoute,
		private storage: Storage,
		private modalController: ModalController
	) {}

	ngOnDestroy() {
		this.pageContentSubscription.unsubscribe();
		this.showPopoverSubscription.unsubscribe();
	}

	ngOnInit() {
		this.isX = this.contentService.isX();
		if (this.pageContentSubscription) {
			this.pageContentSubscription.unsubscribe();
		}
		this.pageContentSubscription = this.contentService.mainPageData.subscribe(pageContent => {
			if (pageContent) {
				this.renderPageData(pageContent);
			}
		});
		if (this.showPopoverSubscription) {
			this.showPopoverSubscription.unsubscribe();
		}
		this.showPopoverSubscription = this.contentService.showPopver.subscribe(modalPageSlug => {
			this.contentModal(modalPageSlug);
		});

		this.route.queryParams.subscribe(params => {
			this.scrollElement.scrollToTop();
			const slug = params.slug ? params.slug : null;
			const mapId = params.map_id ? params.map_id : null;
			const isMapEdit = params['edit_map'] && params['edit_map'] == 1;
			this.pageSlug = !slug ? 'home' : slug;
			this.getChallengeData(slug || '');
			if (!this.account) {
				this.storage.get('account').then(val => {
					this.account = val;
				});
			}
			if (mapId) {
				this.storage.get('strategy_maps').then(mapData => {
					this.mapList = mapData.maps;
					const thisMap = mapData.maps.find(m => m.map_id === mapId);
					if (thisMap) {
						this.strategyMap = thisMap;
						const responseList = thisMap.response ? JSON.parse(thisMap.response) : [];
						if (responseList.length === 0) {
							this.isMapValid = false;
						}
						Object.keys(responseList).forEach(key => {
							if (responseList[key] === '') {
								this.isMapValid = false;
							}
						});
						this.isMapEdit = !this.isMapValid || (isMapEdit && this.strategyMap.is_admin === true);
						this.editClass = this.isMapEdit === true ? 'editMode' : '';
						this.contentService.updatePageContent(this.pageSlug);
					}
				});
			} else {
				this.isMapEdit = isMapEdit;
				this.editClass = this.isMapEdit ? 'editMode' : '';
				this.strategyMap = {
					archived: 0,
					public: 0,
					rating_average: 0.0,
					rating_count: 0,
					response: '',
					is_admin: this.isMapEdit,
					map_key: this.pageSlug,
					account_map: null
				};
				this.contentService.updatePageContent(this.pageSlug);
			}
		});
	}

	goBack() {
		this.navCtrl.back();
	}

	renderPageData(pageData) {
		this.headerClass = '';
		this.isJumpstart = false;
		const contentElement = this.mainContent.nativeElement as HTMLElement;
		if (pageData && pageData.markup) {
			this.headerClass =
				this.pageSlug.indexOf('jumpstart-') > -1
					? 'jumpstart'
					: this.pageSlug.indexOf('library') > -1
					? 'library'
					: this.pageSlug.indexOf('catalyst_leadership') > -1
					? 'leader'
					: this.pageSlug.indexOf('sp_') > -1
					? 'success_planner'
					: this.pageSlug.indexOf('home') > -1
					? 'homePage'
					: '';
			pageData.markup = pageData.markup.replace(/<input scope=/gi, '<ion-input formControlName=');
			if (this.headerClass === 'success_planner') {
				const editModeClass = this.isMapEdit ? 'editMode' : '';
				pageData.markup = '<form class="' + editModeClass + '">' + pageData.markup + '</form>';
			}
			if (
				this.pageSlug === 'jumpstart-leader-intro' ||
				this.pageSlug === 'jumpstart-building-step11' ||
				this.pageSlug === 'jumpstart-building-congrats'
			) {
				this.isJumpstart = true;
			}
			this.template = pageData.markup;
			this.pageTitle = pageData.pageTitle;
			this.pageId = pageData.pageId;
			setTimeout(() => {
				this.contentService.refactorAnchorTags(this.mainContent);
				const challengeElements = this.mainContent.nativeElement.getElementsByClassName('challenge');
				const contentButton = this.mainContent.nativeElement.getElementsByClassName('button_content');
				this.jumpstartButtonText = contentButton && contentButton[0] ? contentButton[0].innerText : 'Continue';
				if (challengeElements[0]) {
					[].slice.call(challengeElements).forEach(element => {
						let buttonElement = element.getElementsByClassName('button')[0];
						this.toggleChallenge(null);
						let challengeListener = (e: any) => {
							this.toggleChallenge(e);
						};
						buttonElement.removeEventListener('click', challengeListener);
						buttonElement.addEventListener('click', challengeListener);
					});
					this.isJumpstart = true;
					this.showChallengeButtonStatus();
				}

				const accordionElements = this.mainContent.nativeElement.getElementsByClassName('accordion');
				if (accordionElements[0]) {
					[].slice.call(accordionElements).forEach(element => {
						let accordionListener = (e: any) => {
							if (element.className.indexOf('open') > -1) {
								element.className = element.className.replace(' open', '');
							} else {
								element.className = element.className + ' open';
							}
						};
						element.removeEventListener('click', accordionListener);
						element.addEventListener('click', accordionListener);
					});
				}

				this.applyMapValues();
				this.isLeader = false;
				if (this.headerClass === 'leader') {
					const leaderButton = this.mainContent.nativeElement.querySelector('.button_content');
					if (leaderButton) {
						this.isLeader = true;
						this.leaderButtonText = leaderButton.innerHTML;
						this.leaderNextUrl = leaderButton.getAttribute('href');
					}
				}

				if (this.pageSlug === 'jumpstart-building' || this.pageSlug === 'jumpstart-leader') {
					this.showChallengeListStatus();
				}
				if (this.pageSlug) {
					this.isMap = this.pageSlug.indexOf('sp_') > -1 ? true : false;
				} else {
					this.pageSlug = 'home';
				}

				const subheaderElement = this.mainContent.nativeElement.querySelector('h2') as HTMLElement;
				this.subheader = subheaderElement && subheaderElement.textContent ? subheaderElement.textContent : '';
				if (this.isMap && this.strategyMap.name) {
					this.subheader = this.strategyMap.name;
				}

				contentElement.classList.add('fadeIn');
			}, 100);
		}
	}

	leaderNext() {
		const nextPageSlug = this.leaderNextUrl.split('/api/')[1].replace('/', '');
		if (nextPageSlug === 'home') {
			this.navCtrl.navigateRoot(['home']);
		} else {
			this.navCtrl.navigateRoot(['main'], { queryParams: { slug: nextPageSlug } });
		}
	}

	applyMapValues() {
		if (this.strategyMap) {
			const values = this.strategyMap.response ? JSON.parse(this.strategyMap.response) : [];
			const inputs = Array.from(this.mainContent.nativeElement.querySelectorAll('input,textarea'));
			inputs.forEach((input, index) => {
				const inputElement = input as HTMLElement;
				let inputName = input['name'];
				const textValue = values[inputName] ? values[inputName] : '';
				input['value'] = textValue;
				inputElement.setAttribute('tabindex', (index + 1).toString());
				if (inputElement.tagName === 'INPUT') {
					inputElement.setAttribute('type', 'text');
				}
				let newText = document.createElement('P');
				newText.innerText = textValue;
				newText.classList.add('responseText');
				inputElement.parentElement.insertBefore(newText, inputElement);
				inputElement.classList.add('hideInput');
			});
		}
	}

	saveMap() {
		if (!this.isMapEdit) {
			let params = { mapId: this.strategyMap.map_id };
			this.navCtrl.navigateRoot(['/map'], { queryParams: params });
			return;
		}
		const content = this.mainContent.nativeElement;
		const origResponse = this.strategyMap.response;
		let inputs = content.querySelectorAll('input,textarea');
		let values = {};
		inputs = Array.from(inputs);
		inputs.forEach(input => {
			values[input['name']] = input['value'];
		});
		this.strategyMap.response = JSON.stringify(values);
		if (!this.strategyMap.account_map) {
			this.strategyMap.account_map = { archived: 0 };
		}
		if (
			!this.mapService.mapMatch(origResponse, this.strategyMap.response) &&
			this.mapService.mapComplete(this.strategyMap)
		) {
			this.strategyMap.status = 'moderate';
		}
		if (this.strategyMap.map_id) {
			let postData = {
				action: 'saveMap',
				auth_code: this.account.auth_code,
				map: this.strategyMap
			};
			this.mapService.mapAPI(postData).subscribe(
				maps => {
					if (maps.length > 0) {
						let params = { mapId: this.strategyMap.map_id, editMode: true };
						this.navCtrl.navigateRoot(['map'], { queryParams: params });
					}
				},
				catchError(() => {
					return observableOf(false);
				})
			);
		} else {
			this.storage.set('new_map', this.strategyMap);
			let params = { mapId: -1, editMode: true };
			this.navCtrl.navigateRoot(['map'], { queryParams: params });
		}
	}

	getChallengeData(pageSlug: string) {
		const path =
			pageSlug.indexOf('jumpstart') > -1
				? 'jumpstart'
				: pageSlug.indexOf('leadership') > -1
				? 'leadership'
				: null;
		const pageKey = pageSlug.substr(pageSlug.indexOf('-') + 1, pageSlug.length);
		this.storage.get('challengeData').then(val => {
			this.challengeData = {};
			if (val) {
				this.challengeData = val;
			}
			if (path) {
				this.path = path;
				if (this.challengeData[path] === undefined) {
					this.challengeData[path] = {};
				}
				if (pageKey) {
					this.pageKey = pageKey;
					if (this.challengeData[path][pageKey] === undefined) {
						this.challengeData[path][pageKey] = false;
					}
				}
			}
		});
	}

	showChallengeButtonStatus() {
		const challengeElement = this.mainContent.nativeElement.querySelector('div.challenge') as HTMLElement;
		if (challengeElement) {
			const buttonElement = challengeElement.querySelector('.button') as HTMLElement;
			const toggleClass = ' button_checked';
			let isChecked =
				this.challengeData && this.challengeData[this.path] && this.challengeData[this.path][this.pageKey]
					? this.challengeData[this.path][this.pageKey]
					: false;
			let buttonClass = buttonElement.className;
			buttonClass = buttonClass.replace(new RegExp(toggleClass, 'g'), '');
			if (isChecked) {
				buttonClass = buttonClass + toggleClass;
			}
			buttonElement.className = buttonClass;
		}
	}

	showChallengeListStatus() {
		setTimeout(() => {
			const challengeList = this.mainContent.nativeElement.getElementsByClassName('challenge_list');
			if (challengeList[0]) {
				for (let parentKey in this.challengeData) {
					let thisData = this.challengeData[parentKey];
					for (let key in thisData) {
						let thisElement = challengeList[0].querySelectorAll('[role=' + key + ']')[0];
						if (thisElement) {
							thisElement.className = thisData[key] === true ? 'checked' : '';
						}
					}
				}
			}
		}, 500);
	}

	toggleChallenge(event: Event) {
		if (event) {
			let isChecked = this.challengeData[this.path][this.pageKey];
			isChecked = !isChecked;
			this.challengeData[this.path][this.pageKey] = isChecked;
			let account = this.account;
			let postData = {};
			postData['action'] = 'updateChallengeData';
			postData['auth_code'] = account.auth_code;
			postData['challenge_data'] = JSON.stringify(this.challengeData);
			this.accountService.toggleChallenge(postData).subscribe(challengeData => {
				if (challengeData) {
					this.challengeData = challengeData;
					this.showChallengeButtonStatus();
				}
			});
		}
	}

	async mapOptions() {
		let buttonObj = [];
		buttonObj.push({
			text: 'Duplicate Map',
			handler: data => {
				this.mapService
					.mapAPI({
						action: 'duplicate_map',
						map_id: this.strategyMap.map_id,
						auth_code: this.account.auth_code
					})
					.subscribe(() => {
						this.navCtrl.back();
					});
			}
		});
		if (this.strategyMap.is_admin && !this.isMapEdit) {
			buttonObj.push({
				text: 'Modify Map',
				handler: () => {
					this.isMapEdit = true;
				}
			});
		}
		if (this.isMapEdit && this.isMapValid) {
			buttonObj.push({
				text: 'Exit Modify Mode',
				handler: () => {
					this.isMapEdit = false;
				}
			});
		}

		buttonObj.push({
			text: 'Delete Map',
			handler: data => {
				this.mapService
					.mapAPI({
						action: 'archive_map',
						map_id: this.strategyMap.map_id,
						auth_code: this.account.auth_code
					})
					.subscribe(() => {
						this.navCtrl.navigateRoot(['success']);
					});
			}
		});

		buttonObj.push({
			text: 'Cancel',
			role: 'cancel',
			handler: data => {}
		});
		const alert = await this.alertCtrl.create({
			header: 'Map Actions',
			buttons: buttonObj
		});
		return await alert.present();
	}

	goToNextStep() {
		const parentPage = this.pageSlug.indexOf('jumpstart-leader') > -1 ? 'jumpstart-leader' : 'jumpstart-building';
		this.storage.get('content-' + parentPage).then(page => {
			const markup = page.markup;
			const parser = new DOMParser();
			const htmlObj = parser.parseFromString(markup, 'text/html');
			const listElement = htmlObj.querySelector('.challenge_list');
			const links = Array.from(listElement.querySelectorAll('a'));
			const foundIndex = links.findIndex(l => l.href.indexOf(this.pageSlug) > -1);
			let nextPageSlug = parentPage;
			if (links[foundIndex + 1]) {
				nextPageSlug = links[foundIndex + 1].href.split('/api/')[1].replace('/', '');
			} else if (this.pageSlug === 'jumpstart-building-congrats') {
				nextPageSlug = 'catalyst_leadership';
			} else if (this.pageSlug === 'jumpstart-leader-step6') {
				nextPageSlug = 'jumpstart-building';
			}
			this.navCtrl.navigateRoot(['main'], { queryParams: { slug: nextPageSlug } });
		});
	}

	async contentModal(pageSlug: string) {
		const modal = await this.modalController.create({
			component: MainPopover,
			cssClass: this.contentService.getModalClass(pageSlug),
			componentProps: {
				pageSlug: pageSlug
			}
		});
		return await modal.present();
	}
}
