const Contact = require('../../models/contact.model');
module.exports.create = async (req, res) => {
  try {
    const { email } = req.body;
    const existingContact = await Contact.findOne({ email: email });
    if (existingContact) {
      res.json({
        code: 'success',
        message: 'Email đã được đăng ký trước đó.',
      });
      return;
    }
    const newContact = new Contact({ email: email });
    await newContact.save();
    res.json({
      code: 'success',
      message: 'Cảm ơn bạn đã đăng ký!',
    });
  } catch (error) {
    console.error(error);
    res.json({
      code: 'error',
      message: 'Đăng ký thất bại. Vui lòng thử lại sau.',
    });
  }
};