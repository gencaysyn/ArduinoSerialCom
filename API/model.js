const mongoose = require('mongoose')

const seraSchema = new mongoose.Schema({
    _id: String,
    name: String,
    temperatures: {type: [Number], default: []},
    set_point: {type: Number, default: 30},
    is_active: Boolean
})

module.exports = mongoose.model('Sera', seraSchema);
