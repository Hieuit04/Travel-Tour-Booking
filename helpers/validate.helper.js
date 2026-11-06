// Kiểm tra chuỗi có đúng định dạng ObjectId của MongoDB (24 ký tự hex)
module.exports.isValidObjectId = (value) => {
  return typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value);
};

