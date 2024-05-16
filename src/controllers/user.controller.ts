import { Request, Response } from 'express';

const demo = async (req: Request, res: Response): Promise<void> => {
  res.send({
    status: 200,
    message: "Working demo API",
  });
};

export { demo };
