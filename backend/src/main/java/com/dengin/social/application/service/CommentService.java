package com.dengin.social.application.service;

import com.dengin.social.application.command.AddCommentCommand;
import com.dengin.social.application.command.DeleteCommentCommand;
import com.dengin.social.application.dto.CommentResponse;
import com.dengin.social.application.dto.CommentListResponse;
import com.dengin.social.application.dto.CommentDto;
import com.dengin.social.application.dto.UserBasicDto;
import com.dengin.social.application.query.GetPostCommentsQuery;
import com.dengin.social.domain.model.Comment;
import com.dengin.social.domain.model.CommentContent;
import com.dengin.social.domain.model.Post;
import com.dengin.social.domain.model.PostStatus;
import com.dengin.social.domain.model.*;
import com.dengin.social.domain.repository.CommentRepository;
import com.dengin.social.domain.repository.PostRepository;
import com.dengin.identity.domain.repository.UserRepository;
import com.dengin.identity.domain.model.User;
import com.dengin.common.exception.BusinessException;
import com.dengin.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Application service for comment operations.
 * 
 * <p>Handles comment creation, deletion, and retrieval with proper business rule enforcement.
 * 
 * <p>Business Rules:
 * <ul>
 *   <li>Only verified users can add comments</li>
 *   <li>Comment content must be 1-500 characters</li>
 *   <li>Comment author can delete their own comments</li>
 *   <li>Post author can delete any comment on their post</li>
 *   <li>Comments are soft-deleted</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    /**
     * Adds a comment to a post.
     * 
     * @param command the add comment command
     * @return the created comment response
     * @throws ResourceNotFoundException if post or user not found
     * @throws BusinessException if user not verified or content invalid
     */
    @Transactional
    public CommentResponse addComment(AddCommentCommand command) {
        log.info("Adding comment to post: {}", command.postId().getValue());

        // Validate post exists and is not deleted
        Post post = postRepository.findByPostId(command.postId())
            .orElseThrow(() -> new ResourceNotFoundException("Gönderi bulunamadı: " + command.postId().getValue()));

        if (post.getStatus() == PostStatus.DELETED) {
            throw new BusinessException("Silinmiş gönderiye yorum yapılamaz", "POST_DELETED");
        }

        // Validate commenter exists and is verified
        User commenter = userRepository.findById(command.commenterId())
            .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı: " + command.commenterId()));

        if (!Boolean.TRUE.equals(commenter.getIsProfessionVerified())) {
            throw new BusinessException("Sadece doğrulanmış kullanıcılar yorum yapabilir", "USER_NOT_VERIFIED");
        }

        // Validate content length
        if (command.content() == null || command.content().trim().isEmpty()) {
            throw new BusinessException("Yorum içeriği boş olamaz", "INVALID_CONTENT");
        }
        if (command.content().length() < 1 || command.content().length() > 500) {
            throw new BusinessException("Yorum içeriği 1 ile 500 karakter arasında olmalıdır", "INVALID_CONTENT_LENGTH");
        }

        // Create comment value object
        CommentContent content = CommentContent.of(command.content());

        // Create new comment entity
        Comment newComment = Comment.create(
            post.getId(),
            commenter.getId(),
            content
        );

        // Save comment
        Comment savedComment = commentRepository.save(newComment);

        // Increment post comment count
        post.incrementCommentCount();
        postRepository.save(post);

        log.info("Comment added successfully: {}", savedComment.getCommentId().getValue());

        return CommentResponse.builder()
            .id(savedComment.getId())
            .commentId(savedComment.getCommentId().getValue())
            .postId(post.getId())
            .commenterId(commenter.getId())
            .commenterName(commenter.getFullName())
            .commenterProfileImageUrl(commenter.getProfileImageUrl())
            .professionId(commenter.getProfession().getId())
            .professionName(commenter.getProfession().getName())
            .verified(Boolean.TRUE.equals(commenter.getIsProfessionVerified()))
            .content(savedComment.getContent().getValue())
            .createdAt(savedComment.getCreatedAt())
            .build();
    }

    /**
     * Deletes a comment from a post.
     * 
     * @param command the delete comment command
     * @throws ResourceNotFoundException if comment not found
     * @throws BusinessException if requester not authorized
     */
    @Transactional
    public void deleteComment(DeleteCommentCommand command) {
        log.info("Deleting comment: {}", command.commentId().getValue());

        // Find comment
        Comment comment = commentRepository.findByCommentId(command.commentId())
            .orElseThrow(() -> new ResourceNotFoundException("Yorum bulunamadı: " + command.commentId().getValue()));

        if (comment.isDeleted()) {
            log.info("Comment already deleted: {}", command.commentId().getValue());
            return; // Idempotent
        }

        // Find post to check post author
        Post post = postRepository.findById(comment.getPostId())
            .orElseThrow(() -> new ResourceNotFoundException("Yorum için gönderi bulunamadı"));

        // Validate requester is comment author or post author
        boolean isCommentAuthor = comment.getCommenterId().equals(command.requesterId());
        boolean isPostAuthor = post.getAuthorId().equals(command.requesterId());

        if (!isCommentAuthor && !isPostAuthor) {
            throw new BusinessException("Bu yorumu sadece yorum sahibi veya gönderi sahibi silebilir", "UNAUTHORIZED_DELETE");
        }

        // Soft delete comment
        comment.delete();
        commentRepository.save(comment);

        // Decrement post comment count
        post.decrementCommentCount();
        postRepository.save(post);

        log.info("Comment deleted successfully: {}", command.commentId().getValue());
    }

    /**
     * Retrieves paginated comments for a post.
     * 
     * @param query the get comments query
     * @return paginated list of comments
     * @throws ResourceNotFoundException if post not found
     */
    @Transactional(readOnly = true)
    public CommentListResponse getPostComments(GetPostCommentsQuery query) {
        log.info("Getting comments for post: {}, page: {}", query.postId().getValue(), query.page());

        // Validate post exists
        Post post = postRepository.findByPostId(query.postId())
            .orElseThrow(() -> new ResourceNotFoundException("Gönderi bulunamadı: " + query.postId().getValue()));

        // Query comments with pagination (oldest first)
        PageRequest pageRequest = PageRequest.of(
            query.page(),
            query.size(),
            Sort.by(Sort.Direction.ASC, "createdAt")
        );

        Page<Comment> commentsPage = commentRepository.findByPostIdAndDeletedFalse(
            post.getId(),
            pageRequest
        );

        // Map to DTOs
        List<CommentDto> commentDtos = commentsPage.getContent().stream()
            .map(this::toCommentDto)
            .collect(Collectors.toList());

        log.info("Retrieved {} comments for post: {}", commentDtos.size(), query.postId().getValue());

        return new CommentListResponse(
            commentDtos,
            commentsPage.getTotalElements(),
            commentsPage.getNumber(),
            commentsPage.getSize()
        );
    }

    /**
     * Maps a Comment entity to CommentDto with commenter details.
     */
    private CommentDto toCommentDto(Comment comment) {
        // Fetch commenter details
        User commenter = userRepository.findById(comment.getCommenterId())
            .orElseThrow(() -> new ResourceNotFoundException("Yorum sahibi bulunamadı: " + comment.getCommenterId()));

        UserBasicDto commenterDto = new UserBasicDto(
            commenter.getId().toString(),
            commenter.getFullName(),
            commenter.getProfession(),
            commenter.getProfileImageUrl(),
            Boolean.TRUE.equals(commenter.getIsProfessionVerified())
        );

        return new CommentDto(
            comment.getCommentId().getValue().toString(),
            comment.getPostId().toString(),
            commenterDto,
            comment.getContent().getValue(),
            comment.getCreatedAt().atZone(ZoneId.systemDefault()).toInstant()
        );
    }
}
