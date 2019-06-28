import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable()
export class LoaderService {
	loader: HTMLIonLoadingElement = null;

	constructor(public loadingController: LoadingController) {}

	async startLoader(message: string) {
		this.stopLoader(0);
		this.loader = await this.loadingController.create({
			message: message,
			duration: 8000,
			backdropDismiss: true
		});
		this.loader.present();
	}

	async stopLoader(millis = 500) {
		if (this.loader) {
			this.loader.dismiss();
			this.loader = null;
		}
	}
}
