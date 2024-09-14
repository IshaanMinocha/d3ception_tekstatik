import mongoose from 'mongoose';

const BlueprintSchema = new mongoose.Schema({
  fileName: String,
  height: Number,
  breadth: Number,
  length: Number,
  floors: Number,
 
},{timestamps : true});

export default mongoose.model('Blueprint', BlueprintSchema);