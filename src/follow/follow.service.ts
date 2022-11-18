import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { from, map, Observable, of, switchMap } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { IUserInfo } from '../common/interface/index';

@Injectable()
export class FollowService {
    constructor(private readonly prismaService: PrismaService) {} 
    followUser(user: IUserInfo, id: number) {

            const userF = this.prismaService.follows.createMany({
                data: [
                    {
                        followerId: id,
                        followingId: user.id,
                    },
                ],
            });
            if (user.id === id) {
                throw new HttpException('You cannot follow yourself', HttpStatus.BAD_REQUEST);
            }

    }

    UserPromise(user: IUserInfo): Promise<any> {
        const hasFollow = this.prismaService.user.findUnique({
            where: {
                id: user.id,
            },
            select: {
                following: {
                    select: {
                        followingId: true,
                    },
                },
            },
        });
        return hasFollow;
    }
    
    


    followers(user: IUserInfo) {
        const userFollowInfo = this.prismaService.user.findFirstOrThrow({
            where: {
                id: user.id,
            },
            select: {
                followers: {
                    select: {
                        following: {
                            select: {
                                name: true,
                                id: true,
                                username: true,
                                ProfilPhotoPath: true,
                                about: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
            },
        });

        return userFollowInfo;
    }

    following(user: IUserInfo) {
        const userFollowingInfo = this.prismaService.user.findFirstOrThrow({
            where: {
                id: user.id,
            },
            select: {
                following: {
                    select: {
                        follower: {
                            select: {
                                name: true,
                                id: true,
                                username: true,
                                ProfilPhotoPath: true,
                                about: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
            },
        });

        return userFollowingInfo;
    }

    unfollowUser(user: IUserInfo, id: number) {
        const userUnfollow = this.prismaService.follows.deleteMany({
            where: {
                followerId: id,
                followingId: user.id,
            },
        });
        return from(userUnfollow).pipe(
            switchMap((data) => {
                return of({
                    message: 'unfollow request sent',
                });
            }
            ),
        );
    }
}
