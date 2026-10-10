module.exports.pathAdmin = 'admin';

module.exports.permissionList = [
  {
    label: "Xem trang tổng quan",
    value: "dashboard-view",
  },
  {
    label: "Xem danh mục",
    value: "category-view",
  },
  {
    label: "Tạo danh mục",
    value: "category-create",
  },
  {
    label: "Sửa danh mục",
    value: "category-edit",
  },
  {
    label: "Xoá danh mục",
    value: "category-delete",
  },
  {
    label: "Xem tour",
    value: "tour-view",
  },
  {
    label: "Tạo tour",
    value: "tour-create",
  },
  {
    label: "Sửa tour",
    value: "tour-edit",
  },
  {
    label: "Xoá tour",
    value: "tour-delete",
  },
  {
    label: "Xem thùng rác tour",
    value: "tour-trash-view",
  },
  {
    label: "Khôi phục tour đã xoá",
    value: "tour-trash-restore",
  },
  {
    label: "Xoá vĩnh viễn tour",
    value: "tour-trash-delete",
  },
  {
    label: "Xem thông tin website",
    value: "website-info-view",
  },
  {
    label: "Sửa thông tin website",
    value: "website-info-edit",
  },
  {
    label: "Xem tài khoản quản trị",
    value: "account-admin-view",
  },
  {
    label: "Tạo tài khoản quản trị",
    value: "account-admin-create",
  },
  {
    label: "Sửa tài khoản quản trị",
    value: "account-admin-edit",
  },
  {
    label: "Đổi mật khẩu tài khoản quản trị",
    value: "account-admin-change-password",
  },
  {
    label: "Xoá tài khoản quản trị",
    value: "account-admin-delete",
  },
  {
    label: "Xem danh sách nhóm quyền",
    value: "role-list-view",
  },
  {
    label: "Tạo nhóm quyền",
    value: "role-create",
  },
  {
    label: "Sửa nhóm quyền",
    value: "role-edit",
  },
  {
    label: "Xoá nhóm quyền",
    value: "role-delete",
  },
  {
    label: "Xem khuyến mãi",
    value: "promotion-view",
  },
  {
    label: "Tạo khuyến mãi",
    value: "promotion-create",
  },
  {
    label: "Sửa khuyến mãi",
    value: "promotion-edit",
  },
  {
    label: "Xoá khuyến mãi",
    value: "promotion-delete",
  },
  {
    label: "Xem thông tin liên hệ",
    value: "contact-view",
  },
  {
    label: "Xoá thông tin liên hệ",
    value: "contact-delete",
  }
];

module.exports.paymentMethodList = [
  {
    label: "Thanh toán tiền mặt khi đi tour",
    value: "money",
  },
  {
    label: "Zalo Pay",
    value: "zalopay",
  },
  {
    label: "VN Pay",
    value: "vnpay",
  },
  {
    label: "Chuyển khoản ngân hàng",
    value: "bank",
  }
];

module.exports.paymentStatusList = [
  {
    label: "Chưa thanh toán",
    value: "unpaid",
  },
  {
    label: "Đã thanh toán",
    value: "paid",
  }
];

module.exports.orderStatusList = [
  {
    label: "Khởi tạo",
    value: "initial",
  },
  {
    label: "Đang xử lý",
    value: "processing",
  },
  {
    label: "Đã hoàn thành",
    value: "done",
  },
  {
    label: "Thành công",
    value: "success",
  },
  {
    label: "Hủy",
    value: "cancel",
  }
];
