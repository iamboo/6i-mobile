export interface AlertConfig {
	title: string;
	message: string;
	buttons: { label: string; value: boolean }[];
}
