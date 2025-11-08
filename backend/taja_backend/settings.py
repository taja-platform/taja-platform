import os
from pathlib import Path
from dotenv import load_dotenv
from decouple import config
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables
load_dotenv(os.path.join(BASE_DIR, ".env"))

# ---------------------------------------------------------------------
# SECURITY & ENV
# ---------------------------------------------------------------------

SECRET_KEY = config("SECRET_KEY", default="unsafe-secret-key")
# OpenCage Geocoding API Key
OPENCAGE_API_KEY = config("OPENCAGE_API_KEY", default=None)

DEBUG = config("DEBUG", default=False, cast=bool)

ALLOWED_HOSTS = config(
    "DJANGO_ALLOWED_HOSTS",
    default="127.0.0.1,localhost",
).split(",")

# ---------------------------------------------------------------------
# APPLICATIONS
# ---------------------------------------------------------------------

INSTALLED_APPS = [
    "corsheaders",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "accounts",
    "shops",
    "fancy",
    "rest_framework",
    "cloudinary",
    "cloudinary_storage",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",  # for static files on Render
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

AUTH_USER_MODEL = "accounts.User"

ROOT_URLCONF = "taja_backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "taja_backend.wsgi.application"

# ---------------------------------------------------------------------
# DATABASE
# ---------------------------------------------------------------------

if DEBUG:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": config("DB_NAME"),
            "USER": config("DB_USER"),
            "PASSWORD": config("DB_PASSWORD"),
            "HOST": config("DB_HOST"),
            "PORT": config("DB_PORT", default=5432, cast=int),
            "OPTIONS": {
                "sslmode": config("DB_SSLMODE", default="require"),
            },
        }
    }

# ---------------------------------------------------------------------
# CORS / CSRF
# ---------------------------------------------------------------------

CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS",
    default="http://localhost:5050,http://127.0.0.1:5050",
).split(",")

CORS_ALLOW_CREDENTIALS = True
CORS_EXPOSE_HEADERS = ["Content-Type", "Authorization"]

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]


CSRF_TRUSTED_ORIGINS = [
    "https://taja-platform.onrender.com",
    *config("CORS_ALLOWED_ORIGINS", default="").split(","),
]


SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
}

# ---------------------------------------------------------------------
CLOUDINARY_STORAGE = {
    "CLOUD_NAME": config("CLOUDINARY_CLOUD_NAME"),
    "API_KEY": config("CLOUDINARY_API_KEY"),
    "API_SECRET": config("CLOUDINARY_API_SECRET"),
}


if DEBUG:
    DEFAULT_FILE_STORAGE = "django.core.files.storage.FileSystemStorage"
else:
    DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"


# ---------------------------------------------------------------------
# AUTH / REST
# ---------------------------------------------------------------------

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ---------------------------------------------------------------------
# INTERNATIONALIZATION
# ---------------------------------------------------------------------

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# ---------------------------------------------------------------------
# STATIC & MEDIA FILES
# ---------------------------------------------------------------------

STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")

# Let WhiteNoise serve static files efficiently
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

if DEBUG:
    MEDIA_URL = "/media/"
    MEDIA_ROOT = os.path.join(BASE_DIR, "media")

# ---------------------------------------------------------------------
# CACHE (Optional: You can remove if not using Redis)
# ---------------------------------------------------------------------

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
    }
}

# ---------------------------------------------------------------------
# DEFAULTS
# ---------------------------------------------------------------------

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
