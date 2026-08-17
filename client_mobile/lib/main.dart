import 'package:client_mobile/core/network/dio_client.dart';
import 'package:client_mobile/core/storage/token_storage.dart';
import 'package:client_mobile/screens/main_nav_screen.dart';
import 'package:client_mobile/screens/splash_screen.dart';
import 'package:client_mobile/widgets/chat_notification_banner.dart';
import 'package:client_mobile/widgets/global_chat_badge.dart';
import 'package:client_mobile/providers/chat_notification_provider.dart';
import 'package:client_mobile/services/chat_service.dart';
import 'package:flutter/material.dart';
import 'package:client_mobile/core/theme/app_colors.dart';
import 'screens/role_select_screen.dart';
import 'package:provider/provider.dart';
import 'package:client_mobile/providers/auth_provider.dart';

final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final access = await TokenStorage.getAccessToken();
  final refresh = await TokenStorage.getRefreshToken();
  debugPrint('Startup TokenStorage Access = $access');
  debugPrint('Startup TokenStorage Refresh = $refresh');

  DioClient.init();

  DioClient.onSessionExpired = () {
    navigatorKey.currentState?.pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const RoleSelectScreen()),
      (route) => false,
    );
  };

  AuthProvider.onLoggedOut = () {
    navigatorKey.currentState?.pushAndRemoveUntil(
      PageRouteBuilder(
        pageBuilder: (context, animation, secondaryAnimation) =>
            const RoleSelectScreen(),
        transitionDuration: Duration.zero,
        reverseTransitionDuration: Duration.zero,
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          return child;
        },
      ),
      (route) => false,
    );
  };
  runApp(const AlidpayApp());
}

class AlidpayApp extends StatelessWidget {
  const AlidpayApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(
          create: (_) =>
              ChatNotificationProvider(chatService: ChatService(DioClient.dio)),
        ),
      ],
      child: MaterialApp(
        initialRoute: '/',
        onGenerateRoute: (settings) {
          Widget page;

          switch (settings.name) {
            case '/':
              page = const SplashScreen();
              break;
            case '/login':
              page = const RoleSelectScreen();
              break;
            case '/buyer-dashboard':
              page = const MainNavScreen(role: 'pembelian');
              break;
            case '/seller-dashboard':
              page = const MainNavScreen(role: 'penjual');
              break;
            default:
              page = const SplashScreen();
          }

          return PageRouteBuilder(
            settings: settings,
            pageBuilder: (context, animation, secondaryAnimation) => page,
            transitionDuration: Duration.zero,
            reverseTransitionDuration: Duration.zero,
            transitionsBuilder:
                (context, animation, secondaryAnimation, child) {
                  return child;
                },
          );
        },
        navigatorKey: navigatorKey,
        title: 'AlidPay',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          fontFamily: 'Roboto',
          scaffoldBackgroundColor: AppColors.background,
          colorScheme: ColorScheme.fromSeed(
            seedColor: AppColors.primary,
            primary: AppColors.primary,
            surface: AppColors.surface,
          ),
          appBarTheme: const AppBarTheme(
            backgroundColor: AppColors.surface,
            foregroundColor: AppColors.text,
            surfaceTintColor: Colors.transparent,
            elevation: 0,
          ),
          dividerColor: AppColors.border,
          inputDecorationTheme: InputDecorationTheme(
            filled: true,
            fillColor: AppColors.surface,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 16,
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.border),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.border),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.primary, width: 2),
            ),
          ),
          filledButtonTheme: FilledButtonThemeData(
            style: FilledButton.styleFrom(
              minimumSize: const Size.fromHeight(48),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
          useMaterial3: true,
        ),
        builder: (context, child) {
          return MediaQuery(
            // 1. Kunci skala font
            data: MediaQuery.of(
              context,
            ).copyWith(textScaler: const TextScaler.linear(1.0)),
            // 2. Gunakan Stack langsung tanpa Overlay ganda
            child: Stack(
              children: [
                child ?? const SizedBox.shrink(),
                const ChatNotificationBanner(),
                const GlobalChatBadge(),
              ],
            ),
          );
        },
      ),
    );
  }
}
