const path = require("path");

module.exports = {
  entry: "./src/index.ts",
  devtool: "eval-cheap-module-source-map",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
            },
          },
        ],
        include: path.resolve(__dirname, "src"),
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    filename: "point-emitter.js",
    path: path.resolve(__dirname, "dist"),
    library: "PointEmitter",
    libraryTarget: "umd",
    libraryExport: "default",
    globalObject: "this",
  },
  // create multiple files at run time -- I don't need it
  /* optimization: {
    runtimeChunk: true,
  }, */
};
