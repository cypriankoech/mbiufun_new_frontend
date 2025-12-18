# Backend Feed Implementation for Mbiufun

## Current State Analysis

### ✅ What Already Exists

1. **Posts System** (`african_mbiu/posts/`)
   - `MbiuPost` model with text, images, video support
   - `PostFeed` view for tribe-based posts
   - `UnifiedFeed` view for friend posts
   - Post creation, editing, deletion endpoints
   - Related to tribes and rooms

2. **Likes System** (`african_mbiu/likes/`)
   - `MbiuLikes` model
   - Like/unlike functionality
   - Already integrated with posts

3. **Comments System** (`african_mbiu/comments/`)
   - Comment functionality exists
   - Integrated with posts

4. **User Relationships**
   - Following/follower system via `Relationship` model
   - Helper methods: `get_following()`, `get_followers()`

5. **Hobbies/Vibes**
   - `Profile` model has `hobbies` field (CharField with choices)
   - `User` has `selected_vibes` (ManyToMany with Games)
   - Max 5 vibes per user already enforced

## 🔨 Required Backend Changes

### 1. Enhance the `MbiuPost` Model

**File**: `am-back/african_mbiu/posts/models.py`

```python
from django.db import models
from african_mbiu.forum.models import Room
from african_mbiu.tribes.models import Tribe
from african_mbiu.users.models import User

class MbiuPost(models.Model):
    POST_TYPE_CHOICES = [
        ('user', 'User Post'),
        ('event', 'Event Post'),
    ]
    
    name = models.CharField(max_length=128, null=True, blank=True)
    description = models.TextField(blank=True)
    main_image = models.CharField(max_length=255, null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    text = models.TextField(null=True)  # This is the caption
    created_at = models.DateTimeField(auto_now_add=True)
    post_img = models.CharField(max_length=255, null=True, blank=True)
    post_video = models.CharField(max_length=255, null=True, blank=True)
    visible = models.BooleanField(default=True, null=False)
    room = models.ForeignKey(Room, on_delete=models.DO_NOTHING,related_name='posts',null=True)
    tribe = models.ForeignKey(Tribe, on_delete=models.DO_NOTHING,related_name='posts',null=True)
    
    # NEW FIELDS FOR FEED FEATURE
    hobby = models.ForeignKey('games.Game', on_delete=models.SET_NULL, null=True, blank=True, 
                               related_name='hobby_posts',
                               limit_choices_to={'game_mode': 'non_competitive'})
    post_type = models.CharField(max_length=10, choices=POST_TYPE_CHOICES, default='user')
    
    # For event posts
    event_title = models.CharField(max_length=255, null=True, blank=True)
    event_date = models.CharField(max_length=100, null=True, blank=True)
    event_time = models.CharField(max_length=100, null=True, blank=True)
    event_link = models.URLField(null=True, blank=True)
    
    def __str__(self):
        return self.name or f"Post by {self.user.username}"
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['hobby', '-created_at']),
        ]
```

**Migration Command**:
```bash
cd am-back
python manage.py makemigrations
python manage.py migrate
```

### 2. Update `PostSerializer`

**File**: `am-back/african_mbiu/posts/front/serializers/post.py`

```python
from african_mbiu.core.core import ago, b64_encode
from african_mbiu.mention.core import parse_mentioned_text
from african_mbiu.users.front.serializers.user import UserMinimalSerializer
from rest_framework import serializers
from african_mbiu.models import MbiuPost
from african_mbiu.comments.front.serializers.core import CommentSerializer
from african_mbiu.likes.front.serializers.core import LikeSerializer
from django.conf import settings


class PostSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()  # Changed to method for more control
    comments = CommentSerializer(many=True, read_only=True)
    likes = LikeSerializer(many=True, read_only=True)
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    timestring = serializers.SerializerMethodField()
    text = serializers.SerializerMethodField()
    post_img = serializers.SerializerMethodField()
    hobby = serializers.SerializerMethodField()
    is_friend_post = serializers.SerializerMethodField()
    event_details = serializers.SerializerMethodField()
    
    class Meta:
        model = MbiuPost
        fields = (
            "id",
            'user',
            'text',
            'created_at',
            'post_img',
            'post_video',
            'likes',
            'comments',
            'likes_count',
            'comments_count',
            'is_liked',
            'timestring',
            'visible',
            'hobby',
            'is_friend_post',
            'post_type',
            'event_details',
        )
    
    def get_user(self, obj: MbiuPost):
        """Return author info"""
        return {
            'id': obj.user.id,
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name,
            'profile_image': settings.API_URL + 'v1/i/image/' + b64_encode(obj.user.profile.profile_image) if obj.user.profile.profile_image else None
        }
    
    def get_hobby(self, obj: MbiuPost):
        """Return hobby info if post is tagged with hobby"""
        if obj.hobby:
            return {
                'id': obj.hobby.id,
                'name': obj.hobby.name,
                'icon': obj.hobby.emoji if hasattr(obj.hobby, 'emoji') else None
            }
        return None
    
    def get_is_friend_post(self, obj: MbiuPost):
        """Check if post is from a friend (following relationship)"""
        request = self.context.get('request')
        user = self.context.get('user')
        if user:
            return user.is_following(obj.user)
        return False
    
    def get_event_details(self, obj: MbiuPost):
        """Return event details if post is an event"""
        if obj.post_type == 'event':
            return {
                'title': obj.event_title,
                'date': obj.event_date,
                'time': obj.event_time,
                'link': obj.event_link
            }
        return None

    def get_post_img(self, obj: MbiuPost):
        if obj.post_img:
            return settings.API_URL + 'v1/i/image/' + b64_encode(obj.post_img)
        return None
    
    def get_likes_count(self, obj: MbiuPost):
        return obj.likes.filter(liked=True).count()
    
    def get_comments_count(self, obj: MbiuPost):
        return obj.comments.count()
    
    def get_is_liked(self, obj: MbiuPost):
        """Check if current user liked this post"""
        user = self.context.get('user')
        if user:
            return obj.likes.filter(user=user, liked=True).exists()
        return False
        
    def get_timestring(self, obj: MbiuPost):
        return ago(obj.created_at)

    def get_text(self, obj: MbiuPost):
        if obj.text:
            if isinstance(obj.text, bytes):
                return parse_mentioned_text(message=obj.text.decode('utf-8'))
            return parse_mentioned_text(message=obj.text)
        return ''
```

### 3. Create Enhanced Feed Views

**File**: `am-back/african_mbiu/posts/front/views/core.py`

Add these new views:

```python
from django.db.models import Q, Count
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

class EnhancedUnifiedFeed(GenericAPIView):
    """
    Unified feed that combines:
    1. Posts from user's selected hobbies/vibes
    2. Posts from friends (people user follows)
    Supports filtering by specific hobby while still showing friend posts
    """
    page = 1
    per_page = 20
    
    def get(self, request, *args, **kwargs):
        data = request.GET.dict()
        user, token = verify_token(request=request)
        
        # Pagination
        if 'page' in data:
            self.page = int(data['page'])
        if 'per_page' in data:
            self.per_page = int(data['per_page'])
        
        # Get user's following list
        following_ids = get_followed_ids(user)
        
        # Get user's selected hobbies/vibes
        user_hobbies = user.selected_vibes.all()
        hobby_ids = [h.id for h in user_hobbies]
        
        # Base filter: exclude posts in rooms (those are for forum/fireplace)
        base_filter = Q(room=None, visible=True)
        
        # Optional: filter by specific hobby
        hobby_filter = data.get('hobby_id')
        
        if hobby_filter:
            # When filtering by hobby, show:
            # 1. Posts tagged with that hobby
            # 2. All friend posts (regardless of hobby)
            posts = MbiuPost.objects.filter(
                base_filter & (
                    Q(hobby_id=hobby_filter) |  # Posts with selected hobby
                    Q(user_id__in=following_ids)  # OR friend posts
                )
            ).distinct().order_by('-created_at')
        else:
            # Show all: posts from user's hobbies + friend posts
            posts = MbiuPost.objects.filter(
                base_filter & (
                    Q(hobby_id__in=hobby_ids) |  # User's hobby posts
                    Q(user_id__in=following_ids)  # Friend posts
                )
            ).distinct().order_by('-created_at')
        
        # Paginate
        paginated_posts = paginate_queryset(posts, self.page, self.per_page)
        
        # Serialize with context
        serializer = PostSerializer(
            paginated_posts, 
            many=True, 
            context={'user': user, 'request': request}
        )
        
        # Calculate if there's a next page
        total_count = posts.count()
        has_next = (self.page * self.per_page) < total_count
        
        return Response({
            'results': serializer.data,
            'count': total_count,
            'next': f'?page={self.page + 1}&per_page={self.per_page}' if has_next else None,
            'previous': f'?page={self.page - 1}&per_page={self.per_page}' if self.page > 1 else None
        }, status.HTTP_200_OK)


class CreatePost(GenericAPIView):
    """
    Enhanced post creation with hobby support
    """
    def post(self, request, *args, **kwargs):
        user, token = verify_token(request=request)
        
        # Check active post limit (5 posts max)
        active_posts_count = MbiuPost.objects.filter(
            user=user, 
            visible=True,
            room=None
        ).count()
        
        if active_posts_count >= 5:
            return Response({
                'error': 'You have reached the maximum of 5 active posts. Delete an old post to create a new one.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get data
        caption = request.data.get('caption', '')
        hobby_id = request.data.get('hobby_id')
        image = request.FILES.get('image')
        
        if not caption.strip():
            return Response({
                'error': 'Caption is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate caption length
        if len(caption) > 500:
            return Response({
                'error': 'Caption must be 500 characters or less'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Handle image upload
        image_path = None
        if image:
            # Validate file size (5MB max)
            if image.size > 5 * 1024 * 1024:
                return Response({
                    'error': 'Image must be less than 5MB'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            image_path = f'posts/{time.time()}_{image.name}'
            handle_uploaded_file(image, image_path)
        
        # Validate hobby if provided
        hobby = None
        if hobby_id:
            try:
                from games.models import Game
                hobby = Game.objects.get(id=hobby_id, game_mode='non_competitive')
                
                # Ensure hobby is in user's selected vibes
                if not user.selected_vibes.filter(id=hobby_id).exists():
                    return Response({
                        'error': 'Selected hobby must be one of your chosen vibes'
                    }, status=status.HTTP_400_BAD_REQUEST)
            except Game.DoesNotExist:
                return Response({
                    'error': 'Invalid hobby selected'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create post
        try:
            new_post = MbiuPost.objects.create(
                user=user,
                text=caption,
                post_img=image_path,
                hobby=hobby,
                tribe=user.tribe,
                room=None,  # Feed posts don't belong to rooms
                post_type='user'
            )
            
            serializer = PostSerializer(new_post, context={'user': user, 'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error creating post: {str(e)}")
            return Response({
                'error': 'Failed to create post'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserActivePostCount(GenericAPIView):
    """
    Get user's active post count and limit
    """
    def get(self, request, *args, **kwargs):
        user, token = verify_token(request=request)
        
        count = MbiuPost.objects.filter(
            user=user,
            visible=True,
            room=None
        ).count()
        
        return Response({
            'count': count,
            'limit': 5
        }, status.HTTP_200_OK)


@api_view(['POST'])
def like_post_v2(request, post_id):
    """
    Enhanced like endpoint
    """
    user, token = verify_token(request=request)
    
    try:
        post = MbiuPost.objects.get(id=post_id)
    except MbiuPost.DoesNotExist:
        return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if already liked
    existing_like = MbiuLikes.objects.filter(user=user, post=post, liked=True).first()
    
    if existing_like:
        return Response({
            'error': 'Already liked',
            'likes_count': post.likes.filter(liked=True).count()
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Create or update like
    MbiuLikes.objects.update_or_create(
        user=user,
        post=post,
        defaults={'liked': True, 'likes': 1}
    )
    
    likes_count = post.likes.filter(liked=True).count()
    
    return Response({
        'likes_count': likes_count
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
def unlike_post_v2(request, post_id):
    """
    Enhanced unlike endpoint
    """
    user, token = verify_token(request=request)
    
    try:
        post = MbiuPost.objects.get(id=post_id)
    except MbiuPost.DoesNotExist:
        return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Remove like
    MbiuLikes.objects.filter(user=user, post=post).delete()
    
    likes_count = post.likes.filter(liked=True).count()
    
    return Response({
        'likes_count': likes_count
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
def ai_caption_suggestions(request):
    """
    Generate AI caption suggestions (placeholder - integrate with OpenAI later)
    """
    user, token = verify_token(request=request)
    
    context = request.data.get('context', '')
    
    # TODO: Integrate with OpenAI API
    # For now, return static suggestions
    suggestions = [
        {'text': 'Just shared something awesome! ✨', 'tone': 'excited'},
        {'text': 'Loving this moment 💙', 'tone': 'casual'},
        {'text': "Here's what I've been up to lately", 'tone': 'reflective'}
    ]
    
    return Response({
        'suggestions': suggestions
    }, status=status.HTTP_200_OK)
```

### 4. Update URL Configuration

**File**: `am-back/african_mbiu/posts/front/urls.py`

```python
from django.urls import path
from . import views as vw

urlpatterns = [
    # Legacy endpoints (keep for backward compatibility)
    path("feed/", vw.PostFeed.as_view()),
    path("detail/<int:id>", vw.edit_post.as_view()),
    path('posts/', vw.PostFeed.as_view(), name='post-feed'),
    path("post/", vw.PostDetail.as_view()),
    path("unified_feed/", vw.UnifiedFeed.as_view()),
    
    # NEW Enhanced Feed endpoints
    path("unified_feed/", vw.EnhancedUnifiedFeed.as_view(), name='enhanced-unified-feed'),
    path("create/", vw.CreatePost.as_view(), name='create-post'),
    path("my_active_count/", vw.UserActivePostCount.as_view(), name='active-post-count'),
    path("<int:post_id>/like/", vw.like_post_v2, name='like-post-v2'),
    path("<int:post_id>/unlike/", vw.unlike_post_v2, name='unlike-post-v2'),
    path("ai_captions/", vw.ai_caption_suggestions, name='ai-captions'),
]
```

### 5. Add Hobbies Endpoint

**File**: `am-back/african_mbiu/users/front/views/user.py`

Add this view:

```python
class UserHobbies(GenericAPIView):
    """
    Get user's selected hobbies/vibes
    """
    def get(self, request):
        user, token = verify_token(request)
        
        vibes = user.selected_vibes.all()
        
        hobbies = [{
            'id': vibe.id,
            'name': vibe.name,
            'icon': vibe.emoji if hasattr(vibe, 'emoji') else None
        } for vibe in vibes]
        
        return Response({
            'hobbies': hobbies
        }, status.HTTP_200_OK)
```

**File**: `am-back/african_mbiu/users/front/urls.py`

Add this URL:

```python
path('hobbies/', UserHobbies.as_view(), name='user-hobbies'),
```

## 📋 Implementation Checklist

- [ ] 1. Add new fields to `MbiuPost` model
- [ ] 2. Run migrations
- [ ] 3. Update `PostSerializer`
- [ ] 4. Add `EnhancedUnifiedFeed` view
- [ ] 5. Add `CreatePost` view
- [ ] 6. Add `UserActivePostCount` view
- [ ] 7. Add `like_post_v2` and `unlike_post_v2` functions
- [ ] 8. Add `ai_caption_suggestions` function
- [ ] 9. Add `UserHobbies` view
- [ ] 10. Update URL configurations
- [ ] 11. Test all endpoints with Postman/curl
- [ ] 12. (Optional) Integrate OpenAI for AI captions

## 🧪 Testing Endpoints

```bash
# 1. Get unified feed
curl -H "Authorization: Bearer <JWT>" \
     -H "mbiu-token: <TOKEN>" \
     "http://localhost:8000/api/v1/posts/unified_feed/?page=1&per_page=20"

# 2. Get unified feed filtered by hobby
curl -H "Authorization: Bearer <JWT>" \
     -H "mbiu-token: <TOKEN>" \
     "http://localhost:8000/api/v1/posts/unified_feed/?page=1&per_page=20&hobby_id=5"

# 3. Create post
curl -X POST \
     -H "Authorization: Bearer <JWT>" \
     -H "mbiu-token: <TOKEN>" \
     -F "caption=Hello world!" \
     -F "hobby_id=5" \
     -F "image=@/path/to/image.jpg" \
     "http://localhost:8000/api/v1/posts/create/"

# 4. Like post
curl -X POST \
     -H "Authorization: Bearer <JWT>" \
     -H "mbiu-token: <TOKEN>" \
     "http://localhost:8000/api/v1/posts/123/like/"

# 5. Get user hobbies
curl -H "Authorization: Bearer <JWT>" \
     -H "mbiu-token: <TOKEN>" \
     "http://localhost:8000/api/v1/user/hobbies/"

# 6. Get active post count
curl -H "Authorization: Bearer <JWT>" \
     -H "mbiu-token: <TOKEN>" \
     "http://localhost:8000/api/v1/posts/my_active_count/"

# 7. AI caption suggestions
curl -X POST \
     -H "Authorization: Bearer <JWT>" \
     -H "mbiu-token: <TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"context": ""}' \
     "http://localhost:8000/api/v1/posts/ai_captions/"
```

## 🚀 Optional Enhancements

### Event Discovery Integration

Create a management command or admin interface to inject event posts:

```python
# african_mbiu/posts/management/commands/create_event_post.py
from django.core.management.base import BaseCommand
from african_mbiu.posts.models import MbiuPost
from african_mbiu.users.models import User
from games.models import Game

class Command(BaseCommand):
    help = 'Create event discovery posts'

    def handle(self, *args, **kwargs):
        # Get a system user for event posts
        system_user = User.objects.filter(is_staff=True).first()
        
        # Create event post
        MbiuPost.objects.create(
            user=system_user,
            text="Check out this amazing trail event! 🏞️",
            post_type='event',
            event_title="Mountain Trail Challenge",
            event_date="2025-10-15",
            event_time="8:00 AM",
            event_link="https://example.com/trail-event",
            hobby=Game.objects.get(name="Hiking"),
            visible=True
        )
        
        self.stdout.write(self.style.SUCCESS('Event post created!'))
```

### Notification Integration

When someone likes or comments on a post, trigger a notification:

```python
from african_mbiu.notifications.models import Notification

# After like is created
Notification.objects.create(
    user=post.user,  # Post author
    type='like',
    content=f'{user.first_name} liked your post',
    link=f'/app/posts/{post.id}'
)
```

## 📝 Notes

- The feed prioritizes posts from user's selected hobbies AND friends
- When filtering by hobby, friend posts are still shown (marked with "Friend Post" pill on frontend)
- Post limit of 5 active posts per user is enforced server-side
- AI caption suggestions currently return static data - integrate OpenAI for dynamic suggestions
- Event posts can be created manually or via management commands
- All endpoints require both JWT token and mbiu-token for authentication

---

**Status**: Ready for implementation
**Estimated Time**: 2-4 hours
**Priority**: High (frontend is ready and waiting for these endpoints)

