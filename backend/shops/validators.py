from django.core.exceptions import ValidationError

def validate_image(image):
    valid_mime_types = ['image/jpeg', 'image/png']
    file_mime_type = image.file.content_type
    if file_mime_type not in valid_mime_types:
        raise ValidationError("Only JPEG and PNG images are allowed.")

    max_size = 2 * 1024 * 1024  # 2 MB
    if image.size > max_size:
        raise ValidationError("Image size must be under 2MB.")
