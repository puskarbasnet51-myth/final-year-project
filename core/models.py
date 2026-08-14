from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('donor', 'Donor'),
        ('receiver', 'Receiver'),
    ]
    user         = models.OneToOneField(User, on_delete=models.CASCADE)
    role         = models.CharField(max_length=10, choices=ROLE_CHOICES)
    organization = models.CharField(max_length=200)
    phone        = models.CharField(max_length=15)
    address      = models.TextField()

    def __str__(self):
        return f"{self.user.username} — {self.role}"


class MealRequest(models.Model):
    """Posted by Receivers (NGOs) to tell donors what they need."""
    STATUS_CHOICES = [
        ('open',   'Open'),
        ('matched','Matched'),
        ('closed', 'Closed'),
    ]
    receiver       = models.ForeignKey(User, on_delete=models.CASCADE,
                                       related_name='meal_requests')
    meal_type      = models.CharField(max_length=200,
                                      help_text="e.g. Dal Bhat, Roti Tarkari")
    people_count   = models.PositiveIntegerField(help_text="Number of people to feed")
    preferred_date = models.DateField()
    notes          = models.TextField(blank=True)
    status         = models.CharField(max_length=10, choices=STATUS_CHOICES,
                                      default='open')
    created_at     = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.meal_type} for {self.people_count} — {self.receiver.username}"


class DonationPost(models.Model):
    """Posted by Donors — a planned fresh food donation."""
    METHOD_CHOICES = [
        ('home_cooked', 'Home Cooked'),
        ('restaurant',  'Restaurant Ordered'),
    ]
    STATUS_CHOICES = [
        ('pending',   'Pending'),
        ('matched',   'Matched'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
    ]
    donor              = models.ForeignKey(User, on_delete=models.CASCADE,
                                           related_name='donation_posts')
    meal_description   = models.CharField(max_length=300,
                                          help_text="Describe the meal you will donate")
    people_count       = models.PositiveIntegerField(help_text="Number of people you can feed")
    donation_date      = models.DateField(help_text="Date you will deliver the food")
    preparation_method = models.CharField(max_length=20, choices=METHOD_CHOICES,
                                          default='home_cooked')
    notes              = models.TextField(blank=True)
    status             = models.CharField(max_length=10, choices=STATUS_CHOICES,
                                          default='pending')
    created_at         = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.meal_description} by {self.donor.username} on {self.donation_date}"


class DonationMatch(models.Model):
    """Created when a DonationPost is matched to a MealRequest."""
    STATUS_CHOICES = [
        ('pending',   'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
    ]
    donation_post  = models.ForeignKey(DonationPost, on_delete=models.CASCADE)
    meal_request   = models.ForeignKey(MealRequest,  on_delete=models.CASCADE)
    matched_on     = models.DateTimeField(auto_now_add=True)
    pickup_status  = models.CharField(max_length=10, choices=STATUS_CHOICES,
                                      default='pending')
    confirmed_by   = models.ForeignKey(User, on_delete=models.SET_NULL,
                                       null=True, blank=True)

    def __str__(self):
        return f"Match: {self.donation_post} → {self.meal_request}"


class Notification(models.Model):
    TYPE_CHOICES = [
        ('donation_posted',  'Donation Posted'),
        ('match_found',      'Match Found'),
        ('match_confirmed',  'Match Confirmed'),
        ('completed',        'Completed'),
    ]
    user       = models.ForeignKey(User, on_delete=models.CASCADE)
    message    = models.TextField()
    notif_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    is_read    = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notif → {self.user.username}: {self.message[:40]}"