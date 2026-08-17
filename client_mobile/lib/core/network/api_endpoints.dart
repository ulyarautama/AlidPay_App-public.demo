class ApiEndpoints {
  static const baseUrl = "http://192.168.1.2:8001/api";

  static const register = "/register";
  static const String checkName = '/check-name';
  static const String checkEmail = '/check-email';
  static const String checkEmailProvider = '/check-email-provider';
  static const login = "/login";
  static const googleLogin = "/login-google";
  static const verifyOtp = "/verify-otp";
  static const resendOtp = "/resend-otp";
  static const refresh = "/refresh";
  static const me = "/me";

  static String markPaidSimple(String id) =>
      '/transaction/$id/mark-paid-simple';

  static String lookupUser(String publicId) => '/users/lookup/$publicId';
  static const String createTransaction = '/transaction';
  static const String getTransactions = '/transaction';
  static const String unseenCount = '/transaction/unseen-count';
  static const String markSeen = '/transaction/mark-seen';
  static const String updateProfile = '/user/profile';
  static String dispute(String transactionId) => '/transaction/$transactionId/dispute';

  static String getDetailTransaction(String id) => '/transaction/$id';
  static String confirmPayment(String id) => '/transaction/$id/confirm-payment';
  static String markShipped(String id) => '/transaction/$id/mark-shipped';
  static String confirmReceived(String id) =>
      '/transaction/$id/confirm-received';

  static String konfirmasiTransaction(String id) =>
      '/transaction/$id/konfirmasi';
  static String tolakTransaction(String id) => '/transaction/$id/tolak';
}
