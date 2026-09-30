import type { Request, Response } from 'express';
import { InventoryService } from './inventory.service.js';
import type { ArchivoConBuffer } from './inventory.types.js';

const service = new InventoryService();
const files = (req: Request) => Array.isArray(req.files) ? req.files as ArchivoConBuffer[] : [];
const id = (req: Request) => String(req.params.id);

export class InventoryController {
  list = async (_req: Request, res: Response) => {
    res.set('Cache-Control', 'no-store');
    res.json(await service.list());
  };
  create = async (req: Request, res: Response) => {
    res.status(201).json({ ok: true, item: await service.create(req.body, files(req), req.user?.sub) });
  };
  update = async (req: Request, res: Response) => {
    res.json({ ok: true, item: await service.update(id(req), req.body, files(req)) });
  };
  movement = async (req: Request, res: Response) => {
    res.status(201).json({ ok: true, ...await service.addMovement(id(req), req.body, req.user?.sub) });
  };
  movements = async (req: Request, res: Response) => {
    res.json(await service.movements(id(req)));
  };
}
