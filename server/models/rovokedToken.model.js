import mongoose from 'mongoose';

const revokedTokenSchema = new mongoose.Schema({
  token: String,
});

export const RevokedToken = mongoose.model('RevokedToken', revokedTokenSchema);
