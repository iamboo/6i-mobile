import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { StrategyMap } from '../../../interfaces/strategyMap.interface';

@Component({
	templateUrl: 'mapComments.html',
	styleUrls: ['./mapComments.scss'],
	providers: []
})
export class MapCommentsPage implements OnInit {
	public map: StrategyMap;
	public comments: string;
	constructor(private navParams: NavParams, private modalCtrl: ModalController) {}

	ngOnInit() {
		this.map = this.navParams.get('map');
		const reviewComments = this.map.map_review ? this.map.map_review.moderator_comments : null;
		const strategyComments = this.map.comments ? this.map.comments : null;
		if (!this.map.is_admin && reviewComments) {
			this.comments = reviewComments;
		}
		if (this.map.is_admin && strategyComments) {
			this.comments = strategyComments;
		}
	}

	dismiss() {
		this.modalCtrl.dismiss();
	}
}
