import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';

/// Interactive 1–5 star selector for write-review flow.
class StarRatingSelector extends StatelessWidget {
  const StarRatingSelector({
    required this.rating,
    required this.onChanged,
    this.size = 36,
    super.key,
  });

  final int rating;
  final ValueChanged<int> onChanged;
  final double size;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'Rating $rating out of 5 stars',
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          for (var i = 1; i <= 5; i++)
            Semantics(
              button: true,
              label: '$i star${i == 1 ? '' : 's'}',
              selected: rating == i,
              child: SizedBox(
                width: 44,
                height: 44,
                child: IconButton(
                  onPressed: () => onChanged(i),
                  icon: Icon(
                    i <= rating ? Icons.star_rounded : Icons.star_border_rounded,
                    color: AppColors.rating,
                    size: size,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
