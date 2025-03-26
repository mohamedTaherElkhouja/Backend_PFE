const PvDechet = require("../model/pvDechetModel");
const User = require("../model/userModel");
const Role = require("../model/roleModel"); // ✅ Ensure Role schema is imported
const Categorie = require("../model/categorieModel"); // Assuming correct import

exports.createPvDechet = async (req, res) => {
    try {
        const { 
            Date_Creation, 
            Id_User, 
            Nature_Dechet, 
            Type_Dechet,
            Designation, 
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
            Designation,
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
