const buildBreadcrumb = (currentCategory, categoryList) => {
  const breadcrumb = [];
  let current = currentCategory;
  while (current && current.parent) {
    const parentId = current.parent.toString();
    const parent = categoryList.find(cat => cat._id.toString() === parentId);
    if (!parent) break;
    breadcrumb.unshift(parent);
    current = parent;
  }
  // Thêm danh mục hiện tại vào cuối mảng (nếu có)
  if (currentCategory) {
    breadcrumb.push(currentCategory);
  }
  return breadcrumb;
};

module.exports = buildBreadcrumb;