import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from 'mongoose';

@Schema({ collection: 'cars', timestamps: true })
export class Car extends Document {
    @Prop({ unique: true })
    name: string

    @Prop()
    carModel: string

    @Prop()
    liscensceDate: string

    @Prop({default: 'active'})
    status: string

    @Prop()
    year: string

    @Prop()
    price: string

    @Prop()
    brand: string

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    owerId: Types.ObjectId

    @Prop({ type: [String] })
    imageUrl: string[]
}

export const CarSchema = SchemaFactory.createForClass(Car)