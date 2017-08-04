import 'babel-polyfill'; // eslint-disable-line import/no-unassigned-import
import {resolve} from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';

module.exports = async (env = {}) => ({
	entry: {
		bundle: ['babel-polyfill', './index.js']
	},
	resolve: {
		modules: ['node_modules']
	},
	output: {
		filename: env.production ? '[name].[hash].js' : '[name].js',
		path: resolve(__dirname, 'docs')
	},
	module: {
		rules: [
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
					{loader: 'css-loader', options: {sourceMap: true}}
					// {loader: 'postcss-loader', options: {sourceMap: true}}
				]
			},
			{
				test: /\.pug$/,
				use: [
					{
						loader: 'pug-loader'
					}
				]
			}
		]
	},
	devServer: {
		hot: false,
		contentBase: resolve(__dirname)
	},
	devtool: 'source-map',
	plugins: [
		new HtmlWebpackPlugin({
			template: 'presentation/template.pug'
		}),
		new CopyWebpackPlugin([{
			from: 'data/',
			to: 'data/'
		}, {
			from: 'images/',
			to: 'images/'
		}], {
			copyUnmodified: true
		})
	]
});
