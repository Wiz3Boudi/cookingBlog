const { Sequelize, Op } = require('sequelize');
const Category = require('../models/category.model')
const recipeModel = require('../models/recipe.model')
const { validationResult } = require('express-validator');
const allowedCategory = require('../models/allowedCategory');
const connection = require('../models/DB.Config.cloud')

const navLogoAndFooter = async (req, res, next) => {
    try {
        const data = await Category.General.findAll({ raw: true, limit: 2 });
        const background = await Category.single_image.findAll({ raw: true });
        res.locals.navLogoAndFooterData = {
            data,
            background
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
        const recipe = await recipeModel.findAll();
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

        const allowedCategoryOnSubmitSelect = await allowedCategory.findAll({ attributes: ['categories'], raw: true });

        const cutCategoriesValues = allowedCategoryOnSubmitSelect.map((category) => category.categories);
        return res.render('submitRecipe', { title: 'Submit-recipe', infoErrorObj, infoSubmitObj, cutCategoriesValues });

    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

const submitRecipeOnPost = async (req, res) => {
    try {
        const convertFirstCharToUppercase = req.body.enterCategory.split('').map((element, index) => index === 0 ? element.toUpperCase() : element).join('');
        const selectedCategory = convertFirstCharToUppercase || req.body.category;
        if (selectedCategory === 'Select Category') {
            req.flash('infoError', 'Please select or enter new category');
            return res.redirect('/submit-recipe');
        };
        if (!req.body.ingredients) {
            req.flash('infoError', 'Ingredients cannot be empty')
        }
        let getAllowedCategoriesData = await allowedCategory.findAll({ attributes: ['categories'], raw: true });
        getAllowedCategoriesData = getAllowedCategoriesData.map((item) => item.categories);
        if (!getAllowedCategoriesData.includes(selectedCategory)) await allowedCategory.create({ categories: selectedCategory });
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('infoError', errors.array()[0].msg);
            return res.redirect('/submit-recipe');
        }
        if (!selectedCategory) {
            req.flash('infoError', 'Category cannot be be empty !')
        }

        if (!req.file) {
            req.flash('infoError', 'Image file is required !');
            return res.redirect('/submit-recipe');
        };
        const { email, name, description, ingredients: [...ingredients] } = req.body;
        const insert = await recipeModel.create({
            name, description, email, ingredients, category: selectedCategory, image: req.file.filename
        })
        await insert.save();
        req.flash('infoSubmit', 'Submitted successfully !');
        return res.redirect('/submit-recipe')
    } catch (error) {
        console.log('Error', error)
        req.flash('infoError', error.message);
        return res.redirect('/submit-recipe');
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
    navLogoAndFooter,
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