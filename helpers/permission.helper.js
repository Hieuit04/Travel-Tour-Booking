module.exports.checkPermission = (res, permission) => {
  if(!res.locals.pers.includes(permission)){
    res.json({
      code: "error",
      message: "Không có quyền truy cập!"
    })
    return false;
  }
  return true;
}