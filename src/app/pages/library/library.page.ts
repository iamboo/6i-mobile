import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { ContentService } from 'src/app/services/content.service';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-library',
	templateUrl: './library.page.html',
	styleUrls: ['./library.page.scss']
})
export class LibraryPage implements OnInit {
	pageSlug: string = '';
	pageLinks: any[] = [];
	pageContentSubscription: Subscription;

	constructor(
		private contentService: ContentService,
		private route: ActivatedRoute,
		private navCtrl: NavController,
		private iab: InAppBrowser
	) {}

	ngOnInit() {
		this.route.queryParams.subscribe(params => {
			this.pageSlug = params && params['slug'] ? params['slug'] : 'library';
			if (this.pageContentSubscription) {
				this.pageContentSubscription.unsubscribe();
			}
			this.pageContentSubscription = this.contentService.mainPageData.subscribe(pageContent => {
				if (pageContent) {
					this.pageLinks = this.contentService.parseLinks(pageContent);
				}
			});
			this.contentService.updatePageContent(this.pageSlug);
		});
	}

	goBack() {
		this.navCtrl.back();
	}

	pageClick(page: any) {
		let slug = page.slug;
		alert(slug);
		if (slug.indexOf('http:/') > -1) {
			if (slug.indexOf('http://') === -1) {
				slug = slug.replace('http:/', 'http://');
			}
			if (slug.indexOf('.pdf') > -1) {
				this.iab.create(slug, '_system');
			}
		} else {
			const newPageSlug = slug;
			this.navCtrl.navigateRoot(['library'], { queryParams: { slug: newPageSlug } });
		}
	}
}
