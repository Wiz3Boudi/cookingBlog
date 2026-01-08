const { Sequelize, Op } = require('sequelize');
const Category = require('../models/category.model')
const recipeModel = require('../models/recipe.model')
const { validationResult } = require('express-validator');
const allowedCategory = require('../models/allowedCategory');
const connection = require('../models/DB.Config.cloud')
const imagekit = require('../utils/imagekit');

const navLogoAndFooterAndAllData = async (req, res, next) => {
    try {
        const data = await Category.General.findAll({ raw: true, limit: 2 });
        const background = await Category.single_image.findAll({ raw: true });

        if (!data || data.length < 0 || typeof data === null || typeof data === 'undefined') {
            return res.locals.itemNotFound = { message: 'No data' }
        }
        res.locals.navLogoAndFooterData = {
            data,
            background,
        }
        next();
    } catch (error) {
        console.log(error.message);
        next();
    }
}

const homePage = async (req, res) => {
    try {
        const index = await Category.General.findAll({
            where: { 'name': ['hero', 'puplish_recipe'] },
            raw: true
        });

        const viewAll = await Category.Category.findByPk(6, { raw: true });

        const categories = await Category.Category.findAll({ raw: true, limit: 5 });

        const recipe = await recipeModel.findAll({ order: [['id', 'DESC']], raw: true, limit: 5 });

        const egyptian = await recipeModel.findAll({ where: { category: 'Egyptian' }, raw: true, limit: 5 });

        const sudanese = await recipeModel.findAll({ where: { category: 'Sudanese' }, raw: true, limit: 5 });

        const american = await recipeModel.findAll({ where: { category: 'American' }, raw: true, limit: 5 });

        if (!index) return res.status(200).json({ status: 'fail !', message: 'data not found !' });
        if (!categories) return res.status(200).json({ status: 'fail !', message: 'data not found !' });
        if (!viewAll) return res.status(200).json({ status: 'fail !', message: 'data not found !' });
        if (!recipe) return res.status(200).json({ status: 'fail !', message: 'data not found !' });
        if (!egyptian) return res.status(200).json({ status: 'fail !', message: 'data not found !' });
        if (!sudanese) return res.status(200).json({ status: 'fail !', message: 'data not found !' });
        if (!american) return res.status(200).json({ status: 'fail !', message: 'data not found !' });

        const data = { categories, viewAll, recipe, egyptian, sudanese, american, index };
        return res.render('index', { title: 'Home', data });
    } catch (error) {
        return res.status(404).json({ Message: error.message || 'error occurred !' });
    }

}

const categoryDetails = async (req, res) => {
    try {

        let recipeId = + req.params.id;
        const data = await recipeModel.findByPk(recipeId);
        const recipe = await data.toJSON();
        if (!recipe) return res.status(200).json({ status: 'fail !', message: 'Something went wrong !' });
        res.render('recipe', { title: 'Recipe-Details', recipe })
    } catch (error) {
        res.status(404).json({ error: error.message })
    }
}
const exploreCategories = async (req, res) => {
    try {
        let categoriess = await connection.query(`
            SELECT t1.*
            FROM Recipes t1
            INNER JOIN (
              SELECT category, MIN(id) as min_id
              FROM Recipes
              GROUP BY category
            ) t2 ON t1.category = t2.category AND t1.id = t2.min_id
            ORDER BY t1.category
          `);
        const categories = categoriess[0]
        if (!categories) return res.status(200).json({ status: 'fail !', message: 'data not found !' });
        return res.render('categories', { title: 'categories', categories });
    } catch (error) {
        res.status(404).json({ status: 'fail', error: error.message });
    }
}

const exploreCategroyById = async (req, res) => {
    try {
        let categoryId = req.params.id;
        const categoryIds = await recipeModel.findAll({ raw: true, where: { 'category': categoryId } });
        if (!categoryIds) return res.status(200).json({ status: 'fail !', message: 'data not found !' });
        return res.render('categoryById', { title: 'category', categoryIds });
    } catch (error) {
        return res.status(500).json({ status: 'fail', error: error.message });
    }
}

const searchRecipe = async (req, res) => {
    try {
        let searchText = req.body.searchTerm
        const sreachresult = await recipeModel.findAll({
            where: {
                [Op.or]: [
                    { description: { [Op.like]: `%${searchText}%` } },
                    { name: { [Op.like]: `%${searchText}%` } },
                    { ingredients: { [Op.like]: `%${searchText}%` } },
                    { ingredients: { [Op.like]: `%${searchText}%` } },
                    { category: { [Op.like]: `%${searchText}%` } }
                ]
            }
        })
        if (!sreachresult || sreachresult === 'undefined' || sreachresult === null || sreachresult.length < 0) {
            return res.status(404).json({ status: 'fail', Message: 'No matches !' });
        }
        res.render('search', { title: 'Search for recipe', sreachresult, searchText });
    } catch (error) {
        return res.status(500).json({ status: 'fail', Error: error.message || 'Something went wrong !' })
    }
}

const exploreLatest = async (req, res) => {
    try {
        const recipe = await recipeModel.findAll({ order: [['id', 'DESC']], raw: true, limit: 20 });
        if (!recipe) return res.status(200).json({ status: 'fail !', message: 'data not found !' });
        return res.render('explore-latest', { title: 'Explore-latest', recipe });
    } catch (error) {
        return res.status(500).json({ Message: error.message || 'error occurred !' });
    }
}

const exploreRandom = async (req, res) => {
    try {
        const randomRecipe = await recipeModel.findOne({
            order: Sequelize.literal('RAND()'),
            limit: 1
        });
        // this also work but "order" is more efficient 

        // const countRecipes = await Recipe.count();
        // if(countRecipes === 0) return res.status(404).json({Message: 'No Recipe found !'});
        // const randomNumber = Math.floor(Math.random() * countRecipes);
        // const randomRecipe = await Recipe.findOne({offset: randomNumber}) 

        res.render('exploreRandom', { title: 'Explore-Random', randomRecipe });
    } catch (error) {
        return res.status(500).json({ Message: error.message || 'something went wrong !' })
    }
}

const submitRecipe = async (req, res) => {
    try {
        const infoErrorObj = req.flash('infoError');
        const infoSubmitObj = req.flash('infoSubmit');
        const formValues = req.flash('infoFormData')[0] || {};

        const allowedCategoryOnSubmitSelect = await allowedCategory.findAll({ attributes: ['categories'], raw: true });

        const cutCategoriesValues = allowedCategoryOnSubmitSelect.map((category) => category.categories);
        return res.render('submitRecipe', { title: 'Submit-recipe', infoErrorObj, infoSubmitObj, formValues, cutCategoriesValues });

    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

const submitRecipeOnPost = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('infoError', errors.errors[0].msg);
            req.flash('infoFormData', req.body);
            return req.session.save(() => res.redirect('/submit-recipe'));
        }

        const { enterCategory, category, email, name, description, ingredients } = req.body;

        let selectedCategory = category;
        if (enterCategory && enterCategory.trim() !== '') {
            selectedCategory = enterCategory.charAt(0).toUpperCase() + enterCategory.slice(1);
        }

        if (!selectedCategory || selectedCategory === 'Select Category') {
            req.flash('infoError', 'Please select or enter a valid category');
            req.flash('infoFormData', req.body);
            return req.session.save(() => res.redirect('/submit-recipe'));
        }

        if (!req.file) {
            req.flash('infoError', 'Image file is required!');
            req.flash('infoFormData', req.body);
            return req.session.save(() => res.redirect('/submit-recipe'));
        }

        let getAllowedCategoriesData = await allowedCategory.findAll({ attributes: ['categories'] });
        let categoryList = getAllowedCategoriesData.map((item) => item.categories);

        if (!categoryList.includes(selectedCategory)) {
            await allowedCategory.create({ categories: selectedCategory });
        }

        const uploadResponse = await imagekit.upload({
            file: req.file.buffer,
            fileName: req.file.originalname,
            folder: '/images/cooking-blog',
            useUniqueFileName: true,
        });

        await recipeModel.create({
            name,
            description,
            email,
            ingredients,
            category: selectedCategory,
            image: uploadResponse.name
        });

        req.flash('infoSubmit', 'Submitted successfully!');
        return req.session.save(() => res.redirect('/submit-recipe'));

    } catch (error) {
        console.error('SERVER ERROR:', error);
        req.flash('infoError', 'Something went wrong: ' + error.message);
        return req.session.save(() => res.redirect('/submit-recipe'));
    }
}

const about = async (req, res) => {
    try {
        res.render('about', { title: 'About' });
    } catch (error) {
        console.log({ Message: error.message || 'error occurred !' });
    }
}

module.exports = {
    homePage,
    navLogoAndFooterAndAllData,
    about,
    exploreCategories,
    categoryDetails,
    exploreCategroyById,
    searchRecipe,
    submitRecipe,
    exploreLatest,
    exploreRandom,
    submitRecipeOnPost,
}