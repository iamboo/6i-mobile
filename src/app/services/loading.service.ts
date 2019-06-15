import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable()
export class LoaderService {
	loader: HTMLIonLoadingElement = null;

	constructor(public loadingController: LoadingController) {}

	async startLoader(message: string) {
		this.stopLoader();
		this.loader = await this.loadingController.create({
			message: message
		});
		this.loader.present();
	}

	async stopLoader() {
		if (this.loader) {
			this.loader.dismiss();
			this.loader = null;
		}
	}
}
