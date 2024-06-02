import moment from 'moment-timezone';

const vietnamTimezone = 'Asia/Ho_Chi_Minh';
moment.tz.setDefault(vietnamTimezone);

export class AnalysisController {
  private _conn: any;
  constructor(conn: any) {
    this._conn = conn;
  }

  async analysisTotalPrice(params: any) {
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      let { startDate, endDate, filterBy } = this._getFilterDates(
        params.filter_by,
        currentDate,
        currentYear
      );

      let sql = `
        SELECT 
          SUM(total_price) AS total_revenue
        FROM 
          tour_regis_informations
        WHERE 
          created_at BETWEEN ? AND ?
          AND status = 'DONE'
      `;

      const [rows] = await this._conn.query(sql, [startDate, endDate]);

      if (rows.length === 0 || rows[0].total_revenue === null) {
        console.log('No data found or total_revenue is null');
        return {
          status: true,
          message: 'No revenue data found for the selected period',
          data: { total_revenue: 0 },
        };
      }

      const totalRevenue = rows[0].total_revenue;

      // Insert kết quả vào bảng analysis
      let insertSql = `
        INSERT INTO analysis (total, filter_by, date, created_at)
        VALUES (?, ?, ?, NOW())
      `;
      await this._conn.query(insertSql, [totalRevenue, filterBy, currentDate]);

      return {
        status: true,
        message: 'Successful',
        data: {
          total_revenue: totalRevenue,
        },
      };
    } catch (error) {
      console.log('Lỗi analysis', error);
      return { status: false, message: 'Lỗi hệ thống', data: null };
    }
  }

  // Total quantity tour
  async analysisQuantityTour(params: any) {
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      let { startDate, endDate, filterBy } = this._getFilterDates(
        params.filter_by,
        currentDate,
        currentYear
      );

      let sql = `
        SELECT 
          COUNT(tour_id) AS total_quantity
        FROM 
          tour_regis_informations
        WHERE 
          created_at BETWEEN ? AND ?
          AND status = 'DONE'
      `;

      const [rows] = await this._conn.query(sql, [startDate, endDate]);

      if (rows.length === 0 || rows[0].total_quantity === null) {
        console.log('No data found or total_quantity is null');
        return {
          status: true,
          message: 'No revenue data found for the selected period',
          data: { total_quantity: 0 },
        };
      }

      const total_quantity = rows[0].total_quantity;

      // Insert kết quả vào bảng analysis
      let insertSql = `
        INSERT INTO analysis (total, filter_by, date, created_at)
        VALUES (?, ?, ?, NOW())
      `;
      await this._conn.query(insertSql, [total_quantity, filterBy, currentDate]);

      return {
        status: true,
        message: 'Successful',
        data: {
          total_quantity: total_quantity,
        },
      };
    } catch (error) {
      console.log('Lỗi analysis', error);
      return { status: false, message: 'Lỗi hệ thống', data: null };
    }
  }

  _getFilterDates(filterBy: any, currentDate: any, currentYear: any) {
    let startDate, endDate;
    switch (filterBy) {
      case 'last_month':
        startDate = moment().subtract(1, 'months').add(1, 'days').toDate();
        endDate = moment().subtract(0, 'days').toDate();
        return { startDate, endDate, filterBy: 2 }; // ORDERED
      case 'last_week':
        startDate = moment().subtract(8, 'days').startOf('day').format('YYYY-MM-DD');
        endDate = moment().subtract(1, 'week').endOf('isoWeek').format('YYYY-MM-DD');
        return { startDate, endDate, filterBy: 1 }; // BOOKING
      default: // 'current_year'
        startDate = new Date(currentYear, 0, 1);
        endDate = new Date(currentYear, 11, 31);
        return { startDate, endDate, filterBy: 0 }; // ORDERED
    }
  }
}
