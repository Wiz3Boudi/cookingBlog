const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const upload = require('../middleware/multer');
const validation = require('../middleware/experss-validatior');

router.use(categoryController.navLogoAndFooterAndAllData);
router.get('/', categoryController.homePage);
router.get('/categories', categoryController.exploreCategories);
router.get('/recipe/:id', categoryController.categoryDetails);
router.get('/category/:id', categoryController.exploreCategroyById);
router.post('/search', categoryController.searchRecipe);
router.get('/explore-latest', categoryController.exploreLatest);
router.get('/random-recipe', categoryController.exploreRandom);
router.get('/submit-recipe', categoryController.submitRecipe);
router.post('/submit-recipe', upload.single('image'),  validation.validation, categoryController.submitRecipeOnPost);
router.get('/about', categoryController.about);

module.exports = router;