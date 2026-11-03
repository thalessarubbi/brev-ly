export class ShortUrlAlreadyExistsError extends Error {
  constructor() {
    super('Short URL already exists.')
  }
}
