const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// Stickers directory
const stickersDir = path.join(__dirname, "../stickers");

// Create stickers directory if it doesn't exist
if (!fs.existsSync(stickersDir)) {
  fs.mkdirSync(stickersDir, { recursive: true });
  
  // Create subdirectories for different sticker packs
  const defaultPackDir = path.join(stickersDir, "default");
  if (!fs.existsSync(defaultPackDir)) {
    fs.mkdirSync(defaultPackDir, { recursive: true });
  }
}

// Get all sticker packs
router.get("/packs", (req, res) => {
  try {
    const packs = fs.readdirSync(stickersDir)
      .filter(item => fs.statSync(path.join(stickersDir, item)).isDirectory())
      .map(pack => {
        // Get stickers in this pack
        const packPath = path.join(stickersDir, pack);
        const stickers = fs.readdirSync(packPath)
          .filter(file => {
            const extension = path.extname(file).toLowerCase();
            return ['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(extension);
          })
          .map(file => ({
            name: file,
            url: `/stickers/${pack}/${file}`
          }));
        
        return {
          name: pack,
          stickers: stickers
        };
      });
    
    res.json(packs);
  } catch (error) {
    console.error("Error fetching sticker packs:", error);
    res.status(500).json({ message: "Failed to fetch sticker packs" });
  }
});

// Get stickers from a specific pack
router.get("/packs/:packName", (req, res) => {
  try {
    const { packName } = req.params;
    const packPath = path.join(stickersDir, packName);
    
    if (!fs.existsSync(packPath)) {
      return res.status(404).json({ message: "Sticker pack not found" });
    }
    
    const stickers = fs.readdirSync(packPath)
      .filter(file => {
        const extension = path.extname(file).toLowerCase();
        return ['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(extension);
      })
      .map(file => ({
        name: file,
        url: `/stickers/${packName}/${file}`
      }));
    
    res.json(stickers);
  } catch (error) {
    console.error("Error fetching stickers:", error);
    res.status(500).json({ message: "Failed to fetch stickers" });
  }
});

module.exports = router; 