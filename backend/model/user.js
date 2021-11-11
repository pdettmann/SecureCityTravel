const { model, Schema } = require('mongoose');

const userSchema = new Schema({
	username: String,
	password: String,
	email: String,
	createdAt: String,
	role: String,
    token: String
});

module.exports = model('user', userSchema);
