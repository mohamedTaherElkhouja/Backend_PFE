const User = require('../model/userModel.js');
const Admin = require('../model/adminModel.js')
const PvDechet= require ('../model/pvDechetModel.js');
const bcrypt=  require ('bcrypt');

module.exports.createAdmin = async(req, res) => {
    try {
      const { email, password } = req.body;
      const hashed = await bcrypt.hash(password, 10);
      const admin = new Admin({ email, password: hashed });
      await admin.save();
      res.status(201).json({ message: 'Utilisateur créé avec succès', admin });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };

module.exports.getAllUsers = async (req, res) => {
    try{
    const users = await User.find().select('-password');
    res.json(users);}
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error in server" });
    }
  };
  module.exports.getAllPvHistory = async (req, res) => {
    try {
      const { statut, userId } = req.query;
  
      const filters = {};
      if (statut) filters.statut = statut;
      if (userId) filters.Id_User = userId; // 🔄 Corrigé ici
  
      console.log("Applying filters:", filters);
  
      const pvList = await PvDechet.find(filters)
        .populate('Id_User', 'username roleId') // 🔄 Corrigé ici
        .sort({ createdAt: -1 });
  
      res.json(pvList);
    } catch (err) {
      console.error("Erreur dans getAllPvHistory:", err);
      res.status(500).json({ message: 'Erreur lors de la récupération de l’historique', error: err.message });
    }
  };
  
  
  module.exports.getUserById = async (req, res) => {
    try {
      const { id } = req.params;
  
      const user = await User.findById(id).select('-password'); // Ne pas renvoyer le mot de passe
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }
  
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json({ error: 'Erreur lors de la récupération de l’utilisateur', details: err.message });
    }
  };
