import jwt from "jsonwebtoken";
import moment from "moment";

export const middleware = (req: any, res: any, next: any, conn: any) => {
  let listAuthen: any = [];

  if (listAuthen.includes(req.url)) {
    const token = req.headers.authorization;

    // Error token null
    if (!token)
      return res.json({
        status: false,
        message: "Token không đúng",
        data: null,
      });

    // check token
    try {
      const result: any = jwt.verify(
        token,
        process.env.APP_KEY_AUTH || "middlekey"
      );

      if (moment() >= moment(result.expire)) {
        return res.json({
          status: false,
          message: "Token không đúng",
          data: null,
        });
      }
    } catch (err) {
      return res.json({
        status: false,
        message: "Token không đúng",
        data: null,
      });
    }

    next();
  } else {
    next();
  }
};
