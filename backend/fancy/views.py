from django.http import JsonResponse

def home(request):
    data = {
        "status": "success",
        "message": "Well, you hit our API successfully",
        "devs": "Habeeb & Eden",
        "motto": "!BabyDevs"
    }
    return JsonResponse(data)
