const { router: bookRouter } = require("./book")
const { router: userRouter } = require("./user")

const apiV1 = require('express')();

apiV1.use('/books',bookRouter);
apiV1.use('/users',userRouter);

module.exports = {apiV1};

