import { AdministratorsEntity } from '../../model/administrator.entity';
import { Request } from 'express';

interface RequestWithAdministrator extends Request {
  user: AdministratorsEntity;
}

export default RequestWithAdministrator;
