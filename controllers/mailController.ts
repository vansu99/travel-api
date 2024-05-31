import nodemailer from 'nodemailer';

export class MailController {
  private _conn: any;
  constructor(conn: any) {
    this._conn = conn;
  }
}
