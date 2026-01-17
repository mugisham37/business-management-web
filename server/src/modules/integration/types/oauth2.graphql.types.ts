import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class OAuth2TokenType {
  @Field()
  integrationId!: string;

  @Field()
  tokenType!: string;

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field(() => [String])
  scopes!: string[];

  @Field({ nullable: true })
  providerId?: string;

  @Field()
  isValid!: boolean;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

@ObjectType()
export class OAuth2AuthorizationUrlType {
  @Field()
  authUrl!: string;

  @Field()
  state!: string;

  @Field({ nullable: true })
  expiresAt?: Date;
}

@ObjectType()
export class OAuth2CallbackResultType {
  @Field()
  success!: boolean;

  @Field({ nullable: true })
  error?: string;

  @Field({ nullable: true })
  integrationId?: string;

  @Field({ nullable: true })
  token?: OAuth2TokenType;
}