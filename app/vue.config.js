module.exports = {
  runtimeCompiler: true,
  devServer: {
    disableHostCheck: process.env.NODE_ENV !== "production"
  }
}
