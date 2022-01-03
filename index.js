if (process.env.NODE_ENV === 'production') {
    exports.default = require('./dist/index');
} else {
    exports.default = require('./src/index.ts');
}
