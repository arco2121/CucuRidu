module.exports = {
    plugins: [
        require('postcss-flexbugs-fixes'),

        require('postcss-custom-properties')({
            preserve: true
        }),

        require('postcss-calc')(),

        require('autoprefixer')({
            overrideBrowserslist: [
                "Chrome >= 30",
                "Safari >= 7",
                "last 10 versions"
            ],
            flexbox: "no-2009"
        }),

        require('postcss-color-function')(),

        require('postcss-opacity')()
    ]
}