import { queryList } from '@/services/ant-design-pro/api';
import { useEffect, useState } from 'react';
const useQueryList = (url: string) => {
  const [items, setItems] = useState<API.UsersListItem[] | undefined>([]);
  const query = async () => {
    const { data } = await queryList(url, { pageSize: 10000 });
    setItems(data);
  };
  useEffect(() => {
    query();
  }, []);
  return { items, setItems };
};

export default useQueryList;
