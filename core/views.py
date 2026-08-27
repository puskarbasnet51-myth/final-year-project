from django.middleware.csrf import get_token
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_POST
from datetime import datetime

from core.models import (
    UserProfile,
    DonationPost,
    MealRequest,
    DonationMatch,
    Notification,
)


# ============================================================
# NOTIFICATIONS
# ============================================================

def notify(user, message, notif_type):
    Notification.objects.create(
        user=user,
        message=message,
        notif_type=notif_type
    )


# ============================================================
# PUBLIC PAGES
# ============================================================

def home(request):
    total_donations = DonationPost.objects.filter(
        status='completed'
    ).count()

    total_users = UserProfile.objects.count()

    total_meals = sum(
        DonationPost.objects.filter(
            status='completed'
        ).values_list('people_count', flat=True)
    )

    return render(request, 'home.html', {
        'total_donations': total_donations,
        'total_users': total_users,
        'total_meals': total_meals,
    })


def about(request):
    return render(request, 'about.html')


# ============================================================
# REGISTRATION
# ============================================================

def _register_user(data):
    """
    Shared registration logic for normal Django
    registration and React registration API.
    """

    username = data.get('username', '').strip()
    email = data.get('email', '').strip()
    password1 = data.get('password1', '')
    password2 = data.get('password2', '')
    role = data.get('role', '').strip()
    phone = data.get('phone', '').strip()
    organization = data.get('organization', '').strip()
    address = data.get('address', '').strip()

    # Required fields
    if not username or not password1 or not password2 or not role:
        return None, 'Please fill in all required fields.'

    # Password check
    if password1 != password2:
        return None, 'Passwords do not match!'

    # Username check
    if User.objects.filter(username=username).exists():
        return None, 'Username already taken!'

    # Create Django user
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password1
    )

    # Create profile
    UserProfile.objects.create(
        user=user,
        role=role,
        phone=phone,
        organization=organization,
        address=address
    )

    return user, None


def register_view(request):
    """
    Normal Django registration page.
    """

    if request.method == 'POST':

        user, error = _register_user(request.POST)

        if error:
            messages.error(request, error)
            return redirect('register')

        messages.success(
            request,
            'Account created! Please login.'
        )

        return redirect('login')

    return render(request, 'register.html')


@ensure_csrf_cookie
def csrf_token_view(request):
    """
    React calls this URL before login/register.
    It creates the CSRF cookie.
    """

    token = get_token(request)

    return JsonResponse({
        'detail': 'CSRF cookie set',
        'csrfToken': token
    })


@require_POST
def register_api(request):
    """
    React registration API.
    """

    user, error = _register_user(request.POST)

    if error:
        return JsonResponse({
            'success': False,
            'message': error
        }, status=400)

    return JsonResponse({
        'success': True,
        'message': 'Account created successfully.'
    })


# ============================================================
# LOGIN
# ============================================================

def login_view(request):
    """
    Normal Django login page.
    """

    if request.method == 'POST':

        username = request.POST.get(
            'username',
            ''
        ).strip()

        password = request.POST.get(
            'password',
            ''
        )

        user = authenticate(
            request,
            username=username,
            password=password
        )

        if user:

            login(request, user)

            return redirect('dashboard')

        messages.error(
            request,
            'Wrong username or password!'
        )

    return render(request, 'login.html')


@require_POST
def login_api(request):
    """
    React login API.
    """

    username = request.POST.get(
        'username',
        ''
    ).strip()

    password = request.POST.get(
        'password',
        ''
    )

    # Check empty fields
    if not username or not password:

        return JsonResponse({
            'success': False,
            'message': 'Please enter username and password.'
        }, status=400)

    # Authenticate
    user = authenticate(
        request,
        username=username,
        password=password
    )

    # Wrong username/password
    if user is None:

        return JsonResponse({
            'success': False,
            'message': 'Wrong username or password!'
        }, status=401)

    # Create Django session
    login(request, user)

    # ADMIN
    if user.is_staff:

        return JsonResponse({
            'success': True,
            'message': 'Login successful',
            'role': 'admin'
        })

    # DONOR / RECEIVER
    try:

        profile = UserProfile.objects.get(
            user=user
        )

        return JsonResponse({
            'success': True,
            'message': 'Login successful',
            'role': profile.role
        })

    except UserProfile.DoesNotExist:

        return JsonResponse({
            'success': False,
            'message': 'User role not found. Please contact the administrator.'
        }, status=400)


# ============================================================
# LOGOUT
# ============================================================

def logout_view(request):
    logout(request)

    return redirect('home')


# ============================================================
# DASHBOARD ROUTER
# ============================================================

@login_required
def dashboard(request):

    # Admin
    if request.user.is_staff:
        return redirect('admin_dashboard')

    try:

        profile = UserProfile.objects.get(
            user=request.user
        )

        # Donor
        if profile.role == 'donor':
            return redirect('donor_dashboard')

        # Receiver
        if profile.role == 'receiver':
            return redirect('receiver_dashboard')

        return redirect('home')

    except UserProfile.DoesNotExist:

        return redirect('home')


# ============================================================
# DONOR DASHBOARD
# ============================================================

@login_required
def donor_dashboard(request):

    my_posts = DonationPost.objects.filter(
        donor=request.user
    ).order_by('-created_at')

    already_responded = DonationMatch.objects.filter(
        donation_post__donor=request.user
    ).values_list(
        'meal_request_id',
        flat=True
    )

    open_requests = MealRequest.objects.filter(
        status='open'
    ).exclude(
        id__in=already_responded
    ).order_by('preferred_date')

    notifications = Notification.objects.filter(
        user=request.user,
        is_read=False
    ).order_by('-created_at')[:5]

    return render(request, 'donor_dashboard.html', {

        'my_posts': my_posts,
        'open_requests': open_requests,
        'notifications': notifications,

        'total': my_posts.count(),

        'pending': my_posts.filter(
            status='pending'
        ).count(),

        'matched': my_posts.filter(
            status='matched'
        ).count(),

        'completed': my_posts.filter(
            status='completed'
        ).count(),
    })


# ============================================================
# ADD DONATION
# ============================================================

@login_required
def add_donation(request):

    if request.method == 'POST':

        meal_desc = request.POST.get(
            'meal_description',
            ''
        ).strip()

        people = request.POST.get(
            'people_count',
            '1'
        )

        donation_date = request.POST.get(
            'donation_date',
            ''
        )

        method = request.POST.get(
            'preparation_method',
            'home_cooked'
        )

        notes = request.POST.get(
            'notes',
            ''
        )

        if not meal_desc or not donation_date:

            messages.error(
                request,
                'Please fill in all required fields.'
            )

            return redirect('donor_dashboard')

        try:

            people_int = int(people)

            donation_date_obj = datetime.strptime(
                donation_date,
                '%Y-%m-%d'
            ).date()

        except (ValueError, TypeError):

            messages.error(
                request,
                'Invalid date or people count.'
            )

            return redirect('donor_dashboard')

        DonationPost.objects.create(

            donor=request.user,

            meal_description=meal_desc,

            people_count=people_int,

            donation_date=donation_date_obj,

            preparation_method=method,

            notes=notes,

            status='pending'
        )

        messages.success(
            request,
            'Donation posted successfully!'
        )

    return redirect('donor_dashboard')


# ============================================================
# DONOR RESPONDS TO REQUEST
# ============================================================

@login_required
def respond_to_request(request, req_id):

    meal_req = get_object_or_404(
        MealRequest,
        id=req_id,
        status='open'
    )

    if request.method == 'POST':

        method = request.POST.get(
            'preparation_method',
            'home_cooked'
        )

        notes = request.POST.get(
            'notes',
            ''
        )

        post = DonationPost.objects.create(

            donor=request.user,

            meal_description=(
                f"{meal_req.meal_type} "
                f"for {meal_req.receiver.username}"
            ),

            people_count=meal_req.people_count,

            donation_date=meal_req.preferred_date,

            preparation_method=method,

            notes=notes,

            status='matched'
        )

        DonationMatch.objects.create(

            donation_post=post,

            meal_request=meal_req,

            confirmed_by=request.user
        )

        meal_req.status = 'matched'
        meal_req.save()

        # Notify donor
        notify(
            request.user,

            (
                f"You committed to feed "
                f"{meal_req.people_count} people "
                f"at {meal_req.receiver.username} "
                f"on {meal_req.preferred_date}!"
            ),

            'match_found'
        )

        # Notify receiver
        notify(
            meal_req.receiver,

            (
                f"{request.user.username} will donate fresh food "
                f"for {meal_req.people_count} people "
                f"on {meal_req.preferred_date}."
            ),

            'match_found'
        )

        messages.success(
            request,
            'Donation matched successfully!'
        )

    return redirect('donor_dashboard')


# ============================================================
# DELETE DONATION
# ============================================================

@login_required
def delete_donation(request, post_id):

    post = get_object_or_404(
        DonationPost,
        id=post_id,
        donor=request.user
    )

    if request.method == 'POST':

        if post.status == 'completed':

            messages.error(
                request,
                'Completed donations cannot be deleted.'
            )

        else:

            post.delete()

            messages.success(
                request,
                'Donation deleted successfully.'
            )

    return redirect('donor_dashboard')


# ============================================================
# RECEIVER DASHBOARD
# ============================================================

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
        user=request.user,
        is_read=False
    ).order_by('-created_at')[:5]

    return render(request, 'receiver_dashboard.html', {

        'my_requests': my_requests,

        'incoming_donations': incoming_donations,

        'available_donations': available_donations,

        'notifications': notifications,

        'total_requests': my_requests.count(),

        'open_requests': my_requests.filter(
            status='open'
        ).count(),

        'matched': my_requests.filter(
            status='matched'
        ).count(),

        'closed': my_requests.filter(
            status='closed'
        ).count(),
    })


# ============================================================
# CLAIM DONATION
# ============================================================

@login_required
def claim_donation(request, post_id):

    donation = get_object_or_404(
        DonationPost,
        id=post_id,
        status='pending'
    )

    if request.method == 'POST':

        meal_req = MealRequest.objects.create(

            receiver=request.user,

            meal_type=donation.meal_description,

            people_count=donation.people_count,

            preferred_date=donation.donation_date,

            status='matched'
        )

        DonationMatch.objects.create(

            donation_post=donation,

            meal_request=meal_req,

            confirmed_by=request.user
        )

        donation.status = 'matched'
        donation.save()

        # Notify donor
        notify(
            donation.donor,

            (
                f"{request.user.username} claimed your donation "
                f"for {donation.people_count} people "
                f"on {donation.donation_date}!"
            ),

            'match_found'
        )

        # Notify receiver
        notify(
            request.user,

            (
                f"You claimed a donation from "
                f"{donation.donor.username} "
                f"for {donation.people_count} people "
                f"on {donation.donation_date}."
            ),

            'match_found'
        )

        messages.success(
            request,
            'Donation claimed successfully!'
        )

    return redirect('receiver_dashboard')


# ============================================================
# ADD MEAL REQUEST
# ============================================================

@login_required
def add_meal_request(request):

    if request.method == 'POST':

        meal_type = request.POST.get(
            'meal_type',
            ''
        ).strip()

        people = request.POST.get(
            'people_count',
            '1'
        )

        preferred_date = request.POST.get(
            'preferred_date',
            ''
        )

        notes = request.POST.get(
            'notes',
            ''
        )

        if not meal_type or not preferred_date:

            messages.error(
                request,
                'Please fill in all required fields.'
            )

            return redirect('receiver_dashboard')

        try:

            people_int = int(people)

        except (ValueError, TypeError):

            messages.error(
                request,
                'Invalid people count.'
            )

            return redirect('receiver_dashboard')

        MealRequest.objects.create(

            receiver=request.user,

            meal_type=meal_type,

            people_count=people_int,

            preferred_date=preferred_date,

            notes=notes
        )

        messages.success(
            request,
            'Meal need posted successfully!'
        )

    return redirect('receiver_dashboard')


# ============================================================
# DELETE MEAL REQUEST
# ============================================================

@login_required
def delete_request(request, req_id):

    meal_request = get_object_or_404(
        MealRequest,
        id=req_id,
        receiver=request.user
    )

    if request.method == 'POST':

        if meal_request.status == 'closed':

            messages.error(
                request,
                'Closed requests cannot be deleted.'
            )

        else:

            meal_request.delete()

            messages.success(
                request,
                'Request deleted successfully.'
            )

    return redirect('receiver_dashboard')


# ============================================================
# CONFIRM PICKUP
# ============================================================

@login_required
def confirm_pickup(request, match_id):

    match = get_object_or_404(
        DonationMatch,
        id=match_id
    )

    match.pickup_status = 'completed'

    match.confirmed_by = request.user

    match.save()

    match.donation_post.status = 'completed'

    match.donation_post.save()

    match.meal_request.status = 'closed'

    match.meal_request.save()

    notify(
        match.donation_post.donor,

        (
            'Your donation was confirmed completed by '
            f'{match.meal_request.receiver.username}. '
            'Thank you!'
        ),

        'completed'
    )

    messages.success(
        request,
        'Pickup confirmed! Thank you.'
    )

    return redirect('receiver_dashboard')


# ============================================================
# ADMIN DASHBOARD - NORMAL DJANGO PAGE
# ============================================================

@login_required
def admin_dashboard(request):

    if not request.user.is_staff:

        return redirect('home')

    posts = DonationPost.objects.all().order_by(
        '-created_at'
    )

    requests = MealRequest.objects.all().order_by(
        '-created_at'
    )

    matches = DonationMatch.objects.all().order_by(
        '-matched_on'
    )

    profiles = UserProfile.objects.all()

    return render(
        request,
        'admin_dashboard.html',
        {

            'posts': posts,

            'requests': requests,

            'matches': matches,

            'profiles': profiles,

            'total_posts': posts.count(),

            'total_requests': requests.count(),

            'total_matches': matches.count(),

            'total_meals': sum(
                p.people_count
                for p in posts.filter(
                    status='completed'
                )
            ),

            'total_users': profiles.count(),
        }
    )


# ============================================================
# ADMIN DASHBOARD API - REACT
# ============================================================

@login_required
def admin_dashboard_api(request):

    # Check admin
    if not request.user.is_staff:

        return JsonResponse({
            'success': False,
            'message': 'Admin access required.'
        }, status=403)

    # Get data
    posts = DonationPost.objects.all().order_by(
        '-created_at'
    )

    requests = MealRequest.objects.all().order_by(
        '-created_at'
    )

    matches = DonationMatch.objects.all().order_by(
        '-matched_on'
    )

    profiles = UserProfile.objects.all()

    # --------------------------------------------------------
    # POSTS
    # --------------------------------------------------------

    posts_data = []

    for post in posts:

        posts_data.append({

            'id': post.id,

            'donor': post.donor.username,

            'meal_description': post.meal_description,

            'people_count': post.people_count,

            'donation_date': str(
                post.donation_date
            ),

            'preparation_method': (
                post.preparation_method
            ),

            'status': post.status,
        })

    # --------------------------------------------------------
    # REQUESTS
    # --------------------------------------------------------

    requests_data = []

    for req in requests:

        requests_data.append({

            'id': req.id,

            'receiver': req.receiver.username,

            'meal_type': req.meal_type,

            'people_count': req.people_count,

            'preferred_date': str(
                req.preferred_date
            ),

            'status': req.status,
        })

    # --------------------------------------------------------
    # MATCHES
    # --------------------------------------------------------

    matches_data = []

    for match in matches:

        matches_data.append({

            'id': match.id,

            'donor': (
                match.donation_post.donor.username
            ),

            'meal': (
                match.donation_post.meal_description
            ),

            'receiver': (
                match.meal_request.receiver.username
            ),

            'date': str(
                match.meal_request.preferred_date
            ),

            'status': match.pickup_status,
        })

    # --------------------------------------------------------
    # USERS / PROFILES
    # --------------------------------------------------------

    profiles_data = []

    for profile in profiles:

        profiles_data.append({

            'id': profile.id,

            'username': (
                profile.user.username
            ),

            'email': (
                profile.user.email
            ),

            'role': profile.role,

            'organization': (
                profile.organization
            ),

            'phone': profile.phone,
        })

    # --------------------------------------------------------
    # TOTAL MEALS
    # --------------------------------------------------------

    total_meals = sum(

        post.people_count

        for post in posts

        if post.status == 'completed'
    )

    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return JsonResponse({

        'success': True,

        'total_users': profiles.count(),

        'total_posts': posts.count(),

        'total_requests': requests.count(),

        'total_matches': matches.count(),

        'total_meals': total_meals,

        'posts': posts_data,

        'requests': requests_data,

        'matches': matches_data,

        'profiles': profiles_data,
    })


# ============================================================
# ADMIN MANUAL MATCH
# ============================================================

@login_required
def manual_match(request, post_id, req_id):

    if not request.user.is_staff:

        return redirect('home')

    post = get_object_or_404(
        DonationPost,
        id=post_id
    )

    meal_request = get_object_or_404(
        MealRequest,
        id=req_id
    )

    DonationMatch.objects.create(

        donation_post=post,

        meal_request=meal_request,

        confirmed_by=request.user
    )

    post.status = 'matched'
    post.save()

    meal_request.status = 'matched'
    meal_request.save()

    # Notify donor
    notify(
        post.donor,

        (
            'Your donation was matched by admin with '
            f'{meal_request.receiver.username}.'
        ),

        'match_found'
    )

    # Notify receiver
    notify(
        meal_request.receiver,

        (
            'Your request was matched with '
            f'{post.donor.username}.'
        ),

        'match_found'
    )

    messages.success(
        request,
        'Manual match created!'
    )

    return redirect('admin_dashboard')


# ============================================================
# PROFILE
# ============================================================

@login_required
def profile_view(request):

    profile = get_object_or_404(
        UserProfile,
        user=request.user
    )

    # DONOR PROFILE
    if profile.role == 'donor':

        posts = DonationPost.objects.filter(
            donor=request.user
        )

        context = {

            'profile': profile,

            'total_posts': posts.count(),

            'matched_posts': posts.filter(
                status='matched'
            ).count(),

            'completed_posts': posts.filter(
                status='completed'
            ).count(),
        }

    # RECEIVER PROFILE
    else:

        requests = MealRequest.objects.filter(
            receiver=request.user
        )

        context = {

            'profile': profile,

            'total_requests': requests.count(),

            'matched_requests': requests.filter(
                status='matched'
            ).count(),

            'closed_requests': requests.filter(
                status='closed'
            ).count(),
        }

    return render(
        request,
        'profile.html',
        context
    )


# ============================================================
# MARK NOTIFICATION AS READ
# ============================================================

@login_required
def mark_read(request, notif_id):

    notification = get_object_or_404(
        Notification,
        id=notif_id,
        user=request.user
    )

    notification.is_read = True

    notification.save()

    return redirect('dashboard')