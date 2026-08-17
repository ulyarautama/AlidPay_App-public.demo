class ChatMessage {
  final String id;
  final String transactionId;
  final String senderId;
  final String senderName;
  final String message;
  final bool isRead;
  final DateTime createdAt;

  ChatMessage({
    required this.id,
    required this.transactionId,
    required this.senderId,
    required this.senderName,
    required this.message,
    required this.isRead,
    required this.createdAt,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'] as String,
      transactionId: json['transaction_id'] as String,
      senderId: json['sender_id'] as String,
      senderName: json['sender_name'] as String? ?? '-',
      message: json['message'] as String,
      isRead: json['is_read'] as bool? ?? false,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }
}
