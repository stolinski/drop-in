export type BaseQuestionConfig = {
	required: boolean;
};

export type TextConfig = BaseQuestionConfig & {
	minLength?: number;
	maxLength?: number;
	validationPattern?: string;
};

export type RatingConfig = BaseQuestionConfig & {
	max: number;
	kind: 'start' | 'number';
	labels?: {
		min: string;
		max: string;
	};
};

export type ChoiceConfig = BaseQuestionConfig & {
	options: Array<{
		id: string;
		label: string;
		value: string;
	}>;
	allowMultiple?: boolean;
	minSelections?: number;
	maxSelections?: number;
	allowOther?: boolean;
};

export type QuestionConfig = TextConfig | RatingConfig | ChoiceConfig;
