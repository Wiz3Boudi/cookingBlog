const express = require('express');
const path = require('path');
const cors = require('cors')
const expressLayout = require('express-ejs-layouts');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const app = express();
const port = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

process.on('warning', (warning) => {
    if (warning.name === 'DeprecationWarning') {
        console.log('Deprecation Warning:', warning.message);
        console.log('Stack:', warning.stack);
        console.log('Code:', warning.code);
    }
});


app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressLayout);

app.use(cookieParser('cookingBlogSecure'));
app.use(session(({
    secret: process.env.SESSION_SECRET || 'cookingBlogSecure',
    store: new SequelizeStore({
        db: require('./server/models/DB.Config.cloud')
    }),
    saveUninitialized: true,
    resave: true
})));
app.use(flash());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'server', 'views'));

app.set('layout', 'layouts/main');

const router = require('./server/routes/category.route')

app.use('/', router);


app.listen(port, () => console.log(`Server is running on port: ${port}`));