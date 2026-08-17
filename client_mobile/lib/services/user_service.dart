import 'package:client_mobile/core/network/dio_client.dart';
import 'package:client_mobile/core/network/api_endpoints.dart';
import 'package:client_mobile/providers/auth_provider.dart';

class UserService {
  static Future<UserModel> updateProfile({
    required String name,
    String? phone,
  }) async {
    final response = await DioClient.dio.put(
      ApiEndpoints
          .updateProfile, // 🟡 tambahin constant ini di ApiEndpoints, arahin ke '/user/profile'
      data: {'name': name, 'phone': phone},
    );

    return UserModel.fromJson(response.data);
  }
}
