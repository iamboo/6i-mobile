import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable()
export class LoaderService {
	loader: HTMLIonLoadingElement = null;

	constructor(public loadingController: LoadingController) {}

	async startLoader(message: string) {
		this.stopLoader(0);
		this.loader = await this.loadingController.create({
			message: message
		});
		this.loader.present();
		this.stopLoader(10000);
	}

	async stopLoader(millis = 500) {
		setTimeout(() => {
			if (this.loader) {
				this.loader.dismiss();
				this.loader = null;
			}
		}, 500);
	}
}
