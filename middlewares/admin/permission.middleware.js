module.exports.checkPermission = (permission) => {
  return (req,res,next) => {
    if(!res.locals.pers.includes(permission)){
      res.json({
        code: "error",
        message: "Không có quyền truy cập!"
      })
      return;
    }
    else{
      next();
    }
  }
}