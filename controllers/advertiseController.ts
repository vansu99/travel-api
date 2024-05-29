export class AdvertiseController {
  private _conn: any;
  constructor(conn: any) {
    this._conn = conn;
  }

  async generate() {
    let values = [];
    for (let i = 1; i <= 30; i++) {
      values.push(`('Bài viết ${i}', '', 'Mô tả bài viết ${i}')`);
    }

    const sql = `INSERT INTO advertises(title, image, description) VALUES ${values.join(',')}`;
    await this._conn.execute(sql);

    return true;
  }

  async list(params: any) {
    try {
      let where = [];
      let sql = 'SELECT * FROM advertises';
      if (params.title) where.push(`title like '%${params.title}%'`);
      if (params.description) where.push(`description like '%${params.description}%'`);

      where.push(`deleted_at IS NULL`);
      if (where.length) sql += ` where ${where.join(' and ')} ORDER BY created_at DESC`;

      const [rows] = await this._conn.query(sql);

      return {
        status: true,
        message: 'Successful',
        data: rows,
      };
    } catch (err) {
      return { status: false, message: 'Lỗi hệ thống', data: null };
    }
  }

  async create(name: string, location: string, image: string, description: string) {
    try {
      // Insert
      const sql = `INSERT INTO advertises(title, image, location, description) VALUES ('${name}', '${image}', '${location}', '${description}')`;
      await this._conn.execute(sql);

      return { status: true, message: 'Successful.', data: null };
    } catch (err) {
      console.log('>>> test err ', err);
      return { status: false, message: 'Lỗi hệ thống', data: null };
    }
  }

  async update(
    advertise_id: string,
    name: string,
    location: string,
    image: string,
    description: string
  ) {
    try {
      const sql = `UPDATE advertises SET title = '${name}', location = '${location}', image = '${image}', description = '${description}' WHERE advertises.advertise_id = '${advertise_id}'`;
      await this._conn.execute(sql);

      return { status: true, message: 'Successful', data: null };
    } catch (err) {
      console.log('>>> test error ', err);
      return { status: false, message: 'Lỗi hệ thống', data: null };
    }
  }

  async detail(id: any) {
    try {
      const sql = `SELECT * FROM advertises WHERE advertise_id = ${id}`;
      const [rows] = await this._conn.query(sql);

      if (rows.length) {
        let data = rows[0];
        return {
          status: true,
          message: 'Successful.',
          data: data,
        };
      } else
        return {
          status: false,
          message: 'Không tìm thấy bài viết tương ứng',
          data: [],
        };
    } catch (err) {
      return { status: false, message: 'Lỗi hệ thống', data: null };
    }
  }

  async delete(advertise_id: string) {
    try {
      const sql = `SELECT * FROM advertises WHERE advertise_id = ${advertise_id}`;
      const [rows] = await this._conn.query(sql);

      if (rows.length) {
        const deleteSql = `UPDATE advertises SET deleted_at = '${new Date().toISOString()}' WHERE advertises.advertise_id = '${advertise_id}'`;
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
}
