import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ContentService } from 'src/app/services/content.service';
import { ContentLinkInterface } from 'src/app/interfaces/contentLink.interface';
import { ModalController, NavController } from '@ionic/angular';

@Component({
	selector: 'app-map-template',
	templateUrl: './map-template.page.html',
	styleUrls: ['./map-template.page.scss']
})
export class MapTemplatePage implements OnInit {
	pageContentSubscription: Subscription;
	pageLinks: ContentLinkInterface[] = [];

	constructor(
		private contentService: ContentService,
		private modalCtrl: ModalController,
		private navCtrl: NavController
	) {}

	ngOnInit() {
		if (this.pageContentSubscription) {
			this.pageContentSubscription.unsubscribe();
		}
		this.pageContentSubscription = this.contentService.popoverPageData.subscribe(pageContent => {
			if (pageContent) {
				this.pageLinks = this.contentService.parseLinks(pageContent);
			}
		});
		this.contentService.updatePageContent('popover-sp-templates');
	}

	dismiss() {
		this.modalCtrl.dismiss('');
	}

	pageClick(templateSlug) {
		this.dismiss();
		this.navCtrl.navigateRoot(['main'], { queryParams: { slug: templateSlug, edit_map: 1 } });
	}
}
