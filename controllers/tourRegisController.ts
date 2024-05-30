export class TourRegisController {
  private _conn: any;
  constructor(conn: any) {
    this._conn = conn;
  }

  async list(params: any) {
    try {
      let where = [];
      let sql = `
            SELECT tri.*, c.name AS customer_name
            FROM tour_regis_informations tri
            LEFT JOIN customers c ON tri.customer_id = c.customer_id
        `;

      if (params.keyword) {
        let keyword = `%${params.keyword}%`;
        where.push(`tri.customer_id LIKE '${keyword}'`);
        where.push(`tri.tour_id LIKE '${keyword}'`);
        where.push(`c.name LIKE '${keyword}'`);
      }

      if (where.length) sql += ` WHERE ${where.join(' OR ')} ORDER BY tri.created_at DESC`;

      const [rows] = await this._conn.query(sql);

      if (rows && rows.length) {
        let customer_list_id = rows.map((a: { customer_id: any }) => a.customer_id);
        let tour_list_id = rows.map((a: { tour_id: any }) => a.tour_id);
        customer_list_id = [...new Set(customer_list_id)];
        tour_list_id = [...new Set(tour_list_id)];

        const c_sql = `SELECT * FROM customers WHERE customer_id IN (${customer_list_id.join(
          ','
        )})`;
        const [c_rows] = await this._conn.query(c_sql);

        const t_sql = `SELECT * FROM tours WHERE tour_id IN (${tour_list_id.join(',')})`;
        const [t_rows] = await this._conn.query(t_sql);

        for await (let tour of rows) {
          tour.customer = c_rows.find(
            (a: { customer_id: any }) => a.customer_id == tour.customer_id
          );
          tour.tour = t_rows.find((a: { tour_id: any }) => a.tour_id == tour.tour_id);
        }
      }

      return {
        status: true,
        message: 'Lấy danh sách tour đăng ký thành công',
        data: rows,
      };
    } catch (err) {
      console.log('Lỗi tour reis controller list', err);
      return { status: false, message: 'Lỗi hệ thống', data: null };
    }
  }

  // booking
  async create(customer_id: number, tour_id: number, person: number) {
    try {
      // Check valid
      const isValidParam = this._checkParams(customer_id, tour_id);
      if (!isValidParam.status) return { status: false, message: isValidParam.message, data: null };

      // Check if the user has already registered for this tour
      const checkSql = `SELECT * FROM tour_regis_informations WHERE customer_id = ? AND tour_id = ?`;
      const [checkResult] = await this._conn.execute(checkSql, [customer_id, tour_id]);

      if (checkResult.length > 0) {
        return { status: false, message: 'Bạn đã đăng ký tour này rồi', data: null };
      }

      // Insert
      const sql = `INSERT INTO tour_regis_informations(customer_id, tour_id, person_quantity, status) VALUES (${customer_id}, ${tour_id}, ${person}, 'WAITING') ORDER BY created_at DESC`;
      const [insertResult] = await this._conn.execute(sql);
      const insertedId = insertResult?.insertId;

      const selectSql = `SELECT * FROM tour_regis_informations WHERE tour_regis_id = ${insertedId}`;
      const [rows] = await await this._conn.query(selectSql);

      return { status: true, message: 'Đặt tour thành công', data: rows[0] };
    } catch (err) {
      return { status: false, message: 'Lỗi hệ thống', data: null };
    }
  }

  async detail(id: any) {
    try {
      const sql = `SELECT * FROM tour_regis_informations WHERE tour_regis_id = ${id}`;
      const [rows] = await this._conn.query(sql);

      if (rows.length) {
        let data = rows[0];

        data['customer'] = await this._getCustomerById(data.customer_id);
        data['tour'] = await this._getTourById(data.tour_id);
        return {
          status: true,
          message: 'Lấy thông tin tour đăng ký thành công',
          data: data,
        };
      } else
        return {
          status: false,
          message: 'Không tìm thấy tour đăng ký tương ứng',
          data: [],
        };
    } catch (err) {
      return { status: false, message: 'Lỗi hệ thống', data: null };
    }
  }

  async updateStatus(id: number, status: string) {
    try {
      const sql = `UPDATE tour_regis_informations SET status = '${status}' WHERE tour_regis_informations.tour_regis_id = ${id}`;
      await this._conn.execute(sql);

      return { status: true, message: 'Successful', data: null };
    } catch (err) {
      return { status: false, message: 'Lỗi hệ thống', data: null };
    }
  }

  private _checkParams(customer_id: number, tour_id: number) {
    if (!customer_id) {
      return { status: false, message: 'Khách hàng là bắt buộc' };
    }
    if (!tour_id) {
      return { status: false, message: 'Tour là bắt buộc' };
    }

    return { status: true, message: '' };
  }

  private async _getCustomerById(id: number) {
    let data = null;
    const sql = `SELECT * FROM customers WHERE customer_id = ${id}`;
    const [rows] = await this._conn.query(sql);

    if (rows && rows.length) {
      data = rows[0];
      delete data.token;
      delete data.password;
    }
    return data;
  }

  private async _getTourById(id: number) {
    let data = null;
    const sql = `SELECT * FROM tours WHERE tour_id = ${id}`;
    const [rows] = await this._conn.query(sql);

    if (rows && rows.length) data = rows[0];
    return data;
  }
}
