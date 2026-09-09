const buildCategoryTree = (categories, parentId = "") => {
  const tree = [];
  const targetParent = (parentId || "").toString();

  for (const record of categories) {
    // Nếu là Mongoose doc thì lấy qua ._doc, nếu là lean object thì lấy chính nó
    const item = record._doc ? record._doc : record;
    const itemParent = (item.parent || "").toString();

    if (itemParent === targetParent) {
      const children = buildCategoryTree(categories, item._id.toString());
      tree.push({
        ...item,
        children
      });
    }
  }

  return tree;
};

module.exports = buildCategoryTree;