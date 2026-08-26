

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from datetime import datetime
from core.models import (
    UserProfile, DonationPost, MealRequest, DonationMatch, Notification
)


def notify(user, message, notif_type):
    Notification.objects.create(
        user=user, message=message, notif_type=notif_type
    )


# ── Public ────────────────────────────────────────────────────
def home(request):
    total_donations = DonationPost.objects.filter(status='completed').count()
    total_users     = UserProfile.objects.count()
    total_meals     = sum(
        DonationPost.objects.filter(
            status='completed'
        ).values_list('people_count', flat=True)
    )
    return render(request, 'home.html', {
        'total_donations': total_donations,
        'total_users':     total_users,
        'total_meals':     total_meals,
    })


def about(request):
    return render(request, 'about.html')


def register_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        email    = request.POST['email']
        p1       = request.POST['password1']
        p2       = request.POST['password2']
        role     = request.POST['role']
        phone    = request.POST['phone']
        org      = request.POST['organization']
        address  = request.POST['address']

        if p1 != p2:
            messages.error(request, 'Passwords do not match!')
            return redirect('register')
        if User.objects.filter(username=username).exists():
            messages.error(request, 'Username already taken!')
            return redirect('register')

        user = User.objects.create_user(
            username=username, email=email, password=p1
        )
        UserProfile.objects.create(
            user=user, role=role, phone=phone,
            organization=org, address=address
        )
        messages.success(request, 'Account created! Please login.')
        return redirect('login')
    return render(request, 'register.html')


def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return redirect('dashboard')
        messages.error(request, 'Wrong username or password!')
    return render(request, 'login.html')

@require_POST
def login_api(request):
    username = request.POST.get('username', '').strip()
    password = request.POST.get('password', '')

    if not username or not password:
        return JsonResponse({
            'success': False,
            'message': 'Please enter username and password.'
        }, status=400)

    user = authenticate(
        request,
        username=username,
        password=password
    )

    if user is None:
        return JsonResponse({
            'success': False,
            'message': 'Wrong username or password!'
        }, status=401)

    login(request, user)

    return JsonResponse({
        'success': True,
        'message': 'Login successful'
    })

def logout_view(request):
    logout(request)
    return redirect('home')


# ── Router ────────────────────────────────────────────────────
@login_required
def dashboard(request):
    if request.user.is_staff:
        return redirect('admin_dashboard')
    try:
        profile = UserProfile.objects.get(user=request.user)
        if profile.role == 'donor':
            return redirect('donor_dashboard')
        return redirect('receiver_dashboard')
    except UserProfile.DoesNotExist:
        return redirect('home')


# ── DONOR ─────────────────────────────────────────────────────
@login_required
def donor_dashboard(request):
    my_posts = DonationPost.objects.filter(
        donor=request.user
    ).order_by('-created_at')

    already_responded = DonationMatch.objects.filter(
        donation_post__donor=request.user
    ).values_list('meal_request_id', flat=True)

    open_requests = MealRequest.objects.filter(
        status='open'
    ).exclude(id__in=already_responded).order_by('preferred_date')

    notifications = Notification.objects.filter(
        user=request.user, is_read=False
    ).order_by('-created_at')[:5]

    return render(request, 'donor_dashboard.html', {
        'my_posts':      my_posts,
        'open_requests': open_requests,
        'notifications': notifications,
        'total':         my_posts.count(),
        'pending':       my_posts.filter(status='pending').count(),
        'matched':       my_posts.filter(status='matched').count(),
        'completed':     my_posts.filter(status='completed').count(),
    })


@login_required
def add_donation(request):
    if request.method == 'POST':
        meal_desc = request.POST.get('meal_description', '').strip()
        people    = request.POST.get('people_count', '1')
        don_date  = request.POST.get('donation_date', '')
        method    = request.POST.get('preparation_method', 'home_cooked')
        notes     = request.POST.get('notes', '')

        if not meal_desc or not don_date:
            messages.error(request, 'Please fill in all required fields.')
            return redirect('donor_dashboard')

        try:
            people_int   = int(people)
            don_date_obj = datetime.strptime(don_date, '%Y-%m-%d').date()
        except (ValueError, TypeError):
            messages.error(request, 'Invalid date or people count.')
            return redirect('donor_dashboard')

        DonationPost.objects.create(
            donor=request.user,
            meal_description=meal_desc,
            people_count=people_int,
            donation_date=don_date_obj,
            preparation_method=method,
            notes=notes,
            status='pending',
        )

        messages.success(
            request,
            'Donation posted! Browse open requests below and respond to one if it matches.'
        )

    return redirect('donor_dashboard')


@login_required
def respond_to_request(request, req_id):
    meal_req = get_object_or_404(MealRequest, id=req_id, status='open')
    if request.method == 'POST':
        method = request.POST.get('preparation_method', 'home_cooked')
        notes  = request.POST.get('notes', '')

        post = DonationPost.objects.create(
            donor=request.user,
            meal_description=f"{meal_req.meal_type} for {meal_req.receiver.username}",
            people_count=meal_req.people_count,
            donation_date=meal_req.preferred_date,
            preparation_method=method,
            notes=notes,
            status='matched',
        )
        DonationMatch.objects.create(
            donation_post=post,
            meal_request=meal_req,
            confirmed_by=request.user,
        )
        meal_req.status = 'matched'
        meal_req.save()

        notify(request.user,
               f"You committed to feed {meal_req.people_count} people "
               f"at {meal_req.receiver.username} on {meal_req.preferred_date}!",
               'match_found')
        notify(meal_req.receiver,
               f"{request.user.username} will donate fresh food "
               f"for {meal_req.people_count} people on {meal_req.preferred_date}.",
               'match_found')
        messages.success(request,
            f"You committed to feed {meal_req.people_count} people "
            f"at {meal_req.receiver.username}!")

    return redirect('donor_dashboard')


@login_required
def delete_donation(request, post_id):
    post = get_object_or_404(DonationPost, id=post_id, donor=request.user)
    if request.method == 'POST':
        if post.status == 'completed':
            messages.error(request, 'Completed donations cannot be deleted.')
        else:
            post.delete()
            messages.success(request, 'Donation deleted successfully.')
    return redirect('donor_dashboard')


# ── RECEIVER ──────────────────────────────────────────────────
@login_required
def receiver_dashboard(request):
    my_requests = MealRequest.objects.filter(
        receiver=request.user
    ).order_by('-created_at')

    incoming_donations = DonationPost.objects.filter(
        donationmatch__meal_request__receiver=request.user
    ).distinct().order_by('-created_at')

    available_donations = DonationPost.objects.filter(
        status='pending'
    ).order_by('donation_date')

    notifications = Notification.objects.filter(
        user=request.user, is_read=False
    ).order_by('-created_at')[:5]

    return render(request, 'receiver_dashboard.html', {
        'my_requests':          my_requests,
        'incoming_donations':   incoming_donations,
        'available_donations':  available_donations,
        'notifications':        notifications,
        'total_requests':       my_requests.count(),
        'open_requests':        my_requests.filter(status='open').count(),
        'matched':              my_requests.filter(status='matched').count(),
        'closed':               my_requests.filter(status='closed').count(),
    })

@login_required
def claim_donation(request, post_id):
    donation = get_object_or_404(DonationPost, id=post_id, status='pending')
    if request.method == 'POST':
        meal_req = MealRequest.objects.create(
            receiver=request.user,
            meal_type=donation.meal_description,
            people_count=donation.people_count,
            preferred_date=donation.donation_date,
            status='matched',
        )
        DonationMatch.objects.create(
            donation_post=donation,
            meal_request=meal_req,
            confirmed_by=request.user,
        )
        donation.status = 'matched'
        donation.save()

        notify(donation.donor,
               f"{request.user.username} claimed your donation for "
               f"{donation.people_count} people on {donation.donation_date}!",
               'match_found')
        notify(request.user,
               f"You claimed a donation from {donation.donor.username} "
               f"for {donation.people_count} people on {donation.donation_date}.",
               'match_found')
        messages.success(request,
            f"You claimed the donation from {donation.donor.username}!")

    return redirect('receiver_dashboard')

@login_required
def add_meal_request(request):
    if request.method == 'POST':
        meal_type  = request.POST.get('meal_type', '').strip()
        people     = request.POST.get('people_count', '1')
        pref_date  = request.POST.get('preferred_date', '')
        notes      = request.POST.get('notes', '')

        if not meal_type or not pref_date:
            messages.error(request, 'Please fill in all required fields.')
            return redirect('receiver_dashboard')

        MealRequest.objects.create(
            receiver=request.user,
            meal_type=meal_type,
            people_count=int(people),
            preferred_date=pref_date,
            notes=notes,
        )
        messages.success(request, 'Meal need posted! Donors can now see your request.')
    return redirect('receiver_dashboard')


@login_required
def delete_request(request, req_id):
    req = get_object_or_404(MealRequest, id=req_id, receiver=request.user)
    if request.method == 'POST':
        if req.status == 'closed':
            messages.error(request, 'Closed requests cannot be deleted.')
        else:
            req.delete()
            messages.success(request, 'Request deleted successfully.')
    return redirect('receiver_dashboard')


@login_required
def confirm_pickup(request, match_id):
    match = get_object_or_404(DonationMatch, id=match_id)
    match.pickup_status        = 'completed'
    match.confirmed_by         = request.user
    match.save()
    match.donation_post.status = 'completed'
    match.donation_post.save()
    match.meal_request.status  = 'closed'
    match.meal_request.save()
    notify(match.donation_post.donor,
           f"Your donation was confirmed completed by "
           f"{match.meal_request.receiver.username}. Thank you!",
           'completed')
    messages.success(request, 'Pickup confirmed! Thank you.')
    return redirect('receiver_dashboard')


# ── ADMIN ─────────────────────────────────────────────────────
@login_required
def admin_dashboard(request):
    if not request.user.is_staff:
        return redirect('home')
    posts    = DonationPost.objects.all().order_by('-created_at')
    reqs     = MealRequest.objects.all().order_by('-created_at')
    matches  = DonationMatch.objects.all().order_by('-matched_on')
    profiles = UserProfile.objects.all()
    return render(request, 'admin_dashboard.html', {
        'posts':          posts,
        'requests':       reqs,
        'matches':        matches,
        'profiles':       profiles,
        'total_posts':    posts.count(),
        'total_requests': reqs.count(),
        'total_matches':  matches.count(),
        'total_meals':    sum(
            p.people_count for p in posts.filter(status='completed')
        ),
        'total_users':    profiles.count(),
    })


@login_required
def manual_match(request, post_id, req_id):
    if not request.user.is_staff:
        return redirect('home')
    post = get_object_or_404(DonationPost, id=post_id)
    req  = get_object_or_404(MealRequest,  id=req_id)
    DonationMatch.objects.create(
        donation_post=post, meal_request=req, confirmed_by=request.user
    )
    post.status = 'matched'; post.save()
    req.status  = 'matched';  req.save()
    notify(post.donor,
           f"Your donation was matched by admin with {req.receiver.username}.",
           'match_found')
    notify(req.receiver,
           f"Your request was matched with {post.donor.username}.",
           'match_found')
    messages.success(request, 'Manual match created!')
    return redirect('admin_dashboard')


# ── PROFILE ───────────────────────────────────────────────────
@login_required
def profile_view(request):
    profile = get_object_or_404(UserProfile, user=request.user)
    if profile.role == 'donor':
        posts = DonationPost.objects.filter(donor=request.user)
        ctx = {
            'profile':         profile,
            'total_posts':     posts.count(),
            'matched_posts':   posts.filter(status='matched').count(),
            'completed_posts': posts.filter(status='completed').count(),
        }
    else:
        reqs = MealRequest.objects.filter(receiver=request.user)
        ctx = {
            'profile':           profile,
            'total_requests':    reqs.count(),
            'matched_requests':  reqs.filter(status='matched').count(),
            'closed_requests':   reqs.filter(status='closed').count(),
        }
    return render(request, 'profile.html', ctx)


@login_required
def mark_read(request, notif_id):
    notif = get_object_or_404(Notification, id=notif_id, user=request.user)
    notif.is_read = True
    notif.save()
    return redirect('dashboard')

    from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie


@ensure_csrf_cookie
def csrf_token_view(request):
    return JsonResponse({'success': True})

from django.contrib.auth import authenticate, login


def api_login(request):
    if request.method != 'POST':
        return JsonResponse({
            'success': False,
            'message': 'POST request required.'
        }, status=405)

    username = request.POST.get('username', '')
    password = request.POST.get('password', '')

    user = authenticate(
        request,
        username=username,
        password=password
    )

    if user is None:
        return JsonResponse({
            'success': False,
            'message': 'Wrong username or password!'
        }, status=401)

    login(request, user)

    if user.is_staff:
        role = 'admin'
    else:
        try:
            profile = UserProfile.objects.get(user=user)
            role = profile.role
        except UserProfile.DoesNotExist:
            role = None

    return JsonResponse({
        'success': True,
        'message': 'Login successful!',
        'role': role
    })