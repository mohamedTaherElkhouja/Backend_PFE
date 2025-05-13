const PvDechet = require("../model/pvDechetModel");
const User = require("../model/userModel");
const Role = require("../model/roleModel"); // ✅ Ensure Role schema is imported
const Categorie = require("../model/categorieModel"); // Assuming correct import
const mongoose = require('mongoose'); 
const nodemailer = require('nodemailer');
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
        await notifyAQ(newPvDechet);
        return res.status(201).json({ message: "PvDechet created successfully", data: newPvDechet });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};


async function notifyAQ(pvDechet) {
    const aqUsers = await User.find().populate("roleId");
    const aqEmails = aqUsers
        .filter(u => u.roleId?.nameRole === "AQ")
        .map(u => u.email); // assuming User schema has `email`

    const transporter = nodemailer.createTransport({
        service: 'gmail', // ou un autre service
        auth: {
            user: 'hamaelkhouja@gmail.com',
            pass: 'xwltmupabvmigfwk'
        }
    });

    const mailOptions = {
        from: 'hamaelkhouja@gmail.com',
        to: aqEmails,
        subject: 'Nouveau PV Déchet à valider',
        html: `<p>Un nouveau PV déchet a été créé. Cliquez <a href="http://localhost:4200/user/login">ici</a> pour le consulter.</p>`
    };

    await transporter.sendMail(mailOptions);
}


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

exports.getPvDechetsForAQ = async (req, res) => {
    const { pvDechetId } = req.params;

    try {
        // Validate pvDechetId if provided
        if (pvDechetId && !mongoose.Types.ObjectId.isValid(pvDechetId)) {
            return res.status(400).json({ message: "Invalid PvDechet ID" });
        }

        let query = { statut: "valider", AQ_Validated: { $ne: true } };

        // If pvDechetId is provided, filter by it
        if (pvDechetId) {
            query._id = pvDechetId;
        }

        const pvList = await PvDechet.find(query);

        if (!pvList || pvList.length === 0) {
            return res.status(404).json({ message: "No PvDechets found" });
        }

        res.status(200).json(pvList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};
exports.validatePvByAQ = async (req, res) => {
    const { pvDechetId } = req.params;
    const { AQ_Commentaire, AQ_Quantite_Avant, AQ_Quantite_Apres } = req.body;

    try {
        // Find the PvDechet by ID
        const dechet = await PvDechet.findById(pvDechetId);
        if (!dechet) {
            return res.status(404).json({ message: "PV non trouvé" });
        }

        // Apply changes
        dechet.AQ_Commentaire = AQ_Commentaire;
        dechet.AQ_Quantite_Avant = AQ_Quantite_Avant;
        dechet.AQ_Quantite_Apres = AQ_Quantite_Apres;
        dechet.AQ_Validated = true;
        dechet.statut = "valider";

        await dechet.save();

        // Notify HSE by email
        await notifyHSE(dechet);

        res.status(200).json({ message: "PV validé avec succès par AQ", data: dechet });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

async function notifyHSE(pvDechet) {
    try {
        // Fetch HSE users
        const hseUsers = await User.find().populate("roleId");
        const hseEmails = hseUsers
            .filter(user => user.roleId?.nameRole === "HSE")
            .map(user => user.email); // Assuming User schema has an `email` field

        if (hseEmails.length === 0) {
            console.warn("Aucun utilisateur HSE trouvé pour la notification.");
            return;
        }

        // Configure email transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Use your email service provider
            auth: {
                user: 'hamaelkhouja@gmail.com', // Replace with your email
                pass: 'xwltmupabvmigfwk' // Replace with your email app password
            }
        });

        // Email content
        const mailOptions = {
            from: 'hamaelkhouja@gmail.com', // Replace with your email
            to: hseEmails,
            subject: 'Notification: PV Déchet validé par AQ',
            html: `
                <p>Bonjour,</p>
                <p>Un PV déchet a été validé par AQ.</p>
                <p>Cliquez <a href="http://localhost:4200/user/login">ici</a> pour le consulter.</p>
                <p>Cordialement,</p>
                <p>Votre système de gestion des déchets</p>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);
        console.log("Notification envoyée aux utilisateurs HSE.");
    } catch (error) {
        console.error("Erreur lors de l'envoi de la notification HSE :", error);
    }
}

exports.getValidatedPvByAQ = async (req, res) => {
    try {
        const validatedPvs = await PvDechet.find({ AQ_Validated: true });

        if (!validatedPvs || validatedPvs.length === 0) {
            return res.status(404).json({ message: "Aucun PV validé par AQ trouvé." });
        }

        res.status(200).json(validatedPvs);
    } catch (error) {
        console.error("Erreur lors de la récupération des PV validés par AQ :", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

exports.validatePvByHSE = async (req, res) => {
    const { pvDechetId } = req.params;
    const { HSE_Commentaire } = req.body;

    try {
        // Find the PvDechet by ID
        const dechet = await PvDechet.findById(pvDechetId);
        if (!dechet) {
            return res.status(404).json({ message: "PV non trouvé" });
        }

        // Apply changes
        dechet.HSE_Commentaire = HSE_Commentaire;
        dechet.HSE_Validated = true;
        

        await dechet.save();

        res.status(200).json({ message: "PV validé avec succès par HSE", data: dechet });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

exports.getPvDechetsForHSE = async (req, res) => {
    try {
        const pvList = await PvDechet.find({ statut: "valider", HSE_Validated: { $ne: false } });

        if (!pvList || pvList.length === 0) {
            return res.status(404).json({ message: "Aucun PV disponible pour HSE" });
        }

        res.status(200).json(pvList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

exports.getValidatedPvByHSE = async (req, res) => {
    try {
        const validatedPvs = await PvDechet.find({ HSE_Validated: true });

        if (!validatedPvs || validatedPvs.length === 0) {
            return res.status(404).json({ message: "Aucun PV validé par HSE" });
        }

        res.status(200).json(validatedPvs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};
