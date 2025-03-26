const mongoose = require('mongoose');
const user = require('./userModel');
const dechetModel = require('./dechetModel');




const pvDechetSchema = new mongoose.Schema(
  {
    Date_Creation: { type: Date, required: true },
    Id_User: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    Nature_Dechet: { type: mongoose.Schema.Types.ObjectId, ref: "DechetModel", required: true },
    Type_Dechet: { type: Number, required: true },
    Designation: { type: String, required: true },
    Num_lot: { type: Number, max: 99999, required: true },
    Motif_Rejet: { type: String, required: true },
    Commentaire: { type: String, required: true },
    statut: { type: String, enum: ["valider", "enregistrer"], required: true },
  },
  { timestamps: true } // ✅ This automatically adds createdAt & updatedAt
);

// Create the Model
const pv_Dechet = mongoose.model("pv_Dechet", pvDechetSchema);

module.exports = pv_Dechet;
