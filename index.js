if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const express = require('express');
const path = require('path');
const cors = require('cors')
const expressLayout = require('express-ejs-layouts');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const sessionStore = require('./server/models/session.model');
const port = process.env.PORT || 3000;

const app = express();

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

app.use(cookieParser(process.env.COOKIE_SECRET || process.env.SESSION_SECRET));

app.use(session({
    secret: process.env.SESSION_SECRET || process.env.COOKIE_SECRET,
    store: sessionStore,
    saveUninitialized: false,
    resave: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
    }
}));
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

app.use(flash());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'server', 'views'));

app.set('layout', 'layouts/main');

const router = require('./server/routes/category.route')
app.use('/', router);

const healthRouter = require('./server/routes/health.route');
app.use('/health', healthRouter);
app.listen(port, () => console.log(`Server is running on port: ${port}`));