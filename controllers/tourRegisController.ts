import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';
import moment from 'moment';

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
  async create(customer_id: number, tour_id: number, person: number, total_price: number) {
    try {
      const myOAuth2Client = new OAuth2Client({
        clientId: process.env.GOOGLE_MAILER_CLIENT_ID,
        clientSecret: process.env.GOOGLE_MAILER_CLIENT_SECRET,
      });

      myOAuth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_MAILER_REFRESH_TOKEN,
      });

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
      const codeBooking = `${Math.floor(100000 + Math.random() * 900000)}`;
      const sql = `INSERT INTO tour_regis_informations(code, customer_id, tour_id, person_quantity, total_price, status) VALUES (${codeBooking}, ${customer_id}, ${tour_id}, ${person}, ${total_price}, 'WAITING') ORDER BY created_at DESC`;
      const [insertResult] = await this._conn.execute(sql);
      const insertedId = insertResult?.insertId;

      const selectSql = `SELECT * FROM tour_regis_informations WHERE tour_regis_id = ${insertedId}`;
      const [rows] = await await this._conn.query(selectSql);

      let data = rows[0];

      data['customer'] = await this._getCustomerById(rows[0].customer_id);
      data['tour'] = await this._getTourById(rows[0].tour_id);

      const myAccessTokenObject = await myOAuth2Client.getAccessToken();
      const myAccessToken = myAccessTokenObject?.token;

      const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.ADMIN_EMAIL_ADDRESS,
          clientId: process.env.GOOGLE_MAILER_CLIENT_ID,
          clientSecret: process.env.GOOGLE_MAILER_CLIENT_SECRET,
          refreshToken: process.env.GOOGLE_MAILER_REFRESH_TOKEN,
          accessToken: myAccessToken as string,
        },
      });

      const mailOptions = {
        to: data?.customer?.email,
        subject: 'Xác nhận đặt tour thành công', // Tiêu đề email
        html: `
          <h1>Xác nhận đặt tour thành công - ${data?.customer?.name}</h1>

          <p>Kính gửi ${data?.customer?.name},</p>

          <p>Ban quản lý Website tour du lịch Nha Trang xin xác nhận thông tin đặt tour thành công của bạn!</p>

          <p>Chúng tôi rất vui mừng được chào đón bạn đến với Nha Trang - thành phố biển xinh đẹp và thơ mộng.</p>

          <h2>Thông tin khách hàng</h2>

          <ul>
            <li>Tên khách hàng: ${data?.customer?.name}</li>
            <li>Số điện thoại: ${data?.customer?.phone_number}</li>
            <li>Email: ${data?.customer?.email}</li>
          </ul>

          <h2>Thông tin tour</h2>

          <ul>
            <li>Tên tour du lịch: ${data?.tour?.name}</li>
            <li>Ngày khởi hành: ${moment(new Date(data?.tour?.name)).format('DD/MM/YYYY')}</li>
            <li>Số lượng người: ${data?.person_quantity}</li>
            <li>Tổng giá tiền: ${data?.total_price?.toLocaleString('vi-VN')}</li>
          </ul>

          <h2>Thông tin thanh toán</h2>
          <div class="payment">
            <p><b>Số tài khoản ngần hàng : </b>1903 5887 5610 19</p>
            <p><b>Tên ngân hàng : </b>Techcombank</p>
            <p><b>Tên chủ thẻ:</b>LE THI KIM ANH</p>
            <p><b>Tổng số tiền thanh toán:</b> ${data?.total_price?.toLocaleString('vi-VN')}</p>
          </div>

          <div class="note">
            <p>Lưu ý:</p>
            <ul>
              <li>Đây là email xác nhận thông tin đặt tour. Chúng tôi sẽ sớm xác nhận thông tin thanh toán thành công cho bạn trong thời gian sớm nhất có thể.</li>
              <li>Vui lòng kiểm tra email của bạn thường xuyên để cập nhật thông tin mới nhất.</li>
              <li>Nếu bạn có bất kỳ câu hỏi hoặc yêu cầu đặc biệt nào, xin vui lòng liên hệ trực tiếp với chúng tôi qua thông tin liên hệ.</li>
            </ul>
          </div>

          <div class="contact">
            <h2>Thông tin liên hệ:</h2>
            <ul>
              <li>
                <a href="#">Website</a>
              </li>
              <li><a href="mailto:anh.ltk.62ttql@ntu.edu.vn">anh.ltk.62ttql@ntu.edu.vn</a></li>
              <li><a href="tel:0972298544">0972298544</a></li>
            </ul>
          </div>

          <p>Một lần nữa, xin cảm ơn bạn đã tin tưởng và lựa chọn Website tour du lịch Nha Trang. Chúng tôi hy vọng sẽ mang đến cho bạn một trải nghiệm du lịch tuyệt vời và đáng nhớ!</p>
        `,
      };

      await transport.sendMail(mailOptions);

      return { status: true, message: 'Đặt tour thành công', data: data };
    } catch (err) {
      return { status: false, message: 'Lỗi hệ thống', data: null };
    }
  }

  // cancel
  async cancel(id: number, customer_id: number) {
    try {
      // Check if the user is an admin
      const customer_admin = await this._getCustomerById(customer_id);
      if (customer_admin.role !== 'admin') {
        return { status: false, message: 'Bạn không có quyền hủy tour này', data: null };
      }

      // Cancel the tour registration
      const cancelSql = `UPDATE tour_regis_informations SET status = 'CANCELLED' WHERE tour_regis_id = ${id}`;
      await this._conn.execute(cancelSql);

      const selectSql = `SELECT * FROM tour_regis_informations WHERE tour_regis_id = ${id}`;
      const [rows] = await this._conn.query(selectSql);

      let data = rows[0];

      data['customer'] = await this._getCustomerById(rows[0].customer_id);
      data['tour'] = await this._getTourById(rows[0].tour_id);

      // send mail
      const myOAuth2Client = new OAuth2Client({
        clientId: process.env.GOOGLE_MAILER_CLIENT_ID,
        clientSecret: process.env.GOOGLE_MAILER_CLIENT_SECRET,
      });

      myOAuth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_MAILER_REFRESH_TOKEN,
      });

      const myAccessTokenObject = await myOAuth2Client.getAccessToken();
      const myAccessToken = myAccessTokenObject?.token;

      const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.ADMIN_EMAIL_ADDRESS,
          clientId: process.env.GOOGLE_MAILER_CLIENT_ID,
          clientSecret: process.env.GOOGLE_MAILER_CLIENT_SECRET,
          refreshToken: process.env.GOOGLE_MAILER_REFRESH_TOKEN,
          accessToken: myAccessToken as string,
        },
      });

      const mailOptions = {
        to: data?.customer?.email,
        subject: 'Xác nhận hủy đơn hàng đặt tour', // Tiêu đề email
        html: `
        <h1>Xác nhận hủy đơn hàng đặt tour - ${data?.customer?.name}</h1>

        <p>Kính gửi ${data?.customer?.name},</p>
        
        <p>
          Ban quản lý Website tour du lịch Nha Trang xin xác nhận yêu cầu hủy đơn hàng ${
            data?.code
          } của bạn đã được thực hiện thành công!
        </p>
        
        <p>
          Chúng tôi rất tiếc khi bạn hủy đơn hàng này, nhưng chúng tôi tôn trọng quyết định của bạn.
        </p>
        
        <h2>Thông tin Đơn hàng</h2>
        <div class="the-order">
          <p><b>Mã đơn hàng:</b> ${data?.code}</p>
          <p><b>Tên khách hàng:</b> ${data?.customer?.name}</p>
          <p><b>Số điện thoại:</b> ${data?.customer?.phone_number}</p>
          <p><b>Email:</b> ${data?.customer?.email}</p>
          <p><b>Tên Tour:</b> ${data?.tour?.name}</p>
          <p><b>Ngày khởi hành:</b> ${moment(new Date(data?.tour?.name)).format('DD/MM/YYYY')}</p>
          <p><b>Tổng giá trị đơn hàng:</b> ${data?.total_price?.toLocaleString('vi-VN')}</p>
        </div>
        
        <div class="note">
          <h2>Lưu ý:</h2>
          <ul>
            <li>
              Số tiền thanh toán cho đơn hàng này sẽ được hoàn trả lại cho bạn trong vòng 3 ngày trừ ngày thứ 7 , chủ nhật
            </li>
            <li>
              Nếu bạn có bất kỳ câu hỏi hoặc yêu cầu nào, vui lòng liên hệ với chúng tôi qua thông tin ở dưới nhé !
            </li>
          </ul>
        </div>
        
        <div class="contact">
            <h2>Thông tin liên hệ:</h2>
            <ul>
              <li>
                <a href="#">Website</a>
              </li>
              <li><a href="mailto:anh.ltk.62ttql@ntu.edu.vn">anh.ltk.62ttql@ntu.edu.vn</a></li>
              <li><a href="tel:0972298544">0972298544</a></li>
            </ul>
          </div>
        
        <p>
          Cảm ơn bạn đã sử dụng dịch vụ của Website tour du lịch Nha Trang. Hy vọng bạn sẽ có cơ hội trải nghiệm du lịch Nha Trang cùng chúng tôi trong tương lai!
        </p>
        
        `,
      };

      await transport.sendMail(mailOptions);

      return { status: true, message: 'Hủy tour thành công', data: null };
    } catch (err) {
      return { status: false, message: 'Lỗi hệ thống', data: null };
    }
  }

  // detail
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

      if (status === 'DONE') {
        const selectSql = `SELECT * FROM tour_regis_informations WHERE tour_regis_id = ${id}`;
        const [rows] = await this._conn.query(selectSql);

        let data = rows[0];

        data['customer'] = await this._getCustomerById(rows[0].customer_id);
        data['tour'] = await this._getTourById(rows[0].tour_id);

        // send mail
        const myOAuth2Client = new OAuth2Client({
          clientId: process.env.GOOGLE_MAILER_CLIENT_ID,
          clientSecret: process.env.GOOGLE_MAILER_CLIENT_SECRET,
        });

        myOAuth2Client.setCredentials({
          refresh_token: process.env.GOOGLE_MAILER_REFRESH_TOKEN,
        });

        const myAccessTokenObject = await myOAuth2Client.getAccessToken();
        const myAccessToken = myAccessTokenObject?.token;

        const transport = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            type: 'OAuth2',
            user: process.env.ADMIN_EMAIL_ADDRESS,
            clientId: process.env.GOOGLE_MAILER_CLIENT_ID,
            clientSecret: process.env.GOOGLE_MAILER_CLIENT_SECRET,
            refreshToken: process.env.GOOGLE_MAILER_REFRESH_TOKEN,
            accessToken: myAccessToken as string,
          },
        });

        const mailOptions = {
          to: data?.customer?.email,
          subject: 'Xác nhận thanh toán đơn hàng thành công', // Tiêu đề email
          html: `
            <h1>Xác nhận thanh toán đơn hàng thành công - ${data?.customer?.name}</h1>

            <p>Kính gửi ${data?.customer?.name},</p>
            
            <p>
              Ban quản lý Website Tour du lịch Nha Trang xin xác nhận thông tin thanh toán đơn hàng
              ${data?.code} của bạn đã thành công!
            </p>
            
            <h2>Thông tin Đơn hàng</h2>
            <div class="the-order">
              <p><b>Mã đơn hàng:</b> ${data?.code}</p>
              <p><b>Tên khách hàng:</b> ${data?.customer?.name}</p>
              <p><b>Số điện thoại:</b> ${data?.customer?.phone_number}</p>
              <p><b>Email:</b>${data?.customer?.email}</p>
              <p><b>Tên Tour:</b> ${data?.tour?.name}</p>
              <p><b>Ngày khởi hành:</b>${moment(new Date(data?.tour?.name)).format(
                'DD/MM/YYYY'
              )}</p>
              <p><b>Tổng giá trị đơn hàng:</b>${data?.total_price?.toLocaleString('vi-VN')}</p>
            </div>
            
            <div class="note">
              <h2>Lưu ý:</h2>
              <ul>
                <li>
                  Tour sẽ được khởi hành đúng thời gian theo ${moment(
                    new Date(data?.tour?.name)
                  ).format('DD/MM/YYYY')}, xin vui lòng
                  lưu lại lịch trình.
                </li>
                <li>
                  Nếu bạn muốn hủy tour có thể liên hệ ngay cho chúng tôi càng sớm càng tốt để có thể được hỗ trợ kịp thời. </br>
                  Trước khi khởi hành tour 10 ngày , bạn muốn hủy tour chúng tôi sẽ hoàn trả lại hoàn toàn chi phí.</br>
                  Ngược lại , sau ngày khởi hành 10 ngày , chúng tôi sẽ hoàn trả lại 50% chi phí.</br>
                </li>
                <li>
                  Nếu bạn có bất kỳ câu hỏi hoặc yêu cầu nào, vui lòng liên hệ với chúng tôi
                  qua thông tin sau:
                </li>
              </ul>
            </div>
            
            <div class="contact">
              <h2>Thông tin liên hệ:</h2>
              <ul>
                <li>
                  <a href="#">Website</a>
                </li>
                <li><a href="mailto:anh.ltk.62ttql@ntu.edu.vn">anh.ltk.62ttql@ntu.edu.vn</a></li>
                <li><a href="tel:0972298544">0972298544</a></li>
              </ul>
            </div>
            
            <p>
              Một lần nữa, xin cảm ơn bạn đã tin tưởng và lựa chọn Website tour du lịch Nha
              Trang. Chúng tôi hy vọng sẽ mang đến cho bạn một trải nghiệm du lịch tuyệt vời
              và đáng nhớ!
            </p>
          `,
        };

        await transport.sendMail(mailOptions);
      }

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
