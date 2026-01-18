import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { 
  COMMUNICATION_CHANNEL_KEY, 
  NOTIFICATION_PRIORITY_KEY, 
  ALERT_SEVERITY_KEY,
  COMMUNICATION_TEMPLATE_KEY,
  RATE_LIMIT_KEY,
  DELIVERY_TRACKING_KEY 
} from '../decorators/communication.decorators';

@Injectable()
export class CommunicationChannelGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredChannels = this.reflector.getAllAndOverride<string[]>(
      COMMUNICATION_CHANNEL_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredChannels) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const args = ctx.getArgs();

    // Extract channel from various possible locations in the request
    let requestedChannel: string | undefined;

    // Check in direct arguments
    if (args.channel) {
      requestedChannel = args.channel;
    } else if (args.channels && Array.isArray(args.channels)) {
      requestedChannel = args.channels[0]; // Use first channel for validation
    } else if (args.notification?.channels) {
      requestedChannel = args.notification.channels[0];
    } else if (args.message?.channel) {
      requestedChannel = args.message.channel;
    }

    if (!requestedChannel) {
      throw new BadRequestException('Communication channel must be specified');
    }

    if (!requiredChannels.includes(requestedChannel)) {
      throw new ForbiddenException(
        `Channel '${requestedChannel}' is not allowed. Allowed channels: ${requiredChannels.join(', ')}`
      );
    }

    // Store channel in request for later use
    request.communicationChannel = requestedChannel;
    return true;
  }
}

@Injectable()
export class NotificationPriorityGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  private priorityLevels = {
    low: 1,
    medium: 2,
    high: 3,
    urgent: 4,
  };

  canActivate(context: ExecutionContext): boolean {
    const minPriority = this.reflector.getAllAndOverride<string>(
      NOTIFICATION_PRIORITY_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!minPriority) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const args = ctx.getArgs();

    // Extract priority from various possible locations
    let requestedPriority: string | undefined;

    if (args.priority) {
      requestedPriority = args.priority;
    } else if (args.notification?.priority) {
      requestedPriority = args.notification.priority;
    } else if (args.message?.priority) {
      requestedPriority = args.message.priority;
    }

    if (!requestedPriority) {
      throw new BadRequestException('Notification priority must be specified');
    }

    const minLevel = this.priorityLevels[minPriority as keyof typeof this.priorityLevels];
    const requestedLevel = this.priorityLevels[requestedPriority as keyof typeof this.priorityLevels];

    if (!requestedLevel || requestedLevel < minLevel) {
      throw new ForbiddenException(
        `Priority '${requestedPriority}' is below minimum required priority '${minPriority}'`
      );
    }

    return true;
  }
}

@Injectable()
export class AlertSeverityGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  private severityLevels = {
    info: 1,
    warning: 2,
    error: 3,
    critical: 4,
  };

  canActivate(context: ExecutionContext): boolean {
    const minSeverity = this.reflector.getAllAndOverride<string>(
      ALERT_SEVERITY_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!minSeverity) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const args = ctx.getArgs();

    // Extract severity from alert arguments
    let requestedSeverity: string | undefined;

    if (args.severity) {
      requestedSeverity = args.severity;
    } else if (args.alert?.severity) {
      requestedSeverity = args.alert.severity;
    }

    if (!requestedSeverity) {
      throw new BadRequestException('Alert severity must be specified');
    }

    const minLevel = this.severityLevels[minSeverity as keyof typeof this.severityLevels];
    const requestedLevel = this.severityLevels[requestedSeverity as keyof typeof this.severityLevels];

    if (!requestedLevel || requestedLevel < minLevel) {
      throw new ForbiddenException(
        `Severity '${requestedSeverity}' is below minimum required severity '${minSeverity}'`
      );
    }

    return true;
  }
}

@Injectable()
export class CommunicationTemplateGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredTemplate = this.reflector.getAllAndOverride<string>(
      COMMUNICATION_TEMPLATE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredTemplate) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const args = ctx.getArgs();

    // Extract template name from various possible locations
    let templateName: string | undefined;

    if (args.templateName) {
      templateName = args.templateName;
    } else if (args.notification?.templateName) {
      templateName = args.notification.templateName;
    } else if (args.template?.name) {
      templateName = args.template.name;
    }

    if (!templateName) {
      throw new BadRequestException(`Template '${requiredTemplate}' is required for this operation`);
    }

    if (templateName !== requiredTemplate) {
      throw new ForbiddenException(
        `Template '${templateName}' is not allowed. Required template: '${requiredTemplate}'`
      );
    }

    return true;
  }
}

@Injectable()
export class CommunicationRateLimitGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  private requestCounts = new Map<string, { count: number; resetTime: number }>();

  canActivate(context: ExecutionContext): boolean {
    const rateLimit = this.reflector.getAllAndOverride<{ maxRequests: number; windowMs: number }>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!rateLimit) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const user = request.user;

    if (!user) {
      return true; // Skip rate limiting if no user context
    }

    const key = `${user.tenantId}:${user.id}:${context.getHandler().name}`;
    const now = Date.now();
    const windowStart = now - rateLimit.windowMs;

    let requestData = this.requestCounts.get(key);

    if (!requestData || requestData.resetTime <= windowStart) {
      // Initialize or reset the counter
      requestData = { count: 1, resetTime: now + rateLimit.windowMs };
      this.requestCounts.set(key, requestData);
      return true;
    }

    if (requestData.count >= rateLimit.maxRequests) {
      const resetIn = Math.ceil((requestData.resetTime - now) / 1000);
      throw new ForbiddenException(
        `Rate limit exceeded. Maximum ${rateLimit.maxRequests} requests per ${rateLimit.windowMs / 1000} seconds. Try again in ${resetIn} seconds.`
      );
    }

    requestData.count++;
    return true;
  }
}

@Injectable()
export class DeliveryTrackingGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const trackingEnabled = this.reflector.getAllAndOverride<boolean>(
      DELIVERY_TRACKING_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (trackingEnabled === undefined) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    // Add tracking metadata to request
    if (trackingEnabled) {
      request.deliveryTracking = {
        enabled: true,
        trackingId: `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        startTime: Date.now(),
        requestId: request.id || `req_${Date.now()}`,
      };
    }

    return true;
  }
}

@Injectable()
export class CommunicationQuotaGuard implements CanActivate {
  constructor() {}

  private quotaUsage = new Map<string, { used: number; resetTime: number }>();

  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const user = request.user;

    if (!user || !user.tenantId) {
      return true;
    }

    // This would typically fetch quota limits from database
    // For now, use default limits
    const quotaLimits = {
      email: { daily: 1000, monthly: 10000 },
      sms: { daily: 500, monthly: 5000 },
      slack: { daily: 2000, monthly: 20000 },
      teams: { daily: 1000, monthly: 10000 },
    };

    const args = ctx.getArgs();
    let channelType: string | undefined;

    // Determine channel type from arguments
    if (args.channel) {
      channelType = args.channel;
    } else if (args.channels && Array.isArray(args.channels)) {
      channelType = args.channels[0];
    } else if (args.notification?.channels) {
      channelType = args.notification.channels[0];
    }

    if (!channelType || !quotaLimits[channelType as keyof typeof quotaLimits]) {
      return true; // Skip quota check for unknown channels
    }

    const key = `${user.tenantId}:${channelType}:daily`;
    const now = Date.now();
    const dayStart = new Date().setHours(0, 0, 0, 0);

    let usage = this.quotaUsage.get(key);

    if (!usage || usage.resetTime <= dayStart) {
      // Initialize or reset daily usage
      usage = { used: 0, resetTime: dayStart + 24 * 60 * 60 * 1000 };
      this.quotaUsage.set(key, usage);
    }

    const limit = quotaLimits[channelType as keyof typeof quotaLimits].daily;

    if (usage.used >= limit) {
      throw new ForbiddenException(
        `Daily quota exceeded for ${channelType}. Limit: ${limit} messages per day.`
      );
    }

    // Increment usage (this would be done after successful delivery in real implementation)
    usage.used++;

    return true;
  }
}

@Injectable()
export class CommunicationPermissionGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const user = request.user;

    if (!user) {
      return false;
    }

    const args = ctx.getArgs();
    const handlerName = context.getHandler().name;

    // Check specific permissions based on operation type
    const requiredPermissions: string[] = [];

    if (handlerName.includes('send') || handlerName.includes('Send')) {
      requiredPermissions.push('communication:send');
    }

    if (handlerName.includes('configure') || handlerName.includes('Configure')) {
      requiredPermissions.push('communication:configure');
    }

    if (handlerName.includes('test') || handlerName.includes('Test')) {
      requiredPermissions.push('communication:test');
    }

    // Extract channel-specific permissions
    let channelType: string | undefined;
    if (args.channel) {
      channelType = args.channel;
    } else if (args.channels && Array.isArray(args.channels)) {
      channelType = args.channels[0];
    }

    if (channelType) {
      requiredPermissions.push(`communication:${channelType}:send`);
    }

    // Check if user has required permissions
    const userPermissions = user.permissions || [];
    const hasPermission = requiredPermissions.every(permission => 
      userPermissions.includes(permission) || userPermissions.includes('communication:*')
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`
      );
    }

    return true;
  }
}

@Injectable()
export class CommunicationContentGuard implements CanActivate {
  constructor() {}

  private forbiddenPatterns = [
    /\b(spam|phishing|scam)\b/i,
    /\b(click here now|urgent action required)\b/i,
    /\b(congratulations! you've won)\b/i,
  ];

  private suspiciousPatterns = [
    /\b(free money|get rich quick)\b/i,
    /\b(limited time offer|act now)\b/i,
  ];

  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const args = ctx.getArgs();

    // Extract message content from various sources
    const contents: string[] = [];

    if (args.message) {
      if (typeof args.message === 'string') {
        contents.push(args.message);
      } else if (args.message.text) {
        contents.push(args.message.text);
      } else if (args.message.message) {
        contents.push(args.message.message);
      }
    }

    if (args.notification?.message) {
      contents.push(args.notification.message);
    }

    if (args.notification?.title) {
      contents.push(args.notification.title);
    }

    if (args.alert?.message) {
      contents.push(args.alert.message);
    }

    if (args.alert?.title) {
      contents.push(args.alert.title);
    }

    // Check for forbidden content
    for (const content of contents) {
      for (const pattern of this.forbiddenPatterns) {
        if (pattern.test(content)) {
          throw new ForbiddenException(
            'Message content contains forbidden patterns and cannot be sent'
          );
        }
      }

      // Log suspicious content for review
      for (const pattern of this.suspiciousPatterns) {
        if (pattern.test(content)) {
          console.warn(`Suspicious content detected: ${content.substring(0, 100)}...`);
        }
      }
    }

    return true;
  }
}

@Injectable()
export class CommunicationSchedulingGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const args = ctx.getArgs();

    // Extract scheduling information
    let scheduledAt: Date | undefined;

    if (args.scheduledAt) {
      scheduledAt = new Date(args.scheduledAt);
    } else if (args.notification?.scheduledAt) {
      scheduledAt = new Date(args.notification.scheduledAt);
    } else if (args.message?.scheduledAt) {
      scheduledAt = new Date(args.message.scheduledAt);
    }

    if (!scheduledAt) {
      return true; // No scheduling, allow immediate sending
    }

    const now = new Date();
    const maxFutureTime = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Validate scheduling constraints
    if (scheduledAt <= now) {
      throw new BadRequestException('Scheduled time must be in the future');
    }

    if (scheduledAt > maxFutureTime) {
      throw new BadRequestException('Cannot schedule messages more than 30 days in advance');
    }

    // Check for business hours if required
    const hour = scheduledAt.getHours();
    const day = scheduledAt.getDay();

    // Skip weekends for business notifications
    if (args.notification?.type?.includes('business') && (day === 0 || day === 6)) {
      throw new BadRequestException('Business notifications cannot be scheduled for weekends');
    }

    // Skip non-business hours for non-urgent notifications
    if (args.notification?.priority !== 'urgent' && (hour < 8 || hour > 18)) {
      throw new BadRequestException('Non-urgent notifications should be scheduled during business hours (8 AM - 6 PM)');
    }

    return true;
  }
}