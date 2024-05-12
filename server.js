import express from "express";
import path from "path"; // Creer un chemin complet vers un fichier
import { fileURLToPath } from "url"; // Obtenir le chemin du module en cours
import fs from "fs/promises";
import cors from "cors";
import { paiement, facture, amountValue, handleMongoDbConnect, createFacture} from "./utils.js";
import { Facture } from "./model/facture.schema.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json()); // Midlewere qui convertisse le données que nous avons reçu depuis le frontend.

const __filename = fileURLToPath(import.meta.url); // Nous donne le chemin de notre fichier
const __dirname = path.dirname(__filename); // On recupere notre dossier

const dbPath = path.join(__dirname, "DB.json");

app.get("/api/getProducts", async(req, res) => {
    try {
        const datas = await loadDatas();
        res.status(200).json(datas)    
    } catch (error) {
        res.status(500).json({ message: "Oops !, une erreur s'est produite." })
    }
});

app.get("/api/getFactures", async(req, res) => {
    try {
        const datas = await Facture.find();
        res.status(200).json(datas)    
    } catch (error) {
        res.status(500).json({ message: "Oops !, une erreur s'est produite." })
    }
});

app.put("/api/getFactures/:id", async(req, res) => {
    const {id} = req.params;
    console.log(id);
    try {
        const data = await Facture.findOneAndUpdate({_id:id},{livrer:true});
        res.status(200).json(data)    
    } catch (error) {
        res.status(500).json({ message: "Oops !, une erreur s'est produite." })
    }
});

app.post("/api/postProducts", async(req, res) => {

    // Si on procede directement comme ça on risque de remplacé le body
    const newData = req.body; // Recuperation des données depuis le front

    res.status(200).json("Produit envoyé");

    // Donc on procede
    const existingDatas = await loadDatas(); // Recuperation des novelles données
    existingDatas.push(newData); // Rajouter des nouvelles données
    await saveDatas(existingDatas); // Enregistrer les nouvelles données
    res(201).json({ message: "Produit ajouté avec succès" });
});

app.post("/api/paiement", async(req, res) => {

    try {
        const data = await loadDatas()
        const totale = amountValue(req.body.panier, data)
        const factureData = { nom:req.body.customer_name, number:req.body.msisdn, panier: req.body.panier, montantTotal:totale, livrer:false }
        const paymentSheet ={
            customer_name : req.body.customer_name, currency: req.body.currency, country: req.body.country, amount: totale, transaction_id: req.body.transaction_id, msisdn: req.body.msisdn
        }
        const result = await paiement(paymentSheet);
        const factureFinal = await facture(result.reference)
        console.log(factureFinal); 
        if (factureFinal.status) {
            await createFacture(factureData)
            
        }
        res.status(200).json(factureFinal);
    } catch (error) {
        res.status(400).json({
            message: error.message
        })
    }

});

async function loadDatas() {
    try {
        const data = await fs.readFile(dbPath, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

async function saveDatas(data) {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2), "utf-8");
}
handleMongoDbConnect()
app.listen(PORT, () => {
    console.log(`listen on port ${PORT}`);
});