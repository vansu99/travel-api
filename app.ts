import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import routes from './routes';
import mysql from 'mysql2/promise';
import cors from 'cors';
import { middleware } from './middleware';
dotenv.config();

class APP {
  private _app: express.Application;
  private _conn: any;
  constructor() {
    this._app = express();
    this._init();
  }

  private async _init() {
    this._app.use(bodyParser.json());
    this._app.use(express.json());
    this._app.use(cors());
    this._app.use(express.urlencoded({ extended: true }));

    // create routes
    await this._connectDB();

    this._handleError();
  }

  private async _connectDB() {
    try {
      const host = process.env.DB_HOST || 'localhost';
      const user = process.env.DB_USER || 'root';
      const name = process.env.DB_NAME || 'demo';
      const pass = process.env.DB_PASS || '';
      this._conn = await mysql.createConnection({
        host: host,
        user: user,
        database: name,
        port: 3306,
        password: pass,
      });
      console.log('Đã kết nối Database');
    } catch (err) {
      console.log('Không thể kết nối Database');
      process.exit();
    }
  }

  private _handleError() {
    this._app.use((req, res, next) => {
      middleware(req, res, next, this._conn);
    });

    this._app.use('/', routes(this._conn));

    // Handle error not found 404
    this._app.use((req: express.Request, res: express.Response) => {
      res.status(404).json({ status: false, message: 'Không tìm thấy trang' });
    });

    // Handle error system 500
    this._app.use((error: Error, req: express.Request, res: express.Response) => {
      return res.status(500).json({
        status: true,
        message: 'Lỗi hệ thống. Vui lòng thử lại sau',
      });
    });
  }

  public listen() {
    // Start the server
    const PORT = process.env.APP_PORT || 3000;
    const BASE_URL = process.env.APP_BASE_URL || 'http://localhost';
    this._app.listen(PORT, () => {
      console.log('-              -               -');
      console.log('-                              -');
      console.log('-     Server is running on     -');
      console.log(`-     ${BASE_URL}:${PORT}    -`);
      console.log('-                              -');
      console.log('-              -               -');
      console.log('');
    });
  }
}

const app = new APP();
app.listen();
