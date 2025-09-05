module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: 'current' }
      }
    ],
    [
      '@babel/preset-react',
      {
        runtime: 'automatic'
      }
    ]
  ],
  plugins: [
    // Allow using Vite-style import.meta.env in source by transforming to process.env for tests
    'babel-plugin-transform-vite-meta-env'
  ]
};


