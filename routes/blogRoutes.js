// routes/blogRoutes.js
const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const blogModel = require('../models/blogModel'); // Corrected model import
const router = express.Router();

// Cloudinary configuration
cloudinary.config({
  cloud_name: 'dwxkileot', // Your Cloudinary cloud name
  api_key: '991132544295571', // Your Cloudinary API key
  api_secret: 'aBiTnhabqxwYmmz7vkKgsN6NJyI', // Your Cloudinary API secret
});

// Set up multer for memory storage (uploading files without storing them locally)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST route for creating a new blog post
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, content, category } = req.body;
    let imageUrl = '';

    // If an image is uploaded, use Cloudinary to upload it
    if (req.file) {
      const result = await cloudinary.uploader.upload_stream({ resource_type: 'auto' }, (error, result) => {
        if (error) {
          return res.status(500).json({ message: 'Error uploading image', error });
        }
        imageUrl = result.secure_url; // Get the image URL from Cloudinary
      });
      req.file.stream.pipe(result); // Upload the image to Cloudinary
    }

    // Create and save a new blog post in the database
    const newBlogPost = new blogModel({ title, content, category, image: imageUrl });
    await newBlogPost.save();
    res.status(201).json(newBlogPost);
  } catch (error) {
    res.status(500).json({ message: 'Error creating blog post', error });
  }
});

// GET route to fetch all blog posts
router.get('/', async (req, res) => {
  try {
    const blogPosts = await blogModel.find().sort({ createdAt: -1 }); // Get all posts, sorted by creation date
    res.status(200).json(blogPosts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blog posts', error });
  }
});

module.exports = router;
