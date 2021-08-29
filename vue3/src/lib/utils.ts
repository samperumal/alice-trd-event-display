export function PromiseTimeout<T>(timeout : number, data: T) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve(data);
		}, timeout);
	});
}