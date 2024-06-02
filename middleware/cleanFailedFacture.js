import { Facture } from "../model/facture.schema.js";
import { facture } from "../utils.js";
export const cleanData = async (req, res, next) => {
  const facturesData = await Facture.find({solded: false});
  facturesData.forEach(async (fatureData) => {
    const checkStatus = await facture(fatureData.reference);
    if (checkStatus.message) {
        await Facture.findOneAndDelete({ reference: fatureData.reference });
    }
    if (checkStatus.status === "succeeded") {
      await Facture.findOneAndUpdate(
        { reference: fatureData.reference },
        { solded: true }
      );
    }
    if (checkStatus.status === "failed") {
      await Facture.findOneAndDelete({ reference: fatureData.reference });
    }
  });
  next();
};
