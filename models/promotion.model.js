const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  promotionName: String,
  description: String,
  discountUpTo: Number, // Số tiền giảm tối đa để hiển thị "GIẢM ĐẾN X đ" trên UI
  timeStart: Date,
  timeEnd: Date,
  status: {
    type: String,
    default: 'active',
  },
  // Danh sách tour tham gia ưu đãi - nhúng thẳng vào (embedded)
  products: [
    {
      tourId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tour',
      },
      specialPriceAdult: Number,    // Giá ưu đãi người lớn
      specialPriceChildren: Number, // Giá ưu đãi trẻ em
      specialPriceBaby: Number,     // Giá ưu đãi em bé
      stockLimit: Number,           // Số lượng vé giá ưu đãi tối đa
    }
  ],
  createdBy: String,
  updatedBy: String,
  deleted: {
    type: Boolean,
    default: false,
  },
  deletedBy: String,
  deletedAt: Date,
}, {
  timestamps: true,
});

const Promotion = mongoose.model('Promotion', schema, 'promotions');

module.exports = Promotion;
