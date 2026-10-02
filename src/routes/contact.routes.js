const express = require('express');

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function createContactRouter(service) {
  const router = express.Router();

  router.get('/', asyncHandler(async (req, res) => {
    res.json(await service.list());
  }));

  router.get('/:id', asyncHandler(async (req, res) => {
    res.json(await service.get(req.params.id));
  }));

  router.post('/', asyncHandler(async (req, res) => {
    res.status(201).json(await service.create(req.body));
  }));

  router.put('/:id', asyncHandler(async (req, res) => {
    res.json(await service.update(req.params.id, req.body));
  }));

  router.delete('/:id', asyncHandler(async (req, res) => {
    res.json(await service.delete(req.params.id));
  }));

  return router;
}

module.exports = createContactRouter;
