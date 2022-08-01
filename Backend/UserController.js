export default class UserController {
	constructor() {
		this.userById = {};
		this.userSessionIds = {};
	}

	register(user) {
		this.userById[user.id] = user;
		this.userSessionIds[user.id] = user;
	}
	unregister(id) {
		var user = this.getById(id);
		if (user) {
			delete this.usersByName[user.name];
			delete this.userSessionIds[user.id];
		}
	}
	getById(id) {
		return this.userById[id];
	}
	removeById(id) {
		const userSession = this.userById[id];
		if (!userSession) return false;
		delete this.userById[id];
	}
}
