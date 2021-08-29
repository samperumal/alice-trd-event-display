export function PromiseTimeout<T>(timeout : number, data: T) {
	return new Promise<T>((resolve, reject) => {
		setTimeout(() => {
			resolve(data);
		}, timeout);
	});
}