from django.shortcuts import render, redirect
from django.views import View
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.models import User
from django.contrib import messages

# signup
''' for signup '''
class SignupView(View):
    def get(self,request):
        return render(request, 'authentification/signup.html' , {'form': UserCreationForm()})

    def post(self, request):
            form = UserCreationForm(request.POST)
            if form.is_valid():
                user = form.save()
                user.first_name = request.POST.get('first_name')
                user.last_name = request.POST.get('last_name')
                user.email = request.POST.get('email')
                user.save()
                messages.success(request,'Account created successfully!')
                return render(request, 'authentification/signup.html', {'form': UserCreationForm()})
                #return redirect('signin')
            messages.error(request,'Registation Failed')
            return render(request, 'authentification/signup.html', {'form': form})
        
# signin
''' for sigin '''
class SigninView(View):
    def get(self,request):
        return render(request, 'authentification/signin.html' , {'form': AuthenticationForm()})
    def post(self, request):
        form = AuthenticationForm(request, data=request.POST)
        s, p = request.POST.get('username'), request.POST.get('password')
        try:
            s = User.objects.get(email=s).username
        except:
            pass
        user = authenticate(request, username=s, password=p)
        if user is not None:
            login(request, user)
            messages.success(request,'Login successful!!')
            return render(request, 'authentification/signin.html', {'form': AuthenticationForm()}) 
            #return redirect('Home')
        messages.error(request, 'Invalid credentials!')   
        return render(request, 'authentification/signin.html' , {'form': form, 'error':'Invalid credentials'})


class LogoutView(View):
    def get(self, request):
        logout(request)
        return redirect('landing_page')
