import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ collection: 'users', timestamps: true })

export class Review extends Document {
    @Prop()
    content: string;

    @Prop()
    userId: string;

    @Prop()
    carId: string;

}

export const ReviewSchema = SchemaFactory.createForClass(Review)