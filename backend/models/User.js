const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const UserSchema = mongoose.Schema({
    creation_date: { type: String, require: true, default: Date.now },
    last_name: { type: String, require: true },
    first_name: { type: String, require: true },
    email: { type: String, require: true, unique: true },
    password: { type: String, require: true },
    admin_role : { type: String, require: true, default:'1' },
}
);

// Plugin pour éviter de créer un utilisateur en double
UserSchema.plugin(uniqueValidator);
module.exports = mongoose.model('User', UserSchema);