'use strict'

const stylelint = require('gulp-stylelint')
const vfs = require('vinyl-fs')

module.exports = (files) => async () => {
  const prettier = (await import('gulp-prettier')).default

  vfs
    .src(files)
    .pipe(prettier()) // First format the CSS files with Prettier
    .pipe(
      stylelint({
        fix: true, // Automatically fix Stylelint issues
        reporters: [{ formatter: 'string', console: true }],
      })
    )
    .pipe(vfs.dest((file) => file.base)) // Write the changes back to the files
}
