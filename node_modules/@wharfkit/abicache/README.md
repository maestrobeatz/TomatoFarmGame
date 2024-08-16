# @wharfkit/abicache

An ABI Caching mechanism for Wharf's Contract and Session Kits.

## Installation

The `@wharfkit/abicache` package is distributed as a module on npm.

```
yarn add @wharfkit/abicache
# or
npm install --save @wharfkit/abicache
```

## Developing

You need [Make](https://www.gnu.org/software/make/), [node.js](https://nodejs.org/en/) and [yarn](https://classic.yarnpkg.com/en/docs/install) installed.

**All development should be done based on the [dev](https://github.com/wharfkit/session/tree/dev) branch.**

Clone the repository and run `make` to checkout all dependencies and build the project. The tests can be run using `make test` and can be continously tested during development with `make test/watch`.

See the [Makefile](./Makefile) for other useful targets.

Before submitting a pull request make sure to run `make check` and `make format`.

## Dependencies

-   [@wharfkit/antelope](https://github.com/wharfkit/antelope): Core library to provide Antelope data types.
-   [@wharfkit/signing-request](https://github.com/@wharfkit/signing-request): Antelope Signing Request Protocol.

---

Made with ☕️ & ❤️ by [Greymass](https://greymass.com).
