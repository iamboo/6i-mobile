import { StrategyMap } from './strategyMap.interface';

export interface ResponseMap {
	key: string;
	status: string;
	message?: string;
	account_maps?: StrategyMap[];
	public_maps?: StrategyMap[];
}
