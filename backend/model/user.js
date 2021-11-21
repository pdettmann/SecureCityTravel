const { model, Schema } = require('mongoose');

const userSchema = new Schema({
	username: String,
	password: String,
	email: String,
	createdAt: String,
    scope: String,
    token: String,
    lastUpdated: Object
});

module.exports = model('user', userSchema);
