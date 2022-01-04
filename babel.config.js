{
}

module.exports = api => {
    const isTest = api.env('test');

    if (isTest) {
        return {
            presets: ['@babel/preset-env', '@babel/preset-typescript'],
            plugins: [
                [
                    '@babel/plugin-transform-runtime',
                    {
                        corejs: 3,
                    },
                ],
            ],
        };
    } else {
        return {
            presets: ['@babel/preset-env', '@babel/preset-typescript'],
        };
    }
};
