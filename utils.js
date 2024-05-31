import mongoose from "mongoose";
import "dotenv/config";
import { Facture } from "./model/facture.schema.js";
export async function paiement(datas) {
  const response = await fetch("https://i-pay.money/api/v1/payments", {
    method: "POST",
    headers: {
      "Ipay-Payment-Type": "mobile",
      "Ipay-Target-Environment": "live",
      Authorization: `Bearer ${process.env.SECRETKEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datas),
  });
  console.log('paiement',response);
  return await response.json();
}
export async function facture(reference) {
  const response = await fetch(
    `https://i-pay.money/api/v1/payments/${reference}`,
    {
      method: "GET",
      headers: {
        "Ipay-Payment-Type": "mobile",
        "Ipay-Target-Environment": "live",
        Authorization: `Bearer ${process.env.SECRETKEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  console.log('facture',response);
  return await response.json();
}

export function amountValue(panier, data) {
  let total = 0;
  panier.forEach((element) => {
    total += data[element.pic].price * element.quantity;
  });
  return total;
}
export async function handleMongoDbConnect() {
  try {
    await mongoose.connect(process.env.URI);
    console.log("MonogDb connected");
  } catch (error) {
    console.log(error);
  }
}

export async function createFacture(data) {
  try {
    await Facture.create(data);
  } catch (error) {
    console.log(error);
  }
}
