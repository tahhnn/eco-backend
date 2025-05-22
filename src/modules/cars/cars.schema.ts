import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from 'mongoose';

@Schema({ collection: 'cars', timestamps: true })
export class Car extends Document {
    @Prop({ unique: true })
    name: string

    @Prop()
    carModel: string

    @Prop()
    liscenscePlate: string

    @Prop({ default: 'active' })
    status: string

    @Prop()
    year: string

    @Prop()
    price: string

    @Prop()
    brand: string

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    ownerId: Types.ObjectId

    @Prop({ type: [String], default: [] })
    imageUrl: string[]
}

export const CarSchema = SchemaFactory.createForClass(Car)