const categoryFilter = (categoryList, parentId = "") => {
  let filteredCategories = [parentId];
  const children = categoryList.filter(item => {
    return item.parent === parentId;
  });
  for (const child of children) {
    filteredCategories = filteredCategories.concat(categoryFilter(categoryList, child._id))
  }
  return filteredCategories
};

module.exports = categoryFilter;