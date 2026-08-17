import 'package:flutter/material.dart';

class SkeletonLoading extends StatefulWidget {
  final double height;
  final double width;
  final double borderRadius;
  final EdgeInsetsGeometry? margin;

  const SkeletonLoading({
    super.key,
    this.height = 16,
    this.width = double.infinity,
    this.borderRadius = 12,
    this.margin,
  });

  @override
  State<SkeletonLoading> createState() => _SkeletonLoadingState();
}

class _SkeletonLoadingState extends State<SkeletonLoading>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final shimmer = Tween<double>(
          begin: -1.2,
          end: 1.2,
        ).transform(_controller.value);

        return Container(
          height: widget.height,
          width: widget.width,
          margin: widget.margin,
          decoration: BoxDecoration(
            color: Colors.grey.shade200,
            borderRadius: BorderRadius.circular(widget.borderRadius),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(widget.borderRadius),
            child: Stack(
              children: [
                Positioned.fill(
                  child: Transform.translate(
                    offset: Offset(shimmer * 120, 0),
                    child: FractionallySizedBox(
                      widthFactor: 0.35,
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              Colors.white.withValues(alpha: 0.0),
                              Colors.white.withValues(alpha: 0.75),
                              Colors.white.withValues(alpha: 0.0),
                            ],
                            stops: const [0.0, 0.5, 1.0],
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class DashboardSkeleton extends StatelessWidget {
  const DashboardSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(18),
      children: [
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SkeletonLoading(height: 18, width: 120),
              const SizedBox(height: 12),
              const SkeletonLoading(height: 14, width: 220),
              const SizedBox(height: 12),
              const SkeletonLoading(height: 14, width: 80),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SkeletonLoading(height: 12, width: 70),
                    SizedBox(height: 10),
                    SkeletonLoading(height: 20, width: 90),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SkeletonLoading(height: 12, width: 70),
                    SizedBox(height: 10),
                    SkeletonLoading(height: 20, width: 90),
                  ],
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        ...List.generate(
          3,
          (index) => Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SkeletonLoading(height: 14, width: 180),
                  SizedBox(height: 10),
                  SkeletonLoading(height: 12, width: 120),
                  SizedBox(height: 8),
                  SkeletonLoading(height: 12, width: 90),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class ListSkeleton extends StatelessWidget {
  final int itemCount;

  const ListSkeleton({super.key, this.itemCount = 4});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: itemCount,
      itemBuilder: (_, _) => Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
          ),
          child: const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SkeletonLoading(height: 14, width: 180),
              SizedBox(height: 10),
              SkeletonLoading(height: 12, width: 120),
              SizedBox(height: 8),
              SkeletonLoading(height: 12, width: 90),
            ],
          ),
        ),
      ),
    );
  }
}
