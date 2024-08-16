import * as pkg from './index'
const ABICache = pkg.default
for (const key of Object.keys(pkg)) {
    if (key === 'default') continue
    ABICache[key] = pkg[key]
}
export default ABICache
