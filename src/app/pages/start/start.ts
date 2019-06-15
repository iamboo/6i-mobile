import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import * as CryptoJS from 'crypto-js';
import { AccountService } from '../../services/account.service';
import { ContentService } from '../../services/content.service';
import { LoaderService } from 'src/app/services/loading.service';

@Component({
	templateUrl: 'start.html',
	styleUrls: ['./start.scss'],
	providers: [AccountService, ContentService]
})
export class StartPage implements OnInit {
	constructor(
		private accountService: AccountService,
		private contentService: ContentService,
		private alertCtrl: AlertController,
		private storage: Storage,
		private navCtrl: NavController,
		private loaderService: LoaderService
	) {}

	ngOnInit() {
		this.storage.remove('account');
		this.storage.remove('challengeData');
		this.storage.remove('strategy_maps');
		this.contentService.initPageData();
		this.contentService.getMenuData(20, 'menu_main');

		setTimeout(() => {
			this.loaderService.stopLoader();
		}, 1000);
	}

	async signInPrompt() {
		var postData = {};
		postData['action'] = 'signIn';
		postData['passkey'] = '!nN0v8x6';
		let alert = await this.alertCtrl.create({
			header: 'Sign In',
			subHeader: 'Enter your email address and password.',
			inputs: [
				{
					name: 'email',
					type: 'email',
					placeholder: 'Email'
				},
				{
					name: 'password',
					type: 'password',
					placeholder: 'Password'
				}
			],
			buttons: [
				{
					text: 'Cancel',
					role: 'cancel',
					handler: data => {}
				},
				{
					text: 'Sign In',
					handler: data => {
						let hash = CryptoJS.MD5(data['password']);
						postData['email'] = data['email'];
						postData['password_old'] = data['password'];
						postData['password'] = hash.toString();
						this.accountService.accountApi(postData).subscribe(accountData => {
							if (accountData) {
								this.navCtrl.navigateRoot('/home');
							}
						});
					}
				}
			]
		});
		return await alert.present();
	}

	async resetPrompt() {
		var postData = {};
		postData['action'] = 'sendPassword';
		postData['passkey'] = '!nN0v8x6';
		let alert = await this.alertCtrl.create({
			header: 'Reset Password',
			inputs: [
				{
					name: 'email',
					type: 'email',
					placeholder: 'Enter your email address'
				}
			],
			buttons: [
				{
					text: 'Cancel',
					role: 'cancel',
					handler: data => {}
				},
				{
					text: 'Proceed',
					handler: data => {
						postData['email'] = data['email'];
						this.accountService.accountApi(postData);
					}
				}
			]
		});
		return await alert.present();
	}
	async presentAlert(message) {
		let alert = await this.alertCtrl.create({
			header: 'Notice',
			subHeader: message,
			buttons: ['Done']
		});
		return await alert.present();
	}
	register() {
		this.navCtrl.navigateRoot(['account']);
	}
}
