const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
    user_id: { type: String, require: true },
    creation_date: { type: Date, require: true, default: Date.now  },
    last_name: { type: String, require: true , default: 'toto'},
    first_name: { type: String, require: true , default: 'toto' },
    title: { type: String, require: true },
    description: { type: String, require: true },
    image_url: { type: String, require: false },
    likes: { type: Number, require: true, default: 0 },
    usersLiked: { type: [String], require: true, default: [] },
    disLikes: { type: Number, require: true, default: 0 },
    usersDisLiked: { type: [String], require: true, default: [] },
}
)
module.exports = mongoose.model('Post', PostSchema);
