package com.meslektas.social.application.command;

import com.meslektas.social.domain.model.PostId;

/**
 * Command to add a comment to a post.
 * 
 * <p>Business Rules:
 * <ul>
 *   <li>Comment content: 1-500 characters</li>
 *   <li>Only verified users can comment</li>
 *   <li>Post must exist and not be deleted</li>
 * </ul>
 */
public record AddCommentCommand(
    PostId postId,
    Long commenterId,
    String content
) {
}
