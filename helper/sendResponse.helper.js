const sendResponse = ({
    res,
    status = 200,
    message,
    data,
    ...rest
  }) => {
    res.status(status).send({
      message: message,
      data: data,
      ...rest,
    });
  };
  
export default sendResponse;