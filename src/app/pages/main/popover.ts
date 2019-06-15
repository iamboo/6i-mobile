import { Component, ViewChild } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { ContentService } from 'src/app/services/content.service';
import { Subscription } from 'rxjs';

@Component({
	templateUrl: 'popover.html',
	styleUrls: ['./popover.scss']
})
export class MainPopover {
	@ViewChild('popoverContent') popoverContent;
	pageSlug: string = '';
	template: string = '';
	pageTitle: string = '';
	pageContentSubscription: Subscription;

	constructor(
		private navCtrl: NavController,
		private contentService: ContentService,
		private modalCtrl: ModalController
	) {}

	ngOnInit() {
		if (this.pageContentSubscription) {
			this.pageContentSubscription.unsubscribe();
		}
		this.pageContentSubscription = this.contentService.popoverPageData.subscribe(pageContent => {
			if (pageContent) {
				this.renderPageData(pageContent);
			}
		});
		this.contentService.updatePageContent(this.pageSlug);
	}

	renderPageData(pageData) {
		this.template = pageData.markup;
		this.pageTitle = pageData.pageTitle;
		setTimeout(() => {
			this.contentService.refactorAnchorTags(this.popoverContent);
		}, 100);
	}

	dismiss(sendRefresh) {
		this.pageContentSubscription.unsubscribe();
		this.modalCtrl.dismiss(sendRefresh);
	}

	setNavCtrl(pageSlug: string) {
		let params = { slug: pageSlug };
		if (this.pageSlug === 'popover-sp-templates') {
			params['edit_map'] = '1';
		}
		this.navCtrl.navigateRoot(['main'], { queryParams: params });
	}
}
