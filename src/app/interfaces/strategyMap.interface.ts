import { MapReview } from './mapReview.interface';
import { AccountMap } from './accountMap.interface';

export interface StrategyMap {
	archived: number;
	date_modified?: number;
	is_admin: boolean;
	map_key?: string;
	map_id?: number;
	name?: string;
	public: number;
	rating_count: number;
	rating_average: number;
	response: string;
	author_notes?: string;
	inList?: boolean;
	comments?: string;
	status?: string;

	account_map: AccountMap;
	map_review?: MapReview;
}
