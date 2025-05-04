import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Review, ReviewSchema } from './reviews.schema';

@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService],
  imports: [MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }])]
})
export class ReviewsModule { }
