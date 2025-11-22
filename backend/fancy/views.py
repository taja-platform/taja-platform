# backend/fancy/views.py
from django.http import JsonResponse
import time
import logging


logger = logging.getLogger(__name__)

def home(request):
    data = {
        "status": "success",
        "message": "Well, you hit our API successfully",
        "devs": "Habeeb & Eden",
        "motto": "!BabyDevs"
    }
    return JsonResponse(data)


def health(request):
    # Log the ping
    logger.info("Health endpoint was hit at %s", time.time())

    # Optional query argument, for example /health?value=7
    value = request.GET.get("value")

    # Do a tiny calculation just so something happens
    if value is not None:
        try:
            num = int(value)
            result = num * 2
        except ValueError:
            result = "Invalid number"
    else:
        result = "OK"

    return JsonResponse({
        "status": "alive",
        "result": result
    })