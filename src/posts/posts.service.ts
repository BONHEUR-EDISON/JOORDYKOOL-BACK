// src/posts/posts.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  // ---------------- GET ALL POSTS ----------------
  async getAll() {
    return this.prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        likes: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  }

  // ---------------- GET POST BY ID ----------------
  async getById(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        likes: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
    if (!post) throw new NotFoundException('Post non trouvé');
    return post;
  }

  // ---------------- CREATE POST ----------------
  async create(userId: string, dto: CreatePostDto) {
    return this.prisma.post.create({
      data: {
        content: dto.content,
        mediaType: dto.mediaType,
        mediaUrl: dto.mediaUrl ?? null,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        likes: true,
        comments: true,
      },
    });
  }

  // ---------------- LIKE / UNLIKE POST ----------------
  async likePost(postId: string, userId: string) {
    const existing = await this.prisma.like.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existing) {
      await this.prisma.like.delete({
        where: { postId_userId: { postId, userId } },
      });
      return { liked: false, likesCount: await this.countLikes(postId) };
    }

    await this.prisma.like.create({ data: { postId, userId } });
    return { liked: true, likesCount: await this.countLikes(postId) };
  }

  // ---------------- COUNT LIKES ----------------
  async countLikes(postId: string) {
    return this.prisma.like.count({ where: { postId } });
  }

  // ---------------- ADD COMMENT ----------------
  async addComment(postId: string, userId: string, content: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post non trouvé');

    return this.prisma.comment.create({
      data: { postId, userId, content },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  // ---------------- DELETE POST ----------------
  async deletePost(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post non trouvé');
    if (post.userId !== userId)
      throw new NotFoundException('Action non autorisée');

    return this.prisma.post.delete({ where: { id: postId } });
  }

  // ---------------- FEED INTELLIGENT ----------------
  async getFeed(userId: string) {
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);

    return this.prisma.post.findMany({
      where: {
        OR: [{ isSponsored: true }, { userId: { in: followingIds } }, {}],
      },
      include: {
        user: true,
        likes: true,
        comments: true,
      },
      orderBy: [
        { isSponsored: 'desc' },
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }
}
