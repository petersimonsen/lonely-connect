import { Request, Response } from "express";

const requestLogFormatter = (
    req: Request,
    res: Response,
    responseBody: any, // object or array sent with res.send()
    requestStartTime?: number
  ) => {
    let requestDuration = "";
    if (requestStartTime) {
        const endTime = Date.now() - requestStartTime;
        requestDuration = `${endTime / 1000}s`; // ms to s
    }
    let { body: requestBody } = req;
    if(res.statusCode < 400){
        requestBody = null;
    }
    return {
      request: {
        headers: req.headers,
        host: req.headers.host,
        baseUrl: req.baseUrl,
        url: req.url,
        method: req.method,
        body: requestBody,
        params: req?.params,
        query: req?.query,
        clientIp: req.headers['x-forwarded-for'] ?? req?.socket.remoteAddress,
      },
      response: {
        headers: res.getHeaders(),
        statusCode: res.statusCode,
        requestDuration,
        body: responseBody,
      }
    };
  };

  export default requestLogFormatter;
