import { Injectable } from '@angular/core';
import { ILocalNotification, LocalNotifications } from '@ionic-native/local-notifications/ngx';

@Injectable()
export class NotifyService {
	constructor(public notify: LocalNotifications) {}

	getDateDue(dateIndex: number, dateTimeStamp: number) {
		const dateObj = new Date(dateTimeStamp);
		const offsetDate = new Date(
			dateObj.getFullYear(),
			dateObj.getMonth(),
			dateObj.getDate() + dateIndex,
			9,
			0,
			0,
			0
		);
		return offsetDate;
	}

	doParseInt(goalData) {
		goalData.forEach(goal => {
			goal.id = parseInt(goal.id);
			goal.date_due = parseInt(goal.date_due);
			goal.complete = parseInt(goal.complete);
		});
		return goalData;
	}

	setNotification(id: number, title: string, message: string, dateTimeStamp: number) {
		let notifyObj: ILocalNotification = {
			id: id,
			text: message,
			trigger: { at: this.getDateDue(0, dateTimeStamp) },
			led: 'FF0000',
			sound: null
		};
		if (title && title != '') {
			notifyObj.title = title;
		}
		this.notify.schedule(notifyObj);
	}

	scheduleNotifications(goals) {
		this.notify.clearAll();
		let notifications = [];
		goals.forEach(goal => {
			if (goal.complete === 0 && goal.description && goal.date_due && goal.id) {
				const date_due = new Date(goal.date_due);
				notifications.push({
					id: goal.id,
					text: 'Goal Reminder: ' + goal.description,
					trigger: { at: date_due },
					led: 'FF0000',
					sound: null
				});
			}
		});
		this.notify.schedule(notifications);
	}
}
