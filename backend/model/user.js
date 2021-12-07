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

userSchema.index({ email: 1});
userSchema.index({ password: 1});

module.exports = model('user', userSchema);
