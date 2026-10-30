// Course hubs (courses, enrollments, orders, products) sit beside their dependants.
// This order gives every declared foreign key its own track without crossing a table.
export const courseRows = [
  ['certificates', 'courses', 'instructors', 'sections'],
  ['reviews', 'enrollments', 'lesson_progress', 'lessons'],
  ['app_auth__account', 'app_auth__user', 'questions', 'question_comments'],
  ['coupon_redemptions', 'orders', 'payments', 'refunds'],
  ['refund_requests', 'coupons', 'products', 'product_files'],
  ['admin_auth__user', 'purchases', 'product_courses', 'download_logs'],
  ['leads', 'app_auth__session', 'app_auth__verification', 'media_assets'],
  ['notices', 'admin_auth__account', 'admin_auth__session', 'admin_auth__verification'],
  ['categories', 'banners', 'webhook_events', 'audit_logs'],
  ['commerce_revision'],
]
