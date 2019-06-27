import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { NotifyService } from '../../services/notify.service';
import { ToDoInterface } from '../../interfaces/todo.interface';
import { StrategyMap } from '../../interfaces/strategyMap.interface';
import { MapService } from '../../services/map.service';
import { AccountObject } from '../../interfaces/account.interface';
import { combineLatest } from 'rxjs';
import { NavController } from '@ionic/angular';
import { ContentService } from 'src/app/services/content.service';

@Component({
	templateUrl: 'todo.html',
	styleUrls: ['./todo.scss'],
	providers: [MapService]
})
export class TodoPage implements OnInit {
	todoList: ToDoInterface[] = [];
	mapList: StrategyMap[] = [];

	showCompleted: boolean = false;
	emptyList: boolean = false;
	accountData: AccountObject;
	public isX = false;

	constructor(
		private navCtrl: NavController,
		private mapService: MapService,
		private storage: Storage,
		private notifyService: NotifyService,
		private contentService: ContentService
	) {}

	ngOnInit() {
		combineLatest(this.storage.get('account'), this.storage.get('goalData')).subscribe(
			([accountData, goalData]) => {
				this.mapService.mapAPI({ action: 'account_maps', auth_code: accountData.auth_code }).subscribe(maps => {
					this.mapList = maps;
					this.mapGoals(goalData);
				});
			}
		);
		this.isX = this.contentService.isX();
	}

	mapGoals(goalData: ToDoInterface[]) {
		goalData.forEach(goal => {
			const thisMap = this.mapList.find(m => m.map_id === goal.map_id);
			if (thisMap) {
				goal.map_name = thisMap.name;
			}
		});
		goalData = this.sortGoals(goalData);
		this.todoList = this.notifyService.doParseInt(goalData);
		this.getEmptyStatus();
	}

	sortGoals(goals: ToDoInterface[]) {
		return goals.sort((a: ToDoInterface, b: ToDoInterface) => {
			if (a['date_due'] < b['date_due']) return -1;
			if (a['date_due'] > b['date_due']) return 1;
			return 0;
		});
	}

	toggleTodo(todo: ToDoInterface) {
		todo.complete = todo.complete ? 0 : 1;
		this.storage.set('goalData', this.todoList);
		this.storage.get('account').then(accountData => {
			let postData = {
				action: 'update_goal',
				auth_code: accountData.auth_code,
				goal: todo
			};
			this.mapService.mapAPI(postData).subscribe(goalData => {
				if (goalData) {
					const storeGoalData = this.notifyService.doParseInt(goalData);
					this.storage.set('goalData', storeGoalData);
					this.notifyService.scheduleNotifications(storeGoalData);
					this.mapGoals(storeGoalData);
				}
			});
		});
	}

	getEmptyStatus() {
		const notCompleted = this.todoList.filter(todo => todo.complete === 0);
		this.emptyList =
			!this.todoList || this.todoList.length === 0 || (!this.showCompleted && notCompleted.length === 0);
	}

	setMoreGoals() {
		this.navCtrl.navigateRoot(['success']);
	}
}
