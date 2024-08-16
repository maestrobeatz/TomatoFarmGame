module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.module.rules.forEach(rule => {
        if (rule.oneOf) {
          rule.oneOf.forEach(oneOfRule => {
            if (oneOfRule.options && oneOfRule.options.sourceMap) {
              oneOfRule.options.sourceMap = false;
            }
          });
        }
      });
      return webpackConfig;
    }
  }
};
