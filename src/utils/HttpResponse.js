export const HttpResponse = (res, resStatus, error, message, data = []) => {
  return res.status(resStatus).json({
    error,
    message,
    data,
  });
};
