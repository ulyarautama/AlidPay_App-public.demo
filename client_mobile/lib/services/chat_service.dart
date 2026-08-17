import 'package:client_mobile/models/chat_summary.dart';
import 'package:dio/dio.dart';
import '../models/chat_message.dart';

class ChatService {
  final Dio dio;

  ChatService(this.dio);

  Future<Map<String, dynamic>> fetchMessages(
    String transactionId, {
    String? cursor,
  }) async {
    final queryParameters = <String, dynamic>{'per_page': 30};

    if (cursor case final validCursor?) {
      queryParameters['cursor'] = validCursor;
    }

    final response = await dio.get(
      '/transaction/$transactionId/messages',
      queryParameters: queryParameters,
    );

    final messages = (response.data['data'] as List)
        .map((item) => ChatMessage.fromJson(item as Map<String, dynamic>))
        .toList();

    return {
      'messages': messages,
      'nextCursor': response.data['next_cursor'] as String?,
    };
  }

  Future<int> fetchUnreadCount() async {
    final response = await dio.get('/chat/unread-count');
    return response.data['unread_count'] as int;
  }

  Future<Map<String, ChatSummary>> fetchChatSummary() async {
    final response = await dio.get('/chat/summary');
    final Map<String, dynamic> data =
        response.data['data'] as Map<String, dynamic>;
    return data.map(
      (key, value) =>
          MapEntry(key, ChatSummary.fromJson(value as Map<String, dynamic>)),
    );
  }

  Future<void> markMessagesAsRead(String transactionId) {
    return dio.post('/transaction/$transactionId/messages/read');
  }

  Future<ChatMessage> sendMessage(
    String transactionId,
    String message, {
    String? socketId, // 👈 tambahin parameter ini
  }) async {
    final response = await dio.post(
      '/transaction/$transactionId/messages',
      data: {'message': message},
      options: socketId != null
          ? Options(
              headers: {'X-Socket-Id': socketId},
            ) // 👈 header ini yang bikin toOthers() kerja
          : null,
    );
    return ChatMessage.fromJson(response.data['data'] as Map<String, dynamic>);
  }
}
