# ldraw

## Install

`yarn install:ldraw`

## Example

```javascript
// example.js
import ldraw from 'ldraw';
ldraw.load('3001.dat').then(part => console.log(part));
```

```bash
npm i node-localstorage
node -r node-localstorage/register example.js
```

## File Formats

* [Official Parts Library Specifications](https://www.ldraw.org/article/512.html) - Files implementing a part, subpart or primitive use `*.dat`. A Lego model consisting of one or more bricks use `*.ldr`.
* [Official Model Repository (OMR) Specification](https://www.ldraw.org/article/593.html) - The Official Model Repository (OMR) is a database of files in the LDraw File Format describing models that are released as sets by LEGO®.  Multiple `*.ldr` files can be aggregated into files of type `*.mpd`

## References

* https://github.com/LasseD/buildinginstructions.js
* https://github.com/HazenBabcock/brigl
