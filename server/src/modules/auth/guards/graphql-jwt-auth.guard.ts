/**
 * GraphQL JWT Auth Guard - Alias for JWT Auth Guard
 * This guard validates JWT tokens in GraphQL requests
 * 
 * Usage:
 * @UseGuards(GraphQLJwtAuthGuard)
 * or
 * @UseGuards(JwtAuthGuard)
 */

export { JwtAuthGuard } from './jwt-auth.guard';
export { JwtAuthGuard as GraphQLJwtAuthGuard } from './jwt-auth.guard';
