import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GuestbookController } from './guestbook.controller';
import { GuestbookService } from './guestbook.service';
import { GuestbookEntry, GuestbookEntrySchema } from './schemas/guestbook-entry.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: GuestbookEntry.name, schema: GuestbookEntrySchema }]),
  ],
  controllers: [GuestbookController],
  providers: [GuestbookService],
  exports: [GuestbookService],
})
export class GuestbookModule {}
