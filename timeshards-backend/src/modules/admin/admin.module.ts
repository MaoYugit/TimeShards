import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { BlogPost, BlogPostSchema } from '../blog/schemas/blog-post.schema';
import { GuestbookEntry, GuestbookEntrySchema } from '../guestbook/schemas/guestbook-entry.schema';
import { ChatMessage, ChatMessageSchema } from '../chat/schemas/chat-message.schema';
import { PortfolioProject, PortfolioProjectSchema } from '../portfolio/schemas/portfolio-project.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BlogPost.name, schema: BlogPostSchema },
      { name: GuestbookEntry.name, schema: GuestbookEntrySchema },
      { name: ChatMessage.name, schema: ChatMessageSchema },
      { name: PortfolioProject.name, schema: PortfolioProjectSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
