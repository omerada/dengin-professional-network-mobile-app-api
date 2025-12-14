package com.dengin.social.application.service;

import com.dengin.common.api.PagedResponse;
import com.dengin.common.infrastructure.DomainEventPublisher;
import com.dengin.identity.application.service.ProfessionService;
import com.dengin.identity.domain.model.User;
import com.dengin.identity.domain.repository.UserRepository;
import com.dengin.social.application.dto.*;
import com.dengin.social.domain.model.*;
import com.dengin.social.application.dto.*;
import com.dengin.social.domain.model.*;
import com.dengin.social.domain.repository.CommentRepository;
import com.dengin.social.domain.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Post Application Service
 * 
 * Orchestrates post-related operations:
 * - Create post
 * - Like/unlike post
 * - Delete post
 * - Get post details
 * - Get user posts
 * 
 * Business Rules:
 * - Only verified users can create posts
 * - Only post author can delete posts
 * - Users can't like their own posts
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PostService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final ProfessionService professionService;
    private final DomainEventPublisher eventPublisher;

    /**
     * Create new post
     * 
     * Business Rule: Only verified users can create posts
     */
    @Transactional
    public PostResponse createPost(CreatePostRequest request, Long userId) {
        log.info("User {} creating post", userId);

        // Validate user is verified
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        if (!user.isVerified()) {
            throw new IllegalStateException("Only verified users can create posts");
        }

        // Convert image DTOs to domain objects
        List<PostImage> images = request.getImages() != null
                ? request.getImages().stream()
                        .map(img -> PostImage.of(
                                img.getS3Key(),
                                img.getUrl(),
                                img.getWidth(),
                                img.getHeight(),
                                img.getFileSize()))
                        .collect(Collectors.toList())
                : List.of();

        // Create post aggregate
        Post post = Post.create(
                userId,
                request.getProfessionId(),
                PostContent.of(request.getContent()),
                images);

        // Save (generates ID)
        post = postRepository.save(post);

        // Publish domain event (after ID is set)
        post.publishCreatedEvent();
        eventPublisher.publishEvents(post.getEvents());
        post.clearEvents();

        log.info("Post {} created by user {}", post.getPostId(), userId);

        return mapToResponse(post, user, false);
    }

    /**
     * Get post by ID
     */
    @Transactional(readOnly = true)
    public PostResponse getPost(Long postId, Long currentUserId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + postId));

        if (!post.isVisible()) {
            throw new IllegalArgumentException("Post not available");
        }

        User author = userRepository.findById(post.getAuthorId())
                .orElseThrow(() -> new IllegalArgumentException("Author not found"));

        boolean liked = currentUserId != null && post.isLikedBy(currentUserId);

        return mapToResponse(post, author, liked);
    }

    /**
     * Get user's posts
     */
    @Transactional(readOnly = true)
    public List<PostResponse> getUserPosts(Long userId, Long currentUserId) {
        List<Post> posts = postRepository.findVisiblePostsByAuthorId(userId);

        User author = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return posts.stream()
                .map(post -> {
                    boolean liked = currentUserId != null && post.isLikedBy(currentUserId);
                    return mapToResponse(post, author, liked);
                })
                .collect(Collectors.toList());
    }

    /**
     * Like post
     * 
     * Business Rule: Users can't like their own posts
     */
    @Transactional
    public LikeResponse likePost(Long postId, Long userId) {
        log.debug("User {} liking post {}", userId, postId);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + postId));

        post.like(userId);
        postRepository.save(post);

        eventPublisher.publishEvents(post.getEvents());
        post.clearEvents();

        return LikeResponse.builder()
                .postId(post.getPostId().getValue())
                .liked(true)
                .likeCount(post.getLikeCount())
                .build();
    }

    /**
     * Unlike post
     */
    @Transactional
    public LikeResponse unlikePost(Long postId, Long userId) {
        log.debug("User {} unliking post {}", userId, postId);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + postId));

        post.unlike(userId);
        postRepository.save(post);

        eventPublisher.publishEvents(post.getEvents());
        post.clearEvents();

        return LikeResponse.builder()
                .postId(post.getPostId().getValue())
                .liked(false)
                .likeCount(post.getLikeCount())
                .build();
    }

    /**
     * Delete post
     * 
     * Business Rule: Only post author can delete
     */
    @Transactional
    public void deletePost(Long postId, Long userId) {
        log.info("User {} deleting post {}", userId, postId);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + postId));

        post.delete(userId);
        postRepository.save(post);

        eventPublisher.publishEvents(post.getEvents());
        post.clearEvents();

        log.info("Post {} deleted", post.getPostId());
    }

    /**
     * Add comment to post
     */
    @Transactional
    public CommentResponse addComment(Long postId, AddCommentRequest request, Long userId) {
        log.debug("User {} commenting on post {}", userId, postId);

        // Validate user is verified
        User commenter = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        if (!commenter.isVerified()) {
            throw new IllegalStateException("Only verified users can comment");
        }

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + postId));

        if (!post.isVisible()) {
            throw new IllegalStateException("Cannot comment on non-visible post");
        }

        // Create comment
        Comment comment = Comment.create(
                postId,
                userId,
                CommentContent.of(request.getContent()));

        comment = commentRepository.save(comment);

        // Update post comment count
        post.incrementCommentCount();
        postRepository.save(post);

        // Publish event directly
        CommentAddedEvent event = new CommentAddedEvent(
                post.getId(),
                post.getPostId(),
                comment.getCommentId(),
                userId,
                post.getAuthorId(),
                request.getContent());
        eventPublisher.publishEvents(java.util.List.of(event));

        log.debug("Comment {} added to post {}", comment.getCommentId(), postId);

        return mapToCommentResponse(comment, commenter);
    }

    /**
     * Get post comments
     */
    @Transactional(readOnly = true)
    public List<CommentResponse> getPostComments(Long postId) {
        List<Comment> comments = commentRepository.findVisibleByPostId(postId);

        return comments.stream()
                .map(comment -> {
                    User commenter = userRepository.findById(comment.getCommenterId())
                            .orElse(null);
                    return mapToCommentResponse(comment, commenter);
                })
                .collect(Collectors.toList());
    }

    /**
     * Delete comment
     * 
     * Business Rule: Only comment author or post author can delete
     */
    @Transactional
    public void deleteComment(Long postId, Long commentId, Long userId) {
        log.debug("User {} deleting comment {} from post {}", userId, commentId, postId);

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found: " + commentId));

        if (!comment.getPostId().equals(postId)) {
            throw new IllegalArgumentException("Comment does not belong to this post");
        }

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + postId));

        // Authorization: comment author or post author
        if (!comment.isAuthor(userId) && !post.isAuthor(userId)) {
            throw new IllegalStateException("Only comment author or post author can delete comment");
        }

        comment.delete();
        commentRepository.save(comment);

        // Update post comment count
        post.decrementCommentCount();
        postRepository.save(post);

        log.debug("Comment {} deleted", commentId);
    }

    // ============================================
    // POST SAVE/BOOKMARK METHODS
    // ============================================

    /**
     * Save/bookmark a post
     */
    @Transactional
    public void savePost(Long postId, Long userId) {
        log.debug("User {} saving post {}", userId, postId);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + postId));

        if (!post.isVisible()) {
            throw new IllegalArgumentException("Post not available");
        }

        post.saveByUser(userId);
        postRepository.save(post);

        log.debug("Post {} saved by user {}", postId, userId);
    }

    /**
     * Unsave/remove bookmark from a post
     */
    @Transactional
    public void unsavePost(Long postId, Long userId) {
        log.debug("User {} unsaving post {}", userId, postId);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + postId));

        post.unsaveByUser(userId);
        postRepository.save(post);

        log.debug("Post {} unsaved by user {}", postId, userId);
    }

    /**
     * Get user's saved posts with pagination
     */
    @Transactional(readOnly = true)
    public PagedResponse<PostResponse> getSavedPosts(Long userId, int page, int size) {
        log.debug("Getting saved posts for user {}, page: {}, size: {}", userId, page, size);

        var savedPosts = postRepository.findSavedPostsByUserId(userId, PageRequest.of(page, size));
        
        List<PostResponse> content = savedPosts.getContent().stream()
                .map(post -> {
                    User author = userRepository.findById(post.getAuthorId())
                            .orElseThrow(() -> new IllegalArgumentException("Author not found"));
                    boolean liked = post.isLikedBy(userId);
                    return mapToResponse(post, author, liked);
                })
                .collect(Collectors.toList());

        return PagedResponse.<PostResponse>builder()
                .content(content)
                .page(page)
                .size(size)
                .totalElements(savedPosts.getTotalElements())
                .totalPages(savedPosts.getTotalPages())
                .hasNext(savedPosts.hasNext())
                .hasPrevious(page > 0)
                .build();
    }

    /**
     * Track post share action
     */
    @Transactional
    public ShareResponse sharePost(Long postId, Long userId) {
        log.debug("User {} sharing post {}", userId, postId);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + postId));

        if (!post.isVisible()) {
            throw new IllegalArgumentException("Post not available");
        }

        post.share(userId);
        postRepository.save(post);

        log.debug("Post {} shared by user {}, new count: {}", postId, userId, post.getShareCount());

        return ShareResponse.of(postId, post.getShareCount());
    }

    // ============================================
    // MAPPING METHODS
    // ============================================

    private PostResponse mapToResponse(Post post, User author, boolean liked) {
        List<PostImageDto> imageDtos = post.getImages().stream()
                .map(img -> PostImageDto.builder()
                        .s3Key(img.getS3Key())
                        .url(img.getUrl())
                        .width(img.getWidth())
                        .height(img.getHeight())
                        .fileSize(img.getFileSize())
                        .build())
                .collect(Collectors.toList());

        return PostResponse.builder()
                .id(post.getId())
                .postId(post.getPostId().getValue())
                .authorId(author.getId())
                .authorName(author.getFullName())
                .authorProfileImageUrl(author.getProfileImageUrl())
                .professionId(post.getProfessionId())
                .professionName(professionService.getProfessionNameById(post.getProfessionId()))
                .authorVerified(author.isVerified())
                .content(post.getContent().getValue())
                .images(imageDtos)
                .likeCount(post.getLikeCount())
                .commentCount(post.getCommentCount())
                .liked(liked)
                .status(post.getStatus())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }

    private CommentResponse mapToCommentResponse(Comment comment, User commenter) {
        if (commenter == null) {
            // Deleted user fallback
            return CommentResponse.builder()
                    .id(comment.getId())
                    .commentId(comment.getCommentId().getValue())
                    .postId(comment.getPostId())
                    .commenterId(comment.getCommenterId())
                    .commenterName("Deleted User")
                    .content(comment.getContent().getValue())
                    .createdAt(comment.getCreatedAt())
                    .build();
        }

        return CommentResponse.builder()
                .id(comment.getId())
                .commentId(comment.getCommentId().getValue())
                .postId(comment.getPostId())
                .commenterId(commenter.getId())
                .commenterName(commenter.getFullName())
                .commenterProfileImageUrl(commenter.getProfileImageUrl())
                .professionId(commenter.getProfession().getId())
                .professionName(commenter.getProfession().getName())
                .verified(commenter.isVerified())
                .content(comment.getContent().getValue())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
