class ChatSummary {
  final String? lastMessage;
  final DateTime? lastMessageAt;
  final int unreadCount;

  ChatSummary({
    this.lastMessage,
    this.lastMessageAt,
    required this.unreadCount,
  });

  factory ChatSummary.fromJson(Map<String, dynamic> json) {
    return ChatSummary(
      lastMessage: json['last_message'] as String?,
      lastMessageAt: json['last_message_at'] != null
          ? DateTime.parse(json['last_message_at'] as String)
          : null,
      unreadCount: json['unread_count'] as int? ?? 0,
    );
  }

  ChatSummary copyWith({
    String? lastMessage,
    DateTime? lastMessageAt,
    int? unreadCount,
  }) {
    return ChatSummary(
      lastMessage: lastMessage ?? this.lastMessage,
      lastMessageAt: lastMessageAt ?? this.lastMessageAt,
      unreadCount: unreadCount ?? this.unreadCount,
    );
  }
}
