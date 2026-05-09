import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { ApiProperty } from "@nestjs/swagger";

export type AdminDocument = Admin & Document;

@Schema({
  timestamps: true,
  collection: "admins",
  toJSON: {
    transform: (_doc: any, ret: any) => {
      delete ret.passwordHash;
      delete ret.__v;
      return ret;
    },
  },
})
export class Admin {
  @ApiProperty({ description: "管理员 ID" })
  _id: string;

  @Prop({ required: true, unique: true, trim: true })
  @ApiProperty({ description: "用户名", example: "admin" })
  username: string;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ default: "admin", enum: ["admin"] })
  @ApiProperty({ description: "角色", example: "admin" })
  role: string;

  @ApiProperty({ description: "创建时间" })
  createdAt: Date;

  @ApiProperty({ description: "更新时间" })
  updatedAt: Date;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
