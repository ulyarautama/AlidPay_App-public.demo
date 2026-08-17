import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

class DashboardSkeleton extends StatelessWidget {
  const DashboardSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: const Color(0xFFF2F2F2),
      highlightColor: Colors.white,
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        children: [
          /// HEADER
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  _SkeletonBox(width: 48, height: 10),
                  SizedBox(height: 8),
                  _SkeletonBox(width: 160, height: 24),
                ],
              ),
              const _SkeletonBox(width: 160, height: 40, radius: 20),
            ],
          ),

          const SizedBox(height: 24),

          /// HERO CARD
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: const [
                    _SkeletonBox(width: 130, height: 12),
                    _SkeletonCircle(18),
                  ],
                ),

                const SizedBox(height: 18),

                const _SkeletonBox(width: 180, height: 34),

                const SizedBox(height: 24),

                Container(height: 1, color: Colors.grey.shade300),

                const SizedBox(height: 18),

                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          _SkeletonBox(width: 70, height: 10),
                          SizedBox(height: 8),
                          _SkeletonBox(width: 90, height: 16),
                        ],
                      ),
                    ),

                    Container(
                      width: 1,
                      height: 32,
                      color: Colors.grey.shade300,
                    ),

                    const SizedBox(width: 16),

                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          _SkeletonBox(width: 90, height: 10),
                          SizedBox(height: 8),
                          _SkeletonBox(width: 100, height: 16),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          /// BUTTON
          const _SkeletonBox(width: double.infinity, height: 54, radius: 12),

          const SizedBox(height: 24),

          /// SUMMARY
          Container(
            padding: const EdgeInsets.symmetric(vertical: 18),
            decoration: const BoxDecoration(
              border: Border(
                top: BorderSide(color: Color(0xFFE6E1D8)),
                bottom: BorderSide(color: Color(0xFFE6E1D8)),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    children: const [
                      _SkeletonBox(width: 34, height: 22),
                      SizedBox(height: 8),
                      _SkeletonBox(width: 70, height: 10),
                    ],
                  ),
                ),

                Container(width: 2, height: 40, color: Colors.grey.shade300),

                Expanded(
                  child: Column(
                    children: const [
                      _SkeletonBox(width: 34, height: 22),
                      SizedBox(height: 8),
                      _SkeletonBox(width: 90, height: 10),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 28),

          const _SkeletonBox(width: 150, height: 22),

          const SizedBox(height: 16),

          /// FILTER
          Row(
            children: const [
              _SkeletonBox(width: 74, height: 34, radius: 8),
              SizedBox(width: 8),
              _SkeletonBox(width: 130, height: 34, radius: 8),
              SizedBox(width: 8),
              _SkeletonBox(width: 120, height: 34, radius: 8),
            ],
          ),

          const SizedBox(height: 20),

          ...List.generate(
            3,
            (_) => const Padding(
              padding: EdgeInsets.only(bottom: 16),
              child: _TransactionSkeleton(),
            ),
          ),
        ],
      ),
    );
  }
}

class _TransactionSkeleton extends StatelessWidget {
  const _TransactionSkeleton();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: const [
          _SkeletonBox(width: 180, height: 14),

          SizedBox(height: 12),

          _SkeletonBox(width: 120, height: 12),

          SizedBox(height: 8),

          _SkeletonBox(width: 90, height: 12),
        ],
      ),
    );
  }
}

class _SkeletonCircle extends StatelessWidget {
  final double size;

  const _SkeletonCircle(this.size);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: const BoxDecoration(
        color: Colors.white,
        shape: BoxShape.circle,
      ),
    );
  }
}

class _SkeletonBox extends StatelessWidget {
  final double width;
  final double height;
  final double radius;

  const _SkeletonBox({
    required this.width,
    required this.height,
    this.radius = 6,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width == double.infinity ? null : width,
      height: height,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(radius),
      ),
    );
  }
}
