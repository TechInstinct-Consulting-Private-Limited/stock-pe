function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
}

function errorHandler(error, req, res, next) {
    console.error(error);

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.isOperational
            ? error.message
            : "An unexpected server error occurred",
    });
}

module.exports = {
    errorHandler,
    notFoundHandler,
};
