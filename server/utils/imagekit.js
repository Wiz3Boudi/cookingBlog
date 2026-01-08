const ImageKit = require('imagekit');
const fs = require('fs')
const path = require('path')
require('dotenv').config();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
  privateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGE_KIT_URL_ENDPOINT
});

module.exports = imagekit;

