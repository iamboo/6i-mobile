import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Observable, of as observableOf } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ContentService } from '../services/content.service';
import { HttpClient } from '@angular/common/http';
import { ResponseAccount } from '../interfaces/response.account.interface';

@Injectable()
export class AccountService {
	constructor(
		private alertCtrl: AlertController,
		private contentService: ContentService,
		private http: HttpClient,
		private storage: Storage
	) {}

	public toggleChallenge(params): Observable<any> {
		return this.http.post(this.contentService.getApiUrl() + '/action/account.php', params, {}).pipe(
			map(data => {
				const challengeData = data && data['challenge_data'] ? JSON.parse(data['challenge_data']) : null;
				this.storage.set('challengeData', challengeData);
				return challengeData;
			})
		);
	}

	public async showMessage(header: string, message: string) {
		let alert = await this.alertCtrl.create({
			header: header,
			message: message,
			buttons: ['Close']
		});
		await alert.present();
	}

	public accountApi(params: any): Observable<boolean> {
		return this.http.post(this.contentService.getApiUrl() + '/action/account.php', params, {}).pipe(
			map((response: ResponseAccount) => {
				const challengeData = response.account.challenge_data
					? JSON.parse(response.account.challenge_data)
					: {};
				delete response.account.challenge_data;
				this.storage.set('challengeData', challengeData);

				if (response.goal_data) {
					this.storage.set('goalData', response.goal_data);
				}
				if (response.account) {
					this.storage.set('account', response.account);
				}
				return true;
			}),
			catchError(() => {
				this.showMessage(
					'Connection Error',
					'There is a problem connecting to online services.  Please try again later.'
				);
				return observableOf(false);
			})
		);
	}

	async presentAlert(message) {
		let alert = await this.alertCtrl.create({
			header: 'Reset Password',
			subHeader: message,
			buttons: ['Done']
		});
		await alert.present();
	}
}
