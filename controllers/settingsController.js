const Settings = require('../models/settingsModel');

// Get settings
const getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        
        // Create default settings if none exist
        if (!settings) {
            settings = await Settings.create({
                courtName: "Futsal Arena Pro",
                address: "",
                facilities: [],
                courtRules: [],
                openingTime: "06:00",
                closingTime: "23:00"
            });
        }

        res.status(200).json({ 
            success: true, 
            data: settings 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch settings",
            error: error.message 
        });
    }
};

// Update settings
const updateSettings = async (req, res) => {
    try {
        const { courtName, address, facilities, courtRules, openingTime, closingTime } = req.body;

        let settings = await Settings.findOne();
        
        if (!settings) {
            settings = await Settings.create({
                courtName,
                address,
                facilities,
                courtRules,
                openingTime,
                closingTime
            });
        } else {
            settings.courtName = courtName || settings.courtName;
            settings.address = address || settings.address;
            settings.facilities = facilities || settings.facilities;
            settings.courtRules = courtRules || settings.courtRules;
            settings.openingTime = openingTime || settings.openingTime;
            settings.closingTime = closingTime || settings.closingTime;
            await settings.save();
        }

        res.status(200).json({ 
            success: true, 
            message: "Settings updated successfully",
            data: settings 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Failed to update settings",
            error: error.message 
        });
    }
};

module.exports = {
    getSettings,
    updateSettings
} 