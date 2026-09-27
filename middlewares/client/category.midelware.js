const Category = require("../../models/category.model")
const buildCategoryTree = require('../../helpers/categoryTree.helper');

module.exports.list = async (req, res, next) => {
  const categoryList = await Category.find({
    deleted: false,
    status: "active"
  });
  const categoryTree = buildCategoryTree(categoryList, "");
  res.locals.categoryTree = categoryTree;
  next();
} 