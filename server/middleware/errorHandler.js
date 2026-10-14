const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }
  
  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  }
  
  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    message = `Duplicate field value entered for ${Object.keys(err.keyValue).join(', ')}`;
  }

  res.status(statusCode);
  
  res.json({
    success: false,
    message: message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { errorHandler };
