import mongoose from 'mongoose';
const { Schema } = mongoose;

const factureSchema = new Schema({
  nom: String,
  number: String,
  panier: [{ pic: Number,price:Number,description: String , name: String, quantity: Number }],
  montantTotal: Number,
  livrer:Boolean,
});
export const Facture = mongoose.model('FactureSchema', factureSchema);