const autoprefixer = require('autoprefixer')
const presetEnv = require('postcss-preset-env')
module.exports = {
	plugins: [autoprefixer(), presetEnv()],
}
