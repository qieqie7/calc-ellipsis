import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser'

export default {
    input: 'src/index.ts',
    output: {
        file: 'dist/index.js',
        format: 'umd',
        name: 'calcDisplayText'
    },
    plugins: [
        babel({extensions: ['.ts', '.js']}),
        terser()
    ],
};
