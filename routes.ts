import express from 'express';
import { CustomerController } from './controllers/customerController';
import { TourController } from './controllers/tourController';
import { TourRegisController } from './controllers/tourRegisController';
import { AdvertiseController } from './controllers/advertiseController';
import { AnalysisController } from './controllers/analysisController';

const routes = (conn: any) => {
  const router = express.Router();

  const customerController = new CustomerController(conn);
  const tourController = new TourController(conn);
  const tourRegisController = new TourRegisController(conn);
  const advertiseController = new AdvertiseController(conn);
  const analysisController = new AnalysisController(conn);

  // Analysis total price
  router.post('/analysis-price', async (req, res, next) => {
    const params = req.body;
    const result = await analysisController.analysisTotalPrice(params);

    return res.json({
      status: result.status,
      message: result.message,
      data: result.data,
    });
  });

  // Analysis total quantity
  router.post('/analysis-quantity', async (req, res, next) => {
    const params = req.body;
    const result = await analysisController.analysisQuantityTour(params);

    return res.json({
      status: result.status,
      message: result.message,
      data: result.data,
    });
  });

  // Customer login
  router.post('/login', async (req, res, next) => {
    const params = req.body;

    const result = await customerController.login(params.username, params.password);

    return res.json({
      status: result.status,
      message: result.message,
      data: result.data,
    });
  });

  router.get('/customer/list', async (req, res, next) => {
    const params = req.query;
    const result = await customerController.list(params);

    return res.json({
      status: result.status,
      message: result.message,
      data: result.data,
    });
  });

  router.post('/customer/detail', async (req, res, next) => {
    if (req.body.id) {
      const result = await customerController.detail(req.body.id);

      return res.json({
        status: result.status,
        message: result.message,
        data: result.data,
      });
    } else {
      return res.json({ status: false, message: 'id không đúng', data: null });
    }
  });

  router.post('/customer/me', async (req, res, next) => {
    if (req.body.id) {
      const result = await customerController.me(req.body.id);

      return res.json({
        status: result.status,
        message: result.message,
        data: result.data,
      });
    } else {
      return res.json({ status: false, message: 'id không đúng', data: null });
    }
  });

  router.post('/customer/delete', async (req, res, next) => {
    if (req.body.id) {
      const result = await customerController.delete(req.body.id);

      return res.json({
        status: result.status,
        message: result.message,
        data: result.data,
      });
    } else {
      return res.json({ status: false, message: 'id không đúng', data: null });
    }
  });

  // Customer create
  router.post('/customer/create', async (req, res, next) => {
    const params = req.body;

    const result = await customerController.create(
      params.name,
      params.phone,
      params.email,
      params.username,
      params.password
    );

    return res.json({
      status: result.status,
      message: result.message,
      data: result.data,
    });
  });

  // customer update
  router.post('/customer/update', async (req, res, next) => {
    const params = req.body;

    const result = await customerController.update(
      params.customer_id,
      params.name,
      params.phone,
      params.email,
      params.username
    );

    return res.json({
      status: result.status,
      message: result.message,
      data: result.data,
    });
  });

  // Tour regis list
  router.get('/tour-regis/list', async (req, res, next) => {
    const params = req.query;
    const result = await tourRegisController.list(params);

    return res.json({
      status: result.status,
      message: result.message,
      data: result.data,
    });
  });

  // Tour regis list by user
  router.post('/tour-regis/list-user', async (req, res, next) => {
    const params = req.body;
    const result = await tourRegisController.listUser(params);

    return res.json({
      status: result.status,
      message: result.message,
      data: result.data,
    });
  });

  // Tour regis create
  router.post('/tour-regis/create', async (req, res, next) => {
    const params = req.body;

    const result = await tourRegisController.create(
      params.customer_id,
      params.tour_id,
      params.person,
      params.total_price
    );

    return res.json({
      status: result.status,
      message: result.message,
      data: result.data,
    });
  });

  // Tour regis update status
  router.post('/tour-regis/update-status', async (req, res, next) => {
    const params = req.body;

    const result = await tourRegisController.updateStatus(params.id, params.status);

    return res.json({
      status: result.status,
      message: result.message,
      data: result.data,
    });
  });

  // Tour regis cancel
  router.post('/tour-regis/cancel', async (req, res, next) => {
    const params = req.body;

    const result = await tourRegisController.cancel(params.id, params.customer_id);

    return res.json({
      status: result.status,
      message: result.message,
      data: result.data,
    });
  });

  // Tour regis create
  router.post('/tour-regis/detail', async (req, res, next) => {
    if (req.body.id) {
      const result = await tourRegisController.detail(req.body.id);

      return res.json({
        status: result.status,
        message: result.message,
        data: result.data,
      });
    } else {
      return res.json({ status: false, message: 'id không đúng', data: null });
    }
  });

  // Tour
  router.get('/tour/generate', async (req, res, next) => {
    await tourController.generate();
    return res.json({
      status: false,
      message: 'Đã tạo 30 tour dữ liệu mẫu',
      data: null,
    });
  });

  // Tour list
  router.get('/tour/list', async (req, res, next) => {
    const params = req.query;
    const result = await tourController.list(params);

    return res.json({
      status: result.status,
      message: result.message,
      data: result.data,
    });
  });

  // Tour detail
  router.post('/tour/detail', async (req, res, next) => {
    if (req.body.id) {
      const result = await tourController.detail(req.body.id);

      return res.json({
        status: result.status,
        message: result.message,
        data: result.data,
      });
    } else {
      return res.json({ status: false, message: 'id không đúng', data: null });
    }
  });

  // Tour create
  router.post('/tour/create', async (req, res, next) => {
    const params = req.body;

    const result = await tourController.create(
      params.name,
      params.image,
      params.location,
      params.description,
      params.price_adult,
      params.price_child,
      params.start_time,
      params.end_time
    );

    return res.json({
      status: result.status,
      message: result.message,
      data: result.data,
    });
  });

  // Tour update
  router.post('/tour/update', async (req, res, next) => {
    const params = req.body;

    const result = await tourController.update(
      params.tour_id,
      params.name,
      params.location,
      params.image,
      params.description,
      params.price_adult,
      params.price_child,
      params.start_time,
      params.end_time
    );

    return res.json({
      status: result.status,
      message: result.message,
      data: result.data,
    });
  });

  // Tour delete
  router.post('/tour/delete', async (req, res, next) => {
    const params = req.body;

    const result = await tourController.delete(params.id);

    return res.json({
      status: result.status,
      message: result.message,
      data: result.data,
    });
  });

  // Advertise
  router.get('/advertise/generate', async (req, res, next) => {
    await advertiseController.generate();
    return res.json({
      status: false,
      message: 'Đã tạo 30 advertise dữ liệu mẫu',
      data: null,
    });
  });

  // Advertises List
  router.get('/advertise/list', async (req, res, next) => {
    const params = req.query;
    const result = await advertiseController.list(params);

    return res.json({
      status: result.status,
      message: result.message,
      data: result.data,
    });
  });

  // Advertises detail
  router.post('/advertise/detail', async (req, res, next) => {
    if (req.body.id) {
      const result = await advertiseController.detail(req.body.id);

      return res.json({
        status: result.status,
        message: result.message,
        data: result.data,
      });
    } else {
      return res.json({ status: false, message: 'id không đúng', data: null });
    }
  });

  // Advertises update
  router.post('/advertise/update', async (req, res, next) => {
    const params = req.body;

    const result = await advertiseController.update(
      params.advertise_id,
      params.name,
      params.location,
      params.image,
      params.description
    );

    return res.json({
      status: result.status,
      message: result.message,
      data: result.data,
    });
  });

  router.post('/advertise/delete', async (req, res, next) => {
    if (req.body.id) {
      const result = await advertiseController.delete(req.body.id);

      return res.json({
        status: result.status,
        message: result.message,
        data: result.data,
      });
    } else {
      return res.json({ status: false, message: 'id không đúng', data: null });
    }
  });

  router.post('/advertise/create', async (req, res, next) => {
    const params = req.body;

    const result = await advertiseController.create(
      params.name,
      params.location,
      params.image,
      params.description
    );

    return res.json({
      status: result.status,
      message: result.message,
      data: result.data,
    });
  });

  return router;
};

export default routes;
