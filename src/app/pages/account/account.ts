import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Storage } from '@ionic/storage';
import { AccountService } from '../../services/account.service';

@Component({
	templateUrl: 'account.html',
	styleUrls: ['./account.scss'],
	providers: [AccountService]
})
export class AccountPage {
	public accountObj: FormGroup;
	public pageTitle = 'Register';

	constructor(
		private accountService: AccountService,
		private navCtrl: NavController,
		private storage: Storage,
		private formBuilder: FormBuilder
	) {
		this.accountObj = this.formBuilder.group({
			email: ['', Validators.required],
			name: ['', Validators.required],
			password: ['', Validators.required],
			referral: [''],
			contact: [false]
		});
	}

	accountForm() {
		var postData = this.accountObj.value;
		postData['action'] = 'add';
		postData['passkey'] = '!nN0v8x6';
		this.accountService.accountApi(postData).subscribe(accountData => {
			this.navCtrl.navigateRoot(['home']);
		});
	}

	back() {
		this.navCtrl.pop();
	}

	ionViewDidLoad() {
		this.storage.get('account').then(val => {
			if (val) {
				this.pageTitle = 'Account';
			}
		});
	}
}
