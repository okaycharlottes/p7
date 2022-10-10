const mongoose = require('mongoose');

const CommentSchema = mongoose.Schema({
    user_id: { type: String, require: true },
    post_id: { type: String, require: true },
    creation_date: { type: String, require: true, default: Date.now  },
    //lastName: { type: String, require: true },
    //firstName: { type: String, require: true },
    content: { type: String, require: true },
}
)
module.exports = mongoose.model('Comment', CommentSchema);
