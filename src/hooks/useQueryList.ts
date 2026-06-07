import { menusControllerFindAllPaged } from '@/services/nest-web/menus';
import { permissiongroupsControllerFindAll } from '@/services/nest-web/permissiongroups';
import { permissionsControllerFindAll } from '@/services/nest-web/permissions';
import { rolesControllerFindAll } from '@/services/nest-web/roles';
import { unwrapResponse } from '@/utils/apiResponse';
import { useEffect, useState } from 'react';

const queryResource = async (url: string) => {
  switch (url) {
    case '/roles':
      return unwrapResponse(await rolesControllerFindAll());
    case '/permissions':
      return unwrapResponse(await permissionsControllerFindAll());
    case '/permissiongroups':
      return unwrapResponse(await permissiongroupsControllerFindAll());
    case '/menus':
      return unwrapResponse(await menusControllerFindAllPaged({ current: 1, pageSize: 10000 }));
    default:
      throw new Error(`Unsupported resource query: ${url}`);
  }
};

const useQueryList = (url: string) => {
  const [items, setItems] = useState<any>([]);
  useEffect(() => {
    queryResource(url).then(setItems).catch(console.error);
  }, [url]);

  return { items, setItems };
};

export default useQueryList;
