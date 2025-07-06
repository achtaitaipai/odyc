import friendlyWords from 'friendly-words';

export function generateGametName() {
	const adj = friendlyWords.predicates[Math.floor(Math.random() * friendlyWords.predicates.length)];
	const obj = friendlyWords.objects[Math.floor(Math.random() * friendlyWords.objects.length)];
	return `${capitalizeFirstLetter(adj)} ${capitalizeFirstLetter(obj)}`;
}

function capitalizeFirstLetter(val: string) {
	return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}
