import 'babel-polyfill'; // eslint-disable-line import/no-unassigned-import
import {resolve} from 'path';
import {HotModuleReplacementPlugin} from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
// Import ManifestPlugin from 'webpack-manifest-plugin';

module.exports = async (env = {}) => ({
	entry: {
		bundle: ['babel-polyfill', './index.js']
	},
	resolve: {
		modules: ['node_modules']
	},
	output: {
		filename: env.production ? '[name].[hash].js' : '[name].js',
		path: resolve(__dirname, 'dist')
	},
	module: {
		rules: [
			{
				test: /\.(txt|csv|tsv|xml)$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'raw-loader'
				}
			},
			{
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							[
								'env',
								{
                  // Via: https://docs.google.com/document/d/1mByh6sT8zI4XRyPKqWVsC2jUfXHZvhshS5SlHErWjXU/view
									browsers: [
										'last 2 versions',
										'ie >= 11',
										'safari >= 10',
										'ios >= 9'
									]
								}
							]
						]
					}
				}
			},
			{
				test: /\.s?css/,
				use: [
            {loader: 'style-loader', options: {sourceMap: true}},
            {loader: 'css-loader', options: {sourceMap: true}},
            {loader: 'postcss-loader', options: {sourceMap: true}}
				]
			}
		]
	},
	devServer: {
		hot: true,
		contentBase: resolve(__dirname, 'client')
	},
	devtool: 'source-map',
	plugins: [
		new HtmlWebpackPlugin({
			template: resolve(__dirname, 'presentation', 'slides.ejs')
		}),
		new HotModuleReplacementPlugin()
	]
});
