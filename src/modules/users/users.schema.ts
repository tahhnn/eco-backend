import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';


@Schema({ collection: 'users', timestamps: true })
export class User extends Document {
    @Prop({ unique: true })
    email: string;

    @Prop()
    password: string;

    @Prop({ unique: true })
    name: string;

    @Prop({ default: 'user' })
    role: string;

    @Prop({ default: "" })
    avatar: string;

    @Prop()
    address: string;

    @Prop()
    phone: string;

    @Prop({ default: true })
    isPublicProfile: boolean

    @Prop()
    status: boolean;

    @Prop()
    bio: string;

    @Prop()
    deviceId: string;

    @Prop({ type: [{ deviceId: String, verifiedAt: Date }], default: [] })
    verifiedDevices: Array<{ deviceId: string; verifiedAt: Date }>;
}
export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.virtual('cars', {
    ref: 'Car',
    localField: '_id',
    foreignField: 'ownerId',
    justOne: false,
});
UserSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'ownerId',
    justOne: false,
});

// ✅ Cho phép hiển thị virtual khi gọi toJSON hoặc toObject
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });