type HttpException = Error & {
  statusCode: number;
  message: string;
};

export default HttpException;
