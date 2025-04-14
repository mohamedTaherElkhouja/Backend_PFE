const PvDechet = require("../model/pvDechetModel");
const User = require("../model/userModel");
const Role = require("../model/roleModel"); // ✅ Ensure Role schema is imported
const Categorie = require("../model/categorieModel"); // Assuming correct import
const mongoose = require('mongoose'); 
exports.createPvDechet = async (req, res) => {
    try {
        const { 
            Date_Creation, 
            Id_User, 
            Nature_Dechet, 
            Type_Dechet,
            Service_Emetteur,
            Designation, 
            Quantite,
            Num_lot, 
            Motif_Rejet, 
            Commentaire 
        } = req.body;

        // Fetch user and populate role
        const user = await User.findById(Id_User)
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

       
        
        // Check if the category (Nature_Dechet) exists
        const categorieId = await Categorie.findById(Nature_Dechet);
        if (!categorieId) {
            return res.status(404).json({ message: "Category not found" });
        }

     
        

        // Create new PvDechet document
        const newPvDechet = new PvDechet({
            Date_Creation,
            Id_User: user._id,
            Nature_Dechet: categorieId._id,
            Type_Dechet,
            Service_Emetteur,
            Designation,
            Quantite,
            Num_lot,
            Motif_Rejet,
            Commentaire,
            statut: "valider",
        });

        // Save to database
        await newPvDechet.save();
        return res.status(201).json({ message: "PvDechet created successfully", data: newPvDechet });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};


module.exports.getAllPvDechetsByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Find the user and populate the 'roleId' field
        const user = await User.findById(userId).populate("roleId");

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
        }

        // Check if the user's role is "emetteur"
        if (!user.roleId || user.roleId.nameRole !== "Emetteur") {
            return res.status(403).json({ success: false, message: "Accès refusé. L'utilisateur n'est pas un émetteur." });
        }

        // Use Service_Emetteur to filter PvDechet
        const pvDechets = await PvDechet.find({ Id_User: userId });

        res.json (pvDechets);
    } catch (error) {
        console.error("Erreur lors de la récupération des PV de déchets :", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};
exports.SavePvDechet = async (req, res) => {
    try {
        const { 
            Date_Creation, 
            Id_User, 
            Nature_Dechet, 
            Type_Dechet,
            Service_Emetteur,
            Designation, 
            Quantite,
            Num_lot, 
            Motif_Rejet, 
            Commentaire 
        } = req.body;

        // Fetch user and populate role
       
        const user = await User.findById(Id_User)
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

       
        
       
        const categorieId = await Categorie.findById(Nature_Dechet);
        if (!categorieId) {
            return res.status(404).json({ message: "Category not found" });
        }
       
        
        
        const newPvDechet = new PvDechet({
            Date_Creation,
            Id_User:user._id,
            Nature_Dechet: categorieId._id,
            Type_Dechet,
            Service_Emetteur,
            Designation,
            Quantite,
            Num_lot,
            Motif_Rejet,
            Commentaire,
            statut: "enregistrer",
        });

        // Save to database
        await newPvDechet.save();
        return res.status(201).json({ message: "PvDechet saved successfully", data: newPvDechet });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.fromSavedtoValidated = async (req, res) => {
    const { pvDechetId } = req.params;

    try {
        const dechet = await PvDechet.findById(pvDechetId);

        if (!dechet) {
            return res.status(404).json({ message: "pvDechet not found" });
        }

        if (dechet.statut === "valider") {
            return res.status(400).json({ message: "This dechet is already validated" });
        }

        // Update status to "valider"
        dechet.statut = "valider";
        await dechet.save();

        return res.status(200).json({ message: "Dechet has been validated successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};
module.exports.UpdatePvDechet = async (req, res) => {
    const { dechetId } = req.params;
    const {
        Date_Creation,
        Nature_Dechet,
        Type_Dechet,
        Service_Emetteur,
        Designation,
        Quantite,
        Num_lot,
        Motif_Rejet,
        Commentaire
    } = req.body;

    try {
        const dechet = await PvDechet.findById(dechetId);

        if (!dechet) {
            return res.status(404).json({ message: "Dechet not found" });
        }

        if (dechet.statut === "valider") {
            return res.status(400).json({ message: "You cannot modify this dechet. It has already been validated." });
        }

        if (dechet.updateCount >= 3) {
            return res.status(403).json({ message: "You have reached the maximum number of allowed updates (3)." });
        }

        // Optional: Convert date if needed
        if (Date_Creation) {
            const [day, month, year] = Date_Creation.split('-');
            dechet.Date_Creation = new Date(`${year}-${month}-${day}`);
        }

        dechet.Designation = Designation;
        dechet.Nature_Dechet = Nature_Dechet;
        dechet.Type_Dechet = Type_Dechet;
        dechet.Service_Emetteur = Service_Emetteur;
        dechet.Quantite = Quantite;
        dechet.Num_lot = Num_lot;
        dechet.Motif_Rejet = Motif_Rejet;
        dechet.Commentaire = Commentaire;
        dechet.updatedAt = Date.now();

        dechet.updateCount = (dechet.updateCount || 0) + 1;

        await dechet.save();

        res.status(200).json({ message: "Dechet updated successfully", updateCount: dechet.updateCount });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};
module.exports.getPvDechetById=async(req,res)=>{
    const {pvDechetId}=req.params
    try{
        const dechet=await PvDechet.findById(pvDechetId)
        if(!dechet){
            return res.status(404).json({message:"error not found"})
            
        }
        res.json(dechet)

    }
    catch(error){
        console.error(error);
        return res.status(500).json({ message: "Server error", error: error.message });


    }
};
module.exports.modifyPvDechet = async (req, res) => {
    const { pvDechetId } = req.params; 
    const { 
        Date_Creation, 
        Nature_Dechet, 
        Type_Dechet, 
        Service_Emetteur, 
        Designation, 
        Quantite, 
        Num_lot, 
        Motif_Rejet, 
        Commentaire 
    } = req.body; 

    try {
        
        const dechet = await PvDechet.findById(pvDechetId);

        
        if (!dechet) {
            return res.status(404).json({ message: "PvDechet not found" });
        }

        
        if (dechet.statut === "valider") {
            return res.status(400).json({ message: "This dechet has already been validated and cannot be modified" });
        }

        
        if (Date_Creation) {
            const [day, month, year] = Date_Creation.split('-');
            dechet.Date_Creation = new Date(`${year}-${month}-${day}`);
        }

        if (Nature_Dechet) dechet.Nature_Dechet = Nature_Dechet;
        if (Type_Dechet) dechet.Type_Dechet = Type_Dechet;
        if (Service_Emetteur) dechet.Service_Emetteur = Service_Emetteur;
        if (Designation) dechet.Designation = Designation;
        if (Quantite) dechet.Quantite = Quantite;
        if (Num_lot) dechet.Num_lot = Num_lot;
        if (Motif_Rejet) dechet.Motif_Rejet = Motif_Rejet;
        if (Commentaire) dechet.Commentaire = Commentaire;

        
        dechet.updatedAt = Date.now();
        dechet.updateCount = (dechet.updateCount || 0) + 1;

        
        await dechet.save();

        
        res.status(200).json({ message: "PvDechet modified successfully", data: dechet });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};
