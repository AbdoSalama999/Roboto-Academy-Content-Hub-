const jwt = require('jsonwebtoken')

// 1. التحقق من وجود التوكن وصحته
exports.protect = (req, res, next) => {
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'غير مصرح لك بالدخول، يرجى تسجيل الدخول أولاً',
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey')
    req.user = decoded // يحتوي على id و role
    next()
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: 'التوكن غير صالح أو منتهي الصلاحية' })
  }
}

// 2. التحقق من أن المستخدم أدمن
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next()
  } else {
    return res
      .status(403)
      .json({ success: false, message: 'عفواً، هذه الصلاحية خاصة بالأدمن فقط' })
  }
}
