package com.dengin.social.application.command;

import com.dengin.social.domain.model.CommentId;

/**
 * Command to delete a comment from a post.
 * 
 * <p>Business Rules:
 * <ul>
 *   <li>Comment author can delete their own comments</li>
 *   <li>Post author can delete any comment on their post</li>
 *   <li>Comment soft-deleted (marked deleted, not physically removed)</li>
 * </ul>
 */
public record DeleteCommentCommand(
    CommentId commentId,
    Long requesterId
) {
}
