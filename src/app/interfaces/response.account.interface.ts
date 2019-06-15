import { AccountObject } from './account.interface';
import { ToDoInterface } from './todo.interface';
import { ReferralInterface } from './referral.interface';

export interface ResponseAccount {
	account: AccountObject;
	key: string;
	referrals: ReferralInterface[];
	goal_data: ToDoInterface[];
}
