const mongoose = require('mongoose');
const schema = new mongoose.Schema({
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AccountClient',
        unique: true},
    items: [{
        tourId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tour',
        },
        quantityAdult: {
            type: Number,
            default: 0
        },
        quantityBaby: {
            type: Number,
            default: 0
        },
        quantityChildren: {
            type: Number,
            default: 0
        },
        checked: {
            type: Boolean,
            default: true
        },
        locationForm:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "City",
        }
    }],

}, {
  timestamps: true
});

const Cart = mongoose.model('Cart', schema, 'cart');

module.exports = Cart;
