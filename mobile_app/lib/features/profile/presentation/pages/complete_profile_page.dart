import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../app/routing/app_routes.dart';
import '../../../../core/di/providers.dart';
import '../../../../core/error/failure.dart';
import '../../../../core/network/api_endpoints.dart';
import '../../../../core/theme/app_adaptive_colors.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/utils/validators.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_snackbar.dart';
import '../../../../core/widgets/app_text_field.dart';
import '../../../auth/domain/entities/app_user.dart';
import '../../../auth/presentation/auth_controller.dart';

/// Post-login step: mobile number required; name fields are not required.
class CompleteProfilePage extends ConsumerStatefulWidget {
  const CompleteProfilePage({super.key});

  @override
  ConsumerState<CompleteProfilePage> createState() => _CompleteProfilePageState();
}

class _CompleteProfilePageState extends ConsumerState<CompleteProfilePage> {
  final _formKey = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _phone = TextEditingController();
  final _firstName = TextEditingController();
  final _lastName = TextEditingController();
  bool _submitting = false;
  bool _uploadingAvatar = false;
  bool _hydrated = false;
  String? _avatarPreviewUrl;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _hydrateFromUser());
  }

  @override
  void dispose() {
    _email.dispose();
    _phone.dispose();
    _firstName.dispose();
    _lastName.dispose();
    super.dispose();
  }

  void _hydrateFromUser() {
    if (_hydrated) return;
    final user = ref.read(authControllerProvider).value?.user;
    if (user == null) return;
    _hydrated = true;
    _email.text = user.email;
    _phone.text = user.phone ?? '';
    _firstName.text = user.firstName ?? '';
    _lastName.text = user.lastName ?? '';
    setState(() {});
  }

  Future<void> _pickAndUploadAvatar() async {
    final picked = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      maxWidth: 1200,
      imageQuality: 85,
    );
    if (picked == null) return;

    setState(() => _uploadingAvatar = true);
    try {
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(
          picked.path,
          filename: picked.name.isNotEmpty ? picked.name : 'avatar.jpg',
        ),
      });
      final data = await ref.read(dioClientProvider).postMultipart(
            ApiEndpoints.avatarUpload,
            formData,
          );
      final url = (data as Map?)?['avatarUrl']?.toString();
      if (url != null && url.isNotEmpty) {
        setState(() => _avatarPreviewUrl = url);
      }
      await ref.read(authControllerProvider.notifier).refresh();
      if (!mounted) return;
      context.showSnack('Profile photo added');
    } catch (error) {
      if (!mounted) return;
      context.showSnack(Failure.from(error).message, isError: true);
    } finally {
      if (mounted) setState(() => _uploadingAvatar = false);
    }
  }

  Future<void> _submit({required bool skipOptional}) async {
    FocusScope.of(context).unfocus();
    if (!_formKey.currentState!.validate()) return;

    setState(() => _submitting = true);
    try {
      await ref.read(dioClientProvider).post(
        ApiEndpoints.completeProfileDetails,
        data: {
          'phone': _phone.text.trim(),
          if (!skipOptional) ...{
            'firstName': _firstName.text.trim(),
            'lastName': _lastName.text.trim(),
          },
          'skipOptional': skipOptional,
        },
      );
      await ref.read(authControllerProvider.notifier).refresh();
      if (!mounted) return;
      context.go(AppRoutes.home);
      context.showSnack(skipOptional ? 'Mobile number saved.' : 'Profile details saved.');
    } catch (error) {
      if (!mounted) return;
      context.showSnack(Failure.from(error).message, isError: true);
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authControllerProvider).value?.user;
    final theme = Theme.of(context);

    if (user == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return PopScope(
      canPop: false,
      child: Scaffold(
        appBar: AppBar(title: const Text('Complete your profile'), automaticallyImplyLeading: false),
        body: SafeArea(
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(AppSpacing.xxl),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(
                        'Add your mobile number to continue shopping on IndoVyapar.',
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: context.adaptiveColors.textSecondary,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.xl),
                      Center(
                        child: _ProfileAvatarSection(
                          user: user,
                          previewUrl: _avatarPreviewUrl,
                          uploading: _uploadingAvatar,
                          onPickPhoto: _pickAndUploadAvatar,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.lg),
                      AppTextField(
                        controller: _email,
                        label: 'Email',
                        prefixIcon: Icons.mail_outline,
                        enabled: false,
                      ),
                      const SizedBox(height: AppSpacing.lg),
                      AppTextField(
                        controller: _phone,
                        label: 'Mobile number',
                        hint: '10-digit mobile',
                        prefixIcon: Icons.phone_outlined,
                        keyboardType: TextInputType.phone,
                        inputFormatters: [
                          FilteringTextInputFormatter.digitsOnly,
                          LengthLimitingTextInputFormatter(10),
                        ],
                        validator: Validators.phone,
                      ),
                      const SizedBox(height: AppSpacing.lg),
                      AppTextField(
                        controller: _firstName,
                        label: 'First name',
                        prefixIcon: Icons.person_outline,
                      ),
                      const SizedBox(height: AppSpacing.lg),
                      AppTextField(
                        controller: _lastName,
                        label: 'Last name',
                      ),
                      const SizedBox(height: AppSpacing.xxl),
                      AppButton(
                        label: 'Save details',
                        isLoading: _submitting || _uploadingAvatar,
                        onPressed: _uploadingAvatar ? null : () => _submit(skipOptional: false),
                      ),
                      const SizedBox(height: AppSpacing.md),
                      AppButton(
                        label: 'Skip for now',
                        variant: AppButtonVariant.secondary,
                        isLoading: _submitting || _uploadingAvatar,
                        onPressed: _uploadingAvatar ? null : () => _submit(skipOptional: true),
                      ),
                      const SizedBox(height: AppSpacing.md),
                      Text(
                        'Mobile number is required.',
                        textAlign: TextAlign.center,
                        style: theme.textTheme.bodySmall?.copyWith(color: context.adaptiveColors.textMuted),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _ProfileAvatarSection extends StatelessWidget {
  const _ProfileAvatarSection({
    required this.user,
    required this.previewUrl,
    required this.uploading,
    required this.onPickPhoto,
  });

  final AppUser user;
  final String? previewUrl;
  final bool uploading;
  final VoidCallback onPickPhoto;

  @override
  Widget build(BuildContext context) {
    final displayUrl = previewUrl ?? user.resolvedAvatarUrl;
    final hasPhoto = displayUrl != null && displayUrl.isNotEmpty;

    return Column(
      children: [
        Stack(
          clipBehavior: Clip.none,
          alignment: Alignment.center,
          children: [
            SizedBox(
              width: 80,
              height: 80,
              child: _ProfileAvatarImage(user: user, imageUrl: displayUrl),
            ),
            if (uploading)
              Positioned.fill(
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: Colors.black38,
                    shape: BoxShape.circle,
                  ),
                  child: const Center(
                    child: SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    ),
                  ),
                ),
              ),
            Positioned(
              right: 0,
              bottom: 0,
              child: Material(
                color: AppColors.primary,
                shape: const CircleBorder(),
                child: InkWell(
                  onTap: uploading ? null : onPickPhoto,
                  customBorder: const CircleBorder(),
                  child: const Padding(
                    padding: EdgeInsets.all(8),
                    child: Icon(Icons.camera_alt_outlined, color: Colors.white, size: 18),
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),
        TextButton(
          onPressed: uploading ? null : onPickPhoto,
          child: Text(hasPhoto ? 'Change photo' : 'Add profile photo'),
        ),
      ],
    );
  }
}

class _ProfileAvatarImage extends StatelessWidget {
  const _ProfileAvatarImage({required this.user, required this.imageUrl});

  final AppUser user;
  final String? imageUrl;

  @override
  Widget build(BuildContext context) {
    final initials = user.initials;

    if (imageUrl == null || imageUrl!.isEmpty) {
      return CircleAvatar(
        radius: 40,
        backgroundColor: AppColors.primary,
        child: Text(
          initials,
          style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w600),
        ),
      );
    }

    return ClipOval(
      child: Image.network(
        imageUrl!,
        width: 80,
        height: 80,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) => CircleAvatar(
          radius: 40,
          backgroundColor: AppColors.primary,
          child: Text(
            initials,
            style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w600),
          ),
        ),
      ),
    );
  }
}
