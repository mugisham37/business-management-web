import { ObjectType, Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

@ObjectType()
export class SocialProvider {
  @Field()
  @ApiProperty({ description: 'Social provider name' })
  provider!: string;

  @Field()
  @ApiProperty({ description: 'Provider user ID' })
  providerId!: string;

  @Field()
  @ApiProperty({ description: 'Email from provider' })
  email!: string;

  @Field()
  @ApiProperty({ description: 'Connection timestamp' })
  connectedAt!: Date;
}

@ObjectType()
export class SocialAuthResponse {
  @Field()
  @ApiProperty({ description: 'Success status' })
  success!: boolean;

  @Field()
  @ApiProperty({ description: 'Response message' })
  message!: string;

  @Field(() => [SocialProvider])
  @ApiProperty({ description: 'Connected social providers', type: [SocialProvider] })
  connectedProviders!: SocialProvider[];
}

@ObjectType()
export class SocialAuthUrlResponse {
  @Field()
  @ApiProperty({ description: 'OAuth authorization URL' })
  authUrl!: string;

  @Field()
  @ApiProperty({ description: 'OAuth state parameter' })
  state!: string;
}