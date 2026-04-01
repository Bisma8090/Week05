import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Follower, FollowerSchema } from './schemas/follower.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { FollowersService } from './followers.service';
import { FollowersController } from './followers.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Follower.name, schema: FollowerSchema },
      { name: User.name, schema: UserSchema },
    ]),
    NotificationsModule,
    GatewayModule,
  ],
  providers: [FollowersService],
  controllers: [FollowersController],
  exports: [FollowersService],
})
export class FollowersModule {}
