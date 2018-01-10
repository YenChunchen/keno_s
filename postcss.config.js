module.exports = {
    ident: 'postcss',
    plugins: [
        require('postcss-cssnext')(),
        require('postcss-nesting')()
    ]
};