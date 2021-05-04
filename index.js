if (process.env.NODE_ENV !== 'production') {
  require('./public/dev')
} else {
  require('./public/electron')
}
