import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import page01 from './../../assets/data/page01.json';
import page02 from './../../assets/data/page02.json';
import page03 from './../../assets/data/page03.json';
import page04 from './../../assets/data/page04.json';
import page05 from './../../assets/data/page05.json';
import page06 from './../../assets/data/page06.json';
import { Subject } from 'rxjs';
import { PageInterface } from '../interfaces/page.interface';
import { NavController, AlertController } from '@ionic/angular';
import { AlertConfig } from '../interfaces/alertConfig.interface';
import { ContentLinkInterface } from '../interfaces/contentLink.interface.js';
import { ActivatedRoute } from '@angular/router';

@Injectable()
export class ContentService {
	prodmode = window.location.hostname.indexOf('localhost') === -1;
	baseUrl = 'http://account.6icatalyst.com';
	apiUrl = this.prodmode ? this.baseUrl : 'http://localhost:8888';
	contentUrl = this.baseUrl + '/api/';
	pageUrl = this.contentUrl + 'wp-json/wp/v2/pages?slug=';
	useStorage = false;
	storageKeys: string[];
	public mainPageData: Subject<PageInterface> = new Subject<PageInterface>();
	public popoverPageData: Subject<PageInterface> = new Subject<PageInterface>();
	public showPopver: Subject<string> = new Subject<string>();

	constructor(
		private http: HttpClient,
		private storage: Storage,
		private alertCtrl: AlertController,
		private navCtrl: NavController,
		private route: ActivatedRoute
	) {}

	public initPageData() {
		const dateTime = new Date().getTime();
		this.storage.keys().then(keys => {
			this.storageKeys = keys;
			const pageList = [page01, page02, page03, page04, page05, page06];
			pageList.forEach((pageData: any) => {
				pageData.forEach(page => {
					let pageKey = 'content-' + page.slug;
					if (this.storageKeys.indexOf(pageKey) === -1) {
						let pageObj = {};
						pageObj['datetime'] = dateTime;
						if (page.content && page.content.rendered) {
							pageObj['markup'] = page.content.rendered;
						}
						if (page.title && page.title.rendered) {
							pageObj['pageTitle'] = page.title.rendered;
						}
						pageObj['pageId'] = page.slug;
						this.storage.set(pageKey, pageObj);
					}
				});
			});
		});
	}

	clickEvent(event: Event) {
		if (event) {
			event.preventDefault();
		}
		let element = event.target as HTMLElement;
		if (!element.hasAttribute('href')) {
			element = element.closest('a');
		}
		const fullSlug = element
			.getAttribute('href')
			.replace(this.contentUrl, '')
			.slice(0, -1);
		this.contentClick(fullSlug);
	}

	contentClick(fullSlug: string) {
		let pageSlug = fullSlug;
		if (pageSlug.indexOf('popover-') > -1) {
			pageSlug = 'popover';
		}
		switch (pageSlug) {
			case 'popover':
				this.showPopver.next(fullSlug);
				break;
			case 'library':
			case 'quick-tools-library':
				this.navCtrl.navigateRoot(['library']);
				break;
			case 'signout':
				this.navCtrl.navigateRoot(['start']);
				break;
			case 'todo':
			case 'to-do':
			case 'to_do':
				this.navCtrl.navigateRoot(['todo']);
				break;
			case 'success':
			case 'success-planner':
			case 'success_planner':
				this.navCtrl.navigateRoot(['success']);
				break;
			default:
				const matchSlug1 = 'jumpstart-building';
				const matchSlug2 = 'jumpstart-leader';
				const currentSlug = this.route.snapshot.queryParams['slug'];
				const replaceBool =
					(currentSlug === matchSlug1 || currentSlug === matchSlug2) &&
					(pageSlug === matchSlug1 || pageSlug === matchSlug2);
				this.navCtrl.navigateRoot(['main'], { queryParams: { slug: fullSlug }, replaceUrl: replaceBool });
				break;
		}
	}

	public updatePageContent(pageSlug: string) {
		if (!pageSlug) {
			return;
		}
		const isPopover = pageSlug.indexOf('popover') > -1;
		const pageUrl = this.pageUrl + pageSlug;
		if (this.useStorage) {
			this.storage.get('content-' + pageSlug).then((page: PageInterface) => {
				if (isPopover) {
					this.popoverPageData.next(page);
				} else {
					this.mainPageData.next(page);
				}
			});
		} else {
			this.http.get(pageUrl).subscribe(apiContent => {
				const storeTimestamp = new Date().getTime();
				const pageData: any = apiContent && Array.isArray(apiContent) ? apiContent[0] : null;
				const storePage: PageInterface = {
					markup: pageData.content.rendered,
					pageTitle: this.pageTitle(pageSlug, pageData.title.rendered),
					pageId: 'page-' + pageData.slug,
					datetime: storeTimestamp
				};
				this.storage.set('content-' + pageSlug, storePage);
				if (isPopover) {
					this.popoverPageData.next(storePage);
				} else {
					this.mainPageData.next(storePage);
				}
			});
		}
	}

	private pageTitle(pageSlug: string, title: string): string {
		const isPopover = pageSlug.indexOf('popover-') > -1;
		const pageTitle =
			isPopover && pageSlug.indexOf('-lm-') > -1
				? 'Learn More'
				: isPopover && pageSlug.indexOf('-ct-') > -1
				? 'Conversation Tips'
				: isPopover && pageSlug.indexOf('-kt-') > -1
				? 'Key Term'
				: isPopover && pageSlug.indexOf('-id-') > -1
				? 'Ideas'
				: isPopover && pageSlug.indexOf('-se-') > -1
				? 'Skills for Entrepreneurs'
				: isPopover && pageSlug.indexOf('-lp-') > -1
				? 'Leadership Principle'
				: isPopover && pageSlug.indexOf('-cs-') > -1
				? 'Case Study'
				: isPopover && pageSlug.indexOf('-co-') > -1
				? 'Coaching'
				: isPopover && pageSlug.indexOf('-dq-') > -1
				? 'Discovery Questions'
				: title;
		return pageTitle;
	}

	public getMenuData(menuId: number, menuSlug: string) {
		this.http.get(this.contentUrl + 'wp-json/wp-api-menus/v2/menus/' + menuId).subscribe(
			menuObj => {
				if (menuObj) {
					this.storeMenu(menuObj);
				}
			},
			() => {
				this.http.get('assets/data/' + menuSlug + '.json').subscribe(menuObj => {
					if (menuObj) {
						this.storeMenu(menuObj);
					}
				});
			}
		);
	}

	private storeMenu(menuObj) {
		let menuItems = menuObj.items.map(item => {
			return {
				title: item.title,
				className: 'listIcon ' + item.classes,
				total: item.attr,
				slug: item.object_slug
			};
		});
		if (menuObj.slug === 'menu_main') {
			menuItems.push({
				title: 'Sign Out',
				slug: 'signout',
				total: '',
				className: 'listIcon fas fa-sign-out-alt'
			});
		}
		this.storage.set(menuObj.slug, menuItems);
	}

	refactorAnchorTags(templateElement) {
		if (!templateElement) {
			return;
		}
		const anchorTags = templateElement.nativeElement.getElementsByTagName('a');
		if (anchorTags[0]) {
			[].slice.call(anchorTags).forEach(element => {
				element.removeEventListener('click', this.clickEvent.bind(this));
				if (!element.hasAttribute('target')) {
					element.addEventListener('click', this.clickEvent.bind(this));
				}
			});
		}
	}

	public async errorMessage() {
		let alert = await this.alertCtrl.create({
			header: 'Oops',
			subHeader: 'The requested page does not exist.',
			buttons: ['Dismiss']
		});
		await alert.present();
	}

	public async promptAlert(config: AlertConfig) {
		let buttons = [];
		config.buttons.forEach(b => {
			buttons.push({
				text: b.label,
				handler: () => {
					alert.dismiss(b.value);
					return false;
				}
			});
		});
		let alert = await this.alertCtrl.create({
			header: config.title,
			message: config.message,
			buttons: buttons
		});
		return await alert;
	}

	getModalClass(pageSlug: string) {
		let styleClass =
			pageSlug.indexOf('-sp-') > -1
				? 'popover_sp'
				: pageSlug.indexOf('-lm-') > -1
				? 'popover_lm'
				: pageSlug.indexOf('-kt-') > -1
				? 'popover_kt'
				: pageSlug.indexOf('-id-') > -1
				? 'popover_id'
				: pageSlug.indexOf('-cs-') > -1
				? 'popover_cs'
				: pageSlug.indexOf('-se-') > -1
				? 'popover_se'
				: pageSlug.indexOf('-lp-') > -1
				? 'popover_lp'
				: pageSlug.indexOf('-co-') > -1
				? 'popover_co'
				: pageSlug.indexOf('-dq-') > -1
				? 'popover_dq'
				: pageSlug.indexOf('-ct-') > -1
				? 'popover_ct'
				: '';
		return styleClass;
	}

	parseLinks(content: PageInterface): ContentLinkInterface[] {
		let pageLinks = [];
		const parser = new DOMParser();
		const htmlObj = parser.parseFromString(content.markup, 'text/html');
		htmlObj.querySelectorAll('a').forEach(link => {
			const apiUrl = this.contentUrl;
			let pageSlug = link.href;
			if (pageSlug.indexOf(apiUrl) > -1) {
				pageSlug = pageSlug.replace(apiUrl, '').replace('/', '');
			}
			const pageLabel = link.innerText;
			pageLinks.push({ slug: pageSlug, label: pageLabel });
		});
		return pageLinks;
	}
}
