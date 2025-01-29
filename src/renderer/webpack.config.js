const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/renderer/index',
  module: {
    rules: [
      {
        test: /\.(png|jp(e*)g|svg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'images/[hash]-[name].[ext]',
            },
          },
        ],
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {        
        test: /\.css$/i,           
        use: ['style-loader', 'css-loader', 'postcss-loader'],      
      },
    ],
  },
  resolve: {
    plugins: [new TsconfigPathsPlugin({ configFile: "./src/renderer/tsconfig.json" })],
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'renderer.js',
    path: path.resolve(__dirname, '../../dist'),
  },
};