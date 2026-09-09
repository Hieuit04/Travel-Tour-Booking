const Joi = require('joi');

module.exports.categoryCreatePost = (req, res, next) => {
  const schema = Joi.object({
    categoryName: Joi.string()
      .required()
      .messages({
        "string.empty": "Vui lòng điền tên danh mục!",
      }),
    parent: Joi.string().allow(''),
    position: Joi.string().allow(''),
    status: Joi.string().allow(''),
    avatar: Joi.string().allow(''),
    description: Joi.string().allow(''),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.json({
      code: "error",
      message: error.details[0].message
    })
    return;
  }
  next();
}