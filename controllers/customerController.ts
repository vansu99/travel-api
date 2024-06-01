import MD5 from 'crypto-js/md5';
import jwt from 'jsonwebtoken';
import moment from 'moment';

export class CustomerController {
  private _conn: any;
  constructor(conn: any) {
    this._conn = conn;
  }

  async login(username: string, password: string) {
    try {
      // const pw = MD5(password);
      const sql = `SELECT * FROM customers where user_name = '${username}' and password = '${password}'`;
      const [rows] = await this._conn.query(sql);

      if (rows.length) {
        const token = jwt.sign(
          { username: username, type: 'user', expire: moment().add(3, 'day').format() },
          process.env.APP_KEY_AUTH || 'middlekey'
        );
        const sql = `UPDATE customers SET token = '${token}' where user_name = '${username}' and password = '${password}'`;
        await this._conn.query(sql);

        delete rows[0].token;
        delete rows[0].password;

        return {
          status: true,
          message: 'Đăng nhập thành công',
          data: { accessToken: token, user: rows[0] },
        };
      } else {
        return { status: false, message: 'Tài khoản hoặc mật khẩu không đúng', data: null };
      }
    } catch (err) {
      console.log('Lỗi Customer controller login');
      return { status: false, message: 'Lỗi hệ thống', data: null };
    }
  }

  async create(name: string, phone: string, email: string, username: string, password: string) {
    try {
      // Check valid
      const isValidParam = this._checkParams(name, phone, email, username, password);
      if (!isValidParam.status) return { status: false, message: isValidParam.message, data: null };

      // Insert
      const sql = `INSERT INTO customers(name, phone_number, email, user_name, password, role) VALUES ('${name}', '${phone}', '${email}', '${username}', '${password}', 'customer')`;
      await this._conn.execute(sql);

      return { status: true, message: 'Successful', data: null };
    } catch (err) {
      console.log('Lỗi Customer controller create', err);
      return { status: false, message: 'Lỗi hệ thống', data: null };
    }
  }

  async list(params: any) {
    try {
      let where = [];
      let sql = 'SELECT * FROM customers';
      if (params.name) where.push(`name like '%${params.name}%'`);

      where.push(`deleted_at IS NULL`);
      if (where.length) sql += ` where ${where.join(' and ')} ORDER BY created_at DESC`;

      const [rows] = await this._conn.query(sql);
      const data = rows.map((row: any) => ({
        id: row.customer_id,
        email: row.email,
        user_name: row.user_name,
        phone_number: row.phone_number,
        name: row.name,
        created_at: row.created_at,
      }));

      return {
        status: true,
        message: 'Successful',
        data: data,
      };
    } catch (err) {
      console.log('Lỗi Customer controller create');
      return { status: false, message: 'Lỗi hệ thống', data: null };
    }
  }

  async detail(id: any) {
    try {
      const sql = `SELECT * FROM customers WHERE customer_id = ${id}`;
      const [rows] = await this._conn.query(sql);

      if (rows.length) {
        let data = rows[0];
        delete data.token;
        delete data.password;
        delete data.deleted_at;

        return {
          status: true,
          message: 'Successful',
          data: data,
        };
      } else
        return {
          status: false,
          message: 'Not found',
          data: [],
        };
    } catch (err) {
      console.log('Lỗi Customer controller create');
      return { status: false, message: 'Lỗi hệ thống', data: null };
    }
  }

  async me(id: any) {
    try {
      const sql = `SELECT * FROM customers WHERE customer_id = ${id}`;
      const [rows] = await this._conn.query(sql);

      if (rows.length) {
        let data = rows[0];
        delete data.token;
        delete data.password;
        delete data.deleted_at;

        return {
          status: true,
          message: 'Successful',
          data: data,
        };
      } else
        return {
          status: false,
          message: 'Not found',
          data: [],
        };
    } catch (err) {
      console.log('Lỗi Customer controller', err);
      return { status: false, message: 'Lỗi hệ thống', data: null };
    }
  }

  async delete(customer_id: string) {
    try {
      const sql = `SELECT * FROM customers WHERE customer_id = ${customer_id}`;
      const [rows] = await this._conn.query(sql);

      if (rows.length) {
        const deleteSql = `UPDATE customers SET deleted_at = '${new Date().toISOString()}' WHERE customers.customer_id = '${customer_id}'`;
        await this._conn.execute(deleteSql);

        return { status: true, message: 'Successful', data: null };
      } else {
        return { status: false, message: 'Not found', data: null };
      }
    } catch (err) {
      console.log('>>> test error ', err);
      return { status: false, message: 'Lỗi hệ thống', data: null };
    }
  }

  async update(customer_id: number, name: string, phone: string, email: string, username: string) {
    try {
      const sql = `UPDATE customers SET name = '${name}', phone_number = '${phone}', email = '${email}', user_name = '${username}' WHERE customers.customer_id = '${customer_id}'`;
      await this._conn.execute(sql);

      return { status: true, message: 'Successful', data: null };
    } catch (err) {
      console.log('>>> test error ', err);
      return { status: false, message: 'Lỗi hệ thống', data: null };
    }
  }

  private _checkParams(
    name: string,
    phone: string,
    email: string,
    username: string,
    password: string
  ) {
    if (phone && (phone.length > 13 || phone.length < 10)) {
      return { status: false, message: 'Số điện thoại không đúng' };
    }
    const emailIsValid = email
      ?.toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );

    if (email && !emailIsValid) {
      return { status: false, message: 'Email không đúng' };
    }

    if (!username) {
      return { status: false, message: 'Tài khoản là bắt buộc' };
    }

    if (!password) {
      return { status: false, message: 'Mật khẩu là bắt buộc' };
    }

    return { status: true, message: '' };
  }
}
