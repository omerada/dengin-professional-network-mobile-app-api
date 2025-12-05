package com.meslektas.common.api;

/**
 * Standard error codes for the API.
 * Provides consistent error identification across all endpoints.
 * 
 * Error Code Format: CATEGORY_SPECIFIC_ERROR
 * 
 * Categories:
 * - AUTH: Authentication related errors
 * - USER: User related errors
 * - VERIFICATION: Verification related errors
 * - POST: Post/Feed related errors
 * - SOCIAL: Follow/Block related errors
 * - MESSAGE: Messaging related errors
 * - NOTIFICATION: Notification related errors
 * - MODERATION: Report/Sanction related errors
 * - VALIDATION: Input validation errors
 * - SYSTEM: System/Infrastructure errors
 */
public final class ErrorCodes {

    private ErrorCodes() {
        // Prevent instantiation
    }

    // ============================================
    // AUTHENTICATION ERRORS (AUTH_*)
    // ============================================

    /** Invalid credentials provided */
    public static final String AUTH_INVALID_CREDENTIALS = "AUTH_INVALID_CREDENTIALS";

    /** Token has expired */
    public static final String AUTH_TOKEN_EXPIRED = "AUTH_TOKEN_EXPIRED";

    /** Token is invalid or malformed */
    public static final String AUTH_TOKEN_INVALID = "AUTH_TOKEN_INVALID";

    /** Refresh token is invalid or expired */
    public static final String AUTH_REFRESH_TOKEN_INVALID = "AUTH_REFRESH_TOKEN_INVALID";

    /** User account is not activated */
    public static final String AUTH_ACCOUNT_NOT_ACTIVATED = "AUTH_ACCOUNT_NOT_ACTIVATED";

    /** User account is suspended */
    public static final String AUTH_ACCOUNT_SUSPENDED = "AUTH_ACCOUNT_SUSPENDED";

    /** User account is banned */
    public static final String AUTH_ACCOUNT_BANNED = "AUTH_ACCOUNT_BANNED";

    /** Email already registered */
    public static final String AUTH_EMAIL_EXISTS = "AUTH_EMAIL_EXISTS";

    /** Password reset token is invalid or expired */
    public static final String AUTH_RESET_TOKEN_INVALID = "AUTH_RESET_TOKEN_INVALID";

    // ============================================
    // USER ERRORS (USER_*)
    // ============================================

    /** User not found */
    public static final String USER_NOT_FOUND = "USER_NOT_FOUND";

    /** User profile is incomplete */
    public static final String USER_PROFILE_INCOMPLETE = "USER_PROFILE_INCOMPLETE";

    /** User email not verified */
    public static final String USER_EMAIL_NOT_VERIFIED = "USER_EMAIL_NOT_VERIFIED";

    /** Invalid profession selection */
    public static final String USER_INVALID_PROFESSION = "USER_INVALID_PROFESSION";

    // ============================================
    // VERIFICATION ERRORS (VERIFICATION_*)
    // ============================================

    /** Verification request not found */
    public static final String VERIFICATION_NOT_FOUND = "VERIFICATION_NOT_FOUND";

    /** Maximum verification attempts exceeded */
    public static final String VERIFICATION_MAX_ATTEMPTS = "VERIFICATION_MAX_ATTEMPTS";

    /** Verification already pending */
    public static final String VERIFICATION_ALREADY_PENDING = "VERIFICATION_ALREADY_PENDING";

    /** Verification already approved */
    public static final String VERIFICATION_ALREADY_APPROVED = "VERIFICATION_ALREADY_APPROVED";

    /** Document upload failed */
    public static final String VERIFICATION_DOCUMENT_UPLOAD_FAILED = "VERIFICATION_DOCUMENT_UPLOAD_FAILED";

    /** Face not detected in selfie */
    public static final String VERIFICATION_FACE_NOT_DETECTED = "VERIFICATION_FACE_NOT_DETECTED";

    /** Face similarity check failed */
    public static final String VERIFICATION_FACE_MISMATCH = "VERIFICATION_FACE_MISMATCH";

    // ============================================
    // POST ERRORS (POST_*)
    // ============================================

    /** Post not found */
    public static final String POST_NOT_FOUND = "POST_NOT_FOUND";

    /** Cannot edit deleted post */
    public static final String POST_DELETED = "POST_DELETED";

    /** Not authorized to modify this post */
    public static final String POST_NOT_AUTHORIZED = "POST_NOT_AUTHORIZED";

    /** Post content too short or too long */
    public static final String POST_CONTENT_INVALID = "POST_CONTENT_INVALID";

    /** Too many images in post */
    public static final String POST_TOO_MANY_IMAGES = "POST_TOO_MANY_IMAGES";

    /** Cannot like own post */
    public static final String POST_CANNOT_LIKE_OWN = "POST_CANNOT_LIKE_OWN";

    /** Post already liked */
    public static final String POST_ALREADY_LIKED = "POST_ALREADY_LIKED";

    /** Post not liked */
    public static final String POST_NOT_LIKED = "POST_NOT_LIKED";

    // ============================================
    // COMMENT ERRORS (COMMENT_*)
    // ============================================

    /** Comment not found */
    public static final String COMMENT_NOT_FOUND = "COMMENT_NOT_FOUND";

    /** Not authorized to delete this comment */
    public static final String COMMENT_NOT_AUTHORIZED = "COMMENT_NOT_AUTHORIZED";

    /** Comment content invalid */
    public static final String COMMENT_CONTENT_INVALID = "COMMENT_CONTENT_INVALID";

    // ============================================
    // SOCIAL ERRORS (SOCIAL_*)
    // ============================================

    /** Cannot follow yourself */
    public static final String SOCIAL_CANNOT_FOLLOW_SELF = "SOCIAL_CANNOT_FOLLOW_SELF";

    /** Already following this user */
    public static final String SOCIAL_ALREADY_FOLLOWING = "SOCIAL_ALREADY_FOLLOWING";

    /** Not following this user */
    public static final String SOCIAL_NOT_FOLLOWING = "SOCIAL_NOT_FOLLOWING";

    /** Cannot follow blocked user */
    public static final String SOCIAL_CANNOT_FOLLOW_BLOCKED = "SOCIAL_CANNOT_FOLLOW_BLOCKED";

    /** Cannot block yourself */
    public static final String SOCIAL_CANNOT_BLOCK_SELF = "SOCIAL_CANNOT_BLOCK_SELF";

    /** User already blocked */
    public static final String SOCIAL_ALREADY_BLOCKED = "SOCIAL_ALREADY_BLOCKED";

    /** User not blocked */
    public static final String SOCIAL_NOT_BLOCKED = "SOCIAL_NOT_BLOCKED";

    // ============================================
    // MESSAGE ERRORS (MESSAGE_*)
    // ============================================

    /** Conversation not found */
    public static final String MESSAGE_CONVERSATION_NOT_FOUND = "MESSAGE_CONVERSATION_NOT_FOUND";

    /** Message not found */
    public static final String MESSAGE_NOT_FOUND = "MESSAGE_NOT_FOUND";

    /** Cannot message blocked user */
    public static final String MESSAGE_USER_BLOCKED = "MESSAGE_USER_BLOCKED";

    /** Cannot message yourself */
    public static final String MESSAGE_CANNOT_MESSAGE_SELF = "MESSAGE_CANNOT_MESSAGE_SELF";

    /** Not a participant in this conversation */
    public static final String MESSAGE_NOT_PARTICIPANT = "MESSAGE_NOT_PARTICIPANT";

    // ============================================
    // NOTIFICATION ERRORS (NOTIFICATION_*)
    // ============================================

    /** Notification not found */
    public static final String NOTIFICATION_NOT_FOUND = "NOTIFICATION_NOT_FOUND";

    /** Device token registration failed */
    public static final String NOTIFICATION_DEVICE_REGISTRATION_FAILED = "NOTIFICATION_DEVICE_REGISTRATION_FAILED";

    // ============================================
    // MODERATION ERRORS (MODERATION_*)
    // ============================================

    /** Report not found */
    public static final String MODERATION_REPORT_NOT_FOUND = "MODERATION_REPORT_NOT_FOUND";

    /** Already reported this content */
    public static final String MODERATION_ALREADY_REPORTED = "MODERATION_ALREADY_REPORTED";

    /** Cannot report own content */
    public static final String MODERATION_CANNOT_REPORT_OWN = "MODERATION_CANNOT_REPORT_OWN";

    /** Invalid report reason */
    public static final String MODERATION_INVALID_REASON = "MODERATION_INVALID_REASON";

    // ============================================
    // VALIDATION ERRORS (VALIDATION_*)
    // ============================================

    /** General validation error */
    public static final String VALIDATION_ERROR = "VALIDATION_ERROR";

    /** Required field is missing */
    public static final String VALIDATION_REQUIRED_FIELD = "VALIDATION_REQUIRED_FIELD";

    /** Field value is invalid */
    public static final String VALIDATION_INVALID_VALUE = "VALIDATION_INVALID_VALUE";

    /** Field value is too short */
    public static final String VALIDATION_TOO_SHORT = "VALIDATION_TOO_SHORT";

    /** Field value is too long */
    public static final String VALIDATION_TOO_LONG = "VALIDATION_TOO_LONG";

    /** Invalid email format */
    public static final String VALIDATION_INVALID_EMAIL = "VALIDATION_INVALID_EMAIL";

    /** Invalid phone format */
    public static final String VALIDATION_INVALID_PHONE = "VALIDATION_INVALID_PHONE";

    /** Invalid date format */
    public static final String VALIDATION_INVALID_DATE = "VALIDATION_INVALID_DATE";

    /** Invalid file type */
    public static final String VALIDATION_INVALID_FILE_TYPE = "VALIDATION_INVALID_FILE_TYPE";

    /** File size exceeds limit */
    public static final String VALIDATION_FILE_TOO_LARGE = "VALIDATION_FILE_TOO_LARGE";

    // ============================================
    // SYSTEM ERRORS (SYSTEM_*)
    // ============================================

    /** Internal server error */
    public static final String SYSTEM_INTERNAL_ERROR = "SYSTEM_INTERNAL_ERROR";

    /** Service temporarily unavailable */
    public static final String SYSTEM_SERVICE_UNAVAILABLE = "SYSTEM_SERVICE_UNAVAILABLE";

    /** Database error */
    public static final String SYSTEM_DATABASE_ERROR = "SYSTEM_DATABASE_ERROR";

    /** External service error (S3, Redis, etc.) */
    public static final String SYSTEM_EXTERNAL_SERVICE_ERROR = "SYSTEM_EXTERNAL_SERVICE_ERROR";

    /** Rate limit exceeded */
    public static final String SYSTEM_RATE_LIMIT_EXCEEDED = "SYSTEM_RATE_LIMIT_EXCEEDED";

    /** Access denied */
    public static final String SYSTEM_ACCESS_DENIED = "SYSTEM_ACCESS_DENIED";

    /** Missing required parameter */
    public static final String SYSTEM_MISSING_PARAMETER = "SYSTEM_MISSING_PARAMETER";

    /** Type mismatch in parameter */
    public static final String SYSTEM_TYPE_MISMATCH = "SYSTEM_TYPE_MISMATCH";
}
