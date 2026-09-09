// 1. Hàm đệ quy biến mảng phẳng thành cây
module.exports.buildCategoryTree = (categories, parentId = "") => {
  const tree = [];
  
  for (const item of categories) {
    // Chuyển _id và parent về string để so sánh an toàn
    const itemParent = (item.parent || "").toString();
    const targetParent = (parentId || "").toString();
    if (itemParent === targetParent) {
      // Đệ quy tìm con của item hiện tại
      const children = buildCategoryTree(categories, item._id);
      tree.push({
        ...item,
        children: children.length > 0 ? children : []
      });
    }
  }

  return tree;
};

// 2. Controller xử lý
const getCategories = async (req, res) => {
  // Lấy toàn bộ danh mục chỉ với 1 query duy nhất
  const categories = await Category.find({ status: "active" }).lean();
  
  // Dựng cây từ mảng trên bộ nhớ
  const categoryTree = buildCategoryTree(categories, "");

  res.json({ data: categoryTree });
};