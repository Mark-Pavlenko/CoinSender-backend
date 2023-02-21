
## Description

Payroll microservice.

## Installation
Needs to installed and run docker. 

```bash
$ npm install
```

Enjoy!!!
## Running the app

```bash
# up and running postgresql
$ ./src/scripts/dev-base.sh

# apply migrations
$ npm run typeorm:migration:run

# run dev mode
$ npm run start:dev
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Bulk upload command

```bash
$ curl -v -F "hello=word" -F "file=@package.csv" http://localhost:3000/employee/upload
```

## Stay in touch

- Author - [Nick Lototskyi](https://github.com/maltez)


## License

Nest is [MIT licensed](LICENSE).
